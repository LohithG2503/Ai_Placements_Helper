import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { logError, logSuccess } from '../../server.js';
import Company from '../../models/Company.js';

// In-memory cache for dataset
let companiesDataset = [];
let datasetLoaded = false;

/**
 * Fetches comprehensive company information from multiple sources
 * @param {string} companyName - The company name to search for
 * @returns {Promise<Object>} - Company information object
 */
export async function getCompanyInfo(companyName) {
  try {
    console.log(`📊 Looking up information for company: ${companyName}`);
    
    if (!companyName || companyName.trim() === '') {
      return {
        success: false,
        error: 'Company name cannot be empty'
      };
    }
    
    // Normalize the company name
    const normalizedName = companyName.trim();
    
    // Check if this is a company with a location (e.g., "Accenture India")
    let specificLocation = null;
    let baseCompanyName = normalizedName;
    
    // Try to parse location-specific company names (e.g. "Accenture India")
    const locationMatches = normalizedName.match(/^([A-Za-z0-9\s&]+)\s+([A-Za-z]+)$/);
    if (locationMatches) {
      baseCompanyName = locationMatches[1].trim();
      specificLocation = locationMatches[2].trim();
      console.log(`🌎 Detected location-specific company: ${baseCompanyName} in ${specificLocation}`);
    }
    
    // First, check if we have the exact company info in our database
    console.log(`🔍 Searching database for exact match: ${normalizedName}`);
    let companyFromDB;
    
    try {
      // Try exact match first
      companyFromDB = await Company.findOne({ 
        name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } 
      });
      
      // If no exact match but we have a location-specific name, try the base company
      if (!companyFromDB && specificLocation) {
        console.log(`🔍 No exact match, searching for base company: ${baseCompanyName}`);
        companyFromDB = await Company.findOne({ 
          name: { $regex: new RegExp(`^${baseCompanyName}$`, 'i') } 
        });
        
        // If found, enrich with location-specific data
        if (companyFromDB) {
          const companyData = companyFromDB.toObject();
          
          // Check if company data has employee data for the specified location
          const locationEmployeeMatches = [
            // Pattern: "X employees in Y"
            companyData.description && 
              companyData.description.match(/(\d[\d,\.]+(?:\s+[a-zA-Z]+)?)\s+employees\s+in\s+([\w\s]+)/i),
            // Pattern: "has over X employees in Y"
            companyData.description && 
              companyData.description.match(/has\s+(?:over|around|about|approximately)?\s+(\d[\d,\.]+(?:\s+[a-zA-Z]+)?)\s+employees\s+in\s+([\w\s]+)/i),
            // Pattern: "workforce of X in Y" 
            companyData.description && 
              companyData.description.match(/workforce\s+of\s+(?:over|around|about|approximately)?\s+(\d[\d,\.]+(?:\s+[a-zA-Z]+)?)\s+in\s+([\w\s]+)/i)
          ];
          
          // Find the first matching pattern
          const employeeMatch = locationEmployeeMatches.find(match => match !== null);
          
          if (specificLocation && employeeMatch) {
            const locationFromDesc = employeeMatch[2].trim().toLowerCase();
            
            // If the description mentions employees in this specific location
            if (locationFromDesc === specificLocation.toLowerCase() || 
                locationFromDesc.includes(specificLocation.toLowerCase())) {
              console.log(`✅ Enhancing with ${baseCompanyName} ${specificLocation} specific information`);
              
              // Filter office locations for the specified location
              if (companyData.officeLocations) {
                const locationOffices = companyData.officeLocations.filter(
                  loc => loc.toLowerCase().includes(specificLocation.toLowerCase())
                );
                if (locationOffices.length > 0) {
                  companyData.primaryOfficeLocations = locationOffices;
                }
              }
              
              // Add specific information about the location
              companyData.focusLocation = specificLocation;
              companyData.regionInfo = {
                employees: employeeMatch[1],
                mainOffices: companyData.primaryOfficeLocations ? 
                  companyData.primaryOfficeLocations.join(', ') : `Major cities in ${specificLocation}`,
                specializations: companyData.productsAndServices ? 
                  companyData.productsAndServices.slice(0, 4).join(', ') : 
                  `${companyData.industry} services and solutions`,
                regionHead: `${companyData.name} ${specificLocation} is headed by a Country Managing Director`
              };
              
              return {
                success: true,
                data: {
                  ...companyData,
                  source: 'database (location-enhanced)'
                }
              };
            }
          }
        }
      }
    } catch (dbError) {
      console.error('Database lookup error:', dbError);
      // Continue even if DB lookup fails
    }

    if (companyFromDB) {
      console.log(`✅ Found ${normalizedName} in database`);
      return {
        success: true,
        data: {
          ...companyFromDB.toObject(),
          source: 'database'
        }
      };
    }

    // If not in database, try to find in our dataset
    console.log(`🔍 Searching dataset for: ${baseCompanyName}`);
    const companyFromDataset = await findCompanyInDataset(baseCompanyName);
    
    if (companyFromDataset) {
      console.log(`✅ Found ${normalizedName} in dataset`);
      
      // Get well-known company data if available
      const wellKnownData = getWellKnownCompanyData(normalizedName);
      const wellKnownDescription = getWellKnownCompanyDescription(normalizedName);
      
      // Prepare the company data by combining dataset and well-known info
      const companyData = {
        name: normalizedName,
        description: wellKnownDescription || 
          `${normalizedName} is a company in the ${companyFromDataset.industry || 'technology'} industry.`,
        industry: companyFromDataset.industry || 'Not specified',
        founded: companyFromDataset.founded || 'Not specified',
        headquarters: companyFromDataset.location || 'Not specified',
        employeeCount: companyFromDataset.employees ? 
          companyFromDataset.employees.toString() : 'Not specified',
        website: companyFromDataset.website || 'Not specified',
        source: 'dataset'
      };
      
      // Add well-known data if available
      if (wellKnownData) {
        Object.assign(companyData, wellKnownData);
      }
      
      // Store the dataset information in the database for future use
      try {
        const newCompany = new Company({
          ...companyData,
          name: normalizedName // Ensure we use the normalized name
        });
        await newCompany.save();
        console.log(`💾 Saved ${normalizedName} from dataset to database`);
      } catch (saveError) {
        console.error('Error saving company to database:', saveError);
        // Continue even if save fails
      }
      
      return {
        success: true,
        data: companyData
      };
    }

    // If not in database or dataset, make external API calls
    console.log(`🌐 Fetching external data for: ${normalizedName}`);
    const apiData = await fetchFromExternalAPI(normalizedName);
    
    // Store the API response in database for future use if successful
    if (apiData && apiData.success && apiData.data) {
      try {
        // Create a new company object with all the required fields
        const newCompany = new Company({
          name: normalizedName,
          description: apiData.data.description || `Information about ${normalizedName}.`,
          industry: apiData.data.industry || 'Not specified',
          founded: apiData.data.founded || 'Not specified',
          headquarters: apiData.data.headquarters || 'Not specified',
          employeeCount: apiData.data.employeeCount || 'Not specified',
          website: apiData.data.website || 'Not specified',
          // Include optional fields if present
          ...(apiData.data.ceo && { ceo: apiData.data.ceo }),
          ...(apiData.data.revenue && { revenue: apiData.data.revenue })
        });
        
        await newCompany.save();
        console.log(`💾 Saved ${normalizedName} from external API to database (Source: ${apiData.data.source || 'External API'})`);
      } catch (saveError) {
        console.error('Error saving API data to database:', saveError);
        // Continue even if save fails
      }
    } else {
      console.log(`❌ No data found for ${normalizedName} from any source`);
    }

    return apiData;
  } catch (error) {
    console.error('Error in getCompanyInfo:', error);
    return {
      success: false,
      error: `Failed to retrieve company information: ${error.message}`
    };
  }
}

