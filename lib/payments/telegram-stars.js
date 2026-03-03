// Интеграция с Telegram Stars для приема платежей
const crypto = require('crypto');

const TELEGRAM_API = 'https://api.telegram.org/bot';

/**
 * Создает invoice link для оплаты через Telegram Stars
 * @param {object} params - Параметры invoice
 * @returns {Promise<string>} - URL для оплаты
 */
async function createInvoiceLink(params) {
  const {
    title,
    description,
    payload,
    currency = 'XTR', // Telegram Stars
    prices,
    botToken
  } = params;

  try {
    const response = await fetch(`${TELEGRAM_API}${botToken}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        payload: JSON.stringify(payload),
        provider_token: '', // Пусто для Telegram Stars
        currency,
        prices: prices.map(p => ({
          label: p.label,
          amount: p.amount
        }))
      })
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to create invoice');
    }

    return data.result;
  } catch (error) {
    console.error('Create invoice error:', error);
    throw error;
  }
}

/**
 * Отправляет invoice пользователю
 * @param {object} params - Параметры invoice
 * @returns {Promise<object>} - Результат отправки
 */
async function sendInvoice(params) {
  const {
    chatId,
    title,
    description,
    payload,
    currency = 'XTR',
    prices,
    botToken
  } = params;

  try {
    const response = await fetch(`${TELEGRAM_API}${botToken}/sendInvoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        title,
        description,
        payload: JSON.stringify(payload),
        provider_token: '',
        currency,
        prices: prices.map(p => ({
          label: p.label,
          amount: p.amount
        }))
      })
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send invoice');
    }

    return data.result;
  } catch (error) {
    console.error('Send invoice error:', error);
    throw error;
  }
}

/**
 * Подтверждает pre-checkout query
 * @param {string} preCheckoutQueryId - ID pre-checkout query
 * @param {boolean} ok - Подтвердить или отклонить
 * @param {string} errorMessage - Сообщение об ошибке (если ok=false)
 * @param {string} botToken - Токен бота
 * @returns {Promise<boolean>} - Результат
 */
async function answerPreCheckoutQuery(preCheckoutQueryId, ok = true, errorMessage = '', botToken) {
  try {
    const response = await fetch(`${TELEGRAM_API}${botToken}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query_id: preCheckoutQueryId,
        ok,
        error_message: ok ? undefined : errorMessage
      })
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Answer pre-checkout error:', error);
    return false;
  }
}

/**
 * Возвращает платеж (refund)
 * @param {number} userId - ID пользователя
 * @param {string} telegramPaymentChargeId - ID платежа от Telegram
 * @param {string} botToken - Токен бота
 * @returns {Promise<boolean>} - Результат возврата
 */
async function refundStarPayment(userId, telegramPaymentChargeId, botToken) {
  try {
    const response = await fetch(`${TELEGRAM_API}${botToken}/refundStarPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        telegram_payment_charge_id: telegramPaymentChargeId
      })
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to refund payment');
    }

    return true;
  } catch (error) {
    console.error('Refund payment error:', error);
    throw error;
  }
}

/**
 * Проверяет подпись webhook от Telegram
 * @param {object} req - Express request
 * @param {string} botToken - Токен бота
 * @returns {boolean} - true если подпись валидна
 */
function verifyTelegramPaymentWebhook(req, botToken) {
  try {
    const secretToken = req.headers['x-telegram-bot-api-secret-token'];
    
    if (!secretToken) {
      return false;
    }
    
    // Создать hash от токена бота
    const secret = crypto.createHash('sha256').update(botToken).digest();
    
    // Проверить подпись
    const checkString = JSON.stringify(req.body);
    const hash = crypto
      .createHmac('sha256', secret)
      .update(checkString)
      .digest('hex');
    
    return hash === secretToken;
  } catch (error) {
    console.error('Verify webhook error:', error);
    return false;
  }
}

/**
 * Обрабатывает успешный платеж
 * @param {object} payment - Данные платежа
 * @returns {object} - Обработанные данные
 */
function processSuccessfulPayment(payment) {
  try {
    const payload = JSON.parse(payment.invoice_payload);
    
    return {
      userId: payment.from?.id,
      amount: payment.total_amount,
      currency: payment.currency,
      telegramPaymentChargeId: payment.telegram_payment_charge_id,
      providerPaymentChargeId: payment.provider_payment_charge_id,
      payload,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Process payment error:', error);
    throw error;
  }
}

/**
 * Конвертирует рубли в Telegram Stars
 * @param {number} rubles - Сумма в рублях
 * @returns {number} - Сумма в Stars
 */
function rublesToStars(rubles) {
  // 1 Star ≈ 2 рубля (примерный курс, может меняться)
  return Math.ceil(rubles / 2);
}

/**
 * Конвертирует Stars в рубли
 * @param {number} stars - Сумма в Stars
 * @returns {number} - Сумма в рублях
 */
function starsToRubles(stars) {
  return stars * 2;
}

module.exports = {
  createInvoiceLink,
  sendInvoice,
  answerPreCheckoutQuery,
  refundStarPayment,
  verifyTelegramPaymentWebhook,
  processSuccessfulPayment,
  rublesToStars,
  starsToRubles
};
