import express from "express";
import axios from "axios";
import { jsonrepair } from "jsonrepair";
import { logError, logSuccess } from "../server.js";
import { getCompanyInfo } from "../src/services/companyService.js";

const router = express.Router();
const AI_MODEL_URL = "http://127.0.0.1:8080/completion";

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
        companyInfo = await getCompanyInfo(jobDetails.company);
        logSuccess("Company info fetched successfully", { company: jobDetails.company });
      } catch (companyError) {
        logError(companyError, "Company Info Fetching");
        // Don't fail the entire request if company info fails
        companyInfo = { error: "Failed to fetch company information" };
      }
    }

    res.json({ 
      job_details: jobDetails,
      company_info: companyInfo
    });
  } catch (error) {
    console.error("Error processing job description:", error);
    res.status(500).json({ 
      error: "Failed to process job description",
      details: error.message 
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
    const companyInfo = await getCompanyInfo(companyName);
    if (!companyInfo) {
      return res.status(404).json({ error: 'Company details not found' });
    }
    res.json(companyInfo);
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

export default router;