/**
 * Search for companies by name
 * @param {string} query Company name to search for
 * @param {number} limit Maximum number of results to return
 * @returns {Promise<Array>} Array of matching companies
 */
export async function searchCompanies(query, limit = 10) {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    // Load the dataset
    const companies = await loadCompaniesDataset();
    
    if (!companies || companies.length === 0) {
      return [];
    }
    
    // Normalize the query for better matching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Find companies that match the query
    const matchingCompanies = companies
      .filter(company => {
        // Check if company name contains the query
        return company.name && 
          company.name.toLowerCase().includes(normalizedQuery);
      })
      .map(company => ({
        name: company.name,
        industry: company.industry || '',
        location: company.location ? 
          (company.country ? `${company.location}, ${company.country}` : company.location) : 
          (company.country || ''),
        founded: company.founded ? formatYearAsInteger(company.founded) : '',
        website: company.website || '',
        description: company.description || `${company.name} is a company in the ${company.industry || 'technology'} industry.`
      }))
      .slice(0, limit);
    
    return matchingCompanies;
  } catch (error) {
    logError(error, 'Search Companies');
    return [];
  }
}

/**
 * Loads the companies dataset from CSV file
 * @returns {Promise<Array>} Array of company objects
 */
async function loadCompaniesDataset() {
  // If already loaded, return the cached dataset
  if (datasetLoaded && companiesDataset.length > 0) {
    return companiesDataset;
  }
  
  // Path to the CSV file - using an existing CSV file
  const csvFilePath = path.resolve('D:\\PROJECTS\\Ai_Placement_Helper\\TESTING\\companies_sorted.csv');
  
  // Check if file exists before trying to read it
  if (!fs.existsSync(csvFilePath)) {
    console.warn(`CSV file not found at path: ${csvFilePath}`);
    logError(new Error(`CSV file not found: ${csvFilePath}`), 'Dataset Loading');
    companiesDataset = [];
    return companiesDataset;
  }
  
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        // Transform CSV data to our company format
        const company = {
          name: data.company_name || data.name || '',
          industry: data.industry || '',
          location: data.locality || data.location || data.city || '',
          country: data.country || '',
          founded: data.founded || data['year founded'] || '',
          employees: parseInt(data['current employee estimate']) || 0,
          totalEmployees: parseInt(data['total employee estimate']) || 0,
          size: data['size range'] || '',
          website: data.domain || data.website || '',
          linkedin: data['linkedin url'] || data.linkedin || ''
        };
        
        if (company.name) {
          results.push(company);
        }
      })
      .on('end', () => {
        companiesDataset = results;
        datasetLoaded = true;
        logSuccess('Companies dataset loaded', { count: results.length });
        resolve(results);
      })
      .on('error', (error) => {
        logError(error, 'CSV Dataset Loading');
        reject(error);
      });
  });
}

