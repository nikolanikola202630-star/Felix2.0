import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('../../lib/db.js', () => ({
  db: {
    getOrCreateUser: vi.fn().mockResolvedValue({ id: 123 }),
    saveMessage: vi.fn().mockResolvedValue({ id: 1 }),
    getUserSettings: vi.fn().mockResolvedValue({ ai_temperature: 0.7 }),
    getHistory: vi.fn().mockResolvedValue({ messages: [] })
  }
}));

global.fetch = vi.fn();

describe('Webhook Integration', () => {
  it('should handle /start command', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 1 } })
    });

    const handler = (await import('../../api/webhook/index.js')).default;

    const req = {
      method: 'POST',
      body: {
        message: {
          text: '/start',
          chat: { id: 123, type: 'private' },
          from: { id: 123, first_name: 'Test', username: 'test' }
        }
      }
    };

    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('sendMessage'),
      expect.any(Object)
    );
  });

  it('should handle GET health check', async () => {
    const handler = (await import('../../api/webhook/index.js')).default;

    const req = { method: 'GET' };
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        bot: expect.any(String)
      })
    );
  });

  it('should return 405 for unsupported methods', async () => {
    const handler = (await import('../../api/webhook/index.js')).default;

    const req = { method: 'PUT' };
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
