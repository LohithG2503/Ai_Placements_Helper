const csv = require('csv-parser');
const fs = require('fs');
const { logError, logSuccess } = require('../server');

class CompanyDataService {
  constructor() {
    this.companies = [];
    this.dataLoaded = false;
    this.dataPath = "D:/PROJECTS/Ai_Placement_Helper/TESTING/companies_sorted.csv";
    this.loadData().catch(error => {
      logError(error, 'CompanyDataService Init');
    });
  }

  async loadData() {
    if (this.dataLoaded) return;

    console.log('🔄 Loading company dataset...');
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.dataPath)
        .pipe(csv())
        .on('data', (data) => {
          if (data.company_name?.trim()) {
            this.companies.push(this.cleanCompanyData(data));
          }
        })
        .on('end', () => {
          this.dataLoaded = true;
          logSuccess('Company dataset loaded', {
            totalCompanies: this.companies.length
          });
          resolve();
        })
        .on('error', (error) => {
          logError(error, 'CSV Loading Error');
          reject(error);
        });
    });
  }

  async findCompany(filters) {
    await this.loadData();
    
    const searchName = this.normalizeCompanyName(filters.name);
    console.log(`🔍 Searching for company: ${searchName}`);
    
    // Try exact match first
    let company = this.companies.find(c => 
      this.normalizeCompanyName(c.name) === searchName
    );
  
    // Try fuzzy match if exact match fails
    if (!company) {
      company = this.companies.find(c => {
        const normalizedCompanyName = this.normalizeCompanyName(c.name);
        return (
          normalizedCompanyName.includes(searchName) ||
          searchName.includes(normalizedCompanyName)
        );
      });
    }

    // If still not found, try more flexible matching
    if (!company) {
      const words = searchName.split(/\s+/);
      company = this.companies.find(c => {
        const companyWords = this.normalizeCompanyName(c.name).split(/\s+/);
        return words.some(word => 
          companyWords.some(companyWord => 
            companyWord.includes(word) || word.includes(companyWord)
          )
        );
      });
    }
  
    if (!company) {
      console.warn(`⚠️ Company "${filters.name}" not found in dataset`);
      return null;
    }
  
    logSuccess(`Company found`, { name: company.name });
    return this.formatCompanyResponse(company);
  }

  formatCompanyResponse(company) {
    return {
      name: company.name,
      description: this.generateDescription(company),
      url: company.linkedinUrl || this.generateLinkedInUrl(company.name),
      additionalInfo: {
        founded: company.yearFounded || null,
        headquarters: this.formatLocation(company) || null,
        industry: company.industry,
        employeeCount: this.formatEmployeeCount(company),
        sizeRange: company.sizeRange,
        domain: company.domain || null
      },
      culture: this.generateCultureInfo(company),
      careerGrowth: this.generateCareerInfo(company),
      interviewPrep: this.generateInterviewPrep(company)
    };
  }
  
  cleanCompanyData(data) {
    // Basic data validation
    if (!data.company_name?.trim()) {
      return null;
    }

    return {
      name: data.company_name.trim(),
      domain: data.domain?.trim() || null,
      yearFounded: this.validateYearFounded(data['year founded']),
      industry: this.validateIndustry(data.industry),
      sizeRange: this.validateSizeRange(data['size range']),
      locality: data.locality?.trim() || null,
      country: data.country?.trim() || null,
      linkedinUrl: data['linkedin url']?.trim() || null,
      currentEmployeeEstimate: this.validateEmployeeCount(data['current employee estimate']),
      totalEmployeeEstimate: this.validateEmployeeCount(data['total employee estimate'])
    };
  }

  validateYearFounded(year) {
    const parsed = parseInt(year);
    if (isNaN(parsed) || parsed < 1800 || parsed > new Date().getFullYear()) {
      return null;
    }
    return parsed;
  }

  validateIndustry(industry) {
    return industry?.trim() || 'Technology';
  }

  validateSizeRange(size) {
    const validSizes = [
      'Self-employed',
      '1-10',
      '11-50',
      '51-200',
      '201-500',
      '501-1000',
      '1001-5000',
      '5001+'
    ];
    const normalized = size?.trim();
    return validSizes.includes(normalized) ? normalized : 'Information not available';
  }

  validateEmployeeCount(count) {
    const parsed = parseInt(count);
    return !isNaN(parsed) && parsed > 0 ? parsed : 0;
  }

  normalizeCompanyName(name) {
    return name.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  generateDescription(company) {
    const parts = [];
    
    // Start with company name and industry (industry has 96% coverage)
    parts.push(`${company.name} is a${company.sizeRange ? ` ${company.sizeRange.toLowerCase()}` : ''} ${company.industry} company`);
    
    // Add employee count if available (100% coverage for estimates)
    if (company.currentEmployeeEstimate > 0) {
      parts.push(`with approximately ${this.formatNumber(company.currentEmployeeEstimate)} current employees`);
    }
    
    // Add location if available (65% coverage for either locality or country)
    const location = this.formatLocation(company);
    if (location) {
      parts.push(`headquartered in ${location}`);
    }
    
    // Add founding year if available (50% coverage)
    if (company.yearFounded) {
      parts.push(`established in ${company.yearFounded}`);
    }
  
    return parts.join(', ') + '.';
  }

  formatLocation(company) {
    if (!company.locality && !company.country) return null;
    if (!company.locality) return company.country;
    if (!company.country) return company.locality;
    return `${company.locality}, ${company.country}`;
  }

  formatNumber(num) {
    if (!num) return null;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatEmployeeCount(company) {
    if (company.currentEmployeeEstimate) {
      return `${this.formatNumber(company.currentEmployeeEstimate)} current employees`;
    }
    if (company.sizeRange) {
      return `${company.sizeRange} employees`;
    }
    return 'Information not available';
  }

  generateLinkedInUrl(companyName) {
    return `https://www.linkedin.com/company/${companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`;
  }

  generateCultureInfo(company) {
    return {
      values: [
        `${company.industry || 'Industry'} Excellence`,
        'Innovation & Growth',
        'Professional Development',
        company.sizeRange ? `${company.sizeRange} Organization Culture` : 'Organizational Culture',
        'Global Collaboration'
      ],
      benefits: [
        'Competitive Compensation',
        'Professional Development',
        'Career Growth Opportunities',
        company.sizeRange ? `${company.sizeRange} Organization Benefits` : 'Company Benefits',
        'Learning & Development'
      ]
    };
  }

  generateCareerInfo(company) {
    return {
      promotionPath: `Career advancement opportunities in ${company.industry || 'the industry'}`,
      learningOpportunities: `Professional development in ${company.sizeRange || 'growing'} organization`,
      mentorshipPrograms: 'Structured mentorship programs available'
    };
  }

  generateInterviewPrep(company) {
    return {
      process: [
        'Initial Application Review',
        company.industry ? `${company.industry} Domain Assessment` : 'Technical Assessment',
        'Technical Rounds',
        'HR Discussion',
        'Final Interview'
      ],
      tipsAndTricks: [
        `Research ${company.industry || 'industry'} background`,
        'Review job requirements thoroughly',
        'Prepare relevant work examples',
        'Research company culture and values',
        'Prepare thoughtful questions'
      ]
    };
  }
}

module.exports = new CompanyDataService();
