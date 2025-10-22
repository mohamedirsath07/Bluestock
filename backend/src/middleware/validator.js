import { body, validationResult } from 'express-validator';
import { parsePhoneNumber } from 'libphonenumber-js';
import sanitizeHtml from 'sanitize-html';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('phone')
    .custom((value) => {
      try {
        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber.isValid();
      } catch {
        return false;
      }
    })
    .withMessage('Valid phone number is required'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const companyValidation = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be 2-255 characters'),
  body('aboutUs')
    .optional()
    .customSanitizer((value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }))
    .isLength({ max: 2000 })
    .withMessage('About us must be less than 2000 characters'),
  body('organizationType')
    .optional()
    .isIn(['private', 'public', 'partnership', 'sole', 'llp'])
    .withMessage('Invalid organization type'),
  body('industryType')
    .optional()
    .isIn(['fintech', 'engineering', 'software', 'edtech', 'oil-gas', 'other'])
    .withMessage('Invalid industry type'),
  body('teamSize')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501+'])
    .withMessage('Invalid team size'),
  body('companyWebsite')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Valid URL is required'),
  body('contactEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('contactPhone')
    .optional()
    .custom((value) => {
      try {
        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber.isValid();
      } catch {
        return false;
      }
    })
    .withMessage('Valid phone number is required'),
];

export const otpValidation = [
  body('phone')
    .custom((value) => {
      try {
        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber.isValid();
      } catch {
        return false;
      }
    })
    .withMessage('Valid phone number is required'),
  body('otpCode')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
];
