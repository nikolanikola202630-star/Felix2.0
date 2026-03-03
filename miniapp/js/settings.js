// Felix Academy - Settings Module v3.0
// EGOIST ECOSYSTEM Edition - Full Personalization

class SettingsManager {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.userId = this.getUserId();
    this.settings = this.loadSettings();
    this.init();
  }

  getUserId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user_id') || this.tg?.initDataUnsafe?.user?.id || null;
  }

  init() {
    this.tg?.ready();
    this.tg?.expand();
    this.tg?.BackButton.show();
    this.tg?.BackButton.onClick(() => window.location.href = 'index.html');
    
    this.setupEventListeners();
    this.applySettings();
    this.loadFromServer();
  }

  loadSettings() {
    const defaults = {
      'theme': 'auto',
      'language': 'ru',
      'ai-model': 'llama-3.3-70b-versatile',
      'ai-temperature': 0.7,
      'notifications-lessons': true,
      'notifications-reminders': true,
      'notifications-achievements': true,
      'learning-autoplay': false,
      'learning-subtitles': false,
      'ui-animations': true,
      'ui-haptic': true,
      'personalization-recommendations': true,
      'personalization-adaptive-difficulty': true,
      'personalization-learning-pace': 'medium'
    };
    
    const saved = localStorage.getItem('felixSettings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }

  saveSettings() {
    localStorage.setItem('felixSettings', JSON.stringify(this.settings));
    this.syncToServer();
    this.applyGlobalPersonalization();
  }

  async syncToServer() {
    if (!this.userId) return;

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: this.userId,
          settings: this.settings
        })
      });

      if (response.ok) {
        console.log('✅ Settings synced to server');
        this.showNotification('Настройки сохранены', 'success');
      }
    } catch (error) {
      console.error('Failed to sync settings:', error);
    }
  }

  async loadFromServer() {
    if (!this.userId) return;

    try {
      const response = await fetch(`/api/settings?user_id=${this.userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings && data.settings.preferences) {
          const serverSettings = JSON.parse(data.settings.preferences);
          this.settings = { ...this.settings, ...serverSettings };
          this.saveSettings();
          this.updateUI();
        }
      }
    } catch (error) {
      console.error('Failed to load settings from server:', error);
    }
  }

  setupEventListeners() {
    // Toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
      const setting = toggle.dataset.setting;
      
      if (this.settings[setting]) {
        toggle.classList.add('active');
      }
      
      toggle.addEventListener('click', () => {
        this.toggleSetting(setting, toggle);
      });
    });

    // Theme select
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.value = this.settings.theme;
      themeSelect.addEventListener('change', (e) => {
        this.settings.theme = e.target.value;
        this.saveSettings();
        this.applyTheme();
        this.hapticFeedback('light');
      });
    }

    // Language select
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.value = this.settings.language;
      languageSelect.addEventListener('change', (e) => {
        this.settings.language = e.target.value;
        this.saveSettings();
        this.hapticFeedback('light');
        this.showNotification('Язык изменен. Перезагрузите приложение.', 'info');
      });
    }

    // AI Model select
    const aiModelSelect = document.getElementById('ai-model-select');
    if (aiModelSelect) {
      aiModelSelect.value = this.settings['ai-model'];
      aiModelSelect.addEventListener('change', (e) => {
        this.settings['ai-model'] = e.target.value;
        this.saveSettings();
        this.hapticFeedback('light');
      });
    }

    // AI Temperature slider
    const temperatureSlider = document.getElementById('ai-temperature');
    const temperatureValue = document.getElementById('temperature-value');
    if (temperatureSlider && temperatureValue) {
      temperatureSlider.value = this.settings['ai-temperature'] * 100;
      temperatureValue.textContent = this.settings['ai-temperature'].toFixed(1);
      
      temperatureSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        this.settings['ai-temperature'] = value;
        temperatureValue.textContent = value.toFixed(1);
        this.saveSettings();
      });
    }
  }

  updateUI() {
    // Update all UI elements with current settings
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
      const setting = toggle.dataset.setting;
      if (this.settings[setting]) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    });

    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = this.settings.theme;

    const languageSelect = document.getElementById('language-select');
    if (languageSelect) languageSelect.value = this.settings.language;

    const aiModelSelect = document.getElementById('ai-model-select');
    if (aiModelSelect) aiModelSelect.value = this.settings['ai-model'];

    const temperatureSlider = document.getElementById('ai-temperature');
    const temperatureValue = document.getElementById('temperature-value');
    if (temperatureSlider && temperatureValue) {
      temperatureSlider.value = this.settings['ai-temperature'] * 100;
      temperatureValue.textContent = this.settings['ai-temperature'].toFixed(1);
    }
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
    this.applyTheme();
    this.applyAnimationsSetting();
    this.applyGlobalPersonalization();
  }

  applyTheme() {
    const theme = this.settings.theme;
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-theme');
    } else {
      // Auto - use Telegram theme
      if (this.tg?.colorScheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
      } else {
        root.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-theme');
      }
    }
  }

  applyAnimationsSetting() {
    if (this.settings['ui-animations']) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
  }

  applyGlobalPersonalization() {
    // Apply personalization to all pages
    const personalization = {
      theme: this.settings.theme,
      animations: this.settings['ui-animations'],
      haptic: this.settings['ui-haptic'],
      language: this.settings.language,
      aiModel: this.settings['ai-model'],
      aiTemperature: this.settings['ai-temperature'],
      autoplay: this.settings['learning-autoplay'],
      subtitles: this.settings['learning-subtitles'],
      notifications: {
        lessons: this.settings['notifications-lessons'],
        reminders: this.settings['notifications-reminders'],
        achievements: this.settings['notifications-achievements']
      }
    };

    // Save to global storage for other pages
    localStorage.setItem('felixPersonalization', JSON.stringify(personalization));

    // Apply CSS variables for personalization
    const root = document.documentElement;
    
    // Animation speed based on preference
    if (this.settings['ui-animations']) {
      root.style.setProperty('--animation-speed', '1');
    } else {
      root.style.setProperty('--animation-speed', '0');
    }

    // Font size based on learning pace
    const pace = this.settings['personalization-learning-pace'];
    if (pace === 'slow') {
      root.style.setProperty('--base-font-size', '16px');
    } else if (pace === 'fast') {
      root.style.setProperty('--base-font-size', '14px');
    } else {
      root.style.setProperty('--base-font-size', '15px');
    }

    console.log('✅ Global personalization applied:', personalization);
  }

  clearCache() {
    this.hapticFeedback('medium');
    
    const confirmed = confirm('Очистить кэш приложения? Это освободит место, но потребует повторной загрузки данных.');
    
    if (confirmed) {
      try {
        const keysToKeep = ['felixSettings', 'felixUser', 'felixPersonalization'];
        const allKeys = Object.keys(localStorage);
        
        let cleared = 0;
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
            cleared++;
          }
        });
        
        this.showNotification(`✅ Кэш очищен! Удалено ${cleared} записей`, 'success');
        this.hapticFeedback('success');
      } catch (error) {
        console.error('Error clearing cache:', error);
        this.showNotification('❌ Ошибка при очистке кэша', 'error');
      }
    }
  }

  showNotification(message, type = 'info') {
    if (this.tg?.showAlert) {
      this.tg.showAlert(message);
    } else {
      alert(message);
    }
  }

  hapticFeedback(type = 'light') {
    if (this.settings['ui-haptic'] && this.tg?.HapticFeedback) {
      if (type === 'success') {
        this.tg.HapticFeedback.notificationOccurred('success');
      } else if (type === 'error') {
        this.tg.HapticFeedback.notificationOccurred('error');
      } else {
        this.tg.HapticFeedback.impactOccurred(type);
      }
    }
  }
}

// Initialize
const settingsManager = new SettingsManager();

// Export for global access
window.FelixSettings = {
  get: (key) => {
    const settings = JSON.parse(localStorage.getItem('felixSettings') || '{}');
    return settings[key];
  },
  getAll: () => {
    return JSON.parse(localStorage.getItem('felixSettings') || '{}');
  },
  getPersonalization: () => {
    return JSON.parse(localStorage.getItem('felixPersonalization') || '{}');
  }
};