/**
 * Find companies in the dataset by name
 * @param {string} companyName Name to search for
 * @returns {Promise<Array>} Matching companies
 */
async function findCompanyInDataset(companyName) {
  try {
    // Load the dataset if not already loaded
    const companies = await loadCompaniesDataset();
    
    if (!companies || companies.length === 0) {
      return null;
    }
    
    // Search by exact name first
    const exactMatch = companies.find(company => 
      company.name && company.name.toLowerCase() === companyName.toLowerCase()
    );
    
    if (exactMatch) {
      // Format founded year as integer if it exists
      if (exactMatch.founded) {
        exactMatch.founded = formatYearAsInteger(exactMatch.founded);
      }
      return exactMatch;
    }
    
    // If no exact match, look for partial matches
    const partialMatches = companies.filter(company => 
      company.name && company.name.toLowerCase().includes(companyName.toLowerCase())
    );
    
    // If we have too many partial matches, try to narrow down
    if (partialMatches.length > 50) {
      // Try to find better matches with the name at the beginning
      const betterMatches = partialMatches.filter(company => 
        company.name.toLowerCase().startsWith(companyName.toLowerCase())
      );
      
      if (betterMatches.length > 0) {
        // Format founded year as integer
        if (betterMatches[0].founded) {
          betterMatches[0].founded = formatYearAsInteger(betterMatches[0].founded);
        }
        return betterMatches[0]; // Return the first better match
      }
    }
    
    // Return the first partial match if available
    if (partialMatches.length > 0) {
      // Format founded year as integer
      if (partialMatches[0].founded) {
        partialMatches[0].founded = formatYearAsInteger(partialMatches[0].founded);
      }
      return partialMatches[0];
    }
    
    return null;
  } catch (error) {
    logError(error, 'Find Company in Dataset');
    return null;
  }
}

/**
 * Format a year value as an integer (no decimal points)
 * @param {string|number} year The year to format
 * @returns {string} Formatted year as string integer
 */
function formatYearAsInteger(year) {
  if (!year) return '';
  
  // If it's already a string, try to parse it
  if (typeof year === 'string') {
    // Extract the first 4-digit number that looks like a year
    const yearMatch = year.match(/\b(18|19|20)\d{2}\b/);
    if (yearMatch) {
      return yearMatch[0];
    }
    
    // Try to parse as a number and convert to integer
    const parsedYear = parseFloat(year);
    if (!isNaN(parsedYear)) {
      return Math.floor(parsedYear).toString();
    }
    
    return year; // Return as is if we can't parse it
  }
  
  // If it's a number, convert to integer and then to string
  if (typeof year === 'number') {
    return Math.floor(year).toString();
  }
  
  return '';
}

// ... Helper functions from companyInfo.js that are referenced above would go here

/**
 * Fetches company information from Wikipedia
 * @param {string} companyName 
 * @returns {Promise<Object>}
 */
