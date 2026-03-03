// API для проверки доступа к курсу
const { apiLimiter } = require('../../lib/middleware/rate-limit');
const { checkPurchase } = require('../../lib/db-purchases');
const { isValidTelegramUserId } = require('../../lib/utils/sanitize');

// Загрузка курсов
const fs = require('fs');
const path = require('path');
const coursesPath = path.join(process.cwd(), 'data', 'courses-structure.json');

module.exports = async (req, res) => {
  apiLimiter(req, res, async () => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-WebApp-Init-Data');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    try {
      const { user_id, course_id } = req.method === 'GET' ? req.query : req.body;

      // Валидация
      if (!user_id || !isValidTelegramUserId(parseInt(user_id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid user_id required'
        });
      }

      if (!course_id) {
        return res.status(400).json({
          success: false,
          error: 'course_id required'
        });
      }

      const userId = parseInt(user_id);
      const courseId = parseInt(course_id);

      // Загрузить курс
      const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
      const course = coursesData.courses.find(c => c.id === courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Проверить доступ
      let hasAccess = false;
      let reason = 'not_purchased';

      // Бесплатный курс
      if (course.price === 0) {
        hasAccess = true;
        reason = 'free_course';
      } else {
        // Проверить покупку
        const purchased = await checkPurchase(userId, courseId);
        if (purchased) {
          hasAccess = true;
          reason = 'purchased';
        }
      }

      // Получить доступные уроки
      const lessons = [];
      if (course.themes) {
        course.themes.forEach(theme => {
          theme.lessons.forEach(lesson => {
            const lessonAccess = hasAccess || lesson.is_free;
            lessons.push({
              id: lesson.id,
              title: lesson.title,
              duration: lesson.duration,
              is_free: lesson.is_free,
              has_access: lessonAccess,
              locked: !lessonAccess
            });
          });
        });
      }

      return res.status(200).json({
        success: true,
        course_id: courseId,
        user_id: userId,
        has_access: hasAccess,
        reason,
        course: {
          id: course.id,
          title: course.title,
          price: course.price,
          is_free: course.price === 0
        },
        lessons,
        stats: {
          total_lessons: lessons.length,
          accessible_lessons: lessons.filter(l => l.has_access).length,
          locked_lessons: lessons.filter(l => l.locked).length
        }
      });

    } catch (error) {
      console.error('❌ Check access error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  });
};
