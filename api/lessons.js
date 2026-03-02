// API для уроков
const { db } = require('../lib/db-academy');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, action } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        // Получить урок
        const userId = req.query.user_id;
        const lesson = await db.getLesson(id, userId);
        
        if (!lesson) {
          return res.status(404).json({ error: 'Lesson not found' });
        }

        return res.json(lesson);
      } else {
        // Получить все уроки курса
        const courseId = req.query.course_id;
        const userId = req.query.user_id;
        
        if (!courseId) {
          return res.status(400).json({ error: 'course_id required' });
        }

        const course = await db.getCourseWithLessons(courseId, userId);
        return res.json(course);
      }
    }

    if (req.method === 'POST') {
      if (action === 'progress') {
        // Обновить прогресс урока
        const { user_id, watch_time, last_position } = req.body;
        
        const progress = await db.updateLessonProgress(user_id, id, {
          watch_time,
          last_position
        });

        return res.json(progress);
      }

      if (action === 'complete') {
        // Отметить урок как завершенный
        const { user_id } = req.body;
        
        const progress = await db.updateLessonProgress(user_id, id, {
          completed: true
        });

        return res.json(progress);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Lessons API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
