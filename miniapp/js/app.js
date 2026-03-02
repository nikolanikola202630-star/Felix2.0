// Felix Elite Mini App - Full Functional with Animations & Sync
const tg = window.Telegram?.WebApp || {
    initDataUnsafe: {},
    ready: () => {},
    expand: () => {},
    showAlert: (text) => alert(text),
    showPopup: () => {},
    HapticFeedback: {
        impactOccurred: () => {},
        notificationOccurred: () => {}
    }
};
tg.ready();
tg.expand();

const API_URL = '/api/app';
const PARTNER_API_URL = '/api/partner';
const SUPPORT_API_URL = '/api/support';
const user = tg.initDataUnsafe?.user || { id: 123456, first_name: 'Demo User' };

// Animation helper
function animateElement(element, animationClass = 'animate-fade-in-up') {
    element.classList.add(animationClass);
    element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
    }, { once: true });
}

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

    // Track referral code from URL if present
    await trackReferralFromUrl();
    
    // Load user data
    await loadUserData();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1000);
    
    // Handle hash navigation
    handleHashNavigation();
}

async function trackReferralFromUrl() {
    try {
        const url = new URL(window.location.href);
        const ref = url.searchParams.get('ref');
        if (!ref) return;

        const sessionKey = 'felix_ref_session_id';
        let sessionId = localStorage.getItem(sessionKey);
        if (!sessionId) {
            sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
            localStorage.setItem(sessionKey, sessionId);
        }

        await fetch(`${PARTNER_API_URL}?action=trackReferral&ref=${encodeURIComponent(ref)}&sessionId=${encodeURIComponent(sessionId)}`);
    } catch (error) {
        console.error('Referral track error:', error);
    }
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
        // 1) Prefer unified sync endpoint
        try {
            const syncResponse = await fetch(`/api/sync?action=getUserData&userId=${user.id}`);
            const syncData = await syncResponse.json();

            if (syncData.success && syncData.data?.stats) {
                updateStats({
                    level: syncData.data.stats.level || 1,
                    xp: syncData.data.stats.xp || 0,
                    courses_completed: syncData.data.stats.courses_completed || 0,
                    achievements_count: syncData.data.stats.achievements_count || 0
                });
                return;
            }
        } catch (error) {
            console.log('Sync endpoint unavailable, fallback to app endpoint');
        }

        // Try to load from API, fallback to mock data
        try {
            const response = await fetch(`${API_URL}?endpoint=admin&action=getUserSettings&userId=${user.id}`);
            const data = await response.json();
            
            if (data.success) {
                updateStats({
                    level: data.stats?.level || data.settings?.level || MOCK_DATA.stats.level,
                    xp: data.stats?.xp || data.settings?.xp || MOCK_DATA.stats.xp,
                    courses_completed: data.stats?.courses_completed || MOCK_DATA.stats.courses_completed,
                    achievements_count: data.stats?.achievements_count || MOCK_DATA.stats.achievements_count
                });
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
    // Update nav tabs with animation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const targetButton =
        document.querySelector(`.nav-tab[onclick="showTab('${tabName}')"]`) ||
        document.querySelector(`.nav-tab[data-tab="${tabName}"]`);

    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Hide all tabs with fade out
    document.querySelectorAll('.tab-content').forEach(content => {
        if (!content.classList.contains('hidden')) {
            content.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => {
                content.classList.add('hidden');
                content.style.animation = '';
            }, 200);
        }
    });
    
    // Show selected tab with fade in
    setTimeout(() => {
        const tabId = tabName + 'Tab';
        const selectedTab = document.getElementById(tabId);
        selectedTab.classList.remove('hidden');
        
        // Animate all cards in the tab
        const cards = selectedTab.querySelectorAll('.card, .stat-card, .course-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.opacity = '1';
                animateElement(card, 'animate-fade-in-up');
            }, index * 50);
        });
        
        // Load tab data
        loadTabData(tabName);
    }, 200);
    
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

