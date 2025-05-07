const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Get details for a specific company
router.post('/details', companyController.getCompanyDetails);

// Search companies with filters
router.get('/search', companyController.searchCompanies);

module.exports = router;
