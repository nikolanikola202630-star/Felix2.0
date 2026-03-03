// Felix Academy - Settings Module
class SettingsManager {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.settings = this.loadSettings();
    this.init();
  }

  init() {
    this.tg?.ready();
    this.tg?.expand();
    this.tg?.BackButton.show();
    this.tg?.BackButton.onClick(() => window.location.href = 'index.html');
    
    this.setupEventListeners();
    this.applySettings();
  }

  loadSettings() {
    const defaults = {
      'notifications-lessons': true,
      'notifications-reminders': true,
      'notifications-achievements': true,
      'learning-autoplay': false,
      'learning-subtitles': false,
      'ui-animations': true,
      'ui-haptic': true
    };
    
    const saved = localStorage.getItem('felixSettings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }

  saveSettings() {
    localStorage.setItem('felixSettings', JSON.stringify(this.settings));
  }

  setupEventListeners() {
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
      const setting = toggle.dataset.setting;
      
      if (this.settings[setting]) {
        toggle.classList.add('active');
      }
      
      toggle.addEventListener('click', () => {
        this.toggleSetting(setting, toggle);
      });
    });
  }

  toggleSetting(setting, element) {
    this.settings[setting] = !this.settings[setting];
    element.classList.toggle('active');
    this.saveSettings();
    this.hapticFeedback('light');
    
    if (setting === 'ui-animations') {
      this.applyAnimationsSetting();
    }
  }

  applySettings() {
    this.applyAnimationsSetting();
  }

  applyAnimationsSetting() {
    if (this.settings['ui-animations']) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
  }

  clearCache() {
    this.hapticFeedback('medium');
    
    if (confirm('Очистить кэш приложения? Это освободит место, но потребует повторной загрузки данных.')) {
      try {
        const keysToKeep = ['felixSettings', 'felixUser'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        });
        
        this.tg?.showAlert('✅ Кэш успешно очищен!');
        this.hapticFeedback('success');
      } catch (error) {
        console.error('Error clearing cache:', error);
        this.tg?.showAlert('❌ Ошибка при очистке кэша');
      }
    }
  }

  hapticFeedback(type = 'light') {
    if (this.settings['ui-haptic'] && this.tg?.HapticFeedback) {
      if (type === 'success') {
        this.tg.HapticFeedback.notificationOccurred('success');
      } else {
        this.tg.HapticFeedback.impactOccurred(type);
      }
    }
  }
}

const settingsManager = new SettingsManager();
