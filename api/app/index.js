// Unified API endpoint for Mini App
module.exports = async (req, res) => {
  const { endpoint, action, userId, courseId } = req.query;

  try {
    // Learning API
    if (endpoint === 'learning') {
      if (action === 'getUserProgress') {
        return res.json({
          success: true,
          progress: {
            level: 5,
            xp: 2500,
            xpToNext: 3000,
            streak: 7,
            totalXP: 12500,
            rank: 'Продвинутый'
          }
        });
      }

      if (action === 'getDailyTasks') {
        return res.json({
          success: true,
          tasks: [
            { id: 1, title: 'Отправить 5 сообщений', progress: 3, total: 5, xp: 50, completed: false },
            { id: 2, title: 'Использовать AI команду', progress: 1, total: 1, xp: 100, completed: true },
            { id: 3, title: 'Пройти урок', progress: 0, total: 1, xp: 150, completed: false }
          ]
        });
      }

      if (action === 'getAchievements') {
        return res.json({
          success: true,
          achievements: [
            { id: 1, name: 'Первые шаги', description: 'Отправить первое сообщение', icon: '🎯', unlocked: true, xp: 50 },
            { id: 2, name: 'Болтун', description: 'Отправить 100 сообщений', icon: '💬', unlocked: true, xp: 200 },
            { id: 3, name: 'AI Мастер', description: 'Использовать все AI команды', icon: '🤖', unlocked: false, xp: 500 },
            { id: 4, name: 'Неделя подряд', description: 'Стрик 7 дней', icon: '🔥', unlocked: true, xp: 300 }
          ]
        });
      }

      if (action === 'getAnalytics') {
        return res.json({
          success: true,
          analytics: {
            totalMessages: 150,
            aiRequests: 45,
            coursesCompleted: 2,
            averageResponseTime: 2.5,
            mostUsedCommand: '/ask',
            activityByHour: Array(24).fill(0).map((_, i) => ({ hour: i, count: Math.floor(Math.random() * 20) })),
            activityByDay: Array(7).fill(0).map((_, i) => ({ day: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i], count: Math.floor(Math.random() * 30) }))
          }
        });
      }

      if (action === 'getLeaderboard') {
        return res.json({
          success: true,
          leaderboard: [
            { rank: 1, username: 'User1', level: 8, xp: 15000, avatar: '👑' },
            { rank: 2, username: 'User2', level: 7, xp: 12000, avatar: '🥈' },
            { rank: 3, username: 'User3', level: 6, xp: 9000, avatar: '🥉' },
            { rank: 4, username: 'You', level: 5, xp: 2500, avatar: '👤', isCurrentUser: true },
            { rank: 5, username: 'User5', level: 4, xp: 2000, avatar: '😎' }
          ]
        });
      }
    }

    // Admin API
    if (endpoint === 'admin') {
      if (action === 'getPartners') {
        return res.json({
          success: true,
          partners: [
            { id: 1, name: 'TechCorp', logo: '🏢', status: 'active', category: 'Технологии' },
            { id: 2, name: 'EduPlatform', logo: '📚', status: 'active', category: 'Образование' },
            { id: 3, name: 'StartupHub', logo: '🚀', status: 'pending', category: 'Стартапы' }
          ]
        });
      }

      if (action === 'getUserSettings') {
        return res.json({
          success: true,
          settings: {
            avatar: '👤',
            username: 'User',
            style: 'casual',
            theme: 'dark',
            notifications: true
          }
        });
      }

      if (action === 'getCourses') {
        // Redirect to courses endpoint
        endpoint = 'courses';
      }
    }

    // Courses API
    if (endpoint === 'courses' || action === 'getCourses' || action === 'getCourse') {
      const courses = [
        {
          id: 'ai-basics',
          title: 'Основы AI',
          description: 'Изучите основы искусственного интеллекта',
          icon: '🤖',
          level: 'Начальный',
          duration: '2 часа',
          lessons: 5,
          progress: 60,
          enrolled: true,
          lessons_data: [
            { id: 1, title: 'Что такое AI?', duration: '15 мин', completed: true },
            { id: 2, title: 'Машинное обучение', duration: '20 мин', completed: true },
            { id: 3, title: 'Нейронные сети', duration: '25 мин', completed: true },
            { id: 4, title: 'Практика', duration: '30 мин', completed: false },
            { id: 5, title: 'Итоговый тест', duration: '10 мин', completed: false }
          ]
        },
        {
          id: 'telegram-bots',
          title: 'Telegram Боты',
          description: 'Создайте своего первого бота',
          icon: '🚀',
          level: 'Средний',
          duration: '3 часа',
          lessons: 6,
          progress: 0,
          enrolled: false,
          lessons_data: [
            { id: 1, title: 'Введение', duration: '10 мин', completed: false },
            { id: 2, title: 'Bot API', duration: '20 мин', completed: false },
            { id: 3, title: 'Команды', duration: '25 мин', completed: false },
            { id: 4, title: 'Inline кнопки', duration: '30 мин', completed: false },
            { id: 5, title: 'Webhook', duration: '25 мин', completed: false },
            { id: 6, title: 'Деплой', duration: '20 мин', completed: false }
          ]
        },
        {
          id: 'python-basics',
          title: 'Python для начинающих',
          description: 'Основы программирования на Python',
          icon: '🐍',
          level: 'Начальный',
          duration: '4 часа',
          lessons: 8,
          progress: 25,
          enrolled: true,
          lessons_data: [
            { id: 1, title: 'Переменные', duration: '15 мин', completed: true },
            { id: 2, title: 'Типы данных', duration: '20 мин', completed: true },
            { id: 3, title: 'Условия', duration: '25 мин', completed: false },
            { id: 4, title: 'Циклы', duration: '30 мин', completed: false },
            { id: 5, title: 'Функции', duration: '35 мин', completed: false },
            { id: 6, title: 'Списки', duration: '25 мин', completed: false },
            { id: 7, title: 'Словари', duration: '25 мин', completed: false },
            { id: 8, title: 'Проект', duration: '45 мин', completed: false }
          ]
        }
      ];

      if (action === 'getCourses') {
        return res.json({ success: true, courses });
      }

      if (action === 'getCourse' && courseId) {
        const course = courses.find(c => c.id === courseId);
        if (course) {
          return res.json({ success: true, course });
        }
        return res.json({ success: false, error: 'Course not found' });
      }
    }

    // Profile API
    if (endpoint === 'profile' || action === 'getProfile') {
      return res.json({
        success: true,
        profile: {
          id: userId || 'demo',
          username: 'User',
          level: 5,
          xp: 2500,
          xpToNext: 3000,
          streak: 7,
          totalMessages: 150,
          achievements: 12,
          avatar: '👤',
          style: 'casual',
          theme: 'dark'
        }
      });
    }

    // Voice API
    if (endpoint === 'voice' && req.method === 'POST') {
      return res.json({
        success: true,
        text: 'Привет! Это распознанный текст из голосового сообщения.',
        confidence: 0.95
      });
    }

    // POST actions
    if (req.method === 'POST') {
      const body = req.body;
      
      if (body.action === 'saveSettings') {
        return res.json({ success: true, message: 'Настройки сохранены' });
      }

      if (body.action === 'completeTask') {
        return res.json({ success: true, xpEarned: body.xp || 50, newLevel: false });
      }

      if (body.action === 'startCourse') {
        return res.json({ success: true, message: 'Курс начат', courseId: body.courseId });
      }

      if (body.action === 'completeLesson') {
        return res.json({ success: true, message: 'Урок завершен', xpEarned: 100 });
      }
    }

    res.json({ success: false, error: 'Unknown endpoint or action' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
