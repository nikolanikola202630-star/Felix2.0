// API endpoint для возврата платежа
const { refundStarPayment } = require('../../lib/payments/telegram-stars');
const { paymentLimiter } = require('../../lib/middleware/rate-limit');

// TODO: Заменить на реальную БД
const purchases = new Map();

// Список админов (должен быть в БД или env)
const ADMINS = [8264612178];

module.exports = async (req, res) => {
  paymentLimiter(req, res, async () => {
    try {
      const { purchase_id, reason, admin_id } = req.body;

      // Проверка прав админа
      if (!admin_id || !ADMINS.includes(parseInt(admin_id))) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin rights required.'
        });
      }

      // Валидация
      if (!purchase_id || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: purchase_id, reason'
        });
      }

      // Найти покупку
      const purchase = purchases.get(purchase_id);

      if (!purchase) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found'
        });
      }

      // Проверить статус
      if (purchase.status === 'refunded') {
        return res.status(400).json({
          success: false,
          error: 'Purchase already refunded'
        });
      }

      if (purchase.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot refund this purchase'
        });
      }

      // Выполнить возврат
      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
      
      await refundStarPayment(
        purchase.user_id,
        purchase.telegram_payment_charge_id,
        botToken
      );

      // Обновить статус
      purchase.status = 'refunded';
      purchase.refund_reason = reason;
      purchase.refunded_at = new Date();
      purchase.refunded_by = admin_id;

      console.log(`💸 Refund processed: ${purchase_id} by admin ${admin_id}`);

      // Отправить уведомление пользователю
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: purchase.user_id,
            text: `💸 <b>Возврат средств</b>\n\nВаш платеж за курс #${purchase.course_id} был возвращен.\n\nПричина: ${reason}`,
            parse_mode: 'HTML'
          })
        });
      } catch (error) {
        console.error('Notification error:', error);
      }

      return res.status(200).json({
        success: true,
        purchase: {
          id: purchase.id,
          status: purchase.status,
          refunded_at: purchase.refunded_at
        }
      });

    } catch (error) {
      console.error('❌ Refund error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });
};
