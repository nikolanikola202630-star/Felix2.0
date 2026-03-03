// Felix Academy V12 - State Management
// Централизованное управление состоянием

class StateManager {
  constructor() {
    this.state = {
      user: null,
      courses: [],
      settings: {},
      cache: new Map(),
      loading: false,
      error: null
    };
    this.listeners = new Map();
  }

  // Получить состояние
  get(key) {
    return key ? this.state[key] : this.state;
  }

  // Установить состояние
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notify(key, value, oldValue);
  }

  // Обновить состояние
  update(key, updater) {
    const oldValue = this.state[key];
    const newValue = typeof updater === 'function' ? updater(oldValue) : updater;
    this.state[key] = newValue;
    this.notify(key, newValue, oldValue);
  }

  // Подписка на изменения
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);

    // Возврат функции отписки
    return () => {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  // Уведомление подписчиков
  notify(key, newValue, oldValue) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(newValue, oldValue));
    }
  }

  // Кэширование
  setCache(key, value, ttl = 300000) { // 5 минут по умолчанию
    this.state.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  getCache(key) {
    const cached = this.state.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.state.cache.delete(key);
      return null;
    }
    
    return cached.value;
  }

  clearCache() {
    this.state.cache.clear();
  }

  // Сброс состояния
  reset() {
    this.state = {
      user: null,
      courses: [],
      settings: {},
      cache: new Map(),
      loading: false,
      error: null
    };
    this.notify('reset', this.state, null);
  }
}

// Экспорт
window.FelixState = new StateManager();
