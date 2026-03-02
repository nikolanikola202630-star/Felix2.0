import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock pg module
const mockQuery = vi.fn();
const mockConnect = vi.fn();
const mockRelease = vi.fn();
const mockEnd = vi.fn();

vi.mock('pg', () => ({
  Pool: vi.fn(() => ({
    query: mockQuery,
    connect: vi.fn(() => ({
      query: mockQuery,
      release: mockRelease
    })),
    end: mockEnd
  }))
}));

// Import after mocking
const { db } = await import('../../lib/db.js');

describe('Database Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrCreateUser', () => {
    it('should create new user', async () => {
      const mockUser = {
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        language: 'ru'
      };

      mockQuery.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const telegramUser = {
        id: 123,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        language_code: 'ru'
      };

      const result = await db.getOrCreateUser(telegramUser);

      expect(result).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([123, 'testuser', 'Test', 'User', 'ru'])
      );
    });

    it('should handle English language code', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 456, language: 'en' }]
      });

      const result = await db.getOrCreateUser({
        id: 456,
        username: 'test',
        first_name: 'Test',
        language_code: 'en'
      });

      expect(result.language).toBe('en');
    });
  });

  describe('saveMessage', () => {
    it('should save message with metadata', async () => {
      const mockMessage = {
        id: 1,
        user_id: 123,
        role: 'user',
        content: 'Test message',
        message_type: 'text',
        metadata: { tokens: 10 }
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockMessage] });

      const result = await db.saveMessage(
        123,
        'user',
        'Test message',
        'text',
        { tokens: 10 }
      );

      expect(result).toEqual(mockMessage);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO messages'),
        expect.arrayContaining([123, 'user', 'Test message', 'text'])
      );
    });

    it('should handle transaction rollback on error', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        db.saveMessage(123, 'user', 'Test', 'text', {})
      ).rejects.toThrow('DB Error');
    });
  });

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      const mockMessages = [
        { id: 1, content: 'Message 1', tags: [] },
        { id: 2, content: 'Message 2', tags: [] }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockMessages })
        .mockResolvedValueOnce({ rows: [{ count: '10' }] });

      const result = await db.getHistory(123, { limit: 10, offset: 0 });

      expect(result.messages).toEqual(mockMessages);
      expect(result.total).toBe(10);
      expect(result.has_more).toBe(false);
    });

    it('should filter by message type', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      await db.getHistory(123, { type: 'voice' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('message_type'),
        expect.arrayContaining([123, 'voice'])
      );
    });
  });

  describe('getUserStats', () => {
    it('should calculate stats correctly', async () => {
      const mockStats = {
        total_messages: '100',
        text_messages: '80',
        voice_messages: '10',
        image_messages: '5',
        document_messages: '5',
        total_tokens: '5000',
        avg_response_time: '1500'
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockStats] })
        .mockResolvedValueOnce({ rows: [{ organize: '10', summary: '5' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await db.getUserStats(123, 'all');

      expect(result.by_type.text).toBe(80);
      expect(result.total_tokens).toBe(5000);
      expect(result.avg_response_time).toBe(1500);
    });
  });

  describe('getUserSettings', () => {
    it('should return existing settings', async () => {
      const mockSettings = {
        user_id: 123,
        ai_temperature: 0.7,
        ai_model: 'llama-3.3-70b-versatile',
        theme: 'dark'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockSettings] });

      const result = await db.getUserSettings(123);

      expect(result).toEqual(mockSettings);
    });

    it('should create default settings if not exist', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ user_id: 123 }] });

      const result = await db.getUserSettings(123);

      expect(result.user_id).toBe(123);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchMessages', () => {
    it('should search with full-text', async () => {
      const mockResults = [
        { id: 1, content: 'Test message', relevance: 0.9 }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockResults });

      const result = await db.searchMessages(123, 'test');

      expect(result.results).toEqual(mockResults);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('to_tsvector'),
        expect.arrayContaining([123, 'test'])
      );
    });
  });
});