async function fetchWikipediaInfo(companyName) {
  try {
    console.log(`Attempting to fetch data for ${companyName} from Wikipedia`);
    
    // First search for the page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(companyName)} company&format=json&origin=*`;
    const searchResponse = await axios.get(searchUrl);
    
    if (!searchResponse.data.query || !searchResponse.data.query.search || searchResponse.data.query.search.length === 0) {
      console.log(`No Wikipedia search results found for ${companyName}`);
      return {}; // No results found
    }
    
    // Get the page ID from the first search result
    const pageId = searchResponse.data.query.search[0].pageid;
    const pageTitle = searchResponse.data.query.search[0].title;
    
    console.log(`Found Wikipedia page: ${pageTitle} (ID: ${pageId})`);
    
    // Fetch detailed page information
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info|categories&exintro=1&inprop=url&pithumbsize=300&pageids=${pageId}&format=json&origin=*`;
    const pageResponse = await axios.get(pageUrl);
    
    if (!pageResponse.data.query || !pageResponse.data.query.pages || !pageResponse.data.query.pages[pageId]) {
      console.log(`Failed to get Wikipedia page details for ${companyName}`);
      return {}; // Failed to get page details
    }
    
    // Get the page content
    const page = pageResponse.data.query.pages[pageId];
    
    // Extract the HTML content
    const extract = page.extract || '';
    
    // Use Cheerio to parse HTML and extract plain text
    const $ = cheerio.load(extract);
    
    // Remove citations and references from the text
    $('sup').remove();
    $('.reference').remove();
    
    let plainTextDescription = $.text().trim();
    // Simplify the description to remove pronunciation guides and complex language elements
    plainTextDescription = simplifyDescription(plainTextDescription);
    
    // Extract industry from categories if available
    let industry = 'Not specified';
    if (page.categories && page.categories.length > 0) {
      // Look for industry-related categories
      const industryCategory = page.categories.find(cat => 
        cat.title && (
          cat.title.includes('companies') || 
          cat.title.includes('industry') ||
          cat.title.includes('Corporation') ||
          cat.title.includes('enterprises')
        )
      );
      
      if (industryCategory) {
        // Extract industry from category title (e.g., "Category:Software companies" -> "Software")
        const match = industryCategory.title.match(/Category:([a-zA-Z]+)\s+companies/);
        if (match && match[1]) {
          industry = match[1];
        }
      }
    }
    
    // Get direct Wikipedia URL
    const companyUrl = page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;
    
    // Return structured Wikipedia info
    return {
      description: plainTextDescription,
      industry: industry,
      headquarters: extractLocation(plainTextDescription),
      founded: extractYear(plainTextDescription),
      employees: extractEmployeeCount(plainTextDescription),
      website: extractWebsite(plainTextDescription),
      url: companyUrl
    };
  } catch (error) {
    console.error('Error fetching from Wikipedia API:', error);
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.log('Network error accessing Wikipedia API - may be a CORS issue');
    }
    return {}; // Return empty object on error
  }
}

/**
 * Extract year founded from text description
 * @param {string} text 
 * @returns {string}
 */
function extractYear(text) {
  if (!text) return 'Not specified';
  
  // Look for patterns like "founded in 1998" or "established in 1998"
  const foundedMatch = text.match(/founded\s+in\s+(\d{4})/i) || 
                       text.match(/established\s+in\s+(\d{4})/i) ||
                       text.match(/incorporated\s+in\s+(\d{4})/i) ||
                       text.match(/\bin\s+(\d{4})\b.*\bfounded\b/i);
  
  return foundedMatch ? foundedMatch[1] : 'Not specified';
}

/**
 * Extract location information from text description
 * @param {string} text 
 * @returns {string}
 */
function extractLocation(text) {
  if (!text) return 'Not specified';
  
  // Look for headquarters or location information
  const hqMatch = text.match(/headquartered\s+in\s+([^\.]+)/i) ||
                  text.match(/headquarters\s+in\s+([^\.]+)/i) ||
                  text.match(/based\s+in\s+([^\.]+)/i);
  
  return hqMatch ? hqMatch[1].trim() : 'Not specified';
}

/**
 * Extract employee count from text description
 * @param {string} text 
 * @returns {string}
 */
function extractEmployeeCount(text) {
  if (!text) return 'Not specified';
  
  // Look for patterns like "30,000 employees" or "employs 30,000 people"
  const employeeMatch = text.match(/(\d{1,3}(?:,\d{3})*)\s+employees/i) ||
                        text.match(/employs\s+(\d{1,3}(?:,\d{3})*)/i);
  
  return employeeMatch ? employeeMatch[1] : 'Not specified';
}

/**
 * Extract website from text description
 * @param {string} text 
 * @returns {string}
 */
function extractWebsite(text) {
  if (!text) return 'Not specified';
  
  // Look for website patterns
  const websiteMatch = text.match(/website\s+is\s+([^\s\.]+\.[^\s\.]+)/i) ||
                       text.match(/([a-z0-9-]+\.[a-z0-9-]+\.[a-z]+)/i);
  
  return websiteMatch ? websiteMatch[1] : 'Not specified';
}

/**
 * Simplifies company description by removing pronunciation guides and simplifying language details
 * @param {string} description The company description
 * @returns {string} Simplified description
 */
function simplifyDescription(description) {
  if (!description) return '';
  
  let simplified = description;
  
  // Remove pronunciation guides in parentheses
  simplified = simplified.replace(/\s*\([^)]*pronunciation[^)]*\)\s*/gi, ' ');
  
  // Remove IPA phonetic transcriptions in square brackets
  simplified = simplified.replace(/\s*\[[^\]]*\]\s*/g, ' ');
  
  // Remove comma-separated description of a language name: "German:", "French:", etc.
  simplified = simplified.replace(/,\s*[A-Z][a-z]+\s*:/g, '');
  
  // Remove references like [1], [2], etc.
  simplified = simplified.replace(/\[\d+\]/g, '');
  
  // Replace multiple spaces, newlines and tabs with a single space
  simplified = simplified.replace(/\s+/g, ' ');
  
  // Remove patterns like "name, stylized as NAME" or "doing business as"
  simplified = simplified.replace(/,\s*stylized as\s+[^,\.;]+/gi, '');
  simplified = simplified.replace(/\s*\(stylized as\s+[^)]+\)/gi, '');
  
  // Remove phrases about former names
  simplified = simplified.replace(/\s*(?:,|and)\s+(?:formerly|previously)(?:\s+(?:named|called|known as))?\s+[^,\.;]+/gi, '');
  simplified = simplified.replace(/\s*\((?:formerly|previously)(?:\s+(?:named|called|known as))?\s+[^)]+\)/gi, '');
  
  // Make "formerly named X" more concise (e.g. "and formerly named Facebook, Inc.")
  simplified = simplified.replace(/\s+and formerly named\s+([^,\.;]+)/gi, ' (formerly $1)');
  
  // Replace "X, officially Y" with just Y
  simplified = simplified.replace(/[^,\.;]+,\s*officially\s+([^,\.;]+)/gi, '$1');
  
  // Simplify corporation types at the end of names
  simplified = simplified.replace(/,\s*(?:Inc\.|LLC|Ltd\.|Limited|Corporation|Corp\.|GmbH|S\.A\.|plc)\b/g, '');
  simplified = simplified.replace(/\s+(?:Inc\.|LLC|Ltd\.|Limited|Corporation|Corp\.|GmbH|S\.A\.|plc)(\s+|\.|,|$)/g, '$1');
  
  // Remove trademark symbols
  simplified = simplified.replace(/[™®©]/g, '');
  
  // Clean up multiple spaces and trim
  simplified = simplified.replace(/\s+/g, ' ').trim();
  
  return simplified;
}

/**
 * Returns manually curated data for well-known companies
 * @param {string} companyName 
 * @returns {Object|null}
 */
function getWellKnownCompanyData(companyName) {
  const lowercase = companyName.toLowerCase();
  
  // Manually curated company data based on public information
  const companies = {
    'razorpay': {
      rating: '4.1/5',
      pros: [
        'Fast-paced startup environment with growth opportunities',
        'Cutting-edge fintech work experience',
        'Good compensation packages with equity options',
        'Strong engineering culture that values technical excellence',
        'Flat organization structure with access to leadership'
      ],
      cons: [
        'Can be high pressure with fast-changing priorities',
        'Work-life balance challenges in some teams',
        'Growing pains as the company scales rapidly',
        'Some processes still being refined as the company matures',
        'High expectations and performance standards'
      ],
      benefits: [
        'Health insurance with family coverage',
        'Employee stock ownership plan (ESOP)',
        'Flexible work policies',
        'Learning and development allowance',
        'Wellness programs and mental health support'
      ],
      culture: 'Razorpay has a high-energy startup culture focused on innovation in the fintech space. The company values technical excellence, customer obsession, and moving quickly to build scalable payment solutions for the Indian market.'
    },
    'google': {
      rating: '4.5/5',
      pros: [
        'Excellent compensation and benefits package',
        'Challenging technical problems to solve',
        'Opportunities to work on influential products',
        'Strong emphasis on work-life balance',
        'Access to cutting-edge technology and research'
      ],
      cons: [
        'Large organization can be bureaucratic',
        'Promotion process can be challenging',
        'Some projects may be canceled unexpectedly',
        'Work can vary greatly between teams',
        'High expectations and performance standards'
      ],
      benefits: [
        'Comprehensive health insurance',
        'Generous 401(k) matching',
        'Free gourmet meals and snacks',
        'On-site wellness services',
        'Extended parental leave policies'
      ],
      culture: 'Google maintains a collaborative and innovation-focused culture. The company encourages creativity, intellectual curiosity, and data-driven decision making. Although it has grown significantly, it still tries to maintain aspects of its startup roots through projects like "20% time" for personal projects.'
    }
    // Add more companies as needed
  };
  
  // Check if we have data for this company
  for (const key in companies) {
    if (lowercase.includes(key) || key.includes(lowercase)) {
      return companies[key];
    }
  }
  
  return null;
}

/**
 * Returns manually curated descriptions for well-known companies that may not have good Wikipedia entries
 * @param {string} companyName 
 * @returns {string|null}
 */
function getWellKnownCompanyDescription(companyName) {
  const lowercase = companyName.toLowerCase();
  
  // Manually curated descriptions based on public information
  const descriptions = {
    'razorpay': `Razorpay is an Indian fintech company that provides payment gateway services to businesses. Founded in 2014 by Harshil Mathur and Shashank Kumar, it has grown to become one of India's leading payment solutions providers. The company offers a comprehensive suite of financial services including payment gateway, business banking, lending, and payroll management. Razorpay enables businesses of all sizes to accept, process, and disburse payments through its product suite. It became a unicorn startup in 2020 when it reached a valuation of over $1 billion. The company is known for its developer-friendly APIs, robust technology infrastructure, and innovative approach to solving payment challenges for the Indian market.`
  };
  
  // Check if we have a description for this company
  for (const key in descriptions) {
    if (lowercase.includes(key) || key.includes(lowercase)) {
      return descriptions[key];
    }
  }
  
  return null;
}

