import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(
      new AppError(
        formatted[0]?.message || 'Validation failed',
        400,
        'VALIDATION_ERROR',
        formatted
      )
    );
  }
  return next();
}

export const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .isIn(['STUDENT', 'COMPANY'])
    .withMessage('Role must be either STUDENT or COMPANY'),
  validateRequest,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email address is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

export const internshipValidation = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('work_mode')
    .isIn(['On-site', 'Remote', 'Hybrid'])
    .withMessage('Work mode must be On-site, Remote, or Hybrid'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('application_deadline').notEmpty().withMessage('Application deadline is required'),
  validateRequest,
];

export const applicationValidation = [
  body('cover_letter')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Cover letter must be at least 20 characters long'),
  validateRequest,
];

export const interviewValidation = [
  body('application_id').notEmpty().withMessage('Application ID is required'),
  body('scheduled_date').notEmpty().withMessage('Interview date is required'),
  body('start_time').notEmpty().withMessage('Start time is required'),
  body('end_time').notEmpty().withMessage('End time is required'),
  body('interview_type')
    .isIn(['Online', 'In-person', 'Phone'])
    .withMessage('Interview type must be Online, In-person, or Phone'),
  validateRequest,
];
