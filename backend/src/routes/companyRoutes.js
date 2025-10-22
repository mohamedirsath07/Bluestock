import express from 'express';
import {
  getCompany,
  updateCompany,
  uploadImage,
  addSocialLink,
  deleteSocialLink,
} from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { companyValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// All company routes require authentication
router.use(authenticate);

router.get('/', getCompany);
router.put('/', companyValidation, validate, updateCompany);
router.post('/upload', uploadImage);
router.post('/social', addSocialLink);
router.delete('/social/:linkId', deleteSocialLink);

export default router;
