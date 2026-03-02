// Unified API endpoint for Mini App
module.exports = async (req, res) => {
  const body = req.body || {};
  const query = req.query || {};

  const endpoint = query.endpoint || body.endpoint || '';
  const action = query.action || body.action || '';
  const userId = query.userId || body.userId || 'demo';
  const courseId = query.courseId || body.courseId;

  const courses = [
    {
      id: 'ai-basics',
      title: 'Основы AI',
      description: 'Изучите основы искусственного интеллекта',
      icon: '🤖',
      level: 'Начальный',
      duration: '2 часа',
      lessons_count: 5,
      students_count: 1200,
      rating: 4.8,
      progress: 60
    },
    {
      id: 'telegram-bots',
      title: 'Telegram Боты',
      description: 'Создайте своего первого бота',
      icon: '🚀',
      level: 'Средний',
      duration: '3 часа',
      lessons_count: 6,
      students_count: 890,
      rating: 4.7,
      progress: 0
    },
    {
      id: 'python-basics',
      title: 'Python для начинающих',
      description: 'Основы программирования на Python',
      icon: '🐍',
      level: 'Начальный',
      duration: '4 часа',
      lessons_count: 8,
      students_count: 1500,
      rating: 4.9,
      progress: 25
    }
  ];

  try {
    if (endpoint === 'learning') {
      if (action === 'getUserProgress') {
        return res.json({
          success: true,
          progress: {
            level: 5,
            xp: 2500,
            xpToNext: 3000,
            streak: 7
          },
          courses
        });
      }

      if (action === 'getDailyTasks') {
        return res.json({
          success: true,
          tasks: [
            { id: 1, title: 'Отправить 5 сообщений', progress: 3, total: 5, xp: 50, completed: false },
            { id: 2, title: 'Использовать AI команду', progress: 1, total: 1, xp: 100, completed: true }
          ]
        });
      }

      if (action === 'getAchievements') {
        return res.json({
          success: true,
          achievements: [
            { id: 1, title: 'Первые шаги', description: 'Завершили первый урок', icon: '🎯', unlocked: true },
            { id: 2, title: 'Неделя подряд', description: '7 дней активности', icon: '🔥', unlocked: true }
          ]
        });
      }
    }

    if (endpoint === 'admin') {
      if (action === 'getUserSettings') {
        return res.json({
          success: true,
          stats: {
            level: 5,
            xp: 2450,
            courses_completed: 3,
            achievements_count: 12
          },
          settings: {
            userId,
            avatar: '👤',
            communicationStyle: 'casual',
            language: 'ru',
            theme: 'dark',
            aiModel: 'llama-3.3-70b-versatile',
            aiTemperature: 0.7
          }
        });
      }

      if (action === 'getPartners') {
        return res.json({
          success: true,
          partners: [
            { id: 'p1', name: 'TechCorp', icon: '🏢', description: 'Технологический партнер' },
            { id: 'p2', name: 'EduPlatform', icon: '📚', description: 'Образовательная платформа' }
          ]
        });
      }
    }

    if (endpoint === 'courses' || action === 'getCourses') {
      return res.json({ success: true, courses });
    }

    if (action === 'getCourse' && courseId) {
      const course = courses.find((c) => c.id === courseId);
      return res.json(course ? { success: true, course } : { success: false, error: 'Course not found' });
    }

    if (endpoint === 'profile' || action === 'getProfile') {
      return res.json({
        success: true,
        profile: {
          id: userId,
          username: 'User',
          level: 5,
          xp: 2500,
          streak: 7,
          totalMessages: 150
        }
      });
    }

    if (req.method === 'POST') {
      if (action === 'saveSettings' || action === 'saveUserSettings' || action === 'updateUserSettings') {
        return res.json({ success: true, message: 'Настройки сохранены' });
      }

      if (action === 'completeTask') {
        return res.json({ success: true, xpEarned: body.xp || 50, newLevel: false });
      }

      if (action === 'startCourse') {
        return res.json({ success: true, message: 'Курс начат', courseId: body.courseId });
      }

      if (action === 'completeLesson') {
        return res.json({ success: true, message: 'Урок завершен', xpEarned: 100 });
      }
    }

    return res.status(400).json({ success: false, error: 'Unknown endpoint or action' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
