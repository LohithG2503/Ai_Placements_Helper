import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';

dotenv.config();

// Default data to use for any company missing these fields
const defaultHiringProcess = {
  avgTimeToHire: "3-6 weeks",
  applicationPortal: "Company career portal or job boards",
  referralBonus: "Available for employees (varies by position)",
  requiredDocuments: [
    "Resume/CV",
    "Cover Letter",
    "Educational certificates",
    "ID proof",
    "Address proof",
    "Previous employment certificates",
    "Professional certifications",
    "Reference contacts"
  ],
  backgroundCheckInfo: "Standard background verification including education, employment, and criminal records check"
};

const defaultCareerGrowth = {
  promotionOpportunities: "Regular performance reviews with promotion cycles based on merit and experience",
  trainingPrograms: "Internal learning platform with technical and soft skills training",
  mentorship: "Formal mentorship programs available for employees at all levels",
  careerPaths: [
    "Technical track (Individual contributor to Technical Expert)",
    "Management track (Team Lead to Director/Executive)",
    "Specialist/Domain Expert track"
  ],
  performanceReviewProcess: "Bi-annual performance reviews with feedback from managers and peers",
  internalMobilityOptions: "Internal job postings and cross-functional movement opportunities"
};

const defaultInterviewProcess = {
  rounds: [
    "InfyTQ assessment", 
    "Technical interview", 
    "HR discussion"
  ],
  typicalDuration: "2-3 weeks",
  tips: [
    "Strong in programming fundamentals",
    "Communication skills",
    "Analytical thinking"
  ],
  commonQuestions: [
    "Tell us about your background and experience",
    "Why are you interested in this role?",
    "Describe a challenging project and how you handled it",
    "How do you stay updated with industry trends?",
    "Where do you see yourself in 5 years?",
    "What are your salary expectations?"
  ],
  dresscode: "Business casual (unless specified otherwise)",
  onlineAssessments: "May include technical assessments relevant to the role"
};

async function enhanceCompanyData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");

    // Get all companies
    const companies = await Company.find({});
    console.log(`Found ${companies.length} companies in the database`);

    let updatedCount = 0;
    
    // Loop through each company and enhance if needed
    for (const company of companies) {
      let needsUpdate = false;
      
      // Check and enhance hiring process
      if (!company.hiringProcess || Object.keys(company.hiringProcess).length === 0) {
        company.hiringProcess = { ...defaultHiringProcess };
        needsUpdate = true;
        console.log(`Adding hiring process for ${company.name}`);
      }
      
      // Check and enhance career growth
      if (!company.careerGrowth || Object.keys(company.careerGrowth).length === 0) {
        company.careerGrowth = { ...defaultCareerGrowth };
        needsUpdate = true;
        console.log(`Adding career growth for ${company.name}`);
      }
      
      // Check and enhance interview process
      if (!company.interviewProcess || Object.keys(company.interviewProcess).length === 0) {
        // Use the new function to get company-specific interview process
        company = await enhanceCompanyWithInterviewProcess(company);
        needsUpdate = true;
      }
      
      // Save if updates were made
      if (needsUpdate) {
        await company.save();
        updatedCount++;
        console.log(`Enhanced data for ${company.name}`);
      }
    }
    
    console.log(`Successfully enhanced ${updatedCount} companies with improved hiring and career data`);
    
  } catch (error) {
    console.error("Error enhancing company data:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

/**
 * Add standard interview process information to a company if not present
 * @param {Object} company - Company document to enhance
 * @param {boolean} overwrite - Whether to overwrite existing data
 * @returns {Object} - Enhanced company document
 */
async function enhanceCompanyWithInterviewProcess(company, overwrite = false) {
  console.log(`Enhancing interview process data for ${company.name}...`);
  
  // If company already has interview process and we're not overwriting, skip
  if (company.interviewProcess && Object.keys(company.interviewProcess).length > 0 && !overwrite) {
    console.log(`Company ${company.name} already has interview process data. Skipping.`);
    return company;
  }
  
  // Try to get known interview process for this company
  const companyService = await import('../src/services/companyService.js');
  const knownProcess = companyService.getWellKnownInterviewProcess(company.name);
  
  if (knownProcess) {
    console.log(`Using well-known interview process for ${company.name}`);
    company.interviewProcess = {
      rounds: knownProcess,
      typicalDuration: "2-3 weeks",
      tips: [
        "Strong in programming fundamentals",
        "Communication skills",
        "Analytical thinking"
      ],
      commonQuestions: defaultInterviewProcess.commonQuestions
    };
  } else {
    // Use default interview process
    company.interviewProcess = {...defaultInterviewProcess};
    
    // Customize some aspects based on company industry if available
    if (company.industry) {
      // Adjust based on industry
      if (company.industry.toLowerCase().includes('tech') || 
          company.industry.toLowerCase().includes('software') ||
          company.industry.toLowerCase().includes('it')) {
        company.interviewProcess.tips.unshift(`Knowledge of ${company.industry} trends`);
      }
    }
  }
  
  return company;
}

// Run the enhancement function
enhanceCompanyData()
  .then(() => console.log("Data enhancement process complete!"))
  .catch(err => console.error("Fatal error during enhancement process:", err)); 