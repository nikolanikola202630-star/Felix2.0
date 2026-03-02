import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../../lib/db.js';

describe('Database Operations', () => {
  const mockQuery = vi.fn();
  const mockClientQuery = vi.fn();
  const mockRelease = vi.fn();
  const mockConnect = vi.fn();

  beforeEach(() => {
    mockQuery.mockReset();
    mockClientQuery.mockReset();
    mockRelease.mockReset();
    mockConnect.mockReset();

    mockConnect.mockResolvedValue({
      query: mockClientQuery,
      release: mockRelease
    });

    db.__setPool({
      query: mockQuery,
      connect: mockConnect
    });
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

      const user = await db.getOrCreateUser({
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      });

      expect(user).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Connection failed'));

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

      mockClientQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockMessage] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await db.saveMessage(123, 'user', 'Hello', 'text', { tokens: 10 });

      expect(result).toEqual(mockMessage);
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockQuery.mockImplementation(async (sql) => {
        const query = String(sql);

        if (query.includes('FROM users u')) {
          return {
            rows: [
              {
                id: 123,
                level: 2,
                xp: 300,
                messages_count: 100,
                ai_requests: 20,
                courses_completed: 1,
                achievements_count: 2
              }
            ]
          };
        }

        if (query.includes('COUNT(*) as total_messages')) {
          return {
            rows: [
              {
                total_messages: 100,
                text_messages: 80,
                voice_messages: 20,
                image_messages: 0,
                document_messages: 0,
                total_tokens: 5000,
                avg_response_time: 250
              }
            ]
          };
        }

        if (query.includes("content LIKE '/organize%'")) {
          return { rows: [{ organize: 1, summary: 2, analyze: 3, generate: 4 }] };
        }

        return { rows: [] };
      });

      const stats = await db.getUserStats(123, 'all');

      expect(stats.total_messages).toBe(100);
      expect(stats.by_type.text).toBe(80);
      expect(stats.level).toBe(2);
      expect(stats.ai_requests).toBe(20);
    });
  });
});
