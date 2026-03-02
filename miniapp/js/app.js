// Felix Elite Mini App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = '/api/app';
const user = tg.initDataUnsafe?.user || { id: 123456, first_name: 'Demo' };

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
        const response = await fetch(`${API_URL}?endpoint=admin&action=getUserSettings&userId=${user.id}`);
        const data = await response.json();
        
        if (data.success) {
            updateStats(data.stats);
        }
    } catch (error) {
        console.error('Load user data error:', error);
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
        // Load my courses
        const myCoursesResponse = await fetch(`${API_URL}?endpoint=learning&action=getUserProgress&userId=${user.id}`);
        const myCoursesData = await myCoursesResponse.json();
        
        if (myCoursesData.success && myCoursesData.courses) {
            renderMyCourses(myCoursesData.courses);
        } else {
            document.getElementById('myCoursesList').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <div class="empty-text">У тебя пока нет активных курсов</div>
                    <button class="btn btn-primary" onclick="scrollToCourses()">Выбрать курс</button>
                </div>
            `;
        }
        
        // Load all courses
        const coursesResponse = await fetch(`${API_URL}?action=getCourses`);
        const coursesData = await coursesResponse.json();
        
        if (coursesData.success && coursesData.courses) {
            renderCourses(coursesData.courses);
        }
    } catch (error) {
        console.error('Load academy error:', error);
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
    try {
        const response = await fetch(`${API_URL}?endpoint=admin&action=getUserSettings&userId=${user.id}`);
        const data = await response.json();
        
        if (data.success) {
            renderProfile(data);
            renderAchievements(data.achievements || []);
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
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
    try {
        const response = await fetch(`${API_URL}?endpoint=admin&action=getPartners`);
        const data = await response.json();
        
        if (data.success && data.partners) {
            renderPartners(data.partners);
        }
    } catch (error) {
        console.error('Load partners error:', error);
    }
}

// Render partners
function renderPartners(partners) {
    if (partners.length === 0) {
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

// Load library
async function loadLibrary() {
    try {
        const response = await fetch(`${API_URL}?endpoint=learning&action=getLibrary&userId=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.items) {
            renderLibrary(data.items);
        }
    } catch (error) {
        console.error('Load library error:', error);
    }
}

// Render library
function renderLibrary(items) {
    if (items.length === 0) {
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

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}?endpoint=learning&action=getAnalytics&userId=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.analytics) {
            renderAnalytics(data.analytics);
        }
    } catch (error) {
        console.error('Load analytics error:', error);
    }
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
    if (data.length === 0) {
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
    if (topics.length === 0) {
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

// Load rating
async function loadRating() {
    try {
        const response = await fetch(`${API_URL}?endpoint=learning&action=getLeaderboard`);
        const data = await response.json();
        
        if (data.success && data.leaderboard) {
            renderRating(data.leaderboard);
        }
    } catch (error) {
        console.error('Load rating error:', error);
    }
}

// Render rating
function renderRating(leaderboard) {
    if (leaderboard.length === 0) {
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
