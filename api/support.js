const supportSystem = require('../lib/support/support-system');

function readPayload(req) {
  if (req.method === 'GET') return req.query || {};
  return req.body || {};
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const payload = readPayload(req);
    const action = payload.action;

    if (req.method === 'GET') {
      if (action === 'myConversation') {
        const userId = payload.userId;
        if (!userId) return res.status(400).json({ success: false, error: 'userId required' });

        const conversation = await supportSystem.getUserConversation(userId);
        return res.status(200).json({ success: true, ...conversation });
      }

      if (action === 'adminInbox') {
        const userId = payload.userId;
        if (!userId) return res.status(400).json({ success: false, error: 'userId required' });

        const threads = await supportSystem.getAdminInbox(userId, payload.status || null);
        return res.status(200).json({ success: true, threads });
      }

      if (action === 'threadMessages') {
        const userId = payload.userId;
        const threadId = payload.threadId;
        if (!userId || !threadId) {
          return res.status(400).json({ success: false, error: 'userId and threadId required' });
        }

        const thread = await supportSystem.getThreadMessages(userId, threadId);
        return res.status(200).json({ success: true, ...thread });
      }

      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    if (req.method === 'POST') {
      if (action === 'sendUserMessage') {
        const { userId, message } = payload;
        if (!userId || !message) {
          return res.status(400).json({ success: false, error: 'userId and message required' });
        }

        const result = await supportSystem.sendUserMessage(userId, message);
        return res.status(200).json({ success: true, ...result });
      }

      if (action === 'sendAdminReply') {
        const { userId, threadId, message } = payload;
        if (!userId || !threadId || !message) {
          return res.status(400).json({ success: false, error: 'userId, threadId and message required' });
        }

        const result = await supportSystem.sendAdminReply(userId, threadId, message);
        return res.status(200).json({ success: true, ...result });
      }

      if (action === 'setThreadStatus') {
        const { userId, threadId, status } = payload;
        if (!userId || !threadId || !status) {
          return res.status(400).json({ success: false, error: 'userId, threadId and status required' });
        }

        const thread = await supportSystem.setThreadStatus(userId, threadId, status);
        return res.status(200).json({ success: true, thread });
      }

      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Support API error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};
