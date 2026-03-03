// Валидация входных данных с использованием Joi
const Joi = require('joi');

// Middleware для валидации
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Показать все ошибки
      stripUnknown: true // Удалить неизвестные поля
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }

    // Заменить body на валидированные данные
    req.body = value;
    next();
  };
};

// Схемы валидации

// Пользователь
const userSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).optional(),
  username: Joi.string().alphanum().min(3).max(50).optional(),
  language_code: Joi.string().length(2).optional()
});

// Курс
const courseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  price: Joi.number().min(0).max(100000).required(),
  category: Joi.string().valid('psychology', 'self-development', 'business', 'it', 'trading').required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all').required(),
  duration_hours: Joi.number().min(1).max(1000).required(),
  instructor: Joi.object({
    name: Joi.string().required(),
    title: Joi.string().required(),
    avatar: Joi.string().required()
  }).required()
});

// Урок
const lessonSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  theme_id: Joi.number().integer().positive().required(),
  title: Joi.string().min(3).max(200).required(),
  duration: Joi.number().min(1).max(300).required(),
  is_free: Joi.boolean().required(),
  video_url: Joi.string().uri().required(),
  description: Joi.string().max(1000).optional()
});

// Покупка
const purchaseSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  course_id: Joi.number().integer().positive().required(),
  amount: Joi.number().min(0).required(),
  currency: Joi.string().valid('XTR', 'RUB', 'USD').required()
});

// AI запрос
const aiRequestSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  message: Joi.string().min(1).max(2000).required(),
  context: Joi.array().items(Joi.object({
    role: Joi.string().valid('user', 'assistant', 'system').required(),
    content: Joi.string().required()
  })).max(10).optional()
});

// Партнерский чат
const chatMessageSchema = Joi.object({
  partner_id: Joi.number().integer().positive().required(),
  student_id: Joi.number().integer().positive().required(),
  message: Joi.string().min(1).max(4000).required()
});

// Прогресс урока
const progressSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  lesson_id: Joi.number().integer().positive().required(),
  progress_percent: Joi.number().min(0).max(100).required(),
  completed: Joi.boolean().required()
});

module.exports = {
  validate,
  userSchema,
  courseSchema,
  lessonSchema,
  purchaseSchema,
  aiRequestSchema,
  chatMessageSchema,
  progressSchema
};
