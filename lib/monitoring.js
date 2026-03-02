import * as Sentry from '@sentry/node';

let initialized = false;

export function initMonitoring() {
  if (initialized || !process.env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || 'development',
    tracesSampleRate: process.env.VERCEL_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Фильтруем чувствительные данные
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
        }
      }
      return event;
    }
  });

  initialized = true;
  console.log('✅ Sentry monitoring initialized');
}

export function captureError(error, context = {}) {
  console.error('Error:', error);
  
  if (!initialized) return;

  Sentry.withScope(scope => {
    // Добавляем контекст
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });

    // Добавляем теги для фильтрации
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context.type) {
      scope.setTag('error_type', context.type);
    }

    Sentry.captureException(error);
  });
}

export function captureMessage(message, level = 'info', context = {}) {
  console.log(`[${level.toUpperCase()}]`, message);
  
  if (!initialized) return;

  Sentry.withScope(scope => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureMessage(message, level);
  });
}

export function logPerformance(operation, duration, metadata = {}) {
  const log = {
    level: 'info',
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  console.log(JSON.stringify(log));

  if (duration > 5000) {
    captureMessage(`Slow operation: ${operation} took ${duration}ms`, 'warning', metadata);
  }
}

// Middleware для Express/Vercel
export function errorHandler(error, req, res, next) {
  captureError(error, {
    url: req.url,
    method: req.method,
    userId: req.body?.message?.from?.id
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
