// Felix Academy - Global Personalization System
// EGOIST ECOSYSTEM Edition
// Applies user settings across all pages

(function() {
  'use strict';

  class GlobalPersonalization {
    constructor() {
      this.settings = this.loadSettings();
      this.personalization = this.loadPersonalization();
      this.init();
    }

    loadSettings() {
      try {
        return JSON.parse(localStorage.getItem('felixSettings') || '{}');
      } catch {
        return {};
      }
    }

    loadPersonalization() {
      try {
        return JSON.parse(localStorage.getItem('felixPersonalization') || '{}');
      } catch {
        return {};
      }
    }

    init() {
      this.applyTheme();
      this.applyAnimations();
      this.applyFontSize();
      this.applyCustomCSS();
      this.setupAutoSave();
    }

    applyTheme() {
      const theme = this.personalization.theme || 'auto';
      const root = document.documentElement;
      const tg = window.Telegram?.WebApp;

      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
      } else if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-theme');
      } else {
        // Auto - use Telegram theme
        if (tg?.colorScheme === 'dark') {
          root.setAttribute('data-theme', 'dark');
          document.body.classList.add('dark-theme');
        } else {
          root.setAttribute('data-theme', 'light');
          document.body.classList.remove('dark-theme');
        }
      }
    }

    applyAnimations() {
      const animations = this.personalization.animations !== false;
      
      if (!animations) {
        document.body.classList.add('no-animations');
        document.documentElement.style.setProperty('--animation-speed', '0');
      } else {
        document.body.classList.remove('no-animations');
        document.documentElement.style.setProperty('--animation-speed', '1');
      }
    }

    applyFontSize() {
      const pace = this.settings['personalization-learning-pace'] || 'medium';
      const root = document.documentElement;

      const fontSizes = {
        slow: '16px',
        medium: '15px',
        fast: '14px'
      };

      root.style.setProperty('--base-font-size', fontSizes[pace] || '15px');
    }

    applyCustomCSS() {
      const root = document.documentElement;

      // Apply custom CSS variables based on personalization
      if (this.personalization.animations === false) {
        root.style.setProperty('--transition-speed', '0s');
      } else {
        root.style.setProperty('--transition-speed', '0.3s');
      }

      // Haptic feedback indicator
      if (this.personalization.haptic === false) {
        root.setAttribute('data-haptic', 'disabled');
      } else {
        root.setAttribute('data-haptic', 'enabled');
      }
    }

    setupAutoSave() {
      // Listen for settings changes
      window.addEventListener('storage', (e) => {
        if (e.key === 'felixSettings' || e.key === 'felixPersonalization') {
          this.settings = this.loadSettings();
          this.personalization = this.loadPersonalization();
          this.init();
        }
      });
    }

    // Public API
    static get(key) {
      const settings = JSON.parse(localStorage.getItem('felixSettings') || '{}');
      return settings[key];
    }

    static getAll() {
      return JSON.parse(localStorage.getItem('felixSettings') || '{}');
    }

    static getPersonalization() {
      return JSON.parse(localStorage.getItem('felixPersonalization') || '{}');
    }

    static applyToElement(element, styles) {
      const personalization = GlobalPersonalization.getPersonalization();
      
      if (personalization.animations === false) {
        element.style.transition = 'none';
      }

      if (styles) {
        Object.assign(element.style, styles);
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.FelixPersonalization = new GlobalPersonalization();
    });
  } else {
    window.FelixPersonalization = new GlobalPersonalization();
  }

  // Export API
  window.FelixSettings = {
    get: GlobalPersonalization.get,
    getAll: GlobalPersonalization.getAll,
    getPersonalization: GlobalPersonalization.getPersonalization,
    applyToElement: GlobalPersonalization.applyToElement
  };

})();
