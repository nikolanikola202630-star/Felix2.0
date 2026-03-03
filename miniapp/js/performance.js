/**
 * Felix Academy - Performance Optimizer
 * Премиум оптимизация производительности
 */

class PerformanceOptimizer {
  constructor() {
    this.metrics = {};
    this.observers = [];
    this.init();
  }

  init() {
    this.measurePageLoad();
    this.observePerformance();
    this.optimizeScrolling();
    this.optimizeAnimations();
    this.monitorMemory();
  }

  // Измерение времени загрузки страницы
  measurePageLoad() {
    if (!window.performance || !window.performance.timing) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        
        this.metrics = {
          // Время до первого байта
          ttfb: timing.responseStart - timing.requestStart,
          
          // Время загрузки DOM
          domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
          
          // Полное время загрузки
          pageLoad: timing.loadEventEnd - timing.navigationStart,
          
          // Время рендеринга
          renderTime: timing.domComplete - timing.domLoading,
          
          // Время подключения
          connectTime: timing.responseEnd - timing.requestStart
        };

        this.logMetrics();
        this.sendMetrics();
      }, 0);
    });
  }

  // Наблюдение за производительностью
  observePerformance() {
    if (!window.PerformanceObserver) return;

    // Long Tasks (задачи > 50ms)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('⚠️ Long task detected:', entry.duration.toFixed(2) + 'ms');
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (e) {
      // Long tasks не поддерживаются
    }

    // Layout Shifts (CLS)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          
          if (entry.value > 0.1) {
            console.warn('⚠️ Layout shift detected:', entry.value.toFixed(4));
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      // Layout shifts не поддерживаются
    }

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('📊 LCP:', lastEntry.renderTime.toFixed(2) + 'ms');
        
        if (lastEntry.renderTime > 2500) {
          console.warn('⚠️ Slow LCP detected');
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      // LCP не поддерживается
    }
  }

  // Оптимизация скроллинга
  optimizeScrolling() {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const delta = scrollY - lastScrollY;
          
          // Направление скролла
          const direction = delta > 0 ? 'down' : 'up';
          
          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('optimizedScroll', {
            detail: { scrollY, delta, direction }
          }));
          
          lastScrollY = scrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    // Passive listener для лучшей производительности
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Оптимизация анимаций
  optimizeAnimations() {
    // Отключить анимации при низкой производительности
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.documentElement.classList.add('reduce-animations');
    }

    // Отключить анимации при низком заряде батареи
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2 && !battery.charging) {
          document.documentElement.classList.add('reduce-animations');
          console.log('⚡ Animations reduced due to low battery');
        }
      });
    }

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduce-animations');
    }
  }

  // Мониторинг памяти
  monitorMemory() {
    if (!performance.memory) return;

    setInterval(() => {
      const memory = performance.memory;
      const usedMemoryMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
      const totalMemoryMB = (memory.totalJSHeapSize / 1048576).toFixed(2);
      const limitMemoryMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2);
      
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2);
      
      if (usagePercent > 90) {
        console.warn('⚠️ High memory usage:', usagePercent + '%');
      }
      
      this.metrics.memory = {
        used: usedMemoryMB,
        total: totalMemoryMB,
        limit: limitMemoryMB,
        usagePercent
      };
    }, 30000); // Каждые 30 секунд
  }

  // Логирование метрик
  logMetrics() {
    console.log('📊 Performance Metrics:');
    console.log('  TTFB:', this.metrics.ttfb + 'ms');
    console.log('  DOM Load:', this.metrics.domLoad + 'ms');
    console.log('  Page Load:', this.metrics.pageLoad + 'ms');
    console.log('  Render Time:', this.metrics.renderTime + 'ms');
    console.log('  Connect Time:', this.metrics.connectTime + 'ms');

    // Оценка производительности
    if (this.metrics.pageLoad < 1000) {
      console.log('✅ Excellent performance!');
    } else if (this.metrics.pageLoad < 2500) {
      console.log('👍 Good performance');
    } else if (this.metrics.pageLoad < 4000) {
      console.log('⚠️ Average performance');
    } else {
      console.log('❌ Poor performance');
    }
  }

  // Отправка метрик на сервер
  async sendMetrics() {
    try {
      // TODO: Отправить на API
      // await fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.metrics)
      // });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  // Получить метрики
  getMetrics() {
    return this.metrics;
  }

  // Очистка
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle helper
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Создать глобальный экземпляр
window.performanceOptimizer = new PerformanceOptimizer();

// Экспорт утилит
window.debounce = debounce;
window.throttle = throttle;

console.log('✅ Performance Optimizer initialized');
