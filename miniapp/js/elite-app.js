// Felix Elite App v5 - Enhanced Functionality
class FelixApp {
  constructor() {
    this.tg = window.Telegram.WebApp;
    this.currentTab = 'profile';
    this.userData = this.loadUserData();
    this.init();
  }

  init() {
    this.tg.ready();
    this.tg.expand();
    this.tg.setHeaderColor('#0a0e27');
    this.tg.setBackgroundColor('#0a0e27');
    
    this.setupEventListeners();
    this.animateOnLoad();
    this.loadDataFromAPI();
  }

  async loadDataFromAPI() {
    const userId = this.userData.id;
    
    if (!userId) {
      console.log('No user ID, using default data');
      this.loadDynamicContent();
      return;
    }

    try {
      const response = await fetch(`https://felix2-0.vercel.app/api/miniapp-data?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      
      // Update user data
      this.userData = {
        ...this.userData,
        name: data.user.first_name,
        level: data.settings.level,
        xp: data.settings.xp,
        stats: {
          messages: data.stats.messages,
          aiRequests: data.stats.ai_requests,
          courses: data.courses.length,
          achievements: data.achievements.length
        },
        courses: data.courses,
        achievements: data.achievements,
        partners: data.partners,
        analytics: data.analytics
      };

      this.loadDynamicContent();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.tg.showAlert('Ошибка загрузки данных. Используются локальные данные.');
      this.loadDynamicContent();
    }
  }

  loadUserData() {
    // Return default data, will be updated from API
    return {
      id: this.tg.initDataUnsafe?.user?.id || null,
      name: this.tg.initDataUnsafe?.user?.first_name || 'User',
      level: 1,
      xp: 0,
      avatar: '👤',
      stats: {
        messages: 0,
        aiRequests: 0,
        courses: 0,
        achievements: 0
      },
      courses: [],
      achievements: [],
      partners: [],
      library: {
        saved: 0,
        favorites: 0,
        notes: 0,
        certificates: 0
      },
      analytics: {
        weeklyMessages: 0,
        weeklyAI: 0,
        weeklyLessons: 0,
        weeklyAchievements: 0,
        growth: 0,
        studyTime: 0,
        avgScore: 0,
        streak: 0,
        rank: 0,
        totalUsers: 0
      }
    };
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => this.switchTab(item.dataset.tab));
    });

    // Card interactions
    document.querySelectorAll('.card, .stat-card').forEach(card => {
      card.addEventListener('click', (e) => this.handleCardClick(e, card));
    });

    // View all buttons
    document.querySelectorAll('.view-all').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleViewAll(e));
    });

    // Course cards
    document.querySelectorAll('.course-card').forEach(card => {
      card.addEventListener('click', () => this.openCourse(card.dataset.courseId));
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabId);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
      content.style.animation = 'none';
    });

    const targetTab = document.getElementById(tabId);
    targetTab.classList.add('active');
    
    setTimeout(() => {
      targetTab.style.animation = 'fadeInUp 0.5s ease';
    }, 10);

    // Haptic feedback
    this.haptic('light');

    // Load tab-specific content
    this.loadTabContent(tabId);
  }

  handleCardClick(e, card) {
    e.stopPropagation();
    this.haptic('light');
    
    const cardType = card.dataset.type;
    const cardId = card.dataset.id;

    switch(cardType) {
      case 'achievement':
        this.showAchievementDetail(cardId);
        break;
      case 'course':
        this.openCourse(cardId);
        break;
      case 'partner':
        this.showPartnerDetail(cardId);
        break;
      case 'stat':
        this.showStatDetail(card.dataset.stat);
        break;
      default:
        console.log('Card clicked:', cardType, cardId);
    }
  }

  handleViewAll(e) {
    e.stopPropagation();
    this.haptic('medium');
    this.tg.showAlert('Функция в разработке');
  }

  openCourse(courseId) {
    this.haptic('medium');
    const course = this.userData.courses.find(c => c.id == courseId);
    if (course) {
      this.tg.showAlert(`Открытие курса: ${course.title}`);
    }
  }

  showAchievementDetail(achievementId) {
    const achievement = this.userData.achievements.find(a => a.id == achievementId);
    if (achievement) {
      this.tg.showPopup({
        title: achievement.title,
        message: `${achievement.icon} ${achievement.desc}\n\nПолучено: ${achievement.date}`,
        buttons: [{ type: 'close' }]
      });
    }
  }

  showPartnerDetail(partnerId) {
    const partner = this.userData.partners.find(p => p.id == partnerId);
    if (partner) {
      this.tg.showPopup({
        title: partner.name,
        message: `${partner.icon} ${partner.desc}\n\nСтатус: ${partner.status === 'active' ? 'Активен' : 'Неактивен'}`,
        buttons: [{ type: 'close' }]
      });
    }
  }

  showStatDetail(statType) {
    const messages = {
      messages: 'Всего отправлено сообщений в боте',
      ai: 'Количество запросов к AI',
      courses: 'Активных курсов в процессе обучения',
      achievements: 'Полученных достижений'
    };
    
    this.tg.showAlert(messages[statType] || 'Статистика');
  }

  loadTabContent(tabId) {
    // Динамическая загрузка контента для вкладки
    console.log('Loading content for tab:', tabId);
    
    // Здесь можно добавить загрузку данных с API
    // В production заменить на реальные запросы
  }

  animateOnLoad() {
    // Animate progress bars
    setTimeout(() => {
      document.querySelectorAll('.progress-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
          bar.style.width = width;
        }, 100);
      });
    }, 500);

    // Stagger animation for cards
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 50);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .stat-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.5s ease';
      observer.observe(card);
    });
  }

  loadDynamicContent() {
    // Update user info
    document.querySelector('.welcome-text h2').textContent = this.userData.name;
    document.querySelector('.level-badge').textContent = `🏆 Уровень ${this.userData.level} • ${this.userData.xp} XP`;
    
    // Update stats
    const stats = document.querySelectorAll('.stat-value');
    stats[0].textContent = this.userData.stats.messages;
    stats[1].textContent = this.userData.stats.aiRequests;
    stats[2].textContent = this.userData.stats.courses;
    stats[3].textContent = this.userData.stats.achievements;
  }

  haptic(type = 'light') {
    if (this.tg.HapticFeedback) {
      this.tg.HapticFeedback.impactOccurred(type);
    }
  }

  showNotification(message, type = 'info') {
    this.tg.showAlert(message);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.felixApp = new FelixApp();
  });
} else {
  window.felixApp = new FelixApp();
}
