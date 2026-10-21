const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'jwt_secret',
  'authorization',
  'secret',
]);

function redactSensitive(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  if (Array.isArray(meta)) return meta.map(redactSensitive);
  const sanitized = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase()) || SENSITIVE_KEYS.has(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = redactSensitive(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatEntry(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...redactSensitive(meta),
  });
}

export const logger = {
  info(message, meta = {}) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(formatEntry('INFO', message, meta));
    }
  },
  warn(message, meta = {}) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(formatEntry('WARN', message, meta));
    }
  },
  error(message, meta = {}) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(formatEntry('ERROR', message, meta));
    }
  },
  audit(action, adminId, details = {}) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(formatEntry('AUDIT', action, { adminId, ...details }));
    }
  },
};
