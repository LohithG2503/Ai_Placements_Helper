import express from 'express';
import { getCompanyInfo, searchCompanies } from '../src/services/companyService.js';
import { logError, logSuccess } from '../server.js';
import Company from '../models/Company.js';

const router = express.Router();

/**
 * @route GET /api/company/search/:query
 * @desc Search for companies by name
 * @access Public
 */
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    
    if (!searchQuery || searchQuery.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    const companies = await searchCompanies(searchQuery);
    
    logSuccess('Company search completed', { query: searchQuery, count: companies.length });
    
    return res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    logError(error, 'Company Search');
    return res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

/**
 * @route GET /api/company/:name
 * @desc Get company information by name
 * @access Public
 */
router.get('/:name', async (req, res) => {
  try {
    const companyName = req.params.name;
    
    if (!companyName) {
      return res.status(400).json({ 
        error: 'Company name is required',
        success: false 
      });
    }
    
    console.log(`Company info request received for: ${companyName}`);
    
    // First try to get from database directly
    try {
      const companyFromDB = await Company.findOne({
        name: { $regex: new RegExp(`^${companyName}$`, 'i') }
      });
      
      if (companyFromDB) {
        console.log(`Found company "${companyName}" directly in database`);
        
        logSuccess('Company info fetched from DB directly', { company: companyName });
        return res.json({
          success: true,
          data: companyFromDB
        });
      }
    } catch (dbError) {
      console.warn(`Direct DB lookup failed for "${companyName}":`, dbError.message);
      // Continue to service-based lookup
    }
    
    // If not found directly, use the service (which includes fallbacks)
    const result = await getCompanyInfo(companyName);
    
    if (!result.success) {
      logError(new Error(result.error || 'Unknown error'), 'Company Info');
      return res.status(500).json({ 
        error: result.error || 'Failed to retrieve company information',
        success: false,
        details: result.details
      });
    }
    
    // Double check we have data
    if (!result.data || Object.keys(result.data).length === 0) {
      console.warn(`Empty data returned for "${companyName}" even though success=true`);
      return res.status(200).json({
        success: false,
        error: `No data found for company: ${companyName}`,
        data: {
          name: companyName,
          description: `Information for ${companyName} is currently unavailable.`,
          industry: "Not specified",
          founded: "Not specified",
          headquarters: "Not specified",
          employeeCount: "Not specified",
          source: "error"
        }
      });
    }
    
    logSuccess('Company info fetched successfully', { company: companyName, source: result.data.source || 'unknown' });
    
    return res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Unhandled error in company route:', error);
    logError(error, 'Company Info');
    return res.status(500).json({ 
      error: error.message,
      success: false,
      // Always provide some fallback data even on error
      data: {
        name: req.params.name || 'Unknown',
        description: 'An error occurred while retrieving company information.',
        industry: "Not available",
        source: "error"
      }
    });
  }
});

/**
 * @route GET /api/company
 * @desc Get list of available companies
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Get a limited list of companies for dropdown/suggestion purposes
    const companies = await Company.find({})
      .select('name industry headquarters')
      .limit(20)
      .sort({ name: 1 });
    
    return res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    logError(error, 'Company List');
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 