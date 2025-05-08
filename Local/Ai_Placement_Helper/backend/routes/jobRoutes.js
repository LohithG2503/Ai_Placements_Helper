import express from "express";
// Remove axios and jsonrepair if no longer needed for this specific route after changes
// import axios from "axios"; 
import { jsonrepair } from "jsonrepair"; // Re-added import
import CompanyService from "../src/services/companyService.js";
import { analyzeJDWithMistral } from "../src/services/mistralService.js"; // Corrected import path

const router = express.Router();
// const AI_MODEL_URL = "http://127.0.0.1:8080/completion"; // Commented out or remove
const companyService = new CompanyService();

/**
 * @route   POST /api/jobs/query
 * @desc    Process job description and extract job details using Mistral AI (JSON output)
 * @access  Public
 */
router.post("/query", async (req, res) => {
  try {
    const { job_description } = req.body;
    if (!job_description) {
      return res.status(400).json({ error: "Job description is required" });
    }

    console.log("Processing job description with Mistral AI for JSON output...");
    const mistralRawResponse = await analyzeJDWithMistral(job_description);
    console.log("Received raw response from Mistral AI.");

    let jobDetails;
    try {
      // First try to parse the response directly
      console.log("Attempting direct JSON parse...");
      jobDetails = JSON.parse(mistralRawResponse);
      console.log("Direct JSON parse successful.");
    } catch (parseError) {
      console.warn("Direct JSON parse failed. Attempting with jsonrepair...", parseError.message);
      try {
        // If direct parsing fails, try to repair and parse
        const repairedJsonString = jsonrepair(mistralRawResponse);
        jobDetails = JSON.parse(repairedJsonString);
        console.log("JSON parse successful with jsonrepair.");
      } catch (repairError) {
        console.error("Could not extract valid JSON from Mistral response even after repair:", repairError.message);
        console.error("Mistral Raw Response was:", mistralRawResponse); // Log the problematic response
        throw new Error("Could not extract valid JSON from AI response. Content: " + mistralRawResponse);
      }
    }

    // Validate the extracted data (essential fields)
    if (!jobDetails || !jobDetails.job_title || !jobDetails.company) {
      console.error("Missing required job details (job_title or company) in parsed JSON.", jobDetails);
      throw new Error("Missing required job details (job_title or company) after AI processing.");
    }
    console.log("Job details successfully parsed:", jobDetails.job_title, jobDetails.company);

    // --- Old AI Model Code - Commented out ---
    /*
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
    */ // --- End of Old AI Model Code ---

    // Get company information if company name is available
    let companyInfo = null;
    if (jobDetails.company && jobDetails.company.toLowerCase() !== "not specified") {
      try {
        console.log(`Fetching company info for: ${jobDetails.company}`);
        const result = await companyService.getCompanyInfo(jobDetails.company);
        companyInfo = result.data;
        console.log(`✅ Company info fetched successfully for: ${jobDetails.company}`);
      } catch (companyError) {
        console.error(`❌ [Company Info Fetching] Error for '${jobDetails.company}':`, companyError.message);
        companyInfo = { 
          name: jobDetails.company,
          description: `Information about ${jobDetails.company} could not be retrieved.`,
          source: "Error"
        };
      }
    } else {
      console.log("Company name not specified in AI output or is 'Not specified', skipping company info fetch.");
    }

    res.json({ 
      success: true,
      job_details: jobDetails,
      company_info: companyInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ [Job Processing] Error:", error.message);
    // console.error("❌ [Job Processing] Full Error Object:", error); // For more detailed debugging if needed
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
    
    // Determine company name and job title dynamically
    let company = req.query.companyFromJD || ''; // PRIORITIZE specific param from frontend
    let jobTitle = req.query.jobTitleFromJD || ''; // PRIORITIZE specific param from frontend
    if (Array.isArray(jobTitle)) {
        jobTitle = jobTitle[0];
    }
    const rawQuery = req.query.query || ""; // The combined query string (used as fallback)

    // If specific params are missing, fallback to parsing rawQuery (less reliable)
    if (!company && !jobTitle && rawQuery) {
        console.warn("⚠️ YouTube search: companyFromJD and jobTitleFromJD query params not provided. Falling back to parsing raw 'query' param. Frontend should be updated for best results.");
        
        // Attempt to extract base term before known interview keywords
        const interviewKeywordsInQuery = ["interview experience", "interview questions", "interview tips", "interview process", "interview"];
        let splitIndex = -1;
        for (const kw of interviewKeywordsInQuery) {
            const idx = rawQuery.toLowerCase().lastIndexOf(kw.toLowerCase());
            if (idx !== -1) {
                splitIndex = idx;
                break;
            }
        }
        let baseSearchTerm = (splitIndex !== -1) ? rawQuery.substring(0, splitIndex).trim() : rawQuery;

        // PROBLEM: Cannot reliably split "CompanyName JobTitle" string here without ambiguity.
        // Example: "Aetherial Dynamics Inc Lead Synergistic Systems Architect"
        // We NEED the frontend to send the company and job title separately based on Mistral's initial analysis.
        // As a last resort, we'll use the whole base term as jobTitle for query generation.
        jobTitle = baseSearchTerm;
        company = ""; // Cannot reliably guess company from the combined string here.
    }
    
    // Ensure jobTitle is not excessively long if derived from raw query fallback
    if (jobTitle.length > 100) { // Arbitrary limit
        jobTitle = jobTitle.split(' ').slice(0, 10).join(' '); // Limit length
    }

    console.log(`🔍 Using for YouTube search: company=\"${company}\", jobTitle=\"${jobTitle}\"`);
    
    const generateSearchQueries = (currentCompany, currentJobTitle) => {
      const queries = [];
      const interviewKeywords = ["interview questions and answers", "interview experience", "interview tips", "technical interview prep", "behavioral interview prep"];

      // Most specific queries
      if (currentCompany && currentJobTitle) {
        queries.push(`"${currentCompany}" "${currentJobTitle}" ${interviewKeywords[0]}`);
        queries.push(`"${currentCompany}" "${currentJobTitle}" ${interviewKeywords[1]}`);
      }

      // Broader job title queries
      if (currentJobTitle) {
        queries.push(`"${currentJobTitle}" ${interviewKeywords[0]}`);
        queries.push(`"${currentJobTitle}" ${interviewKeywords[2]}`);
        
        const titleWords = currentJobTitle.toLowerCase().split(' ').filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'lead', 'senior', 'jr', 'sr'].includes(w));
        
        // Try key terms from job title (e.g., "Systems Architect", "Software Engineer")
        if (titleWords.length >= 2) {
            const twoKeyTerms = titleWords.slice(0, 2).join(' '); // First two significant words
            queries.push(`"${twoKeyTerms}" ${interviewKeywords[3]}`);
        } else if (titleWords.length === 1) {
            queries.push(`"${titleWords[0]}" ${interviewKeywords[3]}`);
        }
      }
      
      // Company-specific interview process (if company is known)
      if (currentCompany) {
        queries.push(`"${currentCompany}" interview process`);
        queries.push(`working at "${currentCompany}" interview`);
      }

      // Generic fallback if other queries are too narrow
      if (currentJobTitle) {
          queries.push(`"${currentJobTitle.split(' ').slice(0,3).join(' ')}" general interview`); // First 3 words of job title + general interview
      }
      queries.push("tech job interview general tips"); // Absolute fallback

      // Remove duplicates and limit the number of queries to try
      return [...new Set(queries)].slice(0, 6); 
    };
    
    let searchQueries = generateSearchQueries(company, jobTitle);
    console.log(`🔍 Generated YouTube search queries:`, searchQueries);
    
    // Get YouTube API key from environment
    const API_KEY = process.env.GOOGLE_KG_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'YouTube API key is not configured'
      });
    }
    
    const BASE_URL = 'https://www.googleapis.com/youtube/v3';
    
    let allResults = [];
    let searchedAllQueries = false;

    // Iteratively try queries until we get enough results or run out of queries
    for (let i = 0; i < searchQueries.length; i++) {
        const currentQuery = searchQueries[i];
        console.log(`🚀 Attempting YouTube search with query: "${currentQuery}"`);
        try {
            const response = await fetch(
              `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(currentQuery)}&maxResults=${maxResults * 2}&type=video&relevanceLanguage=en&videoEmbeddable=true&key=${API_KEY}`
            );
            
            if (!response.ok) {
              console.error(`Error with query "${currentQuery}": ${response.statusText}`);
              continue; // Try next query
            }
            
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                console.log(`✅ Found ${data.items.length} results for query: "${currentQuery}"`);
                allResults = [...allResults, ...data.items];
                // If we get a decent number of results, we might stop early
                // or collect from a few queries to get diversity.
                // For now, let's try to get results from up to 2 successful queries or if many results from one.
                if (allResults.length >= maxResults * 1.5 && i < 2) { // If we have enough from early specific queries
                    // If first query yields many, maybe don't need others
                }
                 if (allResults.length >= maxResults * 3) { // Stop if we have plenty of videos
                    searchedAllQueries = (i + 1) === searchQueries.length;
                    break; 
                }
            } else {
                console.log(`😕 No results for query: "${currentQuery}"`);
            }
        } catch (error) {
            console.error(`Error with query "${currentQuery}": ${error.message}`);
        }
        if (i === searchQueries.length - 1) searchedAllQueries = true;
    }
    
    console.log(`Retrieved ${allResults.length} total results from ${searchedAllQueries ? 'all' : 'some'} attempted queries.`);
    
    // Deduplicate results based on videoId
    const uniqueVideoIds = new Set();
    const uniqueResults = allResults.filter(video => {
        if (video.id && video.id.videoId && !uniqueVideoIds.has(video.id.videoId)) {
            uniqueVideoIds.add(video.id.videoId);
            return true;
        }
        return false;
    });
    allResults = uniqueResults;
    console.log(`Found ${allResults.length} unique videos.`);

    if (allResults.length === 0 && rawQuery) { // Only if all generated queries failed and there was an original raw query
      try {
        console.log("No results found from generated queries, trying a broader search with the original full base query...");
        const fallbackQuery = `${baseSearchTerm} interview tips`; // Use the processed baseSearchTerm
        const response = await fetch(
          `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(fallbackQuery)}&maxResults=${maxResults}&type=video&relevanceLanguage=en&videoEmbeddable=true&key=${API_KEY}`
        );
        if (response.ok) {
          const data = await response.json();
          allResults = data.items || [];
          console.log(`Found ${allResults.length} results from broad fallback query.`);
        }
      } catch (error) {
        console.error('Error with broad fallback query:', error.message);
      }
    }
    
    // Refined scoring algorithm for relevance
    const scoreVideo = (video, compName, jobTitleStr) => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();
      const channelTitle = video.snippet.channelTitle.toLowerCase();
      let score = 0.0; // Use floating point for scores

      const compNameLower = compName ? compName.toLowerCase() : "";
      const jobTitleLower = jobTitleStr ? jobTitleStr.toLowerCase() : "";

      // Company Name Match (High Importance)
      if (compNameLower) {
        if (title.includes(compNameLower)) score += 15;
        else if (description.includes(compNameLower)) score += 7;
        else if (channelTitle.includes(compNameLower)) score += 5; // Company's own channel potentially
      }

      // Job Title Match (High Importance)
      if (jobTitleLower) {
        if (title.includes(jobTitleLower)) score += 12;
        else if (description.includes(jobTitleLower)) score += 6;

        // Match keywords from job title
        const jobKeywords = jobTitleLower.split(' ').filter(w => w.length > 3 && !['lead', 'senior', 'the', 'and', 'for'].includes(w));
        jobKeywords.forEach(keyword => {
          if (title.includes(keyword)) score += 3;
          if (description.includes(keyword)) score += 1.5;
        });
      }
      
      // Interview-specific content (Crucial)
      const interviewKeywords = {
        primary: ['interview questions', 'interview experience', 'interview process', 'technical interview', 'coding interview', 'behavioral interview', 'interview preparation', 'system design interview'],
        secondary: ['interview tips', 'interview guide', 'how to prepare', 'job interview', 'hiring process'],
        tertiary: ['career advice', 'job search', 'tech skills'] // More generic
      };

      interviewKeywords.primary.forEach(keyword => {
        if (title.includes(keyword)) score += 10;
        if (description.includes(keyword)) score += 5;
      });
      interviewKeywords.secondary.forEach(keyword => {
        if (title.includes(keyword)) score += 7;
        if (description.includes(keyword)) score += 3;
      });
       interviewKeywords.tertiary.forEach(keyword => {
        if (title.includes(keyword)) score += 2;
        if (description.includes(keyword)) score += 1;
      });

      // Channel relevance
      const careerChannelKeywords = ['career', 'job', 'interview coach', 'tech interview', 'software engineer channel', 'hr', 'recruiting'];
      careerChannelKeywords.forEach(keyword => {
        if (channelTitle.includes(keyword)) score += 3;
      });
      if (compNameLower && channelTitle.includes(compNameLower)) score += 5; // Bonus if channel title contains company

      // Content recency
      const publishDate = new Date(video.snippet.publishedAt);
      const now = new Date();
      const ageInYears = (now - publishDate) / (1000 * 60 * 60 * 24 * 365);
      if (ageInYears < 1) score += 3;
      else if (ageInYears < 2) score += 1.5;
      else if (ageInYears > 4) score -= 2;
      
      // Penalize clearly irrelevant content (example) - can be expanded
      if (title.includes("gaming") || title.includes("music video") || title.includes("vlog") && !title.includes("interview")) {
          if (!jobTitleLower.includes("game") && !compNameLower.includes("game")) score *= 0.1; // Drastically reduce score
      }
      if (title.toLowerCase().includes("chatgpt") && !jobTitleLower.includes("ai researcher") && !jobTitleLower.includes("machine learning")) score *= 0.5;


      return score;
    };
    
    // Score and sort videos
    const scoredVideos = allResults.map(video => ({
      video,
      score: scoreVideo(video, company, jobTitle) // Pass company and jobTitle to scoring
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