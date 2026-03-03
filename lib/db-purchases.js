// Модуль для работы с покупками курсов
const { getSupabase, query } = require('./supabase-client');

// In-memory fallback для локальной разработки
const inMemoryPurchases = new Map();
const inMemoryTransactions = new Map();

/**
 * Создает запись о покупке курса
 */
async function createPurchase(data) {
  const {
    user_id,
    course_id,
    amount,
    currency,
    telegram_payment_charge_id,
    provider_payment_charge_id,
    referrer_id = null
  } = data;

  const purchase = {
    user_id,
    course_id,
    amount,
    currency,
    telegram_payment_charge_id,
    provider_payment_charge_id,
    referrer_id,
    status: 'completed',
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();

  if (supabase) {
    try {
      const result = await query('purchases', 'insert', {
        data: [purchase],
        select: true,
        single: true
      });
      
      console.log(`✅ Purchase saved to DB: User ${user_id}, Course ${course_id}`);
      return result;
    } catch (error) {
      console.error('❌ Create purchase error:', error);
      throw error;
    }
  } else {
    // Fallback: in-memory
    const id = `${user_id}_${course_id}_${Date.now()}`;
    purchase.id = id;
    inMemoryPurchases.set(id, purchase);
    console.log(`💾 Purchase saved in-memory: ${id}`);
    return purchase;
  }
}

/**
 * Проверяет, куплен ли курс пользователем
 */
async function checkPurchase(userId, courseId) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'completed')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Check purchase error:', error);
      return false;
    }
  } else {
    // Fallback: in-memory
    for (const [, purchase] of inMemoryPurchases) {
      if (purchase.user_id === userId && 
          purchase.course_id === courseId && 
          purchase.status === 'completed') {
        return true;
      }
    }
    return false;
  }
}

/**
 * Получает все покупки пользователя
 */
async function getUserPurchases(userId) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Get user purchases error:', error);
      return [];
    }
  } else {
    // Fallback: in-memory
    const purchases = [];
    for (const [, purchase] of inMemoryPurchases) {
      if (purchase.user_id === userId && purchase.status === 'completed') {
        purchases.push(purchase);
      }
    }
    return purchases.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

/**
 * Возвращает покупку (refund)
 */
async function refundPurchase(purchaseId, reason, adminId) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .update({
          status: 'refunded',
          refund_reason: reason,
          refunded_at: new Date().toISOString(),
          refunded_by: adminId
        })
        .eq('id', purchaseId)
        .select()
        .single();

      if (error) throw error;
      
      console.log(`💸 Purchase refunded: ${purchaseId}`);
      return data;
    } catch (error) {
      console.error('❌ Refund purchase error:', error);
      throw error;
    }
  } else {
    // Fallback: in-memory
    const purchase = inMemoryPurchases.get(purchaseId);
    if (purchase) {
      purchase.status = 'refunded';
      purchase.refund_reason = reason;
      purchase.refunded_at = new Date().toISOString();
      purchase.refunded_by = adminId;
      console.log(`💸 Purchase refunded (in-memory): ${purchaseId}`);
      return purchase;
    }
    throw new Error('Purchase not found');
  }
}

/**
 * Начисляет бонусы реферерам и партнерам
 */
async function processCommissions(userId, courseId, amount) {
  try {
    // Получить реферера пользователя
    const referrer = await getReferrer(userId);
    
    if (!referrer) {
      console.log(`ℹ️  No referrer for user ${userId}`);
      return { success: true, commissions: [] };
    }

    const commissions = [];

    // Комиссия реферера (20%)
    const referrerCommission = Math.floor(amount * 0.20);
    
    if (referrerCommission > 0) {
      const transaction = await createBonusTransaction({
        user_id: referrer.id,
        amount: referrerCommission,
        type: 'referral_commission',
        description: `Комиссия за покупку курса #${courseId}`,
        related_user_id: userId,
        related_course_id: courseId
      });

      commissions.push({
        user_id: referrer.id,
        amount: referrerCommission,
        type: 'referral',
        transaction_id: transaction.id
      });

      console.log(`💰 Referral commission: ${referrerCommission} to user ${referrer.id}`);
    }

    // TODO: Комиссия партнера курса (если есть)
    // const partner = await getCoursePartner(courseId);
    // if (partner) { ... }

    return { success: true, commissions };
  } catch (error) {
    console.error('❌ Process commissions error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Получает реферера пользователя
 */
async function getReferrer(userId) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('referrer_id')
        .eq('id', userId)
        .single();

      if (error || !data?.referrer_id) return null;

      const { data: referrer, error: refError } = await supabase
        .from('users')
        .select('id, first_name')
        .eq('id', data.referrer_id)
        .single();

      if (refError) return null;
      return referrer;
    } catch (error) {
      console.error('❌ Get referrer error:', error);
      return null;
    }
  }
  return null;
}

/**
 * Создает транзакцию бонусов
 */
async function createBonusTransaction(data) {
  const {
    user_id,
    amount,
    type,
    description,
    related_user_id = null,
    related_course_id = null
  } = data;

  const transaction = {
    user_id,
    amount,
    type,
    description,
    related_user_id,
    related_course_id,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      // Создать транзакцию
      const { data: result, error } = await supabase
        .from('bonus_transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;

      // Обновить баланс пользователя
      await supabase.rpc('update_bonus_balance', {
        p_user_id: user_id,
        p_amount: amount
      });

      console.log(`💰 Bonus transaction created: ${amount} for user ${user_id}`);
      return result;
    } catch (error) {
      console.error('❌ Create bonus transaction error:', error);
      throw error;
    }
  } else {
    // Fallback: in-memory
    const id = `tx_${Date.now()}_${user_id}`;
    transaction.id = id;
    inMemoryTransactions.set(id, transaction);
    console.log(`💾 Bonus transaction saved in-memory: ${id}`);
    return transaction;
  }
}

/**
 * Получает статистику покупок
 */
async function getPurchaseStats() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('status', 'completed');

      if (error) throw error;

      const stats = {
        total_purchases: data.length,
        total_revenue: data.reduce((sum, p) => sum + (p.amount || 0), 0),
        by_course: {},
        by_currency: {}
      };

      data.forEach(purchase => {
        // По курсам
        if (!stats.by_course[purchase.course_id]) {
          stats.by_course[purchase.course_id] = {
            count: 0,
            revenue: 0
          };
        }
        stats.by_course[purchase.course_id].count++;
        stats.by_course[purchase.course_id].revenue += purchase.amount || 0;

        // По валютам
        if (!stats.by_currency[purchase.currency]) {
          stats.by_currency[purchase.currency] = {
            count: 0,
            revenue: 0
          };
        }
        stats.by_currency[purchase.currency].count++;
        stats.by_currency[purchase.currency].revenue += purchase.amount || 0;
      });

      return stats;
    } catch (error) {
      console.error('❌ Get purchase stats error:', error);
      return null;
    }
  } else {
    // Fallback: in-memory
    const purchases = Array.from(inMemoryPurchases.values())
      .filter(p => p.status === 'completed');

    const stats = {
      total_purchases: purchases.length,
      total_revenue: purchases.reduce((sum, p) => sum + (p.amount || 0), 0),
      by_course: {},
      by_currency: {}
    };

    purchases.forEach(purchase => {
      if (!stats.by_course[purchase.course_id]) {
        stats.by_course[purchase.course_id] = { count: 0, revenue: 0 };
      }
      stats.by_course[purchase.course_id].count++;
      stats.by_course[purchase.course_id].revenue += purchase.amount || 0;

      if (!stats.by_currency[purchase.currency]) {
        stats.by_currency[purchase.currency] = { count: 0, revenue: 0 };
      }
      stats.by_currency[purchase.currency].count++;
      stats.by_currency[purchase.currency].revenue += purchase.amount || 0;
    });

    return stats;
  }
}

module.exports = {
  createPurchase,
  checkPurchase,
  getUserPurchases,
  refundPurchase,
  processCommissions,
  createBonusTransaction,
  getPurchaseStats
};
