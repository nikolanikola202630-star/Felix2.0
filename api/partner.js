// API для партнеров
const fs = require('fs');
const path = require('path');
const { apiLimiter } = require('../lib/middleware/rate-limit');
const { telegramAuthOptional } = require('../lib/middleware/telegram-auth');
const { sanitizeObject, sanitizeText, isValidTelegramUserId } = require('../lib/utils/sanitize');

// Временное хранилище (в production использовать БД)
const partners = new Map();
const coursePartners = new Map();
const courseStudents = new Map();
const chats = new Map();
const messages = new Map();

// Инициализация тестовых данных
function initTestData() {
  // Тестовый партнер
  partners.set(8264612178, {
    user_id: 8264612178,
    username: 'partner1',
    first_name: 'Mag1c',
    status: 'active',
    commission_rate: 20,
    total_earnings: 15000,
    total_students: 12,
    created_at: new Date()
  });

  // Связь курсов с партнерами
  coursePartners.set('1-8264612178', {
    course_id: 1,
    partner_id: 8264612178,
    role: 'owner',
    can_edit: true,
    can_view_students: true,
    can_chat: true
  });

  // Тестовые студенты
  for (let i = 1; i <= 5; i++) {
    courseStudents.set(`1-${100000 + i}`, {
      id: i,
      course_id: 1,
      user_id: 100000 + i,
      partner_id: 8264612178,
      first_name: `Студент${i}`,
      last_name: 'Тестовый',
      course_title: 'Детективная лаборатория сознания',
      status: 'active',
      progress: Math.floor(Math.random() * 100),
      started_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      last_activity: new Date()
    });
  }

  // Тестовые чаты
  for (let i = 1; i <= 3; i++) {
    const chatId = i;
    chats.set(chatId, {
      id: chatId,
      partner_id: 8264612178,
      student_id: 100000 + i,
      student_name: `Студент${i} Тестовый`,
      course_id: 1,
      course_title: 'Детективная лаборатория сознания',
      status: 'open',
      unread_count: i === 1 ? 2 : 0,
      last_message_at: new Date(Date.now() - i * 60 * 60 * 1000)
    });

    // Тестовые сообщения
    messages.set(chatId, [
      {
        id: 1,
        chat_id: chatId,
        sender_id: 100000 + i,
        sender_type: 'student',
        message: 'Здравствуйте! У меня вопрос по уроку.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        chat_id: chatId,
        sender_id: 8264612178,
        sender_type: 'partner',
        message: 'Здравствуйте! Конечно, задавайте.',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]);
  }
}

initTestData();

function isPartner(userId) {
  return partners.has(parseInt(userId));
}

module.exports = async (req, res) => {
  // Применить rate limiting и опциональную аутентификацию
  apiLimiter(req, res, async () => {
    telegramAuthOptional(req, res, async () => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Telegram-WebApp-Init-Data');

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      try {
        const { action, userId } = req.method === 'GET' ? req.query : req.body;

        if (!userId || !isValidTelegramUserId(parseInt(userId))) {
          return res.status(400).json({
            success: false,
            error: 'Valid userId required'
          });
        }

        const userIdInt = parseInt(userId);

    switch (action) {
      case 'getProfile': {
        // Получить профиль партнера
        const partner = partners.get(userIdInt);
        
        if (!partner) {
          return res.status(404).json({
            success: false,
            error: 'Partner not found'
          });
        }

        return res.status(200).json({
          success: true,
          partner
        });
      }

      case 'getMyCourses': {
        // Получить курсы партнера
        const coursesPath = path.join(process.cwd(), 'data', 'courses-structure.json');
        const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        
        // Фильтровать курсы партнера
        const partnerCourses = [];
        for (const [key, cp] of coursePartners.entries()) {
          if (cp.partner_id === userIdInt) {
            const course = coursesData.courses.find(c => c.id === cp.course_id);
            if (course) {
              // Подсчитать студентов
              const studentsCount = Array.from(courseStudents.values())
                .filter(s => s.course_id === course.id && s.partner_id === userIdInt).length;
              
              const lessonsCount = course.themes?.reduce((sum, theme) => 
                sum + (theme.lessons?.length || 0), 0) || 0;

              partnerCourses.push({
                ...course,
                students_count: studentsCount,
                lessons_count: lessonsCount,
                role: cp.role,
                can_edit: cp.can_edit
              });
            }
          }
        }

        return res.status(200).json({
          success: true,
          courses: partnerCourses
        });
      }

      case 'getMyStudents': {
        // Получить студентов партнера
        const students = Array.from(courseStudents.values())
          .filter(s => s.partner_id === userIdInt);

        return res.status(200).json({
          success: true,
          students
        });
      }

      case 'getMyChats': {
        // Получить чаты партнера
        const partnerChats = Array.from(chats.values())
          .filter(c => c.partner_id === userIdInt)
          .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));

        return res.status(200).json({
          success: true,
          chats: partnerChats
        });
      }

      case 'getChatMessages': {
        // Получить сообщения чата
        const { chatId } = req.method === 'GET' ? req.query : req.body;
        
        if (!chatId) {
          return res.status(400).json({
            success: false,
            error: 'chatId required'
          });
        }

        const chat = chats.get(parseInt(chatId));
        
        if (!chat || chat.partner_id !== userIdInt) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }

        const chatMessages = messages.get(parseInt(chatId)) || [];

        // Отметить как прочитанные
        chat.unread_count = 0;

        return res.status(200).json({
          success: true,
          messages: chatMessages
        });
      }

      case 'sendMessage': {
        // Отправить сообщение
        const { chatId, message } = req.body;
        
        if (!chatId || !message) {
          return res.status(400).json({
            success: false,
            error: 'chatId and message required'
          });
        }

        const chat = chats.get(parseInt(chatId));
        
        if (!chat || chat.partner_id !== userIdInt) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }

        const chatMessages = messages.get(parseInt(chatId)) || [];
        const newMessage = {
          id: chatMessages.length + 1,
          chat_id: parseInt(chatId),
          sender_id: userIdInt,
          sender_type: 'partner',
          message,
          created_at: new Date()
        };

        chatMessages.push(newMessage);
        messages.set(parseInt(chatId), chatMessages);

        // Обновить время последнего сообщения
        chat.last_message_at = new Date();

        return res.status(200).json({
          success: true,
          message: newMessage
        });
      }

      case 'createChat': {
        // Создать или получить чат
        const { studentId, courseId } = req.body;
        
        if (!studentId || !courseId) {
          return res.status(400).json({
            success: false,
            error: 'studentId and courseId required'
          });
        }

        // Проверить существующий чат
        let existingChat = Array.from(chats.values()).find(c => 
          c.partner_id === userIdInt && 
          c.student_id === parseInt(studentId) && 
          c.course_id === parseInt(courseId)
        );

        if (existingChat) {
          return res.status(200).json({
            success: true,
            chat: existingChat
          });
        }

        // Создать новый чат
        const student = courseStudents.get(`${courseId}-${studentId}`);
        const newChatId = chats.size + 1;
        
        const newChat = {
          id: newChatId,
          partner_id: userIdInt,
          student_id: parseInt(studentId),
          student_name: student ? `${student.first_name} ${student.last_name || ''}` : 'Студент',
          course_id: parseInt(courseId),
          course_title: student?.course_title || 'Курс',
          status: 'open',
          unread_count: 0,
          last_message_at: new Date()
        };

        chats.set(newChatId, newChat);
        messages.set(newChatId, []);

        return res.status(200).json({
          success: true,
          chat: newChat
        });
      }

      case 'getStudentProgress': {
        // Получить прогресс студента
        const { studentId, courseId } = req.method === 'GET' ? req.query : req.body;
        
        if (!studentId || !courseId) {
          return res.status(400).json({
            success: false,
            error: 'studentId and courseId required'
          });
        }

        const student = courseStudents.get(`${courseId}-${studentId}`);
        
        if (!student || student.partner_id !== userIdInt) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }

        // Загрузить курс для подсчета уроков
        const coursesPath = path.join(process.cwd(), 'data', 'courses-structure.json');
        const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const course = coursesData.courses.find(c => c.id === parseInt(courseId));
        
        const totalLessons = course?.themes?.reduce((sum, theme) => 
          sum + (theme.lessons?.length || 0), 0) || 0;
        const completedLessons = Math.floor(totalLessons * (student.progress / 100));

        return res.status(200).json({
          success: true,
          progress: {
            total_lessons: totalLessons,
            completed_lessons: completedLessons,
            progress: student.progress,
            started_at: student.started_at,
            last_activity: student.last_activity
          }
        });
      }

      case 'getStats': {
        // Получить статистику партнера
        const partner = partners.get(userIdInt);
        
        if (!partner) {
          return res.status(404).json({
            success: false,
            error: 'Partner not found'
          });
        }

        const myCourses = Array.from(coursePartners.values())
          .filter(cp => cp.partner_id === userIdInt).length;
        
        const myStudents = Array.from(courseStudents.values())
          .filter(s => s.partner_id === userIdInt).length;
        
        const unreadChats = Array.from(chats.values())
          .filter(c => c.partner_id === userIdInt && c.unread_count > 0).length;

        return res.status(200).json({
          success: true,
          stats: {
            courses: myCourses,
            students: myStudents,
            earnings: partner.total_earnings,
            unread_chats: unreadChats
          }
        });
      }

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

  } catch (error) {
    console.error('Partner API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
    });
  });
};
