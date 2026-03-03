// Felix Academy Flagship - Main JavaScript
// Премиум версия с оптимизацией и haptic feedback

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Haptic Feedback Helper
const haptic = {
  light: () => tg.HapticFeedback?.impactOccurred('light'),
  medium: () => tg.HapticFeedback?.impactOccurred('medium'),
  heavy: () => tg.HapticFeedback?.impactOccurred('heavy'),
  success: () => tg.HapticFeedback?.notificationOccurred('success'),
  warning: () => tg.HapticFeedback?.notificationOccurred('warning'),
  error: () => tg.HapticFeedback?.notificationOccurred('error'),
  selection: () => tg.HapticFeedback?.selectionChanged()
};

// Конфигурация
const CONFIG = {
  API_URL: 'https://felix2-0.vercel.app/api',
  GROQ_API_KEY: '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',
  BOT_TOKEN: '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U'
};

// Глобальное состояние
window.FelixApp = {
  user: tg.initDataUnsafe.user || { first_name: 'Пользователь', id: 0 },
  startParam: tg.initDataUnsafe.start_param || '',
  currentSection: 'home',
  data: {
    courses: [],
    myCourses: [],
    stats: {},
    activities: [],
    aiMessages: []
  }
};

// Инициализация приложения
async function init() {
  console.log('🚀 Felix Academy Flagship - Initializing...');
  
  // Показать skeleton loaders
  showSkeletonLoaders();
  
  // Показать данные пользователя
  displayUserInfo();
  
  // Загрузить данные параллельно
  await Promise.all([
    loadUserStats(),
    loadCourses(),
    loadActivities(),
    getAIRecommendation()
  ]);
  
  // Обработать реферальный код
  if (FelixApp.startParam) {
    handleReferral(FelixApp.startParam);
  }
  
  // Haptic feedback при загрузке
  haptic.success();
  
  console.log('✅ App initialized');
}

// Skeleton Loaders
function showSkeletonLoaders() {
  const skeletonHTML = `
    <div class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-meta"></div>
      </div>
    </div>
  `.repeat(3);
  
  document.getElementById('continueCourses').innerHTML = skeletonHTML;
  document.getElementById('freeLessons').innerHTML = skeletonHTML;
  document.getElementById('popularCourses').innerHTML = skeletonHTML;
}

// Отображение информации о пользователе
function displayUserInfo() {
  const { user } = FelixApp;
  
  document.getElementById('userName').textContent = user.first_name;
  document.getElementById('avatar').textContent = user.first_name[0].toUpperCase();
}

