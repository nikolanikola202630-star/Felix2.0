// Felix Academy V12 - API Client
// Централизованный клиент для работы с API

class APIClient {
  constructor() {
    this.baseURL = window.location.origin + '/api';
    this.timeout = 30000;
    this.retries = 3;
    this.cache = new Map();
  }

  // Базовый запрос
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      cache = false,
      cacheTTL = 300000,
      retry = true
    } = options;

    // Проверка кэша
    if (cache && method === 'GET') {
      const cached = this.getFromCache(endpoint);
      if (cached) return cached;
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    let lastError;
    const maxRetries = retry ? this.retries : 1;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Сохранение в кэш
        if (cache && method === 'GET') {
          this.saveToCache(endpoint, data, cacheTTL);
        }

        return data;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await this.delay(1000 * (i + 1)); // Экспоненциальная задержка
        }
      }
    }

    throw lastError;
  }

  // GET запрос
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  // POST запрос
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  // PUT запрос
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  // DELETE запрос
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Кэширование
  saveToCache(key, data, ttl) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache() {
    this.cache.clear();
  }

  // Задержка
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Пакетные запросы
  async batch(requests) {
    return Promise.all(
      requests.map(req => this.request(req.endpoint, req.options))
    );
  }
}

// Экспорт
window.FelixAPI = new APIClient();
