import { getCompanyInfo } from '../src/services/companyService.js';

export const getCompanyDetails = async (req, res) => {
  try {
    const { companyName } = req.query;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    const result = await getCompanyInfo(companyName);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error || 'Failed to fetch company information'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      source: result.source || 'api'
    });

  } catch (error) {
    console.error('Error in getCompanyDetails controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 