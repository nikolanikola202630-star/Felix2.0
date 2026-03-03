// API endpoint для создания invoice для оплаты курса
const { createInvoiceLink, rublesToStars } = require('../../lib/payments/telegram-stars');
const { paymentLimiter } = require('../../lib/middleware/rate-limit');
const { validate, purchaseSchema } = require('../../lib/middleware/validate');
const { sanitizeText } = require('../../lib/utils/sanitize');

// Загрузка курсов
const fs = require('fs');
const path = require('path');
const coursesPath = path.join(process.cwd(), 'data', 'courses-structure.json');
const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

module.exports = async (req, res) => {
  // Применить rate limiting
  paymentLimiter(req, res, async () => {
    try {
      const { course_id, user_id } = req.body;

      // Валидация
      if (!course_id || !user_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: course_id, user_id'
        });
      }

      // Найти курс
      const course = coursesData.courses.find(c => c.id === parseInt(course_id));

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Проверить цену
      if (course.price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'This course is free'
        });
      }

      // Конвертировать цену в Stars
      const priceInStars = rublesToStars(course.price);

      // Создать payload
      const payload = {
        type: 'course_purchase',
        course_id: course.id,
        user_id: user_id,
        timestamp: Date.now()
      };

      // Создать invoice
      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
      
      const invoiceLink = await createInvoiceLink({
        title: sanitizeText(course.title, { maxLength: 32 }),
        description: sanitizeText(course.description, { maxLength: 255 }),
        payload,
        currency: 'XTR',
        prices: [
          {
            label: sanitizeText(course.title, { maxLength: 32 }),
            amount: priceInStars
          }
        ],
        botToken
      });

      // Логирование
      console.log(`📝 Invoice created: Course ${course.id} for user ${user_id}, ${priceInStars} Stars`);

      return res.status(200).json({
        success: true,
        invoice_link: invoiceLink,
        course: {
          id: course.id,
          title: course.title,
          price_rub: course.price,
          price_stars: priceInStars
        }
      });

    } catch (error) {
      console.error('❌ Create invoice error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });
};
