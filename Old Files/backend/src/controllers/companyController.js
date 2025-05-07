import { CompanyService } from '../services/CompanyService.js';

const companyService = new CompanyService();

export const getCompanyDetails = async (req, res) => {
  try {
    const { companyName } = req.params;
    
    if (!companyName?.trim()) {
      return res.status(400).json({ 
        error: 'Company name is required'
      });
    }

    const companyData = await companyService.findCompany({ name: companyName });
    
    if (!companyData) {
      return res.status(404).json({
        error: 'Company not found',
        searchedName: companyName
      });
    }

    res.json({
      status: 'success',
      data: companyData
    });

  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
};

exports.searchCompanies = async (req, res) => {
  try {
    const results = await companyDataService.searchCompanies(req.query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
