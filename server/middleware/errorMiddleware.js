import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    errorCode: 'ENDPOINT_NOT_FOUND',
  });
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED');

  if (statusCode >= 500) {
    logger.error('Unhandled server error', {
      path: req.originalUrl,
      method: req.method,
      error: err.message,
    });
  } else {
    logger.warn('Operational API error', {
      path: req.originalUrl,
      method: req.method,
      statusCode,
      errorCode,
      message: err.message,
    });
  }

  const responsePayload = {
    success: false,
    message:
      statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'Request failed',
    errorCode,
  };

  if (err.details) {
    responsePayload.errors = err.details;
  }

  res.status(statusCode).json(responsePayload);
}
