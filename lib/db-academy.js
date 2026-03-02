// Академия: Расширение функций базы данных
// Дополнительные функции для работы с уроками, покупками и выплатами

const { Pool } = require('pg');

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
}

let pool = createPool();

module.exports = {
  // ============================================
  // УРОКИ (Lessons)
  // ============================================

  async getCourseWithLessons(courseId, userId = null) {
    const course = await pool.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    );

    if (!course.rows[0]) return null;

    const lessons = await pool.query(`
      SELECT 
        l.*,
        CASE 
          WHEN $2 IS NOT NULL THEN lp.completed
          ELSE false
        END as user_completed,
        CASE 
          WHEN $2 IS NOT NULL THEN lp.watch_time
          ELSE 0
        END as user_watch_time
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $2
      WHERE l.course_id = $1
      ORDER BY l.order_num ASC
    `, [courseId, userId]);

    return {
      ...course.rows[0],
      lessons: lessons.rows
    };
  },

  async getLesson(lessonId, userId = null) {
    const result = await pool.query(`
      SELECT 
        l.*,
        c.title as course_title,
        c.id as course_id,
        CASE 
          WHEN $2 IS NOT NULL THEN lp.completed
          ELSE false
        END as user_completed,
        CASE 
          WHEN $2 IS NOT NULL THEN lp.last_position
          ELSE 0
        END as user_last_position
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $2
      WHERE l.id = $1
    `, [lessonId, userId]);

    return result.rows[0] || null;
  },

  async updateLessonProgress(userId, lessonId, data) {
    const { completed, watch_time, last_position } = data;

    const result = await pool.query(`
      INSERT INTO lesson_progress (user_id, lesson_id, completed, watch_time, last_position, completed_at)
      VALUES ($1, $2, $3, $4, $5, CASE WHEN $3 = true THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, lesson_id) DO UPDATE
      SET 
        completed = COALESCE($3, lesson_progress.completed),
        watch_time = COALESCE($4, lesson_progress.watch_time),
        last_position = COALESCE($5, lesson_progress.last_position),
        completed_at = CASE WHEN $3 = true AND lesson_progress.completed = false THEN NOW() ELSE lesson_progress.completed_at END,
        updated_at = NOW()
      RETURNING *
    `, [userId, lessonId, completed, watch_time, last_position]);

    // Обновить прогресс курса
    const lesson = await pool.query('SELECT course_id FROM lessons WHERE id = $1', [lessonId]);
    if (lesson.rows[0]) {
      await this.updateCourseProgress(userId, lesson.rows[0].course_id);
    }

    return result.rows[0];
  },

  async updateCourseProgress(userId, courseId) {
    // Подсчитать процент завершения курса
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_lessons,
        COUNT(CASE WHEN lp.completed = true THEN 1 END) as completed_lessons
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $1
      WHERE l.course_id = $2
    `, [userId, courseId]);

    const { total_lessons, completed_lessons } = stats.rows[0];
    const progress = total_lessons > 0 ? Math.floor((completed_lessons / total_lessons) * 100) : 0;

    await pool.query(`
      INSERT INTO user_progress (user_id, course_id, progress, lessons_completed)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, course_id) DO UPDATE
      SET 
        progress = $3,
        lessons_completed = $4,
        completed_at = CASE WHEN $3 = 100 THEN NOW() ELSE NULL END,
        updated_at = NOW()
    `, [userId, courseId, progress, completed_lessons]);

    return { progress, completed_lessons, total_lessons };
  },

  // ============================================
  // ПОКУПКИ (Purchases)
  // ============================================

  async createPurchase(data) {
    const {
      user_id,
      course_id,
      amount,
      currency = 'RUB',
      payment_method,
      payment_id = null,
      referrer_partner_id = null,
      referrer_user_id = null
    } = data;

    // Проверить, не куплен ли уже курс
    const existing = await pool.query(
      'SELECT * FROM purchases WHERE user_id = $1 AND course_id = $2',
      [user_id, course_id]
    );

    if (existing.rows[0]) {
      throw new Error('Course already purchased');
    }

    // Рассчитать комиссии
    const partner_commission = referrer_partner_id ? amount * 0.2 : 0; // 20%
    const user_bonus = referrer_user_id ? amount * 0.1 : 0; // 10%

    const result = await pool.query(`
      INSERT INTO purchases (
        user_id, course_id, amount, currency, payment_method, payment_id,
        referrer_partner_id, referrer_user_id, partner_commission, user_bonus,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING *
    `, [
      user_id, course_id, amount, currency, payment_method, payment_id,
      referrer_partner_id, referrer_user_id, partner_commission, user_bonus
    ]);

    return result.rows[0];
  },

  async completePurchase(purchaseId, telegram_payment_charge_id = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Обновить статус покупки
      const purchase = await client.query(`
        UPDATE purchases
        SET status = 'completed', completed_at = NOW(), telegram_payment_charge_id = $2
        WHERE id = $1
        RETURNING *
      `, [purchaseId, telegram_payment_charge_id]);

      const p = purchase.rows[0];

      // Начислить комиссию партнеру
      if (p.referrer_partner_id && p.partner_commission > 0) {
        await client.query(`
          UPDATE partner_accounts
          SET balance = balance + $1, updated_at = NOW()
          WHERE user_id = $2
        `, [p.partner_commission, p.referrer_partner_id]);
      }

      // Начислить бонусы пользователю-рефереру
      if (p.referrer_user_id && p.user_bonus > 0) {
        await client.query(`
          UPDATE users
          SET bonus_balance = bonus_balance + $1
          WHERE id = $2
        `, [p.user_bonus, p.referrer_user_id]);

        // Записать транзакцию бонусов
        const newBalance = await client.query(
          'SELECT bonus_balance FROM users WHERE id = $1',
          [p.referrer_user_id]
        );

        await client.query(`
          INSERT INTO bonus_transactions (user_id, amount, type, description, related_purchase_id, balance_after)
          VALUES ($1, $2, 'earned_referral', $3, $4, $5)
        `, [
          p.referrer_user_id,
          p.user_bonus,
          `Бонус за приглашение пользователя ${p.user_id}`,
          p.id,
          newBalance.rows[0].bonus_balance
        ]);
      }

      await client.query('COMMIT');
      return p;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getUserPurchases(userId) {
    const result = await pool.query(`
      SELECT 
        p.*,
        c.title as course_title,
        c.image_url as course_image
      FROM purchases p
      JOIN courses c ON p.course_id = c.id
      WHERE p.user_id = $1 AND p.status = 'completed'
      ORDER BY p.completed_at DESC
    `, [userId]);

    return result.rows;
  },

  async hasPurchased(userId, courseId) {
    const result = await pool.query(
      'SELECT id FROM purchases WHERE user_id = $1 AND course_id = $2 AND status = \'completed\'',
      [userId, courseId]
    );

    return result.rows.length > 0;
  },

  // ============================================
  // ВЫПЛАТЫ ПАРТНЕРАМ (Partner Payouts)
  // ============================================

  async requestPayout(partnerId, amount, method, details) {
    // Проверить баланс
    const partner = await pool.query(
      'SELECT balance FROM partner_accounts WHERE user_id = $1',
      [partnerId]
    );

    if (!partner.rows[0] || partner.rows[0].balance < amount) {
      throw new Error('Insufficient balance');
    }

    if (amount < 1000) {
      throw new Error('Minimum payout amount is 1000');
    }

    const result = await pool.query(`
      INSERT INTO partner_payouts (partner_id, amount, method, details, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `, [partnerId, amount, method, JSON.stringify(details)]);

    return result.rows[0];
  },

  async getPartnerPayouts(partnerId, status = null) {
    let query = 'SELECT * FROM partner_payouts WHERE partner_id = $1';
    const params = [partnerId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY requested_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async approvePayout(payoutId, adminId, transactionId = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Обновить статус выплаты
      const payout = await client.query(`
        UPDATE partner_payouts
        SET status = 'completed', processed_at = NOW(), processed_by = $2, transaction_id = $3
        WHERE id = $1
        RETURNING *
      `, [payoutId, adminId, transactionId]);

      const p = payout.rows[0];

      // Списать с баланса партнера
      await client.query(`
        UPDATE partner_accounts
        SET balance = balance - $1, updated_at = NOW()
        WHERE user_id = $2
      `, [p.amount, p.partner_id]);

      await client.query('COMMIT');
      return p;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async rejectPayout(payoutId, adminId, reason) {
    const result = await pool.query(`
      UPDATE partner_payouts
      SET status = 'rejected', processed_at = NOW(), processed_by = $2, rejection_reason = $3
      WHERE id = $1
      RETURNING *
    `, [payoutId, adminId, reason]);

    return result.rows[0];
  },

  // ============================================
  // СТАТИСТИКА ПАРТНЕРОВ
  // ============================================

  async getPartnerStats(partnerId) {
    const stats = await pool.query(`
      SELECT
        COUNT(DISTINCT rc.id) as total_clicks,
        COUNT(DISTINCT u.id) as registrations,
        COUNT(DISTINCT p.id) as purchases,
        COALESCE(SUM(p.partner_commission), 0) as total_earned,
        COALESCE(SUM(CASE 
          WHEN p.completed_at >= NOW() - INTERVAL '30 days' 
          THEN p.partner_commission 
          ELSE 0 
        END), 0) as month_earned
      FROM partner_accounts pa
      LEFT JOIN referral_clicks rc ON rc.partner_user_id = pa.user_id
      LEFT JOIN users u ON u.referrer_partner_id = pa.user_id
      LEFT JOIN purchases p ON p.referrer_partner_id = pa.user_id AND p.status = 'completed'
      WHERE pa.user_id = $1
    `, [partnerId]);

    const partner = await pool.query(
      'SELECT balance, referral_code FROM partner_accounts WHERE user_id = $1',
      [partnerId]
    );

    return {
      ...stats.rows[0],
      balance: partner.rows[0]?.balance || 0,
      referral_link: `https://t.me/AcademyBot?start=ref_${partner.rows[0]?.referral_code || partnerId}`
    };
  },

  // ============================================
  // БОНУСЫ
  // ============================================

  async getUserBonusBalance(userId) {
    const result = await pool.query(
      'SELECT bonus_balance FROM users WHERE id = $1',
      [userId]
    );

    return result.rows[0]?.bonus_balance || 0;
  },

  async spendBonus(userId, amount, purchaseId, description) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Проверить баланс
      const user = await client.query(
        'SELECT bonus_balance FROM users WHERE id = $1',
        [userId]
      );

      if (!user.rows[0] || user.rows[0].bonus_balance < amount) {
        throw new Error('Insufficient bonus balance');
      }

      // Списать бонусы
      await client.query(`
        UPDATE users
        SET bonus_balance = bonus_balance - $1
        WHERE id = $2
      `, [amount, userId]);

      // Записать транзакцию
      const newBalance = user.rows[0].bonus_balance - amount;

      await client.query(`
        INSERT INTO bonus_transactions (user_id, amount, type, description, related_purchase_id, balance_after)
        VALUES ($1, $2, 'spent_purchase', $3, $4, $5)
      `, [userId, -amount, description, purchaseId, newBalance]);

      await client.query('COMMIT');
      return newBalance;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // ============================================
  // АДМИНКА
  // ============================================

  async getAllPayouts(status = null, limit = 100) {
    let query = `
      SELECT 
        pp.*,
        pa.referral_code,
        u.first_name,
        u.username
      FROM partner_payouts pp
      JOIN partner_accounts pa ON pp.partner_id = pa.user_id
      JOIN users u ON pa.user_id = u.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE pp.status = $1';
      params.push(status);
    }

    query += ' ORDER BY pp.requested_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getAcademyStats() {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM courses WHERE is_active = true) as active_courses,
        (SELECT COUNT(*) FROM purchases WHERE status = 'completed') as total_purchases,
        (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM partner_accounts WHERE is_active = true) as active_partners,
        (SELECT COALESCE(SUM(balance), 0) FROM partner_accounts) as partners_balance
    `);

    return stats.rows[0];
  },

  // Закрытие пула
  async close() {
    await pool.end();
  }
};
