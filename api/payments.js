// ============================================
// PAYMENT: Temporarily disabled for free access
// Uncomment this file to restore payment functionality
// ============================================

/*
// API для платежей через Telegram Stars
const { db } = require('../lib/db-academy');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'create-invoice':
        return await createInvoice(req, res);
      case 'webhook':
        return await handleWebhook(req, res);
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: error.message });
  }
};

async function createInvoice(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { course_id, user_id } = req.body;

  if (!course_id || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Получить курс из БД
    const courseResult = await db.query('SELECT * FROM courses WHERE id = $1', [course_id]);
    
    if (!courseResult || courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const course = courseResult.rows[0];

    // Создать invoice для Telegram Stars
    const invoice = {
      title: course.title,
      description: course.description || `Курс: ${course.title}`,
      payload: JSON.stringify({ course_id, user_id, timestamp: Date.now() }),
      provider_token: '', // Пусто для Stars
      currency: 'XTR', // Telegram Stars
      prices: [{
        label: course.title,
        amount: Math.floor(course.price * 100) // В копейках Stars
      }]
    };

    return res.json({ 
      success: true,
      invoice,
      message: 'Invoice created. Use Telegram Bot API to send it to user.'
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
}

async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { update } = req.body;

  // Обработка pre_checkout_query
  if (update.pre_checkout_query) {
    // Подтвердить оплату через Bot API
    // В production это должно быть сделано через bot.answerPreCheckoutQuery()
    // Здесь мы просто возвращаем ok для webhook
    console.log('Pre-checkout query received:', update.pre_checkout_query.id);
    return res.json({ ok: true });
  }

  // Обработка successful_payment
  if (update.message && update.message.successful_payment) {
    const { invoice_payload, total_amount, telegram_payment_charge_id } = update.message.successful_payment;
    
    try {
      const { course_id, user_id } = JSON.parse(invoice_payload);

      // Создать покупку
      const purchase = await db.createPurchase({
        user_id,
        course_id,
        amount: total_amount / 100,
        currency: 'XTR',
        payment_method: 'telegram_stars',
        payment_id: telegram_payment_charge_id
      });

      // Завершить покупку (начислить комиссии)
      await db.completePurchase(purchase.id, telegram_payment_charge_id);

      console.log('Payment processed successfully:', purchase.id);
      return res.json({ ok: true, purchase_id: purchase.id });
    } catch (error) {
      console.error('Payment processing error:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  return res.status(400).json({ error: 'Unknown update type' });
}
*/

// Temporary handler for free access period
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.status(200).json({ 
    success: false,
    message: 'Payment system temporarily disabled. All courses are free.',
    free_access: true
  });
};
