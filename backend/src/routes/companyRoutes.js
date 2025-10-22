import express from 'express';
import {
  registerCompany,
  getCompanyProfile,
  updateCompanyProfile,
  uploadLogo,
  uploadBanner,
} from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { companyValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// All company routes require authentication
router.use(authenticate);

router.post('/register', companyValidation, validate, registerCompany);
router.get('/profile', getCompanyProfile);
router.put('/profile', companyValidation, validate, updateCompanyProfile);
router.post('/upload-logo', uploadLogo);
router.post('/upload-banner', uploadBanner);

export default router;
