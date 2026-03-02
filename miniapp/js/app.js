// Felix Elite Mini App - Full Functional
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = '/api/app';
const user = tg.initDataUnsafe?.user || { id: 123456, first_name: 'Demo User' };

// Mock data for demo
const MOCK_DATA = {
  stats: {
    level: 5,
    xp: 2450,
    courses_completed: 3,
    achievements_count: 12
  },
  courses: [
    { id: 1, title: 'JavaScript Основы', icon: '💻', lessons_count: 24, duration: '8 часов', rating: 4.8, students_count: 1234, progress: 65 },
    { id: 2, title: 'React для начинающих', icon: '⚛️', lessons_count: 18, duration: '6 часов', rating: 4.9, students_count: 892, progress: 30 },
    { id: 3, title: 'Node.js Backend', icon: '🟢', lessons_count: 32, duration: '12 часов', rating: 4.7, students_count: 756, progress: 0 }
  ],
  achievements: [
    { id: 1, icon: '🎯', title: 'Первые шаги', description: 'Завершил первый урок' },
    { id: 2, icon: '🔥', title: 'Неделя подряд', description: '7 дней активности' },
    { id: 3, icon: '⭐', title: 'Отличник', description: 'Все тесты на 100%' }
  ],
  partners: [
    { id: 1, name: 'TechCorp', icon: '🏢', description: 'Технологический партнер' },
    { id: 2, name: 'EduPlatform', icon: '📚', description: 'Образовательная платформа' }
  ],
  library: [
    { id: 1, title: 'Введение в AI', icon: '🤖', readTime: '15', created_at: new Date().toISOString() },
    { id: 2, title: 'Основы ML', icon: '🧠', readTime: '20', created_at: new Date().toISOString() }
  ],
  analytics: {
    totalTime: 145,
    lessonsCompleted: 42,
    streak: 7,
    avgScore: 87,
    dailyActivity: [
      { label: 'Пн', value: 5 },
      { label: 'Вт', value: 8 },
      { label: 'Ср', value: 12 },
      { label: 'Чт', value: 7 },
      { label: 'Пт', value: 15 },
      { label: 'Сб', value: 10 },
      { label: 'Вс', value: 6 }
    ],
    topicsProgress: [
      { name: 'JavaScript', progress: 85 },
      { name: 'React', progress: 60 },
      { name: 'Node.js', progress: 45 }
    ]
  },
  leaderboard: [
    { name: 'Александр', avatar: '👨‍💻', level: 12, xp: 5420 },
    { name: 'Мария', avatar: '👩‍💼', level: 10, xp: 4890 },
    { name: 'Дмитрий', avatar: '🧑‍🎓', level: 9, xp: 4320 },
    { name: user.first_name, avatar: '👤', level: 5, xp: 2450 },
    { name: 'Елена', avatar: '👩‍🔬', level: 4, xp: 2100 }
  ]
};

// Initialize app
async function init() {
    // Apply theme
    applyTheme();
    
    // Load user data
    await loadUserData();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1000);
    
    // Handle hash navigation
    handleHashNavigation();
}

// Apply theme
function applyTheme() {
    const theme = localStorage.getItem('theme') || 'auto';
    
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Toggle theme
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    tg.HapticFeedback.impactOccurred('light');
}

// Load user data
async function loadUserData() {
    try {
        // Try to load from API, fallback to mock data
        try {
            const response = await fetch(`${API_URL}?endpoint=admin&action=getUserSettings&userId=${user.id}`);
            const data = await response.json();
            
            if (data.success) {
                updateStats(data.stats);
                return;
            }
        } catch (error) {
            console.log('Using mock data');
        }
        
        // Use mock data
        updateStats(MOCK_DATA.stats);
    } catch (error) {
        console.error('Load user data error:', error);
        updateStats(MOCK_DATA.stats);
    }
}

// Update stats
function updateStats(stats = {}) {
    document.getElementById('statLevel').textContent = stats.level || 1;
    document.getElementById('statXP').textContent = stats.xp || 0;
    document.getElementById('statCourses').textContent = stats.courses_completed || 0;
    document.getElementById('statAchievements').textContent = stats.achievements_count || 0;
}

