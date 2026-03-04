// ============================================
// PAYMENT: Temporarily disabled for free access
// Uncomment to restore payment webhooks
// ============================================

module.exports = async (req, res) => {
  return res.status(200).json({ 
    success: true,
    message: 'Payment webhooks disabled during free access period.',
    free_access: true
  });
};

/* PAYMENT: Original webhook code - uncomment to restore
// Webhook для обработки платежей от Telegram
const {
  verifyTelegramPaymentWebhook,
  answerPreCheckoutQuery,
  processSuccessfulPayment
} = require('../../lib/payments/telegram-stars');
const { webhookLimiter } = require('../../lib/middleware/rate-limit');
const {
  createPurchase,
  processCommissions
} = require('../../lib/db-purchases');

/**
 * Отправляет уведомление о покупке
 */
async function sendPurchaseNotification(userId, courseId) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
  
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userId,
        text: `✅ <b>Оплата успешна!</b>\n\nКурс #${courseId} теперь доступен.\nОткройте Академию для начала обучения! 🎓`,
        parse_mode: 'HTML'
      })
    });
    
    console.log(`📧 Notification sent to user ${userId}`);
  } catch (error) {
    console.error('Send notification error:', error);
  }
}

module.exports = async (req, res) => {
  webhookLimiter(req, res, async () => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
      
      // Проверить подпись (в production обязательно!)
      // if (!verifyTelegramPaymentWebhook(req, botToken)) {
      //   return res.status(403).json({ error: 'Invalid signature' });
      // }

      const update = req.body;

      // Обработка pre-checkout query
      if (update.pre_checkout_query) {
        const query = update.pre_checkout_query;
        
        console.log(`🔍 Pre-checkout query from user ${query.from.id}`);
        
        // Проверить доступность курса, баланс и т.д.
        // В данном случае всегда подтверждаем
        
        await answerPreCheckoutQuery(
          query.id,
          true,
          '',
          botToken
        );
        
        return res.status(200).json({ success: true });
      }

      // Обработка успешного платежа
      if (update.message?.successful_payment) {
        const payment = update.message.successful_payment;
        
        console.log(`💳 Successful payment from user ${update.message.from.id}`);
        
        // Обработать данные платежа
        const paymentData = processSuccessfulPayment(payment);
        const { userId, amount, currency, telegramPaymentChargeId, providerPaymentChargeId, payload } = paymentData;
        
        const { course_id, user_id } = payload;

        try {
          // Сохранить покупку в БД
          const purchase = await createPurchase({
            user_id,
            course_id,
            amount,
            currency,
            telegram_payment_charge_id: telegramPaymentChargeId,
            provider_payment_charge_id: providerPaymentChargeId
          });

          console.log(`✅ Purchase saved: ${purchase.id || 'in-memory'}`);

          // Начислить комиссии партнерам и реферерам
          const commissionsResult = await processCommissions(user_id, course_id, amount);
          
          if (commissionsResult.success) {
            console.log(`💰 Commissions processed: ${commissionsResult.commissions?.length || 0} transactions`);
          } else {
            console.error(`⚠️  Commission processing failed: ${commissionsResult.error}`);
          }

          // Отправить уведомление
          await sendPurchaseNotification(user_id, course_id);

          return res.status(200).json({ success: true });
        } catch (error) {
          console.error('❌ Purchase processing error:', error);
          // Все равно вернуть success, чтобы Telegram не повторял webhook
          return res.status(200).json({ success: true, error: error.message });
        }
      }

      // Другие типы обновлений
      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('❌ Payment webhook error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
};
*/