// Render courses with enhanced visuals
function renderCourses(courses) {
    const html = courses.map(course => `
        <div class="course-card-enhanced animate-fade-in-up hover-lift" onclick="openCourse(${course.id})">
            <div class="course-image-enhanced">
                ${course.icon || '📚'}
                ${course.progress > 0 ? `<div class="course-badge">В процессе</div>` : ''}
            </div>
            <div class="course-content-enhanced">
                <div class="course-title-enhanced">${course.title}</div>
                <div class="course-description">${course.description || 'Изучите основы и продвинутые техники'}</div>
                <div class="course-meta-enhanced">
                    <div class="course-meta-item">
                        <span class="course-meta-icon">📊</span>
                        <span>${course.lessons_count} уроков</span>
                    </div>
                    <div class="course-meta-item">
                        <span class="course-meta-icon">⏱️</span>
                        <span>${course.duration}</span>
                    </div>
                    <div class="course-meta-item">
                        <span class="course-meta-icon">⭐</span>
                        <span>${course.rating}/5</span>
                    </div>
                    <div class="course-meta-item">
                        <span class="course-meta-icon">👥</span>
                        <span>${course.students_count}</span>
                    </div>
                </div>
                ${course.progress > 0 ? `
                    <div class="progress-bar-enhanced">
                        <div class="progress-fill-enhanced" style="width: ${course.progress}%"></div>
                    </div>
                    <div class="progress-text">${course.progress}% завершено</div>
                ` : `
                    <button class="btn-primary-enhanced mt-20" onclick="event.stopPropagation(); startCourse(${course.id})">
                        <span>🚀</span>
                        <span>Начать курс</span>
                    </button>
                `}
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

// Render profile with enhanced visuals
function renderProfile(data) {
    const avatar = localStorage.getItem('avatar') || '👤';
    
    const html = `
        <div class="profile-card animate-scale-in">
            <div class="profile-avatar animate-float">
                ${avatar}
            </div>
            <div class="profile-name">
                ${user.first_name || 'Пользователь'}
            </div>
            <div class="profile-status">
                <span class="badge badge-primary">Уровень ${data.stats?.level || 1}</span>
                <span class="badge badge-success" style="margin-left: 8px;">
                    ${data.stats?.xp || 0} XP
                </span>
            </div>
        </div>
        
        <div class="stats-grid stagger-fade-in">
            <div class="stat-card-enhanced">
                <span class="stat-icon">📊</span>
                <div class="stat-value-enhanced">${data.stats?.messages_count || 0}</div>
                <div class="stat-label-enhanced">Сообщений</div>
            </div>
            <div class="stat-card-enhanced">
                <span class="stat-icon">🤖</span>
                <div class="stat-value-enhanced">${data.stats?.ai_requests || 0}</div>
                <div class="stat-label-enhanced">AI запросов</div>
            </div>
            <div class="stat-card-enhanced">
                <span class="stat-icon">📚</span>
                <div class="stat-value-enhanced">${data.stats?.courses_completed || 0}</div>
                <div class="stat-label-enhanced">Курсов</div>
            </div>
            <div class="stat-card-enhanced">
                <span class="stat-icon">🔥</span>
                <div class="stat-value-enhanced">${data.stats?.streak_days || 0}</div>
                <div class="stat-label-enhanced">Дней подряд</div>
            </div>
        </div>
    `;
    
    document.getElementById('profileInfo').innerHTML = html;
}

// Render achievements with enhanced visuals
function renderAchievements(achievements) {
    if (achievements.length === 0) {
        document.getElementById('achievementsList').innerHTML = `
            <div class="empty-state-enhanced">
                <div class="empty-icon-enhanced">🏆</div>
                <div class="empty-title">Пока нет достижений</div>
                <div class="empty-text-enhanced">
                    Начни обучение и получи свое первое достижение!
                </div>
                <button class="btn-primary-enhanced" onclick="showTab('academy')">
                    <span>📚</span>
                    <span>К курсам</span>
                </button>
            </div>
        `;
        return;
    }
    
    const html = achievements.map(achievement => `
        <div class="achievement-enhanced ${achievement.unlocked ? 'animate-fade-in-left' : 'achievement-locked'}">
            <div class="achievement-icon-enhanced">${achievement.icon || '🏆'}</div>
            <div class="achievement-info-enhanced">
                <div class="achievement-title-enhanced">${achievement.title}</div>
                <div class="achievement-desc-enhanced">${achievement.description}</div>
                ${achievement.progress !== undefined ? `
                    <div class="achievement-progress">
                        <div class="progress-bar-enhanced">
                            <div class="progress-fill-enhanced" style="width: ${achievement.progress}%"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
            ${achievement.unlocked ? '<span class="badge badge-success">✓</span>' : '<span class="badge">🔒</span>'}
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
        const response = await fetch(`${PARTNER_API_URL}?action=dashboard&userId=${user.id}`);
        const data = await response.json();

        if (data.success && data.isPartner) {
            renderPartnerDashboard(data);
            return;
        }
    } catch (error) {
        console.error('Load partner dashboard error:', error);
    }

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
    const modal = document.getElementById('settingsModal');
    if (!modal) {
        tg.showAlert('Настройки доступны в боте через команду /settings');
        return;
    }

    modal.classList.remove('hidden');
    loadCurrentSettings();
    tg.HapticFeedback.impactOccurred('light');
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;

    modal.classList.add('hidden');
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


// Render partners with enhanced visuals
function renderPartners(partners) {
    if (!partners || partners.length === 0) {
        document.getElementById('partnersList').innerHTML = `
            <div class="empty-state-enhanced">
                <div class="empty-icon-enhanced">🤝</div>
                <div class="empty-title">Партнеры скоро появятся</div>
                <div class="empty-text-enhanced">
                    Хотите стать партнером? Оставьте заявку!
                </div>
                <button class="btn-primary-enhanced" onclick="submitPartnerApplication()">
                    <span>📝</span>
                    <span>Подать заявку</span>
                </button>
            </div>
        `;
        return;
    }
    
    const html = partners.map(partner => `
        <div class="partner-card-enhanced animate-fade-in-up" onclick="openPartner('${partner.id}')">
            <div class="partner-logo-enhanced">${partner.icon || '🏢'}</div>
            <div class="partner-info-enhanced">
                <div class="partner-name-enhanced">${partner.name}</div>
                <div class="partner-desc-enhanced">${partner.description}</div>
                <div class="partner-tags">
                    ${partner.tags ? partner.tags.map(tag => `<span class="partner-tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('partnersList').innerHTML = html;
}

function renderPartnerDashboard(data) {
    const stats = data.stats || { total: 0, unique: 0, blocked: 0, clicks: [] };
    const recentRows = (stats.clicks || []).slice(0, 20).map((click) => `
        <tr>
            <td>${new Date(click.clicked_at).toLocaleString('ru-RU')}</td>
            <td>${click.is_unique ? 'Уникальный' : 'Повтор'}</td>
            <td>${click.referer || '—'}</td>
            <td>${click.blocked_reason || '—'}</td>
        </tr>
    `).join('');

    document.getElementById('partnersList').innerHTML = `
        <div class="card">
            <div class="card-title mb-16">💼 Кабинет партнера</div>
            <div style="background: var(--bg); border-radius: 12px; padding: 12px; margin-bottom: 12px; font-size: 12px; word-break: break-all;">
                ${data.referralLink}
            </div>
            <button class="btn btn-primary" onclick="copyReferralLink('${data.referralLink.replace(/'/g, '&#39;')}')">🔗 Скопировать ссылку</button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Всего переходов</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.unique}</div>
                <div class="stat-label">Уникальных</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.blocked}</div>
                <div class="stat-label">Заблокировано</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.total > 0 ? Math.round((stats.unique / stats.total) * 100) : 0}%</div>
                <div class="stat-label">Качество трафика</div>
            </div>
        </div>

        <div class="card">
            <div class="card-title mb-16">📋 История переходов</div>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="text-align:left; border-bottom:1px solid var(--border);">
                            <th style="padding:8px 4px;">Время</th>
                            <th style="padding:8px 4px;">Тип</th>
                            <th style="padding:8px 4px;">Источник</th>
                            <th style="padding:8px 4px;">Фильтр</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentRows || '<tr><td colspan="4" style="padding:10px 4px; color: var(--text-secondary);">Переходов пока нет</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function copyReferralLink(link) {
    try {
        await navigator.clipboard.writeText(link);
        tg.showAlert('Ссылка скопирована');
    } catch (error) {
        tg.showAlert(link);
    }
}

async function openHumanSupport() {
    const message = window.prompt('Опишите вопрос для администратора:');
    if (!message || !message.trim()) return;

    try {
        const response = await fetch(SUPPORT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'sendUserMessage',
                userId: user.id,
                message: message.trim()
            })
        });
        const data = await response.json();
        if (data.success) {
            tg.HapticFeedback.notificationOccurred('success');
            tg.showAlert('Сообщение отправлено администратору. Ответ появится в чате поддержки.');
        } else {
            tg.showAlert(`Ошибка: ${data.error || 'Не удалось отправить сообщение'}`);
        }
    } catch (error) {
        console.error('Support send error:', error);
        tg.showAlert('Ошибка отправки сообщения');
    }
}

// Submit partner application
async function submitPartnerApplication() {
    tg.HapticFeedback.impactOccurred('medium');
    
    const name = await tg.showPopup({
        title: 'Заявка на партнерство',
        message: 'Введите название вашей компании:',
        buttons: [
            { id: 'cancel', type: 'cancel' },
            { id: 'submit', type: 'default', text: 'Отправить' }
        ]
    });
    
    if (name === 'submit') {
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submitApplication',
                    userId: user.id,
                    data: {
                        type: 'partner',
                        applicationData: {
                            name: 'Новый партнер',
                            description: 'Описание партнера',
                            icon: '🏢',
                            contact: user.first_name
                        }
                    }
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                tg.showAlert('✅ Заявка отправлена! Администратор рассмотрит её в ближайшее время.');
                tg.HapticFeedback.notificationOccurred('success');
            }
        } catch (error) {
            console.error('Submit application error:', error);
            tg.showAlert('Ошибка отправки заявки');
        }
    }
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
