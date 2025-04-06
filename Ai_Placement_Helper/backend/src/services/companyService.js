import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Singleton instance
let instance = null;

class CompanyService {
  constructor() {
    // Only create a new instance if one doesn't exist
    if (instance) {
      return instance;
    }
    
    this.companies = [];
    this.loadCompaniesFromJSON();
    
    // Store the instance
    instance = this;
  }

  // Load all companies from the centralized JSON file
  loadCompaniesFromJSON() {
    try {
      const filePath = path.join(process.cwd(), '..', 'data', 'companies.json');
      const jsonData = fs.readFileSync(filePath, 'utf8');
      this.companies = JSON.parse(jsonData);
      console.log(`✅ Loaded ${this.companies.length} companies from JSON file`);
    } catch (error) {
      console.error('❌ Error loading companies from JSON:', error);
      this.companies = [
        {
          name: "Google",
          description: "Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.",
          industry: "Technology, Internet, Cloud Computing",
          founded: "September 4, 1998",
          headquarters: "Mountain View, California, United States",
          source: "Fallback Data"
        },
        {
          name: "Microsoft",
          description: "Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.",
          industry: "Technology, Software, Cloud Computing",
          founded: "April 4, 1975",
          headquarters: "Redmond, Washington, United States",
          source: "Fallback Data"
        }
      ];
      console.log(`⚠️ Using ${this.companies.length} fallback companies instead`);
    }
  }

  async getCompanyInfo(companyName) {
    try {
      if (!companyName?.trim()) {
        return this.createErrorResponse('Company name cannot be empty');
      }

      const normalizedName = companyName.trim().toLowerCase();
      
      // Search for company in the JSON data
      const company = this.findCompanyByName(normalizedName);
      
      if (company) {
        console.log(`Using data for: ${companyName}`);
        return this.createSuccessResponse(company);
      }

      return this.createErrorResponse(`No company information found for ${companyName}`);
    } catch (error) {
      console.error('Error in getCompanyInfo:', error);
      return this.createErrorResponse(error.message);
    }
  }

  findCompanyByName(normalizedName) {
    // Check for exact match
    const exactMatch = this.companies.find(
      company => company.name.toLowerCase() === normalizedName
    );
    
    if (exactMatch) return exactMatch;
    
    // Check for partial matches if exact match not found
    const partialMatch = this.companies.find(
      company => normalizedName.includes(company.name.toLowerCase()) || 
                 company.name.toLowerCase().includes(normalizedName)
    );
    
    return partialMatch || null;
  }

  async searchCompanies(query) {
    try {
      if (!query?.trim()) {
        return this.createErrorResponse('Search query cannot be empty');
      }

      const normalizedQuery = query.trim().toLowerCase();
      
      // Search company data from JSON
      const results = this.companies
        .filter(company => 
          company.name.toLowerCase().includes(normalizedQuery) ||
          (company.industry && company.industry.toLowerCase().includes(normalizedQuery))
        )
        .map(company => ({
          name: company.name,
          industry: company.industry,
          headquarters: company.headquarters
        }));
      
      return this.createSuccessResponse(results);
    } catch (error) {
      console.error('Error in searchCompanies:', error);
      return this.createSuccessResponse([]);
    }
  }

  async getCompanyList() {
    try {
      // Return all companies with basic info
      return this.companies.map(company => ({
        name: company.name,
        industry: company.industry,
        headquarters: company.headquarters
      }));
    } catch (error) {
      console.error('Error in getCompanyList:', error);
      return [];
    }
  }

  createSuccessResponse(data) {
    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };
  }

  createErrorResponse(message) {
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    };
  }
}

export default CompanyService; 