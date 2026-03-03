// AI Chat Folders API
// EGOIST ECOSYSTEM Edition
// Система папок для AI чатов как в DeepSeek

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
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // Get all folders
    if (pathname === '/api/ai-chat-folders' && req.method === 'GET') {
      return await getFolders(req, res, userId);
    }

    // Create folder
    if (pathname === '/api/ai-chat-folders' && req.method === 'POST') {
      return await createFolder(req, res, userId);
    }

    // Update folder
    if (pathname.match(/\/api\/ai-chat-folders\/\d+$/) && req.method === 'PUT') {
      const folderId = pathname.split('/').pop();
      return await updateFolder(req, res, userId, folderId);
    }

    // Delete folder
    if (pathname.match(/\/api\/ai-chat-folders\/\d+$/) && req.method === 'DELETE') {
      const folderId = pathname.split('/').pop();
      return await deleteFolder(req, res, userId, folderId);
    }

    // Get chats
    if (pathname === '/api/ai-chat-folders/chats' && req.method === 'GET') {
      const folderId = url.searchParams.get('folderId');
      return await getChats(req, res, userId, folderId);
    }

    // Create chat
    if (pathname === '/api/ai-chat-folders/chats' && req.method === 'POST') {
      return await createChat(req, res, userId);
    }

    // Update chat
    if (pathname.match(/\/api\/ai-chat-folders\/chats\/\d+$/) && req.method === 'PUT') {
      const chatId = pathname.split('/').pop();
      return await updateChat(req, res, userId, chatId);
    }

    // Delete chat
    if (pathname.match(/\/api\/ai-chat-folders\/chats\/\d+$/) && req.method === 'DELETE') {
      const chatId = pathname.split('/').pop();
      return await deleteChat(req, res, userId, chatId);
    }

    // Get messages
    if (pathname.match(/\/api\/ai-chat-folders\/chats\/\d+\/messages$/) && req.method === 'GET') {
      const chatId = pathname.split('/')[4];
      return await getMessages(req, res, userId, chatId);
    }

    // Send message
    if (pathname.match(/\/api\/ai-chat-folders\/chats\/\d+\/messages$/) && req.method === 'POST') {
      const chatId = pathname.split('/')[4];
      return await sendMessage(req, res, userId, chatId);
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('AI Chat Folders API error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get folders
async function getFolders(req, res, userId) {
  try {
    const result = await db.query(
      `SELECT f.*, 
        COUNT(DISTINCT c.id) as chat_count
       FROM ai_chat_folders f
       LEFT JOIN ai_chats c ON c.folder_id = f.id AND c.is_archived = false
       WHERE f.user_id = $1
       GROUP BY f.id
       ORDER BY f.order_index ASC, f.created_at ASC`,
      [userId]
    );

    // Если нет папок, создать дефолтные
    if (result.rows.length === 0) {
      await createDefaultFolders(userId);
      return await getFolders(req, res, userId);
    }

    return res.json({ success: true, folders: result.rows });
  } catch (error) {
    console.error('Get folders error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Create default folders
async function createDefaultFolders(userId) {
  const defaultFolders = [
    { name: 'Общие', icon: '💬', color: '#3B82F6', order_index: 0 },
    { name: 'Работа', icon: '💼', color: '#10B981', order_index: 1 },
    { name: 'Учеба', icon: '📚', color: '#8B5CF6', order_index: 2 },
    { name: 'Личное', icon: '🏠', color: '#F59E0B', order_index: 3 }
  ];

  for (const folder of defaultFolders) {
    await db.query(
      `INSERT INTO ai_chat_folders (user_id, name, icon, color, order_index)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, folder.name, folder.icon, folder.color, folder.order_index]
    );
  }
}

// Create folder
async function createFolder(req, res, userId) {
  try {
    const { name, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name required' });
    }

    const result = await db.query(
      `INSERT INTO ai_chat_folders (user_id, name, icon, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, icon || '📁', color || '#3B82F6']
    );

    return res.json({ success: true, folder: result.rows[0] });
  } catch (error) {
    console.error('Create folder error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Update folder
async function updateFolder(req, res, userId, folderId) {
  try {
    const { name, icon, color, order_index } = req.body;

    const updates = [];
    const params = [userId, folderId];
    let paramCount = 2;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }
    if (icon !== undefined) {
      paramCount++;
      updates.push(`icon = $${paramCount}`);
      params.push(icon);
    }
    if (color !== undefined) {
      paramCount++;
      updates.push(`color = $${paramCount}`);
      params.push(color);
    }
    if (order_index !== undefined) {
      paramCount++;
      updates.push(`order_index = $${paramCount}`);
      params.push(order_index);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const result = await db.query(
      `UPDATE ai_chat_folders
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE user_id = $1 AND id = $2
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    return res.json({ success: true, folder: result.rows[0] });
  } catch (error) {
    console.error('Update folder error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Delete folder
async function deleteFolder(req, res, userId, folderId) {
  try {
    // Переместить чаты в "Общие" (первую папку)
    await db.query(
      `UPDATE ai_chats
       SET folder_id = (
         SELECT id FROM ai_chat_folders
         WHERE user_id = $1
         ORDER BY order_index ASC
         LIMIT 1
       )
       WHERE folder_id = $2 AND user_id = $1`,
      [userId, folderId]
    );

    // Удалить папку
    await db.query(
      `DELETE FROM ai_chat_folders
       WHERE id = $1 AND user_id = $2`,
      [folderId, userId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete folder error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get chats
async function getChats(req, res, userId, folderId) {
  try {
    let query, params;

    if (folderId) {
      query = `
        SELECT * FROM ai_chats
        WHERE user_id = $1 AND folder_id = $2 AND is_archived = false
        ORDER BY is_pinned DESC, last_message_at DESC NULLS LAST, created_at DESC
      `;
      params = [userId, folderId];
    } else {
      query = `
        SELECT * FROM ai_chats
        WHERE user_id = $1 AND is_archived = false
        ORDER BY is_pinned DESC, last_message_at DESC NULLS LAST, created_at DESC
      `;
      params = [userId];
    }

    const result = await db.query(query, params);

    return res.json({ success: true, chats: result.rows });
  } catch (error) {
    console.error('Get chats error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Create chat
async function createChat(req, res, userId) {
  try {
    const { folder_id, title, model, system_prompt } = req.body;

    const result = await db.query(
      `INSERT INTO ai_chats (user_id, folder_id, title, model, system_prompt)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, folder_id || null, title || 'Новый чат', model || 'llama-3.3-70b', system_prompt || null]
    );

    return res.json({ success: true, chat: result.rows[0] });
  } catch (error) {
    console.error('Create chat error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Update chat
async function updateChat(req, res, userId, chatId) {
  try {
    const { title, folder_id, is_pinned, is_archived } = req.body;

    const updates = [];
    const params = [userId, chatId];
    let paramCount = 2;

    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      params.push(title);
    }
    if (folder_id !== undefined) {
      paramCount++;
      updates.push(`folder_id = $${paramCount}`);
      params.push(folder_id);
    }
    if (is_pinned !== undefined) {
      paramCount++;
      updates.push(`is_pinned = $${paramCount}`);
      params.push(is_pinned);
    }
    if (is_archived !== undefined) {
      paramCount++;
      updates.push(`is_archived = $${paramCount}`);
      params.push(is_archived);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const result = await db.query(
      `UPDATE ai_chats
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE user_id = $1 AND id = $2
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    return res.json({ success: true, chat: result.rows[0] });
  } catch (error) {
    console.error('Update chat error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Delete chat
async function deleteChat(req, res, userId, chatId) {
  try {
    await db.query(
      `DELETE FROM ai_chats
       WHERE id = $1 AND user_id = $2`,
      [chatId, userId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get messages
async function getMessages(req, res, userId, chatId) {
  try {
    // Проверка доступа
    const chatCheck = await db.query(
      `SELECT id FROM ai_chats WHERE id = $1 AND user_id = $2`,
      [chatId, userId]
    );

    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const result = await db.query(
      `SELECT * FROM ai_chat_messages
       WHERE chat_id = $1
       ORDER BY created_at ASC`,
      [chatId]
    );

    return res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Send message
async function sendMessage(req, res, userId, chatId) {
  try {
    const { content, role } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content required' });
    }

    // Проверка доступа
    const chatCheck = await db.query(
      `SELECT * FROM ai_chats WHERE id = $1 AND user_id = $2`,
      [chatId, userId]
    );

    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatCheck.rows[0];

    // Сохранить сообщение пользователя
    await db.query(
      `INSERT INTO ai_chat_messages (chat_id, role, content)
       VALUES ($1, $2, $3)`,
      [chatId, role || 'user', content]
    );

    // Получить историю для контекста
    const history = await db.query(
      `SELECT role, content FROM ai_chat_messages
       WHERE chat_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [chatId]
    );

    // Отправить в AI (здесь должна быть интеграция с вашим AI API)
    const aiResponse = await callAI(content, history.rows.reverse(), chat);

    // Сохранить ответ AI
    const result = await db.query(
      `INSERT INTO ai_chat_messages (chat_id, role, content, tokens_used, model)
       VALUES ($1, 'assistant', $2, $3, $4)
       RETURNING *`,
      [chatId, aiResponse.content, aiResponse.tokens || 0, chat.model]
    );

    return res.json({ 
      success: true, 
      message: result.rows[0],
      response: aiResponse.content
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Call AI (заглушка - нужна интеграция с вашим AI)
async function callAI(message, history, chat) {
  // Здесь должна быть интеграция с вашим AI API
  // Пока возвращаем заглушку
  return {
    content: `Ответ AI на: "${message}"`,
    tokens: 50
  };
}
