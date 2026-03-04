// Felix Academy V12 - Unified API Endpoint
// Единый endpoint для всех запросов Mini App с валидацией

const { createClient } = require('@supabase/supabase-js');
const { optionalTelegramAuth, getUserId } = require('../lib/middleware/telegram-init-data');
const { asyncHandler, ValidationError, NotFoundError } = require('../lib/middleware/error-handler');

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Fallback courses data
const FALLBACK_COURSES = [
  {
    id: 'ai-basics',
    title: 'Основы AI',
    description: 'Изучите основы искусственного интеллекта',
    icon: '🤖',
    level: 'Начальный',
    duration: '2 часа',
    lessons: 5,
    progress: 0,
    enrolled: false
  },
  {
    id: 'ml-intro',
    title: 'Введение в ML',
    description: 'Машинное обучение с нуля',
    icon: '🧠',
    level: 'Начальный',
    duration: '3 часа',
    lessons: 8,
    progress: 0,
    enrolled: false
  },
  {
    id: 'python-advanced',
    title: 'Python Advanced',
    description: 'Продвинутый Python для профессионалов',
    icon: '🐍',
    level: 'Продвинутый',
    duration: '5 часов',
    lessons: 12,
    progress: 0,
    enrolled: false
  }
];

/**
 * Main handler
 */
