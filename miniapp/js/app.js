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

// Конфигурация (NO HARDCODED KEYS!)
const CONFIG = {
  API_URL: window.location.origin + '/api',
  // API keys are stored securely on the server
  // Never expose API keys in frontend code!
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
    const response = await fetch(`${CONFIG.API_URL}/stats?user_id=${FelixApp.user.id}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        FelixApp.data.stats = data.stats;
        
        document.getElementById('coursesCount').textContent = data.stats.courses_purchased || 0;
        document.getElementById('hoursLearned').textContent = (data.stats.hours_learned || 0) + 'ч';
        document.getElementById('bonusBalance').textContent = (data.stats.bonus_balance || 0) + '₽';
        return;
      }
    }
    
    // Fallback - тестовые данные
    const stats = {
      courses_purchased: 0,
      hours_learned: 0,
      bonus_balance: 0,
      achievements: 0,
      referrals: 0
    };
    
    FelixApp.data.stats = stats;
    
    document.getElementById('coursesCount').textContent = stats.courses_purchased;
    document.getElementById('hoursLearned').textContent = stats.hours_learned + 'ч';
    document.getElementById('bonusBalance').textContent = stats.bonus_balance + '₽';
  } catch (error) {
    console.error('Error loading stats:', error);
    // Показать нули при ошибке
    document.getElementById('coursesCount').textContent = '0';
    document.getElementById('hoursLearned').textContent = '0ч';
    document.getElementById('bonusBalance').textContent = '0₽';
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
    const response = await fetch(`${CONFIG.API_URL}/history?user_id=${FelixApp.user.id}&limit=10`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.history) {
        const activities = data.history.map(item => ({
          id: item.id,
          type: item.action_type || 'activity',
          title: item.message || item.action_type,
          time: formatTimeAgo(item.created_at),
          icon: getActivityIcon(item.action_type)
        }));
        
        FelixApp.data.activities = activities;
        renderActivities(activities);
        return;
      }
    }
    
    // Fallback - пустой список
    FelixApp.data.activities = [];
    renderActivities([]);
  } catch (error) {
    console.error('Error loading activities:', error);
    FelixApp.data.activities = [];
    renderActivities([]);
  }
}

// Вспомогательные функции
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'только что';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} дн назад`;
  return date.toLocaleDateString('ru-RU');
}

function getActivityIcon(type) {
  const icons = {
    'lesson_completed': '✅',
    'course_purchased': '🎓',
    'achievement': '🏆',
    'referral': '👥',
    'ai_request': '🤖',
    'voice_message': '🎙️'
  };
  return icons[type] || '📌';
}

// AI рекомендация
async function getAIRecommendation() {
  try {
    const { user, data } = FelixApp;
    
    // Получить персональную рекомендацию от AI через наш API
    const response = await fetch(`${CONFIG.API_URL}/learning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        action: 'get_recommendation',
        context: {
          courses: data.myCourses.length,
          bonus_balance: data.stats.bonus_balance || 0
        }
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.recommendation) {
        document.getElementById('aiRecommendation').textContent = result.recommendation;
        return;
      }
    }
    
    // Fallback - умные рекомендации на основе данных
    const recommendations = [];
    
    if (data.myCourses.length > 0) {
      const inProgress = data.myCourses[0];
      recommendations.push(`${user.first_name}, продолжи "${inProgress.title}" - осталось ${100 - inProgress.progress}%! 📈`);
    }
    
    if (data.stats.bonus_balance > 0) {
      recommendations.push(`У тебя ${data.stats.bonus_balance}₽ бонусов - используй их для покупки нового курса! 💰`);
    }
    
    recommendations.push(`Пригласи друга и получи 10% бонусов с его покупок! 🎁`);
    recommendations.push(`Продолжай обучение и развивайся каждый день! 🚀`);
    
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
            <span class="card-price free">Бесплатно</span>
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
async function handleReferral(code) {
  console.log('Referral code:', code);
  
  try {
    // Сохранить в БД через API
    const response = await fetch(`${CONFIG.API_URL}/partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'track_referral',
        user_id: FelixApp.user.id,
        referral_code: code
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('Referral tracked:', data);
      }
    }
  } catch (error) {
    console.error('Error tracking referral:', error);
  }
  
  // Показать уведомление пользователю
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
    'voice': 'voice-assistant.html',
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

// Performance Monitoring (using modern API)
if (window.performance && window.PerformanceObserver) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      try {
        const perfEntries = performance.getEntriesByType('navigation');
        if (perfEntries.length > 0) {
          const perfData = perfEntries[0];
          const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
          const connectTime = perfData.responseEnd - perfData.requestStart;
          const renderTime = perfData.domComplete - perfData.domInteractive;
          
          console.log('📊 Performance Metrics:');
          console.log(`  Page Load: ${Math.round(pageLoadTime)}ms`);
          console.log(`  Connect: ${Math.round(connectTime)}ms`);
          console.log(`  Render: ${Math.round(renderTime)}ms`);
          
          if (pageLoadTime > 3000) {
            console.warn('⚠️ Slow page load detected');
          }
        }
      } catch (error) {
        console.error('Performance monitoring error:', error);
      }
    }, 0);
  });
}

// Экспорт для использования в других модулях
window.FelixApp.openSection = openSection;
window.FelixApp.openCourse = openCourse;
window.FelixApp.continueLesson = continueLesson;

console.log('🎓 Felix Academy Flagship loaded');

// Функция возврата на главную
function goHome() {
  haptic.light();
  window.location.href = 'index.html';
}

// Экспорт функций для глобального доступа
window.goHome = goHome;
