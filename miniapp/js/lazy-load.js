/**
 * Felix Academy - Lazy Loading Utility
 * Оптимизация загрузки изображений для премиум производительности
 */

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    };
    
    this.observer = null;
    this.images = new Set();
    this.init();
  }

  init() {
    // Проверка поддержки IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, loading all images');
      this.loadAllImages();
      return;
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );

    this.observe();
  }

  observe() {
    // Найти все изображения с data-src
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    images.forEach(img => {
      this.images.add(img);
      this.observer.observe(img);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
        this.images.delete(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src || img.src;
    
    if (!src) return;

    // Создать временное изображение для предзагрузки
    const tempImg = new Image();
    
    tempImg.onload = () => {
      // Плавное появление
      img.style.opacity = '0';
      img.src = src;
      
      requestAnimationFrame(() => {
        img.style.transition = 'opacity 0.3s ease-in-out';
        img.style.opacity = '1';
      });
      
      // Удалить data-src после загрузки
      delete img.dataset.src;
      img.classList.add('loaded');
      
      // Haptic feedback (если доступен)
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      }
    };
    
    tempImg.onerror = () => {
      console.error('Failed to load image:', src);
      img.classList.add('error');
      
      // Показать placeholder при ошибке
      img.src = this.getPlaceholder(img);
    };
    
    tempImg.src = src;
  }

  getPlaceholder(img) {
    const width = img.width || 300;
    const height = img.height || 200;
    const text = img.alt || 'Image';
    
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23999'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
  }

  loadAllImages() {
    this.images.forEach(img => this.loadImage(img));
    this.images.clear();
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images.clear();
  }

  // Добавить новые изображения для наблюдения
  observeNew() {
    this.observe();
  }
}

// Создать глобальный экземпляр
window.lazyLoader = new LazyLoader({
  rootMargin: '100px', // Загружать за 100px до появления
  threshold: 0.01
});

// Автоматически наблюдать за новыми изображениями при изменении DOM
if ('MutationObserver' in window) {
  const mutationObserver = new MutationObserver(() => {
    window.lazyLoader.observeNew();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoader;
}

console.log('✅ Lazy Loader initialized');
