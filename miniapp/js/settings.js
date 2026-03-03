// Felix Academy - Settings Module
// Управление настройками приложения

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
    this.tg?.BackButton.onClick(() => window.location.href = 'profile.html');
    
    this.initializeToggles();
    this.setupEventListeners();
  }

  loadSettings() {
    try {
      return JSON.parse(localStorage.getItem('felixSettings') || '{}');
    } catch {
      return {};
    }
  }

  saveSettings() {
    localStorage.setItem('felixSettings', JSON.stringify(this.settings));
  }

  initializeToggles() {
    // Инициализация переключателей из сохраненных настроек
    Object.keys(this.settings).forEach(key => {
      const toggle = document.getElementById(`toggle-${key}`);
      if (toggle && this.settings[key]) {
        toggle.classList.add('active');
      }
    });
  }

  setupEventListeners() {
    // Обработчики для всех настроек
    document.querySelectorAll('[data-setting]').forEach(item => {
      item.addEventListener('click', () => {
        const setting = item.dataset.setting;
        const action = item.dataset.action;
        
        if (action === 'toggle') {
          this.toggleSetting(setting);
        } else if (action === 'select') {
          this.selectSetting(setting);
        }
      });
    });
  }

  toggleSetting(key) {
    const toggle = document.getElementById(`toggle-${key}`);
    if (!toggle) return;

    toggle.classList.toggle('active');
    this.settings[key] = toggle.classList.contains('active');
    this.saveSettings();
    this.hapticFeedback('light');
  }

  selectSetting(key) {
    // Открыть модальное окно выбора
    this.hapticFeedback('medium');
    
    switch(key) {
      case 'theme':
        this.showThemeSelector();
        break;
      case 'language':
        this.showLanguageSelector();
        break;
      default:
        this.tg?.showPopup({
          title: 'В разработке',
          message: 'Эта функция скоро будет доступна',
          buttons: [{type: 'ok'}]
        });
    }
  }

  showThemeSelector() {
    const themes = [
      { id: 'dark', name: 'Темная', emoji: '🌙' },
      { id: 'light', name: 'Светлая', emoji: '☀️' },
      { id: 'auto', name: 'Авто', emoji: '🔄' }
    ];

    // TODO: Реализовать выбор темы
    this.tg?.showPopup({
      title: 'Выбор темы',
      message: 'Функция в разработке',
      buttons: [{type: 'ok'}]
    });
  }

  showLanguageSelector() {
    const languages = [
      { id: 'ru', name: 'Русский', emoji: '🇷🇺' },
      { id: 'en', name: 'English', emoji: '🇬🇧' },
      { id: 'uk', name: 'Українська', emoji: '🇺🇦' }
    ];

    // TODO: Реализовать выбор языка
    this.tg?.showPopup({
      title: 'Выбор языка',
      message: 'Функция в разработке',
      buttons: [{type: 'ok'}]
    });
  }

  clearCache() {
    this.tg?.showConfirm(
      'Вы уверены? Это удалит все сохраненные данные.',
      (confirmed) => {
        if (confirmed) {
          // Очистка localStorage
          const keysToKeep = ['felixSettings'];
          Object.keys(localStorage).forEach(key => {
            if (!keysToKeep.includes(key)) {
              localStorage.removeItem(key);
            }
          });

          // Очистка кеша
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => caches.delete(name));
            });
          }

          this.tg?.showAlert('Кеш очищен', () => {
            window.location.reload();
          });
          
          this.hapticFeedback('success');
        }
      }
    );
  }

  checkUpdates() {
    this.hapticFeedback('medium');
    
    // Симуляция проверки обновлений
    setTimeout(() => {
      this.tg?.showPopup({
        title: 'Обновления',
        message: 'У вас установлена последняя версия 9.1.0',
        buttons: [{type: 'ok'}]
      });
    }, 500);
  }

  openPrivacyPolicy() {
    this.hapticFeedback('light');
    window.open('https://felix-academy.com/privacy', '_blank');
  }

  openTerms() {
    this.hapticFeedback('light');
    window.open('https://felix-academy.com/terms', '_blank');
  }

  hapticFeedback(type = 'light') {
    if (this.tg?.HapticFeedback) {
      this.tg.HapticFeedback.impactOccurred(type);
    }
  }
}

// Инициализация при загрузке страницы
let settingsManager;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
  });
} else {
  settingsManager = new SettingsManager();
}

// Экспорт для использования в HTML
window.settingsManager = settingsManager;
