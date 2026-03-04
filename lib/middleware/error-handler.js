// Centralized Error Handler
// Единая обработка ошибок для всего приложения

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database error') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

class ExternalAPIError extends AppError {
  constructor(message = 'External API error', service = 'unknown') {
    super(message, 502, 'EXTERNAL_API_ERROR');
    this.service = service;
  }
}

/**
 * Express error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  logError(err, req);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Operational errors (expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(isDevelopment && { stack: err.stack })
    });
  }

  // Programming errors (unexpected)
  console.error('💥 UNEXPECTED ERROR:', err);

  res.status(500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack })
  });
}

/**
 * Async handler wrapper
 * Catches async errors and passes to error middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Log error with context
 */
function logError(err, req = null) {
  const timestamp = new Date().toISOString();
  const context = req ? {
    method: req.method,
    url: req.url,
    userId: req.telegramUser?.id,
    ip: req.ip
  } : {};

  console.error('❌ ERROR:', {
    timestamp,
    message: err.message,
    code: err.code || 'UNKNOWN',
    statusCode: err.statusCode || 500,
    context,
    stack: err.stack
  });

  // TODO: Send to monitoring service (Sentry, etc.)
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 UNHANDLED REJECTION:', reason);
    // TODO: Send to monitoring service
  });
}

/**
 * Handle uncaught exceptions
 */
function handleUncaughtException() {
  process.on('uncaughtException', (error) => {
    console.error('💥 UNCAUGHT EXCEPTION:', error);
    // TODO: Send to monitoring service
    
    // Graceful shutdown
    process.exit(1);
  });
}

/**
 * Validate request data
 */
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const message = error.details.map(d => d.message).join(', ');
        throw new ValidationError(message);
      }

      req.body = value;
      next();

    } catch (err) {
      next(err);
    }
  };
}

/**
 * Not found handler (404)
 */
function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.url} not found`));
}

/**
 * Frontend error handler
 */
class FrontendErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  // Handle error
  handle(error, context = {}) {
    const errorObj = {
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      context
    };

    // Store error
    this.errors.push(errorObj);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console
    console.error('❌ Frontend Error:', errorObj);

    // Show user-friendly message
    this.showUserMessage(error);

    // TODO: Send to backend for logging
    this.sendToBackend(errorObj);
  }

  // Show user-friendly message
  showUserMessage(error) {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.showAlert(this.getUserMessage(error));
      tg.HapticFeedback?.notificationOccurred('error');
    } else {
      alert(this.getUserMessage(error));
    }
  }

  // Get user-friendly message
  getUserMessage(error) {
    const messages = {
      'NetworkError': 'Проблема с подключением к интернету',
      'ValidationError': 'Проверьте правильность введенных данных',
      'AuthenticationError': 'Ошибка авторизации. Перезапустите приложение',
      'NotFoundError': 'Запрашиваемый ресурс не найден',
      'RateLimitError': 'Слишком много запросов. Подождите немного',
      'TimeoutError': 'Превышено время ожидания. Попробуйте еще раз'
    };

    return messages[error.name] || 'Произошла ошибка. Попробуйте еще раз';
  }

  // Send error to backend
  async sendToBackend(errorObj) {
    try {
      await fetch('/api/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logError',
          error: errorObj
        })
      });
    } catch (err) {
      console.error('Failed to send error to backend:', err);
    }
  }

  // Get recent errors
  getErrors() {
    return this.errors;
  }

  // Clear errors
  clear() {
    this.errors = [];
  }
}

// Export
module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  ExternalAPIError,
  errorHandler,
  asyncHandler,
  logError,
  handleUnhandledRejection,
  handleUncaughtException,
  validateRequest,
  notFoundHandler,
  FrontendErrorHandler
};

// Frontend export
if (typeof window !== 'undefined') {
  window.FrontendErrorHandler = FrontendErrorHandler;
}
