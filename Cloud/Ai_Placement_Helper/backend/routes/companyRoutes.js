import express from 'express';
import { getCompanyDetails, searchCompanies, getCompanyList } from '../src/controllers/companyController.js';

const router = express.Router();

/**
 * @route GET /api/company/search/:query
 * @desc Search for companies by name or industry
 * @access Public
 */
router.get('/search/:query', searchCompanies);

/**
 * @route GET /api/company/search
 * @desc Search for companies using query parameter
 * @access Public
 */
router.get('/search', searchCompanies);

/**
 * @route GET /api/company/:name
 * @desc Get company information by name
 * @access Public
 */
router.get('/:name', getCompanyDetails);

/**
 * @route GET /api/company/details
 * @desc Get company information by name (using query parameter)
 * @access Public
 */
router.get('/details', getCompanyDetails);

/**
 * @route GET /api/company
 * @desc Get list of available companies (basic info)
 * @access Public
 */
router.get('/', getCompanyList);

export default router; 