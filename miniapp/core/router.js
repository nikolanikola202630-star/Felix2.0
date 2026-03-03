// Felix Academy V12 - Router System
// Централизованная система навигации

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.history = [];
    this.beforeHooks = [];
    this.afterHooks = [];
  }

  // Регистрация маршрута
  register(path, handler) {
    this.routes.set(path, handler);
  }

  // Навигация
  navigate(path, params = {}) {
    // Before hooks
    for (const hook of this.beforeHooks) {
      const result = hook(path, params);
      if (result === false) return; // Отмена навигации
    }

    // Сохранение в историю
    if (this.currentRoute) {
      this.history.push(this.currentRoute);
    }

    // Выполнение обработчика
    const handler = this.routes.get(path);
    if (handler) {
      this.currentRoute = { path, params, timestamp: Date.now() };
      handler(params);
    } else {
      console.error(`Route not found: ${path}`);
      this.navigate('home'); // Fallback на главную
    }

    // After hooks
    for (const hook of this.afterHooks) {
      hook(path, params);
    }
  }

  // Назад
  back() {
    if (this.history.length > 0) {
      const prev = this.history.pop();
      this.navigate(prev.path, prev.params);
    } else {
      this.navigate('home');
    }
  }

  // Хуки
  beforeEach(hook) {
    this.beforeHooks.push(hook);
  }

  afterEach(hook) {
    this.afterHooks.push(hook);
  }

  // Получить текущий маршрут
  getCurrentRoute() {
    return this.currentRoute;
  }

  // Очистить историю
  clearHistory() {
    this.history = [];
  }
}

// Экспорт
window.FelixRouter = new Router();