/**
 * Returns curated interview process data for well-known companies
 * @param {string} companyName 
 * @returns {Array|null}
 */
function getWellKnownInterviewProcess(companyName) {
  const lowercase = companyName.toLowerCase();
  
  // Manually curated interview processes based on public information
  const interviewProcesses = {
    'razorpay': [
      'Initial application screening',
      'Preliminary HR discussion over phone or video call',
      'Online coding assessment or take-home assignment',
      'Technical interview focused on problem-solving and algorithms',
      'Domain-specific technical interview (payments, security, etc.)',
      'System design discussion for senior roles',
      'Cultural fit interview with team members',
      'Final round with founders or senior leadership (for key roles)',
      'Reference checks and background verification',
      'Offer discussion and negotiation'
    ],
    'google': [
      'Resume screening',
      'Phone screening with recruiter',
      'Technical phone interview with an engineer',
      'Online coding assessment (for some roles)',
      'Onsite interviews (4-5 rounds)',
      'Coding interviews focused on algorithms and data structures',
      'System design interview for senior roles',
      'Behavioral interviews assessing Googleyness',
      'Team matching process',
      'Hiring committee review',
      'Offer approval and negotiation'
    ]
    // Add more companies as needed
  };
  
  // Check if we have interview data for this company
  for (const key in interviewProcesses) {
    if (lowercase.includes(key) || key.includes(lowercase)) {
      return interviewProcesses[key];
    }
  }
  
  return null;
}

