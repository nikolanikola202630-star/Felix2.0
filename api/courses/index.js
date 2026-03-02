// Courses API
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

module.exports = async (req, res) => {
  const { action, userId, courseId } = req.query;

  try {
    if (action === 'getCourses') {
      return res.json({
        success: true,
        courses: courses
      });
    }

    if (action === 'getCourse' && courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        return res.json({
          success: true,
          course: course
        });
      }
      return res.json({ success: false, error: 'Course not found' });
    }

    if (req.method === 'POST') {
      const body = req.body;
      
      if (body.action === 'startCourse') {
        return res.json({
          success: true,
          message: 'Курс начат',
          courseId: body.courseId
        });
      }

      if (body.action === 'completeLesson') {
        return res.json({
          success: true,
          message: 'Урок завершен',
          xpEarned: 100
        });
      }
    }

    res.json({ success: false, error: 'Unknown action' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
