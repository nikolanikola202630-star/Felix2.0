import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pg pool
const mockQuery = vi.fn();
vi.mock('pg', () => ({
  Pool: vi.fn(() => ({
    query: mockQuery,
    connect: vi.fn(),
    end: vi.fn()
  }))
}));

describe('Database Operations', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  describe('getOrCreateUser', () => {
    it('should create new user if not exists', async () => {
      const mockUser = {
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        language: 'ru',
        created_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      // Динамический импорт после мока
      const { db } = await import('../../lib/db.js');
      
      const user = await db.getOrCreateUser({
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      });

      expect(user).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Connection failed'));

      const { db } = await import('../../lib/db.js');

      await expect(
        db.getOrCreateUser({ id: 123, username: 'test' })
      ).rejects.toThrow('Connection failed');
    });
  });

  describe('saveMessage', () => {
    it('should save message with metadata', async () => {
      const mockMessage = {
        id: 1,
        user_id: 123,
        role: 'user',
        content: 'Hello',
        message_type: 'text',
        metadata: { tokens: 10 }
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockMessage] }) // INSERT
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const { db } = await import('../../lib/db.js');

      const result = await db.saveMessage(123, 'user', 'Hello', 'text', { tokens: 10 });
      
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        total_messages: 100,
        text_messages: 80,
        voice_messages: 20,
        total_tokens: 5000,
        avg_response_time: 250
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockStats] });

      const { db } = await import('../../lib/db.js');

      const stats = await db.getUserStats(123, 'all');
      
      expect(stats.total_messages).toBe(100);
      expect(stats.by_type.text).toBe(80);
    });
  });
});