async function fetchFromExternalAPI(companyName) {
  try {
    // Try different data sources in sequence until we get valid information
    console.log(`Fetching data for ${companyName} from external APIs`);
    let errors = [];
    
    // Prepare a proxy configuration if needed
    const proxyConfig = process.env.HTTP_PROXY ? {
      proxy: {
        host: process.env.HTTP_PROXY.split(':')[0],
        port: parseInt(process.env.HTTP_PROXY.split(':')[1] || '8080')
      }
    } : {};
    
    // 1. Try SerpAPI first as it's most reliable if configured
    try {
      const serpApiInfo = await fetchSerpApiInfo(companyName);
      if (serpApiInfo && Object.keys(serpApiInfo).length > 0 && serpApiInfo.description) {
        console.log(`Found data for ${companyName} from SerpAPI`);
        return {
          success: true,
          data: {
            name: companyName,
            ...serpApiInfo,
            source: "SerpAPI"
          }
        };
      }
    } catch (error) {
      console.error('SerpAPI fetch error:', error.message);
      errors.push(`SerpAPI: ${error.message}`);
    }
    
    // 2. Try WikiData second
    try {
      const wikiDataInfo = await fetchWikiDataInfo(companyName);
      if (wikiDataInfo && Object.keys(wikiDataInfo).length > 0 && wikiDataInfo.description) {
        console.log(`Found data for ${companyName} from WikiData`);
        return {
          success: true,
          data: {
            name: companyName,
            ...wikiDataInfo,
            source: "WikiData"
          }
        };
      }
    } catch (error) {
      console.error('WikiData fetch error:', error.message);
      errors.push(`WikiData: ${error.message}`);
    }
    
    // 3. Try Wikipedia third
    try {
      const wikipediaInfo = await fetchWikipediaInfo(companyName);
      if (wikipediaInfo && wikipediaInfo.description) {
        console.log(`Found data for ${companyName} from Wikipedia`);
        return {
          success: true,
          data: {
            name: companyName,
            description: wikipediaInfo.description,
            industry: wikipediaInfo.industry || "Not specified",
            founded: wikipediaInfo.founded || "Not specified",
            headquarters: wikipediaInfo.headquarters || "Not specified",
            employeeCount: wikipediaInfo.employees || "Not specified",
            source: "Wikipedia"
          }
        };
      }
    } catch (error) {
      console.error('Wikipedia fetch error:', error.message);
      errors.push(`Wikipedia: ${error.message}`);
    }
    
    // 4. Try DuckDuckGo as fourth option
    try {
      const duckDuckGoInfo = await fetchDuckDuckGoInfo(companyName);
      if (duckDuckGoInfo && duckDuckGoInfo.description) {
        console.log(`Found data for ${companyName} from DuckDuckGo`);
        return {
          success: true,
          data: {
            name: companyName,
            ...duckDuckGoInfo,
            source: "DuckDuckGo"
          }
        };
      }
    } catch (error) {
      console.error('DuckDuckGo fetch error:', error.message);
      errors.push(`DuckDuckGo: ${error.message}`);
    }
    
    // 5. Generate a best-effort fallback for well-known companies
    const wellKnownDescription = getWellKnownCompanyDescription(companyName);
    const wellKnownData = getWellKnownCompanyData(companyName);
    
    if (wellKnownDescription || wellKnownData) {
      console.log(`Using curated data for ${companyName}`);
      return {
        success: true,
        data: {
          name: companyName,
          description: wellKnownDescription || `${companyName} is a company in the technology industry.`,
          industry: "Not specified",
          founded: "Not specified",
          headquarters: "Not specified",
          employeeCount: "Not specified",
          ...(wellKnownData || {}),
          source: "Curated"
        }
      };
    }
    
    // Default placeholder if no data was found from any source
    console.log(`No data found for ${companyName} from any external API. Error count: ${errors.length}`);
    
    // If there were connectivity errors with all sources, report that specifically
    if (errors.length >= 3) {
      return {
        success: false,
        error: 'Failed to connect to external data sources. Please check your network connection.',
        data: {
          name: companyName,
          description: `Information about ${companyName} could not be retrieved. Please try again later.`,
          industry: "Not available",
          founded: "Not available",
          headquarters: "Not available",
          employeeCount: "Not available",
          source: "Error"
        }
      };
    }
    
    // Default fallback
    return {
      success: true,
      data: {
        name: companyName,
        description: `Information about ${companyName} is currently being compiled.`,
        industry: "Not specified",
        founded: "Not specified",
        headquarters: "Not specified",
        employeeCount: "Not specified",
        source: "placeholder"
      }
    };
  } catch (error) {
    console.error('Error fetching from external APIs:', error);
    return {
      success: false,
      error: 'Failed to fetch company information from external sources',
      details: error.message
    };
  }
}

