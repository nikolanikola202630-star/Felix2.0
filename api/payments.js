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

  // TODO: Получить курс из БД
  // const course = await db.query('SELECT * FROM courses WHERE id = $1', [course_id]);
  
  // Тестовые данные
  const course = {
    id: course_id,
    title: 'Основы трейдинга',
    description: 'Полный курс по трейдингу',
    price: 2990
  };

  // Создать invoice для Telegram Stars
  const invoice = {
    title: course.title,
    description: course.description,
    payload: JSON.stringify({ course_id, user_id }),
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
}

async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { update } = req.body;

  // Обработка pre_checkout_query
  if (update.pre_checkout_query) {
    // TODO: Подтвердить оплату через Bot API
    return res.json({ ok: true });
  }

  // Обработка successful_payment
  if (update.message && update.message.successful_payment) {
    const { invoice_payload, total_amount, telegram_payment_charge_id } = update.message.successful_payment;
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

    return res.json({ ok: true, purchase_id: purchase.id });
  }

  return res.status(400).json({ error: 'Unknown update type' });
}
