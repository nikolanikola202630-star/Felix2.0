const { db } = require('../db');
const adminSystem = require('../admin/admin-system');

class SupportSystem {
  async sendUserMessage(userId, message) {
    const text = String(message || '').trim();
    if (!text) throw new Error('Message is required');

    const thread = await db.getOrCreateSupportThread(userId);
    const saved = await db.addSupportMessage(thread.id, userId, 'user', text);
    return { thread, message: saved };
  }

  async sendAdminReply(adminId, threadId, message) {
    if (!adminSystem.isAdmin(adminId)) {
      throw new Error('Unauthorized: Admin access required');
    }

    const text = String(message || '').trim();
    if (!text) throw new Error('Message is required');

    const thread = await db.getSupportThread(threadId);
    if (!thread) throw new Error('Thread not found');

    const saved = await db.addSupportMessage(threadId, adminId, 'admin', text);
    return { thread, message: saved };
  }

  async getUserConversation(userId) {
    const thread = await db.getOrCreateSupportThread(userId);
    const messages = await db.getSupportMessages(thread.id, 300);
    await db.markSupportMessagesRead(thread.id, 'user');
    return { thread, messages };
  }

  async getAdminInbox(adminId, status = null) {
    if (!adminSystem.isAdmin(adminId)) {
      throw new Error('Unauthorized: Admin access required');
    }
    return db.listSupportThreads(status, 300);
  }

  async getThreadMessages(requesterId, threadId) {
    const thread = await db.getSupportThread(threadId);
    if (!thread) throw new Error('Thread not found');

    const isAdmin = adminSystem.isAdmin(requesterId);
    if (!isAdmin && String(thread.user_id) !== String(requesterId)) {
      throw new Error('Forbidden');
    }

    const role = isAdmin ? 'admin' : 'user';
    const messages = await db.getSupportMessages(threadId, 300);
    await db.markSupportMessagesRead(threadId, role);
    return { thread, messages };
  }

  async setThreadStatus(adminId, threadId, status) {
    if (!adminSystem.isAdmin(adminId)) {
      throw new Error('Unauthorized: Admin access required');
    }

    const normalized = String(status || '').toLowerCase();
    if (!['open', 'closed'].includes(normalized)) {
      throw new Error('Invalid status');
    }

    const updated = await db.setSupportThreadStatus(threadId, normalized);
    if (!updated) throw new Error('Thread not found');
    return updated;
  }
}

module.exports = new SupportSystem();