// Show tab
function showTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab
    const tabId = tabName + 'Tab';
    document.getElementById(tabId).classList.remove('hidden');
    
    // Load tab data
    loadTabData(tabName);
    
    tg.HapticFeedback.impactOccurred('light');
}

// Load tab data
async function loadTabData(tabName) {
    switch (tabName) {
        case 'academy':
            await loadAcademy();
            break;
        case 'notes':
            await loadNotes();
            break;
        case 'partners':
            await loadPartners();
            break;
        case 'library':
            await loadLibrary();
            break;
        case 'analytics':
            await loadAnalytics();
            break;
        case 'rating':
            await loadRating();
            break;
        case 'profile':
            await loadProfile();
            break;
        case 'ai':
            await loadAICommands();
            break;
    }
}

// Load academy
async function loadAcademy() {
    try {
        // Try API first
        try {
            const myCoursesResponse = await fetch(`${API_URL}?endpoint=learning&action=getUserProgress&userId=${user.id}`);
            const myCoursesData = await myCoursesResponse.json();
            
            if (myCoursesData.success && myCoursesData.courses) {
                renderMyCourses(myCoursesData.courses);
            } else {
                throw new Error('No data');
            }
        } catch {
            // Use mock data
            const myCourses = MOCK_DATA.courses.filter(c => c.progress > 0);
            if (myCourses.length > 0) {
                renderMyCourses(myCourses);
            } else {
                document.getElementById('myCoursesList').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📚</div>
                        <div class="empty-text">У тебя пока нет активных курсов</div>
                        <button class="btn btn-primary" onclick="scrollToCourses()">Выбрать курс</button>
                    </div>
                `;
            }
        }
        
        // Load all courses - always use mock for demo
        renderCourses(MOCK_DATA.courses);
    } catch (error) {
        console.error('Load academy error:', error);
        renderCourses(MOCK_DATA.courses);
    }
}

// Render my courses
function renderMyCourses(courses) {
    const html = courses.map(course => `
        <div class="course-card" onclick="openCourse(${course.id})">
            <div class="course-image">${course.icon || '📚'}</div>
            <div class="course-content">
                <div class="course-title">${course.title}</div>
                <div class="course-meta">
                    <span>📊 ${course.lessons_count} уроков</span>
                    <span>⏱️ ${course.duration}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('myCoursesList').innerHTML = html;
}

// Render courses
function renderCourses(courses) {
    const html = courses.map(course => `
        <div class="course-card" onclick="openCourse(${course.id})">
            <div class="course-image">${course.icon || '📚'}</div>
            <div class="course-content">
                <div class="course-title">${course.title}</div>
                <div class="course-meta">
                    <span>📊 ${course.lessons_count} уроков</span>
                    <span>⭐ ${course.rating}/5</span>
                    <span>👥 ${course.students_count}</span>
                </div>
                <button class="btn btn-primary mt-20" onclick="event.stopPropagation(); startCourse(${course.id})">
                    Начать курс
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('coursesList').innerHTML = html;
}

// Load profile
async function loadProfile() {
    const data = {
        success: true,
        stats: MOCK_DATA.stats,
        achievements: MOCK_DATA.achievements
    };
    
    renderProfile(data);
    renderAchievements(data.achievements);
}

// Render profile
function renderProfile(data) {
    const html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; background: var(--gradient-primary); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                👤
            </div>
            <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">
                ${user.first_name || 'Пользователь'}
            </div>
            <div style="color: var(--text-secondary);">
                ID: ${user.id}
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${data.stats?.level || 1}</div>
                <div class="stat-label">Уровень</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.stats?.xp || 0}</div>
                <div class="stat-label">Опыт</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.stats?.messages_count || 0}</div>
                <div class="stat-label">Сообщений</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.stats?.ai_requests || 0}</div>
                <div class="stat-label">AI запросов</div>
            </div>
        </div>
    `;
    
    document.getElementById('profileInfo').innerHTML = html;
}

// Render achievements
function renderAchievements(achievements) {
    if (achievements.length === 0) {
        document.getElementById('achievementsList').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏆</div>
                <div class="empty-text">У тебя пока нет достижений</div>
                <div style="color: var(--text-secondary); font-size: 14px;">
                    Начни обучение чтобы получить первое!
                </div>
            </div>
        `;
        return;
    }
    
    const html = achievements.map(achievement => `
        <div class="achievement">
            <div class="achievement-icon">${achievement.icon || '🏆'}</div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('achievementsList').innerHTML = html;
}

// Load AI commands
function loadAICommands() {
    const commands = [
        { id: 'ask', icon: '💬', name: 'Задать вопрос', desc: 'Задай любой вопрос AI' },
        { id: 'summary', icon: '📝', name: 'Резюме', desc: 'Краткое изложение текста' },
        { id: 'analyze', icon: '🔍', name: 'Анализ', desc: 'Детальный анализ текста' },
        { id: 'generate', icon: '✨', name: 'Генерация', desc: 'Создание контента' },
        { id: 'translate', icon: '🌐', name: 'Перевод', desc: 'Перевод на любой язык' },
        { id: 'improve', icon: '✏️', name: 'Улучшение', desc: 'Улучшение текста' },
        { id: 'brainstorm', icon: '💡', name: 'Идеи', desc: 'Генерация идей' },
        { id: 'explain', icon: '📖', name: 'Объяснение', desc: 'Простые объяснения' }
    ];
    
    const html = commands.map(cmd => `
        <button class="btn btn-secondary mb-16" onclick="useAICommand('${cmd.id}')">
            <span>${cmd.icon}</span>
            <div style="text-align: left; flex: 1;">
                <div style="font-weight: 600;">${cmd.name}</div>
                <div style="font-size: 13px; opacity: 0.7;">${cmd.desc}</div>
            </div>
        </button>
    `).join('');
    
    document.getElementById('aiCommandsList').innerHTML = html;
}

// Use AI command
function useAICommand(command) {
    tg.HapticFeedback.impactOccurred('medium');
    tg.showAlert(`Используй команду /${command} в боте для работы с AI`);
}

// Open course
function openCourse(courseId) {
    tg.HapticFeedback.impactOccurred('light');
    tg.showAlert(`Открытие курса ${courseId}...`);
}

// Start course
function startCourse(courseId) {
    tg.HapticFeedback.impactOccurred('medium');
    tg.showAlert(`Начало курса ${courseId}...`);
}

// Scroll to courses
function scrollToCourses() {
    document.getElementById('coursesList').scrollIntoView({ behavior: 'smooth' });
}

// Show settings
function showSettings() {
    tg.HapticFeedback.impactOccurred('light');
    tg.showAlert('Настройки доступны в боте через команду /settings');
}

// Handle hash navigation
function handleHashNavigation() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        const tabButton = document.querySelector(`.nav-tab[onclick="showTab('${hash}')"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
}

// Initialize on load
window.addEventListener('load', init);


// Load notes tab
async function loadNotes() {
    await loadSavedNotes();
}

// Load partners
async function loadPartners() {
    renderPartners(MOCK_DATA.partners);
}

// Load library  
async function loadLibrary() {
    renderLibrary(MOCK_DATA.library);
}

// Load analytics
async function loadAnalytics() {
    renderAnalytics(MOCK_DATA.analytics);
}

// Load rating
async function loadRating() {
    renderRating(MOCK_DATA.leaderboard);
}

// Settings functions
function showSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    loadCurrentSettings();
    tg.HapticFeedback.impactOccurred('light');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
    tg.HapticFeedback.impactOccurred('light');
}

function loadCurrentSettings() {
    // Load saved settings
    const style = localStorage.getItem('communicationStyle') || 'casual';
    const language = localStorage.getItem('language') || 'ru';
    const theme = localStorage.getItem('theme') || 'auto';
    const model = localStorage.getItem('aiModel') || 'llama-3.3-70b-versatile';
    const temperature = localStorage.getItem('aiTemperature') || '0.7';
    
    // Update UI
    updateSettingButtons('style', style);
    updateSettingButtons('language', language);
    updateSettingButtons('theme', theme);
    updateSettingButtons('model', model);
    document.getElementById('tempValue').textContent = temperature;
    
    // Load avatars
    loadAvatars();
}

function updateSettingButtons(setting, value) {
    document.querySelectorAll(`[data-setting="${setting}"]`).forEach(btn => {
        if (btn.dataset.value === value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateSetting(setting, value) {
    // Update UI
    updateSettingButtons(setting, value);
    
    // Save to localStorage
    const settingMap = {
        style: 'communicationStyle',
        language: 'language',
        theme: 'theme',
        model: 'aiModel'
    };
    
    localStorage.setItem(settingMap[setting], value);
    
    // Apply theme immediately
    if (setting === 'theme') {
        applyTheme();
    }
    
    tg.HapticFeedback.impactOccurred('light');
}

function updateTemperature(value) {
    const temp = (value / 10).toFixed(1);
    document.getElementById('tempValue').textContent = temp;
    localStorage.setItem('aiTemperature', temp);
}

function loadAvatars() {
    const avatars = ['👤', '😊', '🤓', '😎', '🥳', '🤖', '👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🏫'];
    const currentAvatar = localStorage.getItem('avatar') || '👤';
    
    const html = avatars.map(avatar => `
        <div class="avatar-option ${avatar === currentAvatar ? 'active' : ''}" 
             onclick="selectAvatar('${avatar}')">
            ${avatar}
        </div>
    `).join('');
    
    document.getElementById('avatarGrid').innerHTML = html;
}

function selectAvatar(avatar) {
    localStorage.setItem('avatar', avatar);
    loadAvatars();
    tg.HapticFeedback.impactOccurred('light');
}

async function saveSettings() {
    try {
        const settings = {
            communicationStyle: localStorage.getItem('communicationStyle') || 'casual',
            language: localStorage.getItem('language') || 'ru',
            theme: localStorage.getItem('theme') || 'auto',
            aiModel: localStorage.getItem('aiModel') || 'llama-3.3-70b-versatile',
            aiTemperature: parseFloat(localStorage.getItem('aiTemperature') || '0.7'),
            avatar: localStorage.getItem('avatar') || '👤'
        };
        
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: 'admin',
                action: 'saveUserSettings',
                userId: user.id,
                settings
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            tg.showAlert('✅ Настройки сохранены!');
            tg.HapticFeedback.notificationOccurred('success');
            closeSettings();
        }
    } catch (error) {
        console.error('Save settings error:', error);
        tg.showAlert('Ошибка сохранения настроек');
    }
}

// Helper functions
function openPartner(partnerId) {
    tg.HapticFeedback.impactOccurred('light');
    tg.showAlert(`Открытие партнера ${partnerId}...`);
}

function openLibraryItem(itemId) {
    tg.HapticFeedback.impactOccurred('light');
    tg.showAlert(`Открытие материала ${itemId}...`);
}


// Render partners
function renderPartners(partners) {
    if (!partners || partners.length === 0) {
        document.getElementById('partnersList').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🤝</div>
                <div class="empty-text">Партнеры скоро появятся</div>
            </div>
        `;
        return;
    }
    
    const html = partners.map(partner => `
        <div class="partner-card" onclick="openPartner('${partner.id}')">
            <div class="partner-logo">${partner.icon || '🏢'}</div>
            <div class="partner-info">
                <div class="partner-name">${partner.name}</div>
                <div class="partner-desc">${partner.description}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('partnersList').innerHTML = html;
}

// Render library
function renderLibrary(items) {
    if (!items || items.length === 0) {
        document.getElementById('libraryList').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <div class="empty-text">Библиотека пуста</div>
                <button class="btn btn-primary mt-20" onclick="showTab('academy')">
                    Начать обучение
                </button>
            </div>
        `;
        return;
    }
    
    const html = items.map(item => `
        <div class="library-item" onclick="openLibraryItem('${item.id}')">
            <div class="library-header">
                <div class="library-icon">${item.icon || '📄'}</div>
                <div class="library-title">${item.title}</div>
            </div>
            <div class="library-meta">
                <span>📅 ${new Date(item.created_at).toLocaleDateString('ru-RU')}</span>
                <span>⏱️ ${item.readTime || '5'} мин</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('libraryList').innerHTML = html;
}

// Render analytics
function renderAnalytics(analytics) {
    const html = `
        <div class="stats-grid mb-16">
            <div class="stat-card">
                <div class="stat-value">${analytics.totalTime || 0}</div>
                <div class="stat-label">Минут обучения</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analytics.lessonsCompleted || 0}</div>
                <div class="stat-label">Уроков пройдено</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analytics.streak || 0}</div>
                <div class="stat-label">Дней подряд</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analytics.avgScore || 0}%</div>
                <div class="stat-label">Средний балл</div>
            </div>
        </div>
        
        <div class="card-title mb-16">📈 Активность по дням</div>
        <div class="chart">
            ${generateChartBars(analytics.dailyActivity || [])}
        </div>
        
        <div class="card-title mb-16">🎯 Прогресс по темам</div>
        ${generateTopicsProgress(analytics.topicsProgress || [])}
    `;
    
    document.getElementById('analyticsContent').innerHTML = html;
}

// Generate chart bars
function generateChartBars(data) {
    if (!data || data.length === 0) {
        return '<div style="text-align: center; color: var(--text-secondary);">Нет данных</div>';
    }
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    return data.map(d => {
        const height = (d.value / maxValue) * 100;
        return `<div class="chart-bar" style="height: ${height}%" title="${d.label}: ${d.value}"></div>`;
    }).join('');
}

// Generate topics progress
function generateTopicsProgress(topics) {
    if (!topics || topics.length === 0) {
        return '<div style="text-align: center; color: var(--text-secondary);">Нет данных</div>';
    }
    
    return topics.map(topic => `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 600;">${topic.name}</span>
                <span style="color: var(--text-secondary);">${topic.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${topic.progress}%"></div>
            </div>
        </div>
    `).join('');
}

// Render rating
function renderRating(leaderboard) {
    if (!leaderboard || leaderboard.length === 0) {
        document.getElementById('ratingList').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏆</div>
                <div class="empty-text">Рейтинг пуст</div>
            </div>
        `;
        return;
    }
    
    const html = leaderboard.map((item, index) => {
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';
        
        return `
            <div class="leaderboard-item">
                <div class="leaderboard-rank ${rankClass}">${rank}</div>
                <div class="leaderboard-avatar">${item.avatar || '👤'}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${item.name}</div>
                    <div class="leaderboard-score">
                        <span class="leaderboard-xp">${item.xp} XP</span>
                        • Уровень ${item.level}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('ratingList').innerHTML = html;
}

// Open course with real interaction
function openCourse(courseId) {
    tg.HapticFeedback.impactOccurred('medium');
    const course = MOCK_DATA.courses.find(c => c.id === courseId);
    if (course) {
        tg.showAlert(`Открываем курс: ${course.title}\n\nСкоро здесь будут уроки!`);
    }
}

// Start course with real interaction
function startCourse(courseId) {
    tg.HapticFeedback.impactOccurred('medium');
    const course = MOCK_DATA.courses.find(c => c.id === courseId);
    if (course) {
        tg.showPopup({
            title: 'Начать курс?',
            message: `Вы хотите начать курс "${course.title}"?`,
            buttons: [
                { id: 'cancel', type: 'cancel' },
                { id: 'start', type: 'default', text: 'Начать' }
            ]
        }, (buttonId) => {
            if (buttonId === 'start') {
                // Add to my courses
                course.progress = 1;
                tg.showAlert('✅ Курс добавлен! Начинай обучение!');
                loadAcademy();
            }
        });
    }
}