/**
 * Fetches company information from WikiData API
 * @param {string} companyName 
 * @returns {Promise<Object>}
 */
async function fetchWikiDataInfo(companyName) {
  try {
    // Search for the company in WikiData
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(companyName)}&language=en&format=json&origin=*`;
    const searchResponse = await axios.get(searchUrl);
    
    if (!searchResponse.data.search || searchResponse.data.search.length === 0) {
      return {}; // No results found
    }
    
    // Get the entity ID from the first search result
    const entityId = searchResponse.data.search[0].id;
    
    // Fetch detailed entity information
    const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&format=json&origin=*&props=claims|labels|descriptions|sitelinks`;
    const entityResponse = await axios.get(entityUrl);
    
    if (!entityResponse.data.entities || !entityResponse.data.entities[entityId]) {
      return {}; // Failed to get entity details
    }
    
    // Process the entity data
    const entity = entityResponse.data.entities[entityId];
    const claims = entity.claims || {};
    
    // Extract information from WikiData claims
    const description = entity.descriptions?.en?.value || '';
    const industry = extractClaimValue(claims, 'P452') || extractClaimValue(claims, 'P31');
    const founded = extractClaimValue(claims, 'P571');
    const headquarters = extractClaimValue(claims, 'P159');
    const employeeCount = extractClaimValue(claims, 'P1128');
    const website = extractClaimValue(claims, 'P856');
    
    return {
      description,
      industry,
      founded,
      headquarters,
      employeeCount: employeeCount ? employeeCount.toString() : "Not specified",
      website
    };
  } catch (error) {
    console.error('Error fetching from WikiData API:', error);
    return {}; // Return empty object on error
  }
}

/**
 * Helper function to extract values from WikiData claims
 * @param {Object} claims WikiData claims object
 * @param {string} propertyId WikiData property ID
 * @returns {string|null} Extracted value or null
 */
function extractClaimValue(claims, propertyId) {
  if (!claims[propertyId] || !claims[propertyId][0]) {
    return null;
  }
  
  const claim = claims[propertyId][0];
  const mainSnak = claim.mainsnak;
  
  if (!mainSnak || !mainSnak.datavalue) {
    return null;
  }
  
  // Handle different data types
  const datavalue = mainSnak.datavalue;
  
  if (datavalue.type === 'string') {
    return datavalue.value;
  } else if (datavalue.type === 'time') {
    // For dates (like founding date)
    return datavalue.value.time.replace(/^\+/, '').substring(0, 4); // Extract year
  } else if (datavalue.type === 'wikibase-entityid') {
    // For references to other entities (like industry or headquarters)
    return datavalue.value.id || null; // Return the entity ID, needs another lookup for full value
  } else if (datavalue.type === 'quantity') {
    // For numerical values (like employee count)
    return datavalue.value.amount.replace(/^\+/, '');
  }
  
  return null;
}

/**
 * Fetches company information from DuckDuckGo Instant Answer API
 * @param {string} companyName 
 * @returns {Promise<Object>}
 */
