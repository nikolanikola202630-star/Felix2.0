// Felix Academy - Community API
// EGOIST ECOSYSTEM Edition
// Course discussions and community features

const { db } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Get discussions by course
    if (pathname === '/api/community/discussions' && req.method === 'GET') {
      const courseId = url.searchParams.get('course_id');
      const category = url.searchParams.get('category') || 'all';
      const limit = parseInt(url.searchParams.get('limit') || '20');

      let query = `
        SELECT 
          d.*,
          u.first_name as author_name,
          u.username as author_username,
          COUNT(DISTINCT dc.id) as comments_count,
          COUNT(DISTINCT dl.user_id) as likes_count
        FROM discussions d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN discussion_comments dc ON d.id = dc.discussion_id
        LEFT JOIN discussion_likes dl ON d.id = dl.discussion_id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (courseId && courseId !== 'all') {
        paramCount++;
        query += ` AND d.course_id = $${paramCount}`;
        params.push(courseId);
      }

      if (category !== 'all') {
        paramCount++;
        query += ` AND d.category = $${paramCount}`;
        params.push(category);
      }

      query += `
        GROUP BY d.id, u.first_name, u.username
        ORDER BY d.created_at DESC
        LIMIT $${paramCount + 1}
      `;
      params.push(limit);

      const result = await db.query(query, params);

      return res.json({
        success: true,
        discussions: result.rows
      });
    }

    // Create discussion
    if (pathname === '/api/community/discussions' && req.method === 'POST') {
      const { user_id, course_id, category, title, content } = req.body;

      if (!user_id || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await db.query(
        `INSERT INTO discussions (user_id, course_id, category, title, content)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user_id, course_id || null, category || 'general', title, content]
      );

      return res.json({
        success: true,
        discussion: result.rows[0]
      });
    }

    // Get comments for discussion
    if (pathname.startsWith('/api/community/discussions/') && pathname.endsWith('/comments') && req.method === 'GET') {
      const discussionId = pathname.split('/')[4];
      
      const result = await db.query(
        `SELECT 
          dc.*,
          u.first_name as author_name,
          u.username as author_username
         FROM discussion_comments dc
         LEFT JOIN users u ON dc.user_id = u.id
         WHERE dc.discussion_id = $1
         ORDER BY dc.created_at ASC`,
        [discussionId]
      );

      return res.json({
        success: true,
        comments: result.rows
      });
    }

    // Add comment
    if (pathname.startsWith('/api/community/discussions/') && pathname.endsWith('/comments') && req.method === 'POST') {
      const discussionId = pathname.split('/')[4];
      const { user_id, content } = req.body;

      if (!user_id || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await db.query(
        `INSERT INTO discussion_comments (discussion_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [discussionId, user_id, content]
      );

      return res.json({
        success: true,
        comment: result.rows[0]
      });
    }

    // Toggle like
    if (pathname.startsWith('/api/community/discussions/') && pathname.endsWith('/like') && req.method === 'POST') {
      const discussionId = pathname.split('/')[4];
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id required' });
      }

      // Check if already liked
      const existing = await db.query(
        `SELECT * FROM discussion_likes WHERE discussion_id = $1 AND user_id = $2`,
        [discussionId, user_id]
      );

      if (existing.rows.length > 0) {
        // Unlike
        await db.query(
          `DELETE FROM discussion_likes WHERE discussion_id = $1 AND user_id = $2`,
          [discussionId, user_id]
        );
        return res.json({ success: true, liked: false });
      } else {
        // Like
        await db.query(
          `INSERT INTO discussion_likes (discussion_id, user_id) VALUES ($1, $2)`,
          [discussionId, user_id]
        );
        return res.json({ success: true, liked: true });
      }
    }

    // Get community stats
    if (pathname === '/api/community/stats' && req.method === 'GET') {
      const [membersResult, discussionsResult, activeResult] = await Promise.all([
        db.query('SELECT COUNT(*) as count FROM users'),
        db.query('SELECT COUNT(*) as count FROM discussions'),
        db.query(`SELECT COUNT(DISTINCT user_id) as count FROM messages WHERE created_at > NOW() - INTERVAL '1 hour'`)
      ]);

      return res.json({
        success: true,
        stats: {
          members: parseInt(membersResult.rows[0].count),
          discussions: parseInt(discussionsResult.rows[0].count),
          active: parseInt(activeResult.rows[0].count)
        }
      });
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('Community API error:', error);
    return res.status(500).json({ error: error.message });
  }
};
