// API для получения купленных курсов пользователя
const { apiLimiter } = require('../../lib/middleware/rate-limit');
const { getUserPurchases } = require('../../lib/db-purchases');
const { isValidTelegramUserId } = require('../../lib/utils/sanitize');

// Загрузка курсов
const fs = require('fs');
const path = require('path');
const coursesPath = path.join(process.cwd(), 'data', 'courses-structure.json');

module.exports = async (req, res) => {
  apiLimiter(req, res, async () => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-WebApp-Init-Data');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { user_id } = req.query;

      // Валидация
      if (!user_id || !isValidTelegramUserId(parseInt(user_id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid user_id required'
        });
      }

      // PAYMENT: Free access - return all courses
      // Uncomment below to restore purchase-based filtering
      
      /* PAYMENT: Original purchase check - uncomment to restore
      // Получить покупки пользователя
      const purchases = await getUserPurchases(userId);
      */
      
      // FREE ACCESS: Return all courses as "purchased"
      const purchases = []; // Empty during free period

      // Загрузить данные курсов
      const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

      // FREE ACCESS: All courses are available
      const allCourses = coursesData.courses.map(course => {
        const totalLessons = course.themes?.reduce((sum, theme) => 
          sum + (theme.lessons?.length || 0), 0) || 0;

        return {
          purchase_id: null,
          course_id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          image: course.image,
          instructor: course.instructor,
          rating: course.rating,
          total_lessons: totalLessons,
          duration_hours: course.duration_hours,
          purchased_at: null,
          amount_paid: 0,
          currency: 'FREE',
          progress: 0,
          completed_lessons: 0,
          last_lesson_id: null,
          is_free: true,
          free_access_period: true
        };
      });

      /* PAYMENT: Original course filtering - uncomment to restore
      // Собрать информацию о купленных курсах
      const myCourses = purchases.map(purchase => {
        const course = coursesData.courses.find(c => c.id === purchase.course_id);
        
        if (!course) {
          return null;
        }

        // Подсчитать уроки
        const totalLessons = course.themes?.reduce((sum, theme) => 
          sum + (theme.lessons?.length || 0), 0) || 0;

        return {
          purchase_id: purchase.id,
          course_id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          image: course.image,
          instructor: course.instructor,
          rating: course.rating,
          total_lessons: totalLessons,
          duration_hours: course.duration_hours,
          purchased_at: purchase.created_at,
          amount_paid: purchase.amount,
          currency: purchase.currency,
          progress: 0, // TODO: Получить из БД
          completed_lessons: 0, // TODO: Получить из БД
          last_lesson_id: null // TODO: Получить из БД
        };
      }).filter(Boolean); // Удалить null значения

      // Добавить бесплатные курсы
      const freeCourses = coursesData.courses
        .filter(c => c.price === 0)
        .map(course => {
          const totalLessons = course.themes?.reduce((sum, theme) => 
            sum + (theme.lessons?.length || 0), 0) || 0;

          return {
            purchase_id: null,
            course_id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            image: course.image,
            instructor: course.instructor,
            rating: course.rating,
            total_lessons: totalLessons,
            duration_hours: course.duration_hours,
            purchased_at: null,
            amount_paid: 0,
            currency: 'FREE',
            progress: 0,
            completed_lessons: 0,
            last_lesson_id: null,
            is_free: true
          };
        });

      const allCourses = [...myCourses, ...freeCourses];

      return res.status(200).json({
        success: true,
        user_id: userId,
        count: allCourses.length,
        courses: allCourses,
        free_access_period: true,
        stats: {
          total_courses: allCourses.length,
          paid_courses: 0, // All free during this period
          free_courses: allCourses.length,
          total_spent: 0,
          total_lessons: allCourses.reduce((sum, c) => sum + c.total_lessons, 0),
          total_hours: allCourses.reduce((sum, c) => sum + (c.duration_hours || 0), 0)
        }
      });

    } catch (error) {
      console.error('❌ Get my courses error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  });
};
