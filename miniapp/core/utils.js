// Felix Academy V12 - Utilities
// Вспомогательные функции

const FelixUtils = {
  // Telegram WebApp
  tg: window.Telegram?.WebApp,

  // Haptic Feedback
  haptic: {
    light: () => window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'),
    medium: () => window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy'),
    success: () => window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success'),
    warning: () => window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning'),
    error: () => window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error')
  },

  // Форматирование времени
  formatTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    
    return new Date(date).toLocaleDateString('ru-RU');
  },

  // Форматирование числа
  formatNumber(num) {
    return new Intl.NumberFormat('ru-RU').format(num);
  },

  // Форматирование цены
  formatPrice(price) {
    if (price === 0) return 'Бесплатно';
    return `${this.formatNumber(price)} ₽`;
  },

  // Debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Генерация ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Валидация email
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Копирование в буфер обмена
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.haptic.success();
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  },

  // Загрузка изображения
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  },

  // Анимация скролла
  smoothScroll(element, to, duration = 300) {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      element.scrollTop = start + change * this.easeInOutQuad(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  },

  // Easing функция
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  // Получение параметров URL
  getUrlParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },

  // Установка параметров URL
  setUrlParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    window.history.pushState({}, '', url);
  },

  // Локальное хранилище
  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    
    remove(key) {
      localStorage.removeItem(key);
    },
    
    clear() {
      localStorage.clear();
    }
  },

  // Показать уведомление
  showNotification(message, type = 'info') {
    if (this.tg?.showAlert) {
      this.tg.showAlert(message);
    } else {
      alert(message);
    }
    
    if (type === 'success') this.haptic.success();
    if (type === 'error') this.haptic.error();
  },

  // Показать подтверждение
  async showConfirm(message) {
    if (this.tg?.showConfirm) {
      return this.tg.showConfirm(message);
    }
    return confirm(message);
  },

  // Инициализация Telegram WebApp
  initTelegram() {
    if (this.tg) {
      this.tg.ready();
      this.tg.expand();
      this.tg.enableClosingConfirmation();
    }
  },

  // Получить пользователя
  getUser() {
    return this.tg?.initDataUnsafe?.user || {
      id: 0,
      first_name: 'Пользователь',
      username: 'user'
    };
  },

  // Закрыть приложение
  close() {
    if (this.tg) {
      this.tg.close();
    } else {
      window.history.back();
    }
  }
};

// Экспорт
window.FelixUtils = FelixUtils;