// Загрузка статистики пользователя
async function loadUserStats() {
  try {
    // TODO: Загрузить с API
    // const stats = await fetch(`${CONFIG.API_URL}/user/stats?user_id=${FelixApp.user.id}`).then(r => r.json());
    
    // Тестовые данные
    const stats = {
      courses_purchased: 2,
      hours_learned: 15,
      bonus_balance: 500,
      achievements: 5,
      referrals: 3
    };
    
    FelixApp.data.stats = stats;
    
    document.getElementById('coursesCount').textContent = stats.courses_purchased;
    document.getElementById('hoursLearned').textContent = stats.hours_learned + 'ч';
    document.getElementById('bonusBalance').textContent = stats.bonus_balance + '₽';
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Загрузка курсов
async function loadCourses() {
  try {
    // Загружаем с API
    const response = await fetch(`${CONFIG.API_URL}/courses-full`);
    const data = await response.json();
    
    if (data.success) {
      FelixApp.data.courses = data.courses;
      
      // Мои курсы (в процессе) - пока тестовые
      const myCourses = [
        {
          ...data.courses[0],
          progress: 45,
          last_lesson_id: 2,
          current_theme: 1
        }
      ];
      
      FelixApp.data.myCourses = myCourses;
      
      // Рендер
      renderCarousel('continueCourses', myCourses, 'continue');
      renderCarousel('freeLessons', data.courses.filter(c => c.freeLessons > 0), 'course');
      renderCarousel('popularCourses', data.courses.sort((a, b) => b.students - a.students), 'course');
    }
  } catch (error) {
    console.error('Error loading courses:', error);
    
    // Fallback - тестовые данные
    const fallbackCourses = [
      {
        id: 1,
        title: 'Детективная лаборатория сознания',
        price: 2990,
        rating: 4.8,
        image: 'https://via.placeholder.com/280x160/667eea/ffffff?text=Психология',
        category: 'psychology',
        is_free: false,
        students: 1247,
        totalLessons: 5
      },
      {
        id: 2,
        title: 'Путь к лучшей версии себя',
        price: 3990,
        rating: 4.9,
        image: 'https://via.placeholder.com/280x160/764ba2/ffffff?text=Саморазвитие',
        category: 'self-development',
        is_free: false,
        students: 2156,
        totalLessons: 25
      },
      {
        id: 3,
        title: 'От идеи до устойчивого предприятия',
        price: 4990,
        rating: 4.7,
        image: 'https://via.placeholder.com/280x160/10b981/ffffff?text=Бизнес',
        category: 'business',
        is_free: false,
        students: 892,
        totalLessons: 25
      }
    ];
    
    FelixApp.data.courses = fallbackCourses;
    
    renderCarousel('continueCourses', [], 'continue');
    renderCarousel('freeLessons', fallbackCourses, 'course');
    renderCarousel('popularCourses', fallbackCourses, 'course');
  }
}

// Загрузка активности
async function loadActivities() {
  try {
    // TODO: Загрузить с API
    
    // Тестовые данные
    const activities = [
      {
        id: 1,
        type: 'lesson_completed',
        title: 'Завершен урок "Введение в трейдинг"',
        time: '2 часа назад',
        icon: '✅'
      },
      {
        id: 2,
        type: 'achievement',
        title: 'Получено достижение "Первый шаг"',
        time: '5 часов назад',
        icon: '🏆'
      },
      {
        id: 3,
        type: 'referral',
        title: 'Новый реферал зарегистрировался',
        time: '1 день назад',
        icon: '👥'
      }
    ];
    
    FelixApp.data.activities = activities;
    renderActivities(activities);
  } catch (error) {
    console.error('Error loading activities:', error);
  }
}

// AI рекомендация
async function getAIRecommendation() {
  try {
    const { user, data } = FelixApp;
    
    // TODO: Получить персональную рекомендацию от AI
    // const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {...});
    
    // Тестовая рекомендация
    const recommendations = [
      `${user.first_name}, продолжи курс "Основы трейдинга" - осталось всего 55%! 📈`,
      `Рекомендую начать курс "Python для начинающих" - он бесплатный и очень популярный! 🐍`,
      `У тебя ${data.stats.bonus_balance}₽ бонусов - используй их для покупки нового курса! 💰`,
      `Пригласи друга и получи 10% бонусов с его покупок! 🎁`
    ];
    
    const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)];
    document.getElementById('aiRecommendation').textContent = randomRec;
  } catch (error) {
    console.error('Error getting AI recommendation:', error);
    document.getElementById('aiRecommendation').textContent = 
      'Продолжай обучение и развивайся каждый день! 🚀';
  }
}

