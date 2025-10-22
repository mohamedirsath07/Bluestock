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
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name is required (2-255 characters)'),
  body('gender')
    .isIn(['m', 'f', 'o'])
    .withMessage('Gender must be m (male), f (female), or o (other)'),
  body('mobile_no')
    .custom((value) => {
      try {
        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber.isValid();
      } catch {
        return false;
      }
    })
    .withMessage('Valid mobile number with country code is required'),
  body('signup_type')
    .optional()
    .isIn(['e', 'g'])
    .withMessage('Signup type must be e (email) or g (Google)'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const companyValidation = [
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be 2-255 characters'),
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be 2-50 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be 2-50 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be 2-50 characters'),
  body('postal_code')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be 3-20 characters'),
  body('website')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Valid URL is required'),
  body('industry')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
  body('founded_date')
    .optional()
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('description')
    .optional()
    .customSanitizer((value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }))
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('social_links')
    .optional()
    .isObject()
    .withMessage('Social links must be a valid JSON object'),
];

export const otpValidation = [
  body('mobile_no')
    .custom((value) => {
      try {
        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber.isValid();
      } catch {
        return false;
      }
    })
    .withMessage('Valid mobile number with country code is required'),
  body('otp_code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
];
