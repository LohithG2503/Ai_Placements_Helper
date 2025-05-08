import dotenv from 'dotenv';
dotenv.config();

import MistralModule from '@mistralai/mistralai'; // Import the entire module export

// Access the Mistral constructor from the imported module
const MistralClient = MistralModule.Mistral; 

console.log("[mistralService.js] Attempting to use MistralModule.Mistral. typeof is:", typeof MistralClient);

const apiKey = process.env.MISTRAL_API_KEY;

//console.log("[mistralService.js] MISTRAL_API_KEY value:", apiKey);
//console.log("[mistralService.js] MISTRAL_API_KEY type:", typeof apiKey);

if (!apiKey) {
  console.error("[mistralService.js] MISTRAL_API_KEY is not set or is empty. Please check your .env file and server restart.");
}

// Instantiate the client using the resolved MistralClient, expecting it to be the constructor
// Pass apiKey as an option: { apiKey: apiKey }
let client = null;
if (apiKey && MistralClient) { // Also check if MistralClient is now defined
  try {
    client = new MistralClient({ apiKey: apiKey });
    console.log("[mistralService.js] Successfully instantiated Mistral client via MistralModule.Mistral.");
  } catch (e) {
    console.error("[mistralService.js] Error instantiating Mistral client via MistralModule.Mistral:", e);
  }
} else if (!MistralClient) {
    console.error("[mistralService.js] MistralClient (from MistralModule.Mistral) is undefined. Check library export structure.");
}

/**
 * Analyzes a job description using the Mistral API.
 * @param {string} jobDescriptionText The job description text.
 * @param {string} model The Mistral model to use (e.g., 'mistral-medium-latest').
 * @returns {Promise<string>} The analysis result from the Mistral API.
 */
async function analyzeJDWithMistral(jobDescriptionText, model = 'mistral-medium-latest') {
  if (!client) {
    if (!apiKey) { 
        throw new Error("Mistral client cannot be initialized because MISTRAL_API_KEY is missing or empty.");
    }
    throw new Error("Mistral client is not initialized. Instantiation failed. Check server logs for 'Error instantiating Mistral client' messages.");
  }

  if (!jobDescriptionText || typeof jobDescriptionText !== 'string' || jobDescriptionText.trim() === '') {
    throw new Error("Job description text must be a non-empty string.");
  }

  // Updated prompt for more flexible, context-based extraction and more concise summaries
  const detailedPrompt = `Analyze the following job description and extract key information into a JSON object. 
Infer the information from the overall text, even if specific tags like "Company:" or "Location:" are not present. 
For lists like responsibilities and requirements, prioritize summarizing the information into concise points rather than copying verbatim, especially if the original points are lengthy or numerous. Aim for clarity and brevity suitable for a quick overview.
Follow these guidelines for extraction:

1.  **Job Title:** Identify the most likely job title from the description. If no clear job title is discernible, use "Not specified".
2.  **Company Name:** Identify the company offering the position from the text. This might be explicitly stated or inferred. If no company name can be reliably identified, use "Not specified".
3.  **Location:** Determine the primary work location(s) mentioned. This could be a city, state, country, or indicate if it's remote. If no location is mentioned, use "Not specified".
4.  **Salary Range:** Scan for any mention of salary or compensation. If not found, use "Not specified".
5.  **Job Type:** Identify the type of employment (e.g., Full-time, Part-time, Contract, Internship) based on terms used. If not clear, use "Not specified".
6.  **Responsibilities:** Identify the main duties and key responsibilities. Summarize these into a list of concise, impactful statements. If the original text contains many detailed bullet points, condense them into higher-level summaries. Present as a list of strings. If none are clearly stated, use an empty array [].
7.  **Requirements/Qualifications:** Identify essential skills, core qualifications, key experience, and necessary education. Summarize these into a list of concise, impactful statements. Focus on the most critical requirements. If the original text is very detailed, provide a summarized list. Present as a list of strings. If none are clearly stated, use an empty array [].
8.  **How to Apply:** Find instructions or links on how to apply. If not mentioned, use "Not specified".

Return ONLY a valid JSON object in this exact format (do not add any text before or after the JSON object):
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
---
${jobDescriptionText}
---`;

  const messages = [
    {
      role: 'user',
      content: detailedPrompt,
    },
  ];

  try {
    console.log(`Sending request to Mistral API with model: ${model} for context-based JSON output.`);
    const chatResponse = await client.chat.complete({
      model: model,
      messages: messages,
      // You can add other parameters here if needed, e.g., temperature, max_tokens
      // temperature: 0.7,
      // max_tokens: 500,
    });

    if (chatResponse && chatResponse.choices && chatResponse.choices.length > 0 && chatResponse.choices[0].message) {
      console.log("Received response from Mistral API.");
      return chatResponse.choices[0].message.content;
    } else {
      console.error("Invalid response structure from Mistral API:", chatResponse);
      throw new Error('Invalid response structure from Mistral API.');
    }
  } catch (error) {
    console.error('Error calling Mistral API:', error.message);
    // It might be useful to log the full error object for more details in some cases
    // console.error(error); 
    throw new Error(`Failed to get analysis from Mistral API: ${error.message}`);
  }
}

export {
  analyzeJDWithMistral,
}; 