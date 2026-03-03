// API для управления курсами (Admin)
const fs = require('fs');
const path = require('path');
const { apiLimiter } = require('../lib/middleware/rate-limit');
const { sanitizeObject, isValidTelegramUserId } = require('../lib/utils/sanitize');

// Список админов (в production использовать БД)
const ADMINS = [
  8264612178, // Ваш Telegram ID
  // Добавьте другие ID админов
];

function isAdmin(userId) {
  return ADMINS.includes(parseInt(userId));
}

module.exports = async (req, res) => {
  // Применить rate limiting
  apiLimiter(req, res, async () => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    try {
      const { action, userId } = req.method === 'GET' ? req.query : req.body;

      // Валидация userId
      if (!userId || !isValidTelegramUserId(parseInt(userId))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      // Проверка прав админа
      if (!isAdmin(userId)) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

    const coursesPath = path.join(process.cwd(), 'data', 'courses-structure.json');

    switch (action) {
      case 'getCourses': {
        // Получить все курсы
        const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        return res.status(200).json({
          success: true,
          courses: coursesData.courses
        });
      }

      case 'saveCourses': {
        // Сохранить все курсы
        const { courses } = req.body;
        
        if (!courses || !Array.isArray(courses)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid courses data'
          });
        }

        // Создать бэкап
        const backupPath = path.join(process.cwd(), 'data', `courses-backup-${Date.now()}.json`);
        const currentData = fs.readFileSync(coursesPath, 'utf8');
        fs.writeFileSync(backupPath, currentData);

        // Сохранить новые данные
        const newData = { courses };
        fs.writeFileSync(coursesPath, JSON.stringify(newData, null, 2));

        return res.status(200).json({
          success: true,
          message: 'Courses saved successfully',
          backup: backupPath
        });
      }

      case 'addCourse': {
        // Добавить новый курс
        const { course } = req.body;
        
        if (!course) {
          return res.status(400).json({
            success: false,
            error: 'Course data required'
          });
        }

        const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        
        // Генерировать ID
        const maxId = coursesData.courses.length > 0 
          ? Math.max(...coursesData.courses.map(c => c.id)) 
          : 0;
        course.id = maxId + 1;

        coursesData.courses.push(course);
        fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

        return res.status(200).json({
          success: true,
          course
        });
      }

      case 'updateCourse': {
        // Обновить курс
        const { courseId, updates } = req.body;
        
        if (!courseId || !updates) {
          return res.status(400).json({
            success: false,
            error: 'Course ID and updates required'
          });
        }

        const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const index = coursesData.courses.findIndex(c => c.id === parseInt(courseId));

        if (index === -1) {
          return res.status(404).json({
            success: false,
            error: 'Course not found'
          });
        }

        coursesData.courses[index] = {
          ...coursesData.courses[index],
          ...updates
        };

        fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

        return res.status(200).json({
          success: true,
          course: coursesData.courses[index]
        });
      }

      case 'deleteCourse': {
        // Удалить курс
        const { courseId } = req.body;
        
        if (!courseId) {
          return res.status(400).json({
            success: false,
            error: 'Course ID required'
          });
        }

        const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const initialLength = coursesData.courses.length;
        
        coursesData.courses = coursesData.courses.filter(c => c.id !== parseInt(courseId));

        if (coursesData.courses.length === initialLength) {
          return res.status(404).json({
            success: false,
            error: 'Course not found'
          });
        }

        fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));

        return res.status(200).json({
          success: true,
          message: 'Course deleted successfully'
        });
      }

      case 'getStats': {
        // Получить статистику
        const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        
        const stats = {
          totalCourses: coursesData.courses.length,
          totalLessons: coursesData.courses.reduce((sum, course) => 
            sum + (course.themes?.reduce((s, t) => s + (t.lessons?.length || 0), 0) || 0), 0),
          totalStudents: coursesData.courses.reduce((sum, course) => 
            sum + (course.students || 0), 0),
          totalHours: coursesData.courses.reduce((sum, course) => 
            sum + (course.duration_hours || 0), 0),
          totalRevenue: coursesData.courses.reduce((sum, course) => 
            sum + ((course.price || 0) * (course.students || 0)), 0),
          byCategory: {}
        };

        // Статистика по категориям
        coursesData.courses.forEach(course => {
          if (!stats.byCategory[course.category]) {
            stats.byCategory[course.category] = {
              count: 0,
              students: 0,
              revenue: 0
            };
          }
          stats.byCategory[course.category].count++;
          stats.byCategory[course.category].students += course.students || 0;
          stats.byCategory[course.category].revenue += (course.price || 0) * (course.students || 0);
        });

        return res.status(200).json({
          success: true,
          stats
        });
      }

      case 'restoreBackup': {
        // Восстановить из бэкапа
        const { backupFile } = req.body;
        
        if (!backupFile) {
          return res.status(400).json({
            success: false,
            error: 'Backup file required'
          });
        }

        const backupPath = path.join(process.cwd(), 'data', backupFile);
        
        if (!fs.existsSync(backupPath)) {
          return res.status(404).json({
            success: false,
            error: 'Backup file not found'
          });
        }

        const backupData = fs.readFileSync(backupPath, 'utf8');
        fs.writeFileSync(coursesPath, backupData);

        return res.status(200).json({
          success: true,
          message: 'Backup restored successfully'
        });
      }

      case 'listBackups': {
        // Список бэкапов
        const dataDir = path.join(process.cwd(), 'data');
        const files = fs.readdirSync(dataDir);
        const backups = files
          .filter(f => f.startsWith('courses-backup-'))
          .map(f => ({
            filename: f,
            timestamp: parseInt(f.replace('courses-backup-', '').replace('.json', '')),
            size: fs.statSync(path.join(dataDir, f)).size
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        return res.status(200).json({
          success: true,
          backups
        });
      }

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

  } catch (error) {
    console.error('Admin Courses API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
  });
};
