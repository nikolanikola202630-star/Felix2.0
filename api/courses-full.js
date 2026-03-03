// API для получения полной структуры курсов
const fs = require('fs');
const path = require('path');
const { apiLimiter } = require('../lib/middleware/rate-limit');
const { sanitizeObject } = require('../lib/utils/sanitize');

module.exports = async (req, res) => {
  // Применить rate limiting
  apiLimiter(req, res, async () => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  try {
    // Читаем файл с курсами
    const coursesPath = path.join(process.cwd(), 'data', 'courses-structure.json');
    const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

    // Получаем параметры запроса
    const { id, category, level, free_only } = req.query;

    let filteredCourses = coursesData.courses;

    // Фильтр по ID
    if (id) {
      filteredCourses = filteredCourses.filter(c => c.id === parseInt(id));
    }

    // Фильтр по категории
    if (category) {
      filteredCourses = filteredCourses.filter(c => c.category === category);
    }

    // Фильтр по уровню
    if (level) {
      filteredCourses = filteredCourses.filter(c => c.level === level || c.level === 'all');
    }

    // Фильтр только бесплатные
    if (free_only === 'true') {
      filteredCourses = filteredCourses.filter(c => c.price === 0);
    }

    // Добавляем вычисляемые поля
    filteredCourses = filteredCourses.map(course => ({
      ...course,
      totalLessons: course.themes.reduce((sum, theme) => sum + theme.lessons.length, 0),
      freeLessons: course.themes.reduce((sum, theme) => 
        sum + theme.lessons.filter(l => l.is_free).length, 0
      )
    }));

    // Санитизация данных перед отправкой
    const sanitizedCourses = sanitizeObject(filteredCourses);

    return res.status(200).json({
      success: true,
      count: sanitizedCourses.length,
      courses: sanitizedCourses
    });

  } catch (error) {
    console.error('Error loading courses:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load courses',
      message: error.message
    });
  }
  });
};
