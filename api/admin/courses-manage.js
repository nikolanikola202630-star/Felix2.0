// Расширенный API для управления курсами (Admin)
const fs = require('fs');
const path = require('path');
const { apiLimiter } = require('../../lib/middleware/rate-limit');
const { sanitizeObject, isValidTelegramUserId } = require('../../lib/utils/sanitize');
const { rublesToStars } = require('../../lib/payments/telegram-stars');

// Список админов
const ADMINS = [8264612178];

function isAdmin(userId) {
  return ADMINS.includes(parseInt(userId));
}

const coursesPath = path.join(process.cwd(), 'data', 'courses-structure.json');

module.exports = async (req, res) => {
  apiLimiter(req, res, async () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    try {
      const { action, userId } = req.method === 'GET' ? req.query : req.body;

      if (!userId || !isValidTelegramUserId(parseInt(userId))) {
        return res.status(400).json({
          success: false,
          error: 'Valid user ID required'
        });
      }

      if (!isAdmin(userId)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      switch (action) {
        // Обновить цену курса
        case 'updatePrice': {
          const { courseId, price } = req.body;
          
          if (!courseId || price === undefined) {
            return res.status(400).json({
              success: false,
              error: 'courseId and price required'
            });
          }

          if (price < 0 || price > 100000) {
            return res.status(400).json({
              success: false,
              error: 'Price must be between 0 and 100,000'
            });
          }

          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
          const course = coursesData.courses.find(c => c.id === parseInt(courseId));

          if (!course) {
            return res.status(404).json({
              success: false,
              error: 'Course not found'
            });
          }

          const oldPrice = course.price;
          course.price = parseInt(price);
          course.price_stars = rublesToStars(course.price);
          course.updated_at = new Date().toISOString();

          fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

          console.log(`💰 Price updated: Course ${courseId} from ${oldPrice}₽ to ${price}₽`);

          return res.status(200).json({
            success: true,
            course: {
              id: course.id,
              title: course.title,
              old_price: oldPrice,
              new_price: course.price,
              price_stars: course.price_stars
            }
          });
        }

        // Массовое обновление цен
        case 'bulkUpdatePrices': {
          const { courseIds, discount } = req.body;
          
          if (!courseIds || !Array.isArray(courseIds) || discount === undefined) {
            return res.status(400).json({
              success: false,
              error: 'courseIds array and discount required'
            });
          }

          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
          const updated = [];

          courseIds.forEach(id => {
            const course = coursesData.courses.find(c => c.id === parseInt(id));
            if (course && course.price > 0) {
              const oldPrice = course.price;
              course.price = Math.floor(course.price * (1 - discount / 100));
              course.price_stars = rublesToStars(course.price);
              course.updated_at = new Date().toISOString();
              
              updated.push({
                id: course.id,
                title: course.title,
                old_price: oldPrice,
                new_price: course.price
              });
            }
          });

          fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

          console.log(`💰 Bulk price update: ${updated.length} courses, ${discount}% discount`);

          return res.status(200).json({
            success: true,
            updated_count: updated.length,
            courses: updated
          });
        }

        // Добавить урок к курсу
        case 'addLesson': {
          const { courseId, themeId, lesson } = req.body;
          
          if (!courseId || !themeId || !lesson) {
            return res.status(400).json({
              success: false,
              error: 'courseId, themeId, and lesson required'
            });
          }

          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
          const course = coursesData.courses.find(c => c.id === parseInt(courseId));

          if (!course) {
            return res.status(404).json({
              success: false,
              error: 'Course not found'
            });
          }

          const theme = course.themes.find(t => t.id === parseInt(themeId));

          if (!theme) {
            return res.status(404).json({
              success: false,
              error: 'Theme not found'
            });
          }

          // Генерировать ID урока
          const maxLessonId = Math.max(
            ...coursesData.courses.flatMap(c => 
              c.themes.flatMap(t => t.lessons.map(l => l.id))
            ),
            0
          );

          lesson.id = maxLessonId + 1;
          theme.lessons.push(lesson);

          // Обновить длительность курса
          course.duration_hours = Math.ceil(
            course.themes.reduce((sum, t) => 
              sum + t.lessons.reduce((s, l) => s + (l.duration || 0), 0), 0
            ) / 60
          );

          fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

          console.log(`📚 Lesson added: ${lesson.title} to course ${courseId}`);

          return res.status(200).json({
            success: true,
            lesson
          });
        }

        // Обновить урок
        case 'updateLesson': {
          const { courseId, themeId, lessonId, updates } = req.body;
          
          if (!courseId || !themeId || !lessonId || !updates) {
            return res.status(400).json({
              success: false,
              error: 'courseId, themeId, lessonId, and updates required'
            });
          }

          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
          const course = coursesData.courses.find(c => c.id === parseInt(courseId));

          if (!course) {
            return res.status(404).json({
              success: false,
              error: 'Course not found'
            });
          }

          const theme = course.themes.find(t => t.id === parseInt(themeId));

          if (!theme) {
            return res.status(404).json({
              success: false,
              error: 'Theme not found'
            });
          }

          const lesson = theme.lessons.find(l => l.id === parseInt(lessonId));

          if (!lesson) {
            return res.status(404).json({
              success: false,
              error: 'Lesson not found'
            });
          }

          // Обновить урок
          Object.assign(lesson, updates);

          // Обновить длительность курса
          course.duration_hours = Math.ceil(
            course.themes.reduce((sum, t) => 
              sum + t.lessons.reduce((s, l) => s + (l.duration || 0), 0), 0
            ) / 60
          );

          fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

          console.log(`✏️ Lesson updated: ${lesson.title}`);

          return res.status(200).json({
            success: true,
            lesson
          });
        }

        // Удалить урок
        case 'deleteLesson': {
          const { courseId, themeId, lessonId } = req.body;
          
          if (!courseId || !themeId || !lessonId) {
            return res.status(400).json({
              success: false,
              error: 'courseId, themeId, and lessonId required'
            });
          }

          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
          const course = coursesData.courses.find(c => c.id === parseInt(courseId));

          if (!course) {
            return res.status(404).json({
              success: false,
              error: 'Course not found'
            });
          }

          const theme = course.themes.find(t => t.id === parseInt(themeId));

          if (!theme) {
            return res.status(404).json({
              success: false,
              error: 'Theme not found'
            });
          }

          const lessonIndex = theme.lessons.findIndex(l => l.id === parseInt(lessonId));

          if (lessonIndex === -1) {
            return res.status(404).json({
              success: false,
              error: 'Lesson not found'
            });
          }

          const deletedLesson = theme.lessons.splice(lessonIndex, 1)[0];

          // Обновить длительность курса
          course.duration_hours = Math.ceil(
            course.themes.reduce((sum, t) => 
              sum + t.lessons.reduce((s, l) => s + (l.duration || 0), 0), 0
            ) / 60
          );

          fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

          console.log(`🗑️ Lesson deleted: ${deletedLesson.title}`);

          return res.status(200).json({
            success: true,
            message: 'Lesson deleted'
          });
        }

        // Изменить порядок уроков
        case 'reorderLessons': {
          const { courseId, themeId, lessonIds } = req.body;
          
          if (!courseId || !themeId || !lessonIds || !Array.isArray(lessonIds)) {
            return res.status(400).json({
              success: false,
              error: 'courseId, themeId, and lessonIds array required'
            });
          }

          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
          const course = coursesData.courses.find(c => c.id === parseInt(courseId));

          if (!course) {
            return res.status(404).json({
              success: false,
              error: 'Course not found'
            });
          }

          const theme = course.themes.find(t => t.id === parseInt(themeId));

          if (!theme) {
            return res.status(404).json({
              success: false,
              error: 'Theme not found'
            });
          }

          // Переупорядочить уроки
          const reorderedLessons = lessonIds.map(id => 
            theme.lessons.find(l => l.id === parseInt(id))
          ).filter(Boolean);

          theme.lessons = reorderedLessons;

          fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

          console.log(`🔄 Lessons reordered in theme ${themeId}`);

          return res.status(200).json({
            success: true,
            lessons: theme.lessons
          });
        }

        // Получить детальную статистику
        case 'getDetailedStats': {
          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
          
          const stats = {
            overview: {
              total_courses: coursesData.courses.length,
              total_lessons: coursesData.courses.reduce((sum, c) => 
                sum + (c.themes?.reduce((s, t) => s + (t.lessons?.length || 0), 0) || 0), 0),
              total_hours: coursesData.courses.reduce((sum, c) => 
                sum + (c.duration_hours || 0), 0),
              total_students: coursesData.courses.reduce((sum, c) => 
                sum + (c.students || 0), 0),
              avg_rating: (coursesData.courses.reduce((sum, c) => 
                sum + (c.rating || 0), 0) / coursesData.courses.length).toFixed(1)
            },
            by_category: {},
            by_level: {},
            by_price: {
              free: 0,
              under_3000: 0,
              under_5000: 0,
              over_5000: 0
            },
            courses: coursesData.courses.map(c => ({
              id: c.id,
              title: c.title,
              category: c.category,
              level: c.level,
              price: c.price,
              price_stars: rublesToStars(c.price),
              students: c.students || 0,
              rating: c.rating || 0,
              lessons_count: c.themes?.reduce((sum, t) => sum + (t.lessons?.length || 0), 0) || 0,
              duration_hours: c.duration_hours || 0
            }))
          };

          // Статистика по категориям
          coursesData.courses.forEach(c => {
            if (!stats.by_category[c.category]) {
              stats.by_category[c.category] = {
                count: 0,
                students: 0,
                avg_price: 0
              };
            }
            stats.by_category[c.category].count++;
            stats.by_category[c.category].students += c.students || 0;
            stats.by_category[c.category].avg_price += c.price || 0;
          });

          // Средняя цена по категориям
          Object.keys(stats.by_category).forEach(cat => {
            stats.by_category[cat].avg_price = Math.floor(
              stats.by_category[cat].avg_price / stats.by_category[cat].count
            );
          });

          // Статистика по уровням
          coursesData.courses.forEach(c => {
            if (!stats.by_level[c.level]) {
              stats.by_level[c.level] = 0;
            }
            stats.by_level[c.level]++;
          });

          // Статистика по ценам
          coursesData.courses.forEach(c => {
            if (c.price === 0) {
              stats.by_price.free++;
            } else if (c.price < 3000) {
              stats.by_price.under_3000++;
            } else if (c.price < 5000) {
              stats.by_price.under_5000++;
            } else {
              stats.by_price.over_5000++;
            }
          });

          return res.status(200).json({
            success: true,
            stats
          });
        }

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action'
          });
      }

    } catch (error) {
      console.error('❌ Admin courses manage error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  });
};
