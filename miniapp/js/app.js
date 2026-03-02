// Felix Academy Flagship - Main JavaScript
// Объединяет все функции в одном приложении

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

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
  
  // Показать данные пользователя
  displayUserInfo();
  
  // Загрузить данные
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
  
  console.log('✅ App initialized');
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
    // TODO: Загрузить с API
    // const courses = await fetch(`${CONFIG.API_URL}/courses`).then(r => r.json());
    
    // Тестовые данные
    const allCourses = [
      {
        id: 1,
        title: 'Основы трейдинга',
        price: 2990,
        rating: 4.8,
        image: 'https://via.placeholder.com/280x160?text=Trading',
        category: 'trading',
        is_free: false
      },
      {
        id: 2,
        title: 'Python для начинающих',
        price: 0,
        rating: 4.9,
        image: 'https://via.placeholder.com/280x160?text=Python',
        category: 'it',
        is_free: true
      },
      {
        id: 3,
        title: 'Психология успеха',
        price: 1990,
        rating: 4.7,
        image: 'https://via.placeholder.com/280x160?text=Psychology',
        category: 'psychology',
        is_free: false
      }
    ];
    
    FelixApp.data.courses = allCourses;
    
    // Мои курсы (в процессе)
    const myCourses = [
      {
        ...allCourses[0],
        progress: 45,
        last_lesson_id: 2
      }
    ];
    
    FelixApp.data.myCourses = myCourses;
    
    // Рендер
    renderCarousel('continueCourses', myCourses, 'continue');
    renderCarousel('freeLessons', allCourses.filter(c => c.is_free), 'course');
    renderCarousel('popularCourses', allCourses, 'course');
  } catch (error) {
    console.error('Error loading courses:', error);
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
    container.innerHTML = items.map(item => `
      <div class="card" onclick="openCourse(${item.id})">
        <img src="${item.image}" alt="${item.title}" class="card-image">
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div style="margin: 8px 0;">
            <div style="font-size: 12px; color: var(--hint); margin-bottom: 4px;">
              Прогресс: ${item.progress}%
            </div>
            <div style="width: 100%; height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; overflow: hidden;">
              <div style="width: ${item.progress}%; height: 100%; background: var(--primary);"></div>
            </div>
          </div>
          <button style="width: 100%; padding: 8px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px;" 
                  onclick="continueLesson(${item.last_lesson_id}); event.stopPropagation();">
            Продолжить →
          </button>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = items.map(item => `
      <div class="card" onclick="openCourse(${item.id})">
        <img src="${item.image}" alt="${item.title}" class="card-image">
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div class="card-meta">
            <span class="card-price ${item.price === 0 ? 'free' : ''}">
              ${item.price > 0 ? item.price + ' ₽' : 'Бесплатно'}
            </span>
            <span>⭐ ${item.rating}</span>
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
  
  container.innerHTML = activities.map(activity => `
    <div class="activity-item">
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
    tg.showAlert('✨ Вы перешли по партнерской ссылке! Получите бонусы при покупке.');
  } else if (code.startsWith('ref_user')) {
    tg.showAlert('🎁 Вы перешли по реферальной ссылке! Получите бонусы при покупке.');
  }
}

// Навигация
function goHome() {
  window.location.reload();
}

function openSection(section) {
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
    tg.showAlert(`Раздел "${section}" в разработке`);
  }
}

function openCourse(courseId) {
  window.location.href = `course.html?id=${courseId}`;
}

function continueLesson(lessonId) {
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

// Экспорт для использования в других модулях
window.FelixApp.openSection = openSection;
window.FelixApp.openCourse = openCourse;
window.FelixApp.continueLesson = continueLesson;

console.log('🎓 Felix Academy Flagship loaded');