async function fetchDuckDuckGoInfo(companyName) {
  try {
    console.log(`Attempting to fetch data for ${companyName} from DuckDuckGo`);
    
    // Use DuckDuckGo Instant Answer API to get company info
    // Adding company at the end helps with more accurate results
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(companyName)}%20company&format=json&no_html=1&skip_disambig=1&no_redirect=1`;
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Ai_Placement_Helper/1.0'
      }
    });
    
    console.log(`DuckDuckGo API response status: ${response.status}`);
    
    // If no meaningful response, try without adding "company"
    if (!response.data || !response.data.AbstractText) {
      console.log(`No abstract for ${companyName}, trying alternative query`);
      const altUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(companyName)}&format=json&no_html=1&skip_disambig=1&no_redirect=1`;
      const altResponse = await axios.get(altUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Ai_Placement_Helper/1.0'
        }
      });
      
      if (!altResponse.data || !altResponse.data.AbstractText) {
        console.log(`No DuckDuckGo results found for ${companyName}`);
        return {};
      }
      
      response.data = altResponse.data;
    }
    
    // Extract basic information from the response
    const description = response.data.AbstractText || '';
    const abstractSource = response.data.AbstractSource || '';
    console.log(`Found DuckDuckGo abstract for ${companyName} from ${abstractSource}`);
    
    // Process infobox if available
    const infobox = response.data.Infobox || {};
    const infoboxContent = infobox.content || [];
    
    // Process infobox content to extract more structured data
    const industry = extractInfoboxValue(infoboxContent, 'Industry') ||
                    extractInfoboxValue(infoboxContent, 'Type');
    const founded = extractInfoboxValue(infoboxContent, 'Founded') || 
                   extractInfoboxValue(infoboxContent, 'Founding date');
    const headquarters = extractInfoboxValue(infoboxContent, 'Headquarters') || 
                         extractInfoboxValue(infoboxContent, 'Location');
    const employeeCount = extractInfoboxValue(infoboxContent, 'Number of employees') || 
                          extractInfoboxValue(infoboxContent, 'Employees');
    const website = response.data.AbstractURL || 
                    extractInfoboxValue(infoboxContent, 'Website') ||
                    extractInfoboxValue(infoboxContent, 'Official website');
    
    return {
      description: description || `${companyName} is a company in the technology industry.`,
      industry: industry || extractIndustryFromText(description) || 'Not specified',
      founded: founded || extractYear(description) || 'Not specified',
      headquarters: headquarters || extractLocation(description) || 'Not specified',
      employeeCount: employeeCount || extractEmployeeCount(description) || 'Not specified',
      website: website || 'Not specified',
      source: abstractSource || 'DuckDuckGo'
    };
  } catch (error) {
    console.error('Error fetching from DuckDuckGo API:', error);
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.log('Network error accessing DuckDuckGo API - may be a CORS issue');
    }
    return {}; // Return empty object on error
  }
}

/**
 * Extract industry information from text description
 * @param {string} text 
 * @returns {string}
 */
function extractIndustryFromText(text) {
  if (!text) return null;
  
  // Common industry patterns
  const patterns = [
    /is\s+a[n]?\s+([a-z\-]+(?:\s+[a-z\-]+){0,2})\s+company/i,
    /provider\s+of\s+([a-z\-]+(?:\s+[a-z\-]+){0,2})/i,
    /specializing\s+in\s+([a-z\-]+(?:\s+[a-z\-]+){0,2})/i,
    /focuses\s+on\s+([a-z\-]+(?:\s+[a-z\-]+){0,2})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  }
  
  return null;
}

/**
 * Helper function to extract values from DuckDuckGo infobox content
 * @param {Array} infoboxContent 
 * @param {string} label 
 * @returns {string|null}
 */
function extractInfoboxValue(infoboxContent, label) {
  const item = infoboxContent.find(item => 
    item.label && item.label.toLowerCase() === label.toLowerCase()
  );
  
  return item ? item.value : null;
}

/**
 * Fetches company information from SerpAPI
 * @param {string} companyName 
 * @returns {Promise<Object>}
 */
async function fetchSerpApiInfo(companyName) {
  try {
    // Check if SerpAPI key is available in environment variables
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) {
      console.warn('SerpAPI key not found in environment variables');
      return {};
    }
    
    console.log(`Attempting to fetch data for ${companyName} from SerpAPI`);
    
    // Use SerpAPI knowledge graph search to get company info
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(companyName)}%20company&api_key=${apiKey}`;
    const response = await axios.get(url);
    
    if (!response.data || !response.data.knowledge_graph) {
      console.log(`No knowledge graph results found for ${companyName}`);
      return {}; // No knowledge graph results found
    }
    
    const kg = response.data.knowledge_graph;
    console.log(`Found SerpAPI knowledge graph for ${companyName}`);
    
    // Extract data from knowledge graph
    const description = kg.description || '';
    const industry = kg.category || '';
    const founded = kg.founded || '';
    const headquarters = kg.headquarters || kg.location || '';
    const employeeCount = kg.employees || '';
    const website = kg.website || '';
    
    // Additional possible fields
    const ceo = kg.ceo || '';
    const revenue = kg.revenue || '';
    const parentOrg = kg.parent_organization || '';
    
    // Add rich data if available
    const richData = {
      ...(ceo && { ceo }),
      ...(revenue && { revenue }),
      ...(parentOrg && { parentOrganization: parentOrg })
    };
    
    return {
      description: description || `${companyName} is a company in the ${industry || 'technology'} industry.`,
      industry: industry || 'Not specified',
      founded: founded || 'Not specified',
      headquarters: headquarters || 'Not specified',
      employeeCount: employeeCount || 'Not specified',
      website: website || 'Not specified',
      ...richData
    };
  } catch (error) {
    console.error('Error fetching from SerpAPI:', error);
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.log('Network error accessing SerpAPI - may be a CORS issue');
    }
    return {}; // Return empty object on error
  }
} 