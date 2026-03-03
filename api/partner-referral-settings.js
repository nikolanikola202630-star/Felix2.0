// Partner Referral Bot Settings API
// EGOIST ECOSYSTEM Edition
// Allows partners to customize their referral bot

const { db } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const partnerUserId = url.searchParams.get('partner_user_id');

    if (!partnerUserId) {
      return res.status(400).json({ error: 'partner_user_id required' });
    }

    // Get settings
    if (pathname === '/api/partner-referral-settings' && req.method === 'GET') {
      return await getSettings(req, res, partnerUserId);
    }

    // Update settings
    if (pathname === '/api/partner-referral-settings' && req.method === 'POST') {
      return await updateSettings(req, res, partnerUserId);
    }

    // Get quiz questions
    if (pathname === '/api/partner-referral-settings/quiz' && req.method === 'GET') {
      return await getQuizQuestions(req, res, partnerUserId);
    }

    // Add quiz question
    if (pathname === '/api/partner-referral-settings/quiz' && req.method === 'POST') {
      return await addQuizQuestion(req, res, partnerUserId);
    }

    // Delete quiz question
    if (pathname.startsWith('/api/partner-referral-settings/quiz/') && req.method === 'DELETE') {
      const questionId = pathname.split('/').pop();
      return await deleteQuizQuestion(req, res, partnerUserId, questionId);
    }

    // Get form fields
    if (pathname === '/api/partner-referral-settings/form' && req.method === 'GET') {
      return await getFormFields(req, res, partnerUserId);
    }

    // Add form field
    if (pathname === '/api/partner-referral-settings/form' && req.method === 'POST') {
      return await addFormField(req, res, partnerUserId);
    }

    // Delete form field
    if (pathname.startsWith('/api/partner-referral-settings/form/') && req.method === 'DELETE') {
      const fieldId = pathname.split('/').pop();
      return await deleteFormField(req, res, partnerUserId, fieldId);
    }

    // Get access log
    if (pathname === '/api/partner-referral-settings/access-log' && req.method === 'GET') {
      return await getAccessLog(req, res, partnerUserId);
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('Partner referral settings API error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get partner settings
async function getSettings(req, res, partnerUserId) {
  try {
    const result = await db.query(
      `SELECT * FROM partner_referral_settings WHERE partner_user_id = $1`,
      [partnerUserId]
    );

    if (result.rows.length === 0) {
      // Create default settings
      const createResult = await db.query(
        `INSERT INTO partner_referral_settings (partner_user_id)
         VALUES ($1)
         RETURNING *`,
        [partnerUserId]
      );
      return res.json({ success: true, settings: createResult.rows[0] });
    }

    return res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Update partner settings
async function updateSettings(req, res, partnerUserId) {
  try {
    const {
      welcome_message,
      bot_name,
      bot_avatar_emoji,
      access_conditions,
      primary_color,
      secondary_color,
      logo_url,
      custom_buttons,
      auto_messages,
      max_referrals_per_day,
      require_phone,
      require_username,
      min_account_age_days,
      track_utm_params,
      custom_utm_source
    } = req.body;

    const updates = [];
    const params = [partnerUserId];
    let paramCount = 1;

    if (welcome_message !== undefined) {
      paramCount++;
      updates.push(`welcome_message = $${paramCount}`);
      params.push(welcome_message);
    }
    if (bot_name !== undefined) {
      paramCount++;
      updates.push(`bot_name = $${paramCount}`);
      params.push(bot_name);
    }
    if (bot_avatar_emoji !== undefined) {
      paramCount++;
      updates.push(`bot_avatar_emoji = $${paramCount}`);
      params.push(bot_avatar_emoji);
    }
    if (access_conditions !== undefined) {
      paramCount++;
      updates.push(`access_conditions = $${paramCount}`);
      params.push(JSON.stringify(access_conditions));
    }
    if (primary_color !== undefined) {
      paramCount++;
      updates.push(`primary_color = $${paramCount}`);
      params.push(primary_color);
    }
    if (secondary_color !== undefined) {
      paramCount++;
      updates.push(`secondary_color = $${paramCount}`);
      params.push(secondary_color);
    }
    if (logo_url !== undefined) {
      paramCount++;
      updates.push(`logo_url = $${paramCount}`);
      params.push(logo_url);
    }
    if (custom_buttons !== undefined) {
      paramCount++;
      updates.push(`custom_buttons = $${paramCount}`);
      params.push(JSON.stringify(custom_buttons));
    }
    if (auto_messages !== undefined) {
      paramCount++;
      updates.push(`auto_messages = $${paramCount}`);
      params.push(JSON.stringify(auto_messages));
    }
    if (max_referrals_per_day !== undefined) {
      paramCount++;
      updates.push(`max_referrals_per_day = $${paramCount}`);
      params.push(max_referrals_per_day);
    }
    if (require_phone !== undefined) {
      paramCount++;
      updates.push(`require_phone = $${paramCount}`);
      params.push(require_phone);
    }
    if (require_username !== undefined) {
      paramCount++;
      updates.push(`require_username = $${paramCount}`);
      params.push(require_username);
    }
    if (min_account_age_days !== undefined) {
      paramCount++;
      updates.push(`min_account_age_days = $${paramCount}`);
      params.push(min_account_age_days);
    }
    if (track_utm_params !== undefined) {
      paramCount++;
      updates.push(`track_utm_params = $${paramCount}`);
      params.push(track_utm_params);
    }
    if (custom_utm_source !== undefined) {
      paramCount++;
      updates.push(`custom_utm_source = $${paramCount}`);
      params.push(custom_utm_source);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const query = `
      UPDATE partner_referral_settings
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE partner_user_id = $1
      RETURNING *
    `;

    const result = await db.query(query, params);

    return res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get quiz questions
async function getQuizQuestions(req, res, partnerUserId) {
  try {
    const result = await db.query(
      `SELECT * FROM partner_quiz_questions 
       WHERE partner_user_id = $1 
       ORDER BY order_index ASC`,
      [partnerUserId]
    );

    return res.json({ success: true, questions: result.rows });
  } catch (error) {
    console.error('Get quiz questions error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Add quiz question
async function addQuizQuestion(req, res, partnerUserId) {
  try {
    const { question, options, correct_answer, order_index } = req.body;

    if (!question || !options || correct_answer === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(
      `INSERT INTO partner_quiz_questions 
       (partner_user_id, question, options, correct_answer, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [partnerUserId, question, JSON.stringify(options), correct_answer, order_index || 0]
    );

    return res.json({ success: true, question: result.rows[0] });
  } catch (error) {
    console.error('Add quiz question error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Delete quiz question
async function deleteQuizQuestion(req, res, partnerUserId, questionId) {
  try {
    await db.query(
      `DELETE FROM partner_quiz_questions 
       WHERE id = $1 AND partner_user_id = $2`,
      [questionId, partnerUserId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete quiz question error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get form fields
async function getFormFields(req, res, partnerUserId) {
  try {
    const result = await db.query(
      `SELECT * FROM partner_form_fields 
       WHERE partner_user_id = $1 
       ORDER BY order_index ASC`,
      [partnerUserId]
    );

    return res.json({ success: true, fields: result.rows });
  } catch (error) {
    console.error('Get form fields error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Add form field
async function addFormField(req, res, partnerUserId) {
  try {
    const { field_name, field_type, field_label, field_options, is_required, order_index } = req.body;

    if (!field_name || !field_type || !field_label) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(
      `INSERT INTO partner_form_fields 
       (partner_user_id, field_name, field_type, field_label, field_options, is_required, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        partnerUserId,
        field_name,
        field_type,
        field_label,
        field_options ? JSON.stringify(field_options) : null,
        is_required !== undefined ? is_required : true,
        order_index || 0
      ]
    );

    return res.json({ success: true, field: result.rows[0] });
  } catch (error) {
    console.error('Add form field error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Delete form field
async function deleteFormField(req, res, partnerUserId, fieldId) {
  try {
    await db.query(
      `DELETE FROM partner_form_fields 
       WHERE id = $1 AND partner_user_id = $2`,
      [fieldId, partnerUserId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete form field error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get access log
async function getAccessLog(req, res, partnerUserId) {
  try {
    const limit = parseInt(req.query.limit || '100');

    const result = await db.query(
      `SELECT 
        pal.*,
        u.first_name,
        u.username
       FROM partner_access_log pal
       LEFT JOIN users u ON pal.referred_user_id = u.id
       WHERE pal.partner_user_id = $1
       ORDER BY pal.created_at DESC
       LIMIT $2`,
      [partnerUserId, limit]
    );

    return res.json({ success: true, log: result.rows });
  } catch (error) {
    console.error('Get access log error:', error);
    return res.status(500).json({ error: error.message });
  }
}
