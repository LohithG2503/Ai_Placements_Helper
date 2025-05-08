import express from "express";
import axios from "axios";
import { jsonrepair } from "jsonrepair";
import CompanyService from "../src/services/companyService.js";

const router = express.Router();
const AI_MODEL_URL = "http://127.0.0.1:8080/completion";
const companyService = new CompanyService();

/**
 * @route   POST /api/jobs/query
 * @desc    Process job description and extract job details
 * @access  Public
 */
router.post("/query", async (req, res) => {
  try {
    const { job_description } = req.body;
    if (!job_description) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const response = await axios.post(AI_MODEL_URL, {
      prompt: `Analyze the following job description and extract key information into a JSON object. Follow these rules:
1. Extract the job title from the "Job Title:" field or the first line if not specified
2. Extract the location from the "Location:" field or mark as "Not specified" if not found
3. For salary, mark as "Not specified" if not mentioned
4. For job type, look for terms like "Full-time", "Part-time", "Contract", etc. or mark as "Not specified"
5. For responsibilities, extract all bullet points under "Key Responsibilities:" or similar sections
6. For requirements, combine both "Qualifications:" and "Preferred Qualifications:" sections
7. For how to apply, mark as "Not specified" if not mentioned
8. Extract the company name from the "Company:" field or identify it from the description

Return ONLY a valid JSON object in this exact format:
{
  "job_title": "",
  "company": "",
  "location": "",
  "salary_range": "",
  "job_type": "",
  "responsibilities": [],
  "requirements": [],
  "how_to_apply": ""
}

Job Description:
${job_description}`,
      max_tokens: 800,
      temperature: 0.1,
    });

    let jobDetails;
    try {
      // First try to parse the response directly
      jobDetails = JSON.parse(response.data.content);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from the response
      const jsonMatch = response.data.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jobDetails = JSON.parse(jsonrepair(jsonMatch[0]));
      } else {
        throw new Error("Could not extract valid JSON from response");
      }
    }

    // Validate the extracted data
    if (!jobDetails.job_title || !jobDetails.company) {
      throw new Error("Missing required job details");
    }

    // Get company information if company name is available
    let companyInfo = null;
    if (jobDetails.company && jobDetails.company !== "Not specified") {
      try {
        const result = await companyService.getCompanyInfo(jobDetails.company);
        companyInfo = result.data;
        console.log(`✅ Company info fetched successfully for: ${jobDetails.company}`);
      } catch (companyError) {
        console.error(`❌ [Company Info Fetching] Error:`, companyError);
        // Don't fail the entire request if company info fails
        companyInfo = { 
          name: jobDetails.company,
          description: `Information about ${jobDetails.company} could not be retrieved.`,
          source: "Error"
        };
      }
    }

    res.json({ 
      success: true,
      job_details: jobDetails,
      company_info: companyInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ [Job Processing] Error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to process job description",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/jobs/company-details/:companyName
 * @desc    Fetch company details by company name
 * @access  Public
 */
router.get('/company-details/:companyName', async (req, res) => {
  const { companyName } = req.params;
  try {
    if (!companyName || companyName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Company name must be at least 2 characters',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Company details requested for: ${companyName}`);
    const result = await companyService.getCompanyInfo(companyName);
    return res.json(result);
  } catch (error) {
    console.error('❌ [Company Details] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch company details',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/job/youtube-search
 * @desc    Search YouTube for videos related to a company and job title
 * @access  Public
 */
router.get('/youtube-search', async (req, res) => {
  try {
    const { query, maxResults = 6 } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Extract search terms from the query
    const searchTerms = query.trim().split(/\s+/);
    
    // Determine company name and job title dynamically
    let company = '';
    let jobTitle = '';
    let companyWords = 0;
    
    // Try to identify multi-word company names
    if (searchTerms.length >= 2) {
      // First, check for common company name formats with Ltd, Inc, Pvt, etc.
      const companyRegex = /^(.*?)\s+(ltd|inc|pvt|private|international|corp|limited)$/i;
      const fullQuery = query.trim();
      const companyMatch = fullQuery.match(companyRegex);
      
      if (companyMatch) {
        // We found a pattern that looks like a company name
        company = companyMatch[0];
        companyWords = company.split(/\s+/).length;
        jobTitle = searchTerms.slice(companyWords).join(' ');
      } else {
        // If no pattern matched, use a sliding window approach
        // Try different splits to find a reasonable combination
        for (let i = Math.min(4, searchTerms.length - 1); i >= 1; i--) {
          const potentialCompany = searchTerms.slice(0, i).join(' ');
          const potentialJobTitle = searchTerms.slice(i).join(' ');
          
          // If both parts are reasonably sized, use this split
          if (potentialCompany.length >= 3) {
            company = potentialCompany;
            companyWords = i;
            jobTitle = potentialJobTitle;
            break;
          }
        }
      }
      
      // If we couldn't find a good split, consider the first term the company
      if (!company) {
        company = searchTerms[0];
        companyWords = 1;
        jobTitle = searchTerms.slice(1).join(' ');
      }
    } else if (searchTerms.length === 1) {
      // If only one term is provided, consider it the company
      company = searchTerms[0];
      companyWords = 1;
    }
    
    console.log(`🔍 Extracted from query: company="${company}", job="${jobTitle}"`);
    
    // Generate multiple search variations with emphasis on interview experience
    const generateSearchQueries = () => {
      const queries = [];
      const baseQuery = query.trim();
      
      // Start with more specific interview-focused queries
      if (company && jobTitle) {
        queries.push(`${company} ${jobTitle} interview questions and answers`);
        queries.push(`${company} ${jobTitle} interview experience process tips`);
        queries.push(`how to prepare for ${jobTitle} interview at ${company}`);
      } else if (company) {
        queries.push(`${company} job interview process tips questions`);
        queries.push(`working at ${company} interview experience`);
      } else if (jobTitle) {
        queries.push(`${jobTitle} interview questions and answers tips`);
        queries.push(`how to prepare for ${jobTitle} interview`);
      } else {
        queries.push(`${baseQuery} interview questions and answers`);
      }
      
      // Add a fallback query
      queries.push(`${baseQuery} job interview preparation tips`);
      
      return queries;
    };
    
    const searchQueries = generateSearchQueries();
    console.log(`🔍 Primary search query: "${searchQueries[0]}"`);
    
    // Get YouTube API key from environment
    const API_KEY = process.env.GOOGLE_KG_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'YouTube API key is not configured'
      });
    }
    
    const BASE_URL = 'https://www.googleapis.com/youtube/v3';
    
    // Try to get results from all queries in parallel
    const searchPromises = searchQueries.slice(0, 3).map(async (searchQuery) => {
      try {
        const response = await fetch(
          `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
            searchQuery
          )}&maxResults=${maxResults * 2}&type=video&relevanceLanguage=en&videoEmbeddable=true&key=${API_KEY}`
        );
        
        if (!response.ok) {
          console.error(`Error with query "${searchQuery}": ${response.statusText}`);
          return [];
        }
        
        const data = await response.json();
        return data.items || [];
      } catch (error) {
        console.error(`Error with query "${searchQuery}": ${error.message}`);
        return [];
      }
    });
    
    // Wait for all searches to complete
    const searchResults = await Promise.all(searchPromises);
    
    // Combine all results
    let allResults = [];
    searchResults.forEach(results => {
      allResults = [...allResults, ...results];
    });
    
    console.log(`Retrieved ${allResults.length} total results from all queries`);
    
    if (allResults.length === 0) {
      // If we got no results at all, try a more generic query
      try {
        console.log("No results found, trying a generic interview query...");
        const genericQuery = company 
          ? `${company} interview` 
          : (jobTitle ? `${jobTitle} interview tips` : "job interview preparation");
        
        const response = await fetch(
          `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
            genericQuery
          )}&maxResults=${maxResults * 2}&type=video&relevanceLanguage=en&videoEmbeddable=true&key=${API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          allResults = data.items || [];
        }
      } catch (error) {
        console.error('Error with fallback query:', error.message);
      }
    }
    
    // Improved scoring algorithm for relevance
    const scoreVideo = (video) => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();
      const channelTitle = video.snippet.channelTitle.toLowerCase();
      let score = 0;
      
      // Check for company name match (very important)
      if (company) {
        const companyLower = company.toLowerCase();
        const companyTerms = companyLower.split(/\s+/);
        
        // Full company name matching
        if (title.includes(companyLower)) {
          score += 8; // High score for full company match in title
        } else if (description.includes(companyLower)) {
          score += 4; // Medium score for full company match in description
        }
        
        // Individual company terms matching
        companyTerms.forEach(term => {
          if (term.length > 2) {
            if (title.includes(term)) score += 2;
            if (description.includes(term)) score += 1;
          }
        });
      }
      
      // Check for job title match
      if (jobTitle) {
        const jobTitleLower = jobTitle.toLowerCase();
        if (title.includes(jobTitleLower)) {
          score += 6; // High score for job title match in title
        } else if (description.includes(jobTitleLower)) {
          score += 3; // Medium score for job title match in description
        }
        
        // Individual job title terms
        jobTitle.toLowerCase().split(/\s+/).forEach(term => {
          if (term.length > 2 && !['and', 'the', 'for', 'with'].includes(term)) {
            if (title.includes(term)) score += 1.5;
            if (description.includes(term)) score += 0.5;
          }
        });
      }
      
      // Interview-specific content is highly valuable
      const interviewKeywords = {
        // High value keywords
        primary: ['interview experience', 'interview questions', 'interview process', 'job interview', 'interview preparation'],
        // Medium value keywords
        secondary: ['interview', 'interviews', 'interviewing', 'hiring process', 'recruitment process'],
        // Lower value but still relevant
        tertiary: ['career', 'job', 'tips', 'advice', 'preparation', 'questions', 'answers']
      };
      
      // Check for high-value interview keywords
      interviewKeywords.primary.forEach(keyword => {
        if (title.includes(keyword)) score += 6;
        if (description.includes(keyword)) score += 3;
      });
      
      // Check for medium-value interview keywords
      interviewKeywords.secondary.forEach(keyword => {
        if (title.includes(keyword)) score += 4;
        if (description.includes(keyword)) score += 2;
      });
      
      // Check for lower-value but still relevant keywords
      interviewKeywords.tertiary.forEach(keyword => {
        if (title.includes(keyword)) score += 2;
        if (description.includes(keyword)) score += 1;
      });
      
      // Prefer videos from career/educational channels
      const careerChannelKeywords = ['career', 'job', 'recruit', 'hr', 'interview', 'talent', 'hiring', 'tech', 'learn'];
      careerChannelKeywords.forEach(keyword => {
        if (channelTitle.includes(keyword)) score += 1.5;
      });
      
      // Negative signals - promotional content or non-interview content
      const negativeKeywords = ['promotional', 'promotion', 'commercial', 'advertisement', 'product review', 'unboxing'];
      negativeKeywords.forEach(keyword => {
        if (title.includes(keyword)) score -= 5;
        if (description.includes(keyword)) score -= 2;
      });
      
      // Content recency matters - newer content is more valuable
      const publishDate = new Date(video.snippet.publishedAt);
      const now = new Date();
      const ageInYears = (now - publishDate) / (1000 * 60 * 60 * 24 * 365);
      
      if (ageInYears < 1) {
        score += 3; // Content less than a year old
      } else if (ageInYears < 2) {
        score += 2; // Content 1-2 years old
      } else if (ageInYears < 3) {
        score += 1; // Content 2-3 years old
      } else if (ageInYears > 5) {
        score -= 1; // Older content is less relevant
      }
      
      return score;
    };
    
    // Score and sort videos
    const scoredVideos = allResults.map(video => ({
      video,
      score: scoreVideo(video)
    }));
    
    scoredVideos.sort((a, b) => b.score - a.score);
    
    // Remove duplicates
    const uniqueVideos = [];
    const videoIds = new Set();
    
    for (const { video } of scoredVideos) {
      if (!videoIds.has(video.id.videoId)) {
        videoIds.add(video.id.videoId);
        uniqueVideos.push(video);
      }
    }
    
    // Log scores for debugging
    const topScoredVideos = scoredVideos.slice(0, 10);
    console.log("Top scored videos:");
    topScoredVideos.forEach(({video, score}) => {
      console.log(`Score ${score.toFixed(1)}: ${video.snippet.title}`);
    });
    
    // Limit to requested number
    const finalVideos = uniqueVideos.slice(0, maxResults);
    console.log(`Returning ${finalVideos.length} videos after filtering and scoring`);
    
    // Format the response
    const items = finalVideos.map((video) => ({
      id: {
        videoId: video.id.videoId
      },
      snippet: {
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnails: {
          medium: {
            url: video.snippet.thumbnails.medium.url
          },
          default: {
            url: video.snippet.thumbnails.default.url
          },
          high: {
            url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url
          }
        },
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        channelId: video.snippet.channelId
      }
    }));
    
    return res.json({
      success: true,
      items,
      pageInfo: {
        totalResults: items.length
      },
      nextPageToken: null
    });
    
  } catch (error) {
    console.error('Error in YouTube search:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch videos'
    });
  }
});

// Add a generic function to search for a company's YouTube channel
const searchCompanyChannels = async (company, API_KEY) => {
  console.log(`🔍 Searching for YouTube channels related to: ${company}`);
  
  try {
    // First, search for channels related to the company
    const channelSearchResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          q: `${company} official channel`,
          type: 'channel',
          maxResults: 5,
          key: API_KEY
        }
      }
    );
    
    let companyVideos = [];
    
    if (channelSearchResponse.data?.items?.length > 0) {
      const channelIds = channelSearchResponse.data.items.map(item => item.id.channelId);
      console.log(`Found ${channelIds.length} possible channels for ${company}`);
      
      // For each channel, get their videos
      for (const channelId of channelIds) {
        try {
          const channelVideosResponse = await axios.get(
            `https://www.googleapis.com/youtube/v3/search`,
            {
              params: {
                part: 'snippet',
                channelId: channelId,
                maxResults: 10,
                type: 'video',
                key: API_KEY,
                order: 'relevance',
                videoEmbeddable: true
              }
            }
          );
          
          if (channelVideosResponse.data?.items?.length > 0) {
            const videos = channelVideosResponse.data.items.map(item => ({
              id: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.medium.url,
              channelName: item.snippet.channelTitle,
              publishDate: item.snippet.publishedAt,
              description: item.snippet.description,
              videoId: item.id.videoId,
              searchQuery: 'Official Channel',
              isOfficialChannel: true
            }));
            
            console.log(`Found ${videos.length} videos from channel ${channelId}`);
            companyVideos = [...companyVideos, ...videos];
          }
        } catch (error) {
          console.error(`Error fetching videos from channel ${channelId}:`, error.message);
        }
      }
    }
    
    return companyVideos;
  } catch (error) {
    console.error('Error searching for company channels:', error.message);
    return [];
  }
};

// Add a function to help detect industry based on company name
function detectIndustry(company) {
  const companyLower = company.toLowerCase();
  const industries = [];
  
  // Industry detection patterns
  if (/tech|software|app|digital|cyber|ai|cloud|data/i.test(companyLower)) 
    industries.push('technology');
  if (/bank|financial|invest|capital|fund|asset|wealth/i.test(companyLower)) 
    industries.push('finance');
  if (/health|pharma|medical|hospital|care/i.test(companyLower)) 
    industries.push('healthcare');
  if (/retail|shop|store|market|ecommerce/i.test(companyLower)) 
    industries.push('retail');
  if (/food|restaurant|beverage|catering/i.test(companyLower)) 
    industries.push('food');
  if (/travel|hotel|tourism|airline|flight/i.test(companyLower)) 
    industries.push('travel');
  if (/media|news|entertainment|film|tv|television|streaming|broadcast/i.test(companyLower)) 
    industries.push('media');
  if (/energy|oil|gas|power|renewable|electric/i.test(companyLower)) 
    industries.push('energy');
  if (/manufacturing|industrial|factory|production/i.test(companyLower)) 
    industries.push('manufacturing');
  if (/consult|service|solution|agency/i.test(companyLower)) 
    industries.push('consulting');
  if (/telecom|network|communication/i.test(companyLower)) 
    industries.push('telecommunications');
  if (/auto|car|vehicle|motor/i.test(companyLower)) 
    industries.push('automotive');
  
  // Default industry if none detected
  if (industries.length === 0) {
    industries.push('business');
  }
  
  return industries;
}

// Try to find official channel for the company
async function findOfficialChannel(company) {
  try {
    console.log(`Looking for official YouTube channel for ${company}...`);
    
    // Search for the company's channel
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          q: `${company} official`,
          type: 'channel',
          maxResults: 5,
          key: API_KEY
        }
      }
    );
    
    if (!response.data?.items?.length) {
      console.log(`No official channels found for ${company}`);
      return null;
    }
    
    // Get the first channel that seems official
    const potentialChannels = response.data.items.filter(item => {
      const title = item.snippet.title.toLowerCase();
      const channelName = company.toLowerCase();
      
      // Check if channel title contains company name or vice versa
      return title.includes(channelName) || 
             channelName.includes(title) ||
             // Handle acronyms and simplified names
             (title.split(' ').some(word => channelName.includes(word) && word.length > 2));
    });
    
    if (potentialChannels.length === 0) {
      console.log(`No channels matching "${company}" name found`);
      return null;
    }
    
    const officialChannel = potentialChannels[0];
    console.log(`Found potential official channel: ${officialChannel.snippet.title}`);
    return officialChannel.id.channelId;
  } catch (error) {
    console.error('Error finding official channel:', error.message);
    return null;
  }
}

// Function to get videos from a channel
async function getVideosFromChannel(channelId, maxResults = 10) {
  try {
    console.log(`Fetching videos from channel ${channelId}...`);
    
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          channelId: channelId,
          maxResults: maxResults,
          order: 'date',
          type: 'video',
          key: API_KEY
        }
      }
    );
    
    if (!response.data?.items?.length) {
      console.log(`No videos found in channel ${channelId}`);
      return [];
    }
    
    console.log(`Found ${response.data.items.length} videos from official channel`);
    
    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelName: item.snippet.channelTitle,
      publishDate: item.snippet.publishedAt,
      description: item.snippet.description,
      videoId: item.id.videoId,
      searchQuery: 'Official Channel',
      isOfficial: true // Mark as official channel content
    }));
  } catch (error) {
    console.error('Error fetching channel videos:', error.message);
    return [];
  }
}

export default router;