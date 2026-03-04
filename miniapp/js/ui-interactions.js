// Felix Academy V12 - UI Interactions
// Old Money. Cold Mind. High Society.

/**
 * Глобальные UI взаимодействия для всех страниц
 */

class UIInteractions {
  constructor() {
    this.init();
  }

  init() {
    this.setupModalHandlers();
    this.setupLoadingStates();
    this.setupToastSystem();
    this.setupNavigationEffects();
  }

  // ============================================
  // МОДАЛЬНЫЕ ОКНА
  // ============================================

  setupModalHandlers() {
    // Закрытие модальных окон
    document.addEventListener('click', (e) => {
      // Закрытие по клику на backdrop
      if (e.target.classList.contains('modal-backdrop-brandbook')) {
        this.closeModal(e.target.querySelector('.modal-brandbook'));
      }

      // Закрытие по кнопке закрытия
      if (e.target.classList.contains('modal-close-brandbook')) {
        const modal = e.target.closest('.modal-brandbook');
        this.closeModal(modal);
      }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-backdrop-brandbook');
        if (openModal) {
          this.closeModal(openModal.querySelector('.modal-brandbook'));
        }
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop-brandbook';
    backdrop.appendChild(modal.cloneNode(true));
    document.body.appendChild(backdrop);

    // Предотвратить скролл body
    document.body.style.overflow = 'hidden';

    // Анимация появления
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
    });
  }

  closeModal(modal) {
    const backdrop = modal?.closest('.modal-backdrop-brandbook');
    if (!backdrop) return;

    // Анимация исчезновения
    backdrop.style.opacity = '0';
    
    setTimeout(() => {
      backdrop.remove();
      document.body.style.overflow = '';
    }, 200);
  }

  // ============================================
  // СОСТОЯНИЯ ЗАГРУЗКИ
  // ============================================

  setupLoadingStates() {
    // Глобальный загрузчик
    this.createGlobalLoader();
  }

  createGlobalLoader() {
    if (document.getElementById('globalLoader')) return;

    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.className = 'loading-brandbook hidden';
    loader.innerHTML = `
      <div class="spinner-brandbook"></div>
      <div class="loading-text-brandbook">Загрузка</div>
    `;
    document.body.appendChild(loader);
  }

  showLoading(text = 'Загрузка') {
    const loader = document.getElementById('globalLoader');
    if (!loader) return;

    const loadingText = loader.querySelector('.loading-text-brandbook');
    if (loadingText) {
      loadingText.textContent = text;
    }

    loader.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (!loader) return;

    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ============================================
  // СИСТЕМА УВЕДОМЛЕНИЙ
  // ============================================

  setupToastSystem() {
    // Контейнер для toast уведомлений
    if (!document.getElementById('toastContainer')) {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }
  }

  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-brandbook';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Показать
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Скрыть и удалить
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  // ============================================
  // НАВИГАЦИОННЫЕ ЭФФЕКТЫ
  // ============================================

  setupNavigationEffects() {
    // Плавные переходы между страницами
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      
      // Только для внутренних ссылок
      if (href.startsWith('http') || href.startsWith('#')) return;

      e.preventDefault();
      this.navigateWithTransition(href);
    });
  }

  navigateWithTransition(url) {
    // Fade out
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 200ms ease-out';

    setTimeout(() => {
      window.location.href = url;
    }, 200);
  }

  // ============================================
  // УТИЛИТЫ
  // ============================================

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
  }

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Проверка видимости элемента
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Плавная прокрутка к элементу
  scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Глобальный экземпляр
window.uiInteractions = new UIInteractions();

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIInteractions;
}