// Рендер карусели
function renderCarousel(containerId, items, type) {
  const container = document.getElementById(containerId);
  
  if (items.length === 0) {
    container.innerHTML = '<div class="loading">Пока нет курсов</div>';
    return;
  }
  
  if (type === 'continue') {
    container.innerHTML = items.map((item, index) => `
      <div class="card stagger-item" onclick="openCourse(${item.id})" style="animation-delay: ${index * 50}ms">
        <img src="${item.image}" alt="${item.title}" class="card-image" loading="lazy">
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div style="margin: var(--space-2) 0;">
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-1); font-weight: 500;">
              Прогресс: ${item.progress}%
            </div>
            <div style="width: 100%; height: 6px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
              <div style="width: ${item.progress}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); transition: width 0.5s ease;"></div>
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-top: var(--space-2);" 
                  onclick="continueLesson(${item.last_lesson_id}); event.stopPropagation();">
            Продолжить →
          </button>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = items.map((item, index) => `
      <div class="card stagger-item" onclick="openCourse(${item.id})" style="animation-delay: ${index * 50}ms">
        <img src="${item.image}" alt="${item.title}" class="card-image" loading="lazy">
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div class="card-meta">
            <span class="card-price ${item.price === 0 ? 'free' : ''}">
              ${item.price > 0 ? item.price + ' ₽' : 'Бесплатно'}
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="color: #F59E0B;">⭐</span>
              <span style="font-weight: 600;">${item.rating}</span>
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Рендер активности
function renderActivities(activities) {
  const container = document.getElementById('activityList');
  
  if (activities.length === 0) {
    container.innerHTML = '<div class="loading">Нет активности</div>';
    return;
  }
  
  container.innerHTML = activities.map((activity, index) => `
    <div class="activity-item stagger-item" style="animation-delay: ${index * 50}ms">
      <div class="activity-icon">${activity.icon}</div>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-time">${activity.time}</div>
      </div>
    </div>
  `).join('');
}

// Обработка реферального кода
function handleReferral(code) {
  console.log('Referral code:', code);
  
  // TODO: Сохранить в БД
  // await fetch(`${CONFIG.API_URL}/referral/save`, {...});
  
  if (code.startsWith('ref_partner')) {
    haptic.success();
    tg.showAlert('✨ Вы перешли по партнерской ссылке! Получите бонусы при покупке.');
  } else if (code.startsWith('ref_user')) {
    haptic.success();
    tg.showAlert('🎁 Вы перешли по реферальной ссылке! Получите бонусы при покупке.');
  }
}

// Добавить haptic feedback на все кнопки
document.addEventListener('DOMContentLoaded', () => {
  // Haptic на все кликабельные элементы
  document.querySelectorAll('.action-btn, .nav-item, .card, .btn').forEach(el => {
    el.addEventListener('click', () => haptic.light());
  });
  
  // Haptic на hover для desktop
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.action-btn, .card').forEach(el => {
      el.addEventListener('mouseenter', () => haptic.selection());
    });
  }
});

// Навигация
function goHome() {
  haptic.light();
  window.location.reload();
}

function openSection(section) {
  haptic.medium();
  FelixApp.currentSection = section;
  
  const routes = {
    'academy': 'catalog.html',
    'ai': 'ai-chat.html',
    'voice': 'voice.html',
    'partner': 'partner.html',
    'community': 'community.html',
    'analytics': 'analytics.html',
    'achievements': 'achievements.html',
    'profile': 'profile.html',
    'settings': 'settings.html',
    'catalog': 'catalog.html',
    'my-courses': 'my-courses.html'
  };
  
  const route = routes[section];
  
  if (route) {
    window.location.href = route;
  } else {
    haptic.warning();
    tg.showAlert(`Раздел "${section}" в разработке`);
  }
}

function openCourse(courseId) {
  haptic.medium();
  window.location.href = `course.html?id=${courseId}`;
}

function continueLesson(lessonId) {
  haptic.medium();
  window.location.href = `lesson.html?id=${lessonId}`;
}

// Обработка кнопки "Назад"
tg.BackButton.onClick(() => {
  tg.close();
});

// Запуск приложения
init().catch(error => {
  console.error('❌ Initialization error:', error);
  tg.showAlert('Ошибка загрузки приложения');
});

// Регистрация Service Worker для offline поддержки
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/miniapp/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Проверка обновлений
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Новая версия доступна
              if (confirm('Доступна новая версия приложения. Обновить?')) {
                newWorker.postMessage({ action: 'skipWaiting' });
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

// Performance Monitoring
if (window.performance && window.performance.timing) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      
      console.log('📊 Performance Metrics:');
      console.log(`  Page Load: ${pageLoadTime}ms`);
      console.log(`  Connect: ${connectTime}ms`);
      console.log(`  Render: ${renderTime}ms`);
      
      // Отправить метрики на сервер (опционально)
      if (pageLoadTime > 3000) {
        console.warn('⚠️ Slow page load detected');
      }
    }, 0);
  });
}

// Экспорт для использования в других модулях
window.FelixApp.openSection = openSection;
window.FelixApp.openCourse = openCourse;
window.FelixApp.continueLesson = continueLesson;

console.log('🎓 Felix Academy Flagship loaded');
