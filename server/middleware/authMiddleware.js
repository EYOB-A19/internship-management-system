import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ethiointern-production-grade-jwt-secret-2026';

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.table('users').find((u) => u.id === decoded.sub);
    if (!user) {
      return next(new AppError('User account no longer exists.', 401, 'USER_NOT_FOUND'));
    }
    if (user.status === 'SUSPENDED') {
      return next(
        new AppError(
          'Your account has been suspended by an administrator.',
          403,
          'ACCOUNT_SUSPENDED'
        )
      );
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    return next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token.', 401, 'INVALID_TOKEN'));
  }
}

export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.table('users').find((u) => u.id === decoded.sub);
    if (user && user.status !== 'SUSPENDED') {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };
    }
  } catch {
    // Ignore invalid optional token
  }
  return next();
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }
    return next();
  };
}