module.exports = asyncHandler(async (req, res) => {
  // Apply optional auth middleware
  await new Promise((resolve, reject) => {
    optionalTelegramAuth(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const { method } = req;
  const action = req.query.action || req.body?.action;
  const userId = getUserId(req);

  console.log(`📡 API Request: ${method} ${action} (user: ${userId})`);

  // Route to appropriate handler
  try {
    let result;

    switch (action) {
      // Learning endpoints
      case 'getUserProgress':
        result = await getUserProgress(userId);
        break;
      case 'getDailyTasks':
        result = await getDailyTasks(userId);
        break;
      case 'getAchievements':
        result = await getAchievements(userId);
        break;
      case 'getAnalytics':
        result = await getAnalytics(userId);
        break;
      case 'getLeaderboard':
        result = await getLeaderboard();
        break;

      // Courses endpoints
      case 'getCourses':
        result = await getCourses(userId);
        break;
      case 'getCourse':
        result = await getCourse(req.query.courseId || req.body?.courseId, userId);
        break;
      case 'startCourse':
        result = await startCourse(req.body.courseId, userId);
        break;
      case 'completeLesson':
        result = await completeLesson(req.body.courseId, req.body.lessonId, userId);
        break;

      // Profile endpoints
      case 'getProfile':
        result = await getProfile(userId);
        break;
      case 'updateProfile':
        result = await updateProfile(userId, req.body.data);
        break;

      // Settings endpoints
      case 'getSettings':
        result = await getSettings(userId);
        break;
      case 'saveSettings':
        result = await saveSettings(userId, req.body.settings);
        break;

      // Admin endpoints
      case 'getPartners':
        result = await getPartners();
        break;

      // Error logging
      case 'logError':
        result = await logError(req.body.error, userId);
        break;

      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error(`❌ API Error (${action}):`, error);
    
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error',
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// ============================================================================
// LEARNING HANDLERS
// ============================================================================

async function getUserProgress(userId) {
  if (!userId) {
    return {
      progress: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        streak: 0,
        totalXP: 0,
        rank: 'Новичок'
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      progress: data || {
        level: 1,
        xp: 0,
        xpToNext: 100,
        streak: 0,
        totalXP: 0,
        rank: 'Новичок'
      }
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return {
      progress: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        streak: 0,
        totalXP: 0,
        rank: 'Новичок'
      }
    };
  }
}

async function getDailyTasks(userId) {
  // TODO: Implement daily tasks
  return {
    tasks: [
      { id: 1, title: 'Пройти 1 урок', progress: 0, target: 1, xp: 50, completed: false },
      { id: 2, title: 'Получить 100 XP', progress: 0, target: 100, xp: 100, completed: false },
      { id: 3, title: 'Задать вопрос AI', progress: 0, target: 1, xp: 25, completed: false }
    ]
  };
}

async function getAchievements(userId) {
  // TODO: Implement achievements
  return {
    achievements: [
      { id: 1, title: 'Первый шаг', description: 'Начать первый курс', icon: '🎯', unlocked: false },
      { id: 2, title: 'Ученик', description: 'Пройти 5 уроков', icon: '📚', unlocked: false },
      { id: 3, title: 'Мастер', description: 'Завершить курс', icon: '🏆', unlocked: false }
    ]
  };
}

async function getAnalytics(userId) {
  // TODO: Implement analytics
  return {
    analytics: {
      totalTime: 0,
      lessonsCompleted: 0,
      coursesStarted: 0,
      coursesCompleted: 0,
      averageScore: 0
    }
  };
}

async function getLeaderboard() {
  // TODO: Implement leaderboard
  return {
    leaderboard: []
  };
}

// ============================================================================
// COURSES HANDLERS
// ============================================================================

async function getCourses(userId) {
  try {
    // Try to get from database
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // If no courses in DB, return fallback
    if (!data || data.length === 0) {
      return { courses: FALLBACK_COURSES };
    }

    // Get user progress if userId provided
    let userCourses = data;
    if (userId) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('course_id, progress')
        .eq('user_id', userId);

      if (progress) {
        userCourses = data.map(course => {
          const userProgress = progress.find(p => p.course_id === course.id);
          return {
            ...course,
            progress: userProgress?.progress || 0,
            enrolled: !!userProgress
          };
        });
      }
    }

    return { courses: userCourses };

  } catch (error) {
    console.error('Error getting courses:', error);
    return { courses: FALLBACK_COURSES };
  }
}

async function getCourse(courseId, userId) {
  if (!courseId) {
    throw new ValidationError('courseId is required');
  }

  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError('Course not found');

    // Get user progress
    let progress = 0;
    if (userId) {
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('progress')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      progress = progressData?.progress || 0;
    }

    return {
      course: {
        ...data,
        progress
      }
    };

  } catch (error) {
    console.error('Error getting course:', error);
    
    // Return fallback course
    const fallback = FALLBACK_COURSES.find(c => c.id === courseId);
    if (fallback) {
      return { course: fallback };
    }
    
    throw new NotFoundError('Course not found');
  }
}

async function startCourse(courseId, userId) {
  if (!courseId || !userId) {
    throw new ValidationError('courseId and userId are required');
  }

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      message: 'Course started successfully',
      progress: data
    };

  } catch (error) {
    console.error('Error starting course:', error);
    throw error;
  }
}

async function completeLesson(courseId, lessonId, userId) {
  if (!courseId || !lessonId || !userId) {
    throw new ValidationError('courseId, lessonId and userId are required');
  }

  try {
    // TODO: Implement lesson completion logic
    // Update progress, award XP, etc.

    return {
      message: 'Lesson completed successfully',
      xpEarned: 50
    };

  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
}

// ============================================================================
// PROFILE HANDLERS
// ============================================================================

async function getProfile(userId) {
  if (!userId) {
    return {
      profile: {
        id: 0,
        username: 'Guest',
        level: 1,
        xp: 0,
        xpToNext: 100,
        streak: 0,
        totalMessages: 0,
        achievements: 0
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Get progress
    const progress = await getUserProgress(userId);

    return {
      profile: {
        ...data,
        ...progress.progress
      }
    };

  } catch (error) {
    console.error('Error getting profile:', error);
    return {
      profile: {
        id: userId,
        username: 'User',
        level: 1,
        xp: 0,
        xpToNext: 100,
        streak: 0,
        totalMessages: 0,
        achievements: 0
      }
    };
  }
}

async function updateProfile(userId, data) {
  if (!userId) {
    throw new ValidationError('userId is required');
  }

  try {
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      message: 'Profile updated successfully',
      profile: updated
    };

  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// ============================================================================
// SETTINGS HANDLERS
// ============================================================================

async function getSettings(userId) {
  if (!userId) {
    return {
      settings: {
        theme: 'dark',
        notifications: true,
        language: 'ru'
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      settings: data || {
        theme: 'dark',
        notifications: true,
        language: 'ru'
      }
    };

  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      settings: {
        theme: 'dark',
        notifications: true,
        language: 'ru'
      }
    };
  }
}

async function saveSettings(userId, settings) {
  if (!userId) {
    throw new ValidationError('userId is required');
  }

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      message: 'Settings saved successfully',
      settings: data
    };

  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// ============================================================================
// ADMIN HANDLERS
// ============================================================================

async function getPartners() {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      partners: data || []
    };

  } catch (error) {
    console.error('Error getting partners:', error);
    return {
      partners: []
    };
  }
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

async function logError(errorData, userId) {
  try {
    console.error('Frontend error:', errorData);

    // TODO: Save to database or send to monitoring service

    return {
      message: 'Error logged successfully'
    };

  } catch (error) {
    console.error('Error logging error:', error);
    return {
      message: 'Failed to log error'
    };
  }
}
