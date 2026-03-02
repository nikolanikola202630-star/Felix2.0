import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('AI Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChatResponse', () => {
    it('should return AI response with context', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Привет! Как дела?'
          }
        }],
        usage: {
          total_tokens: 150
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Динамический импорт
      const { ai } = await import('../../lib/ai.js');

      const result = await ai.getChatResponse(
        'Привет',
        [],
        { temperature: 0.7, model: 'llama-3.3-70b-versatile' }
      );

      expect(result.content).toBe('Привет! Как дела?');
      expect(result.tokens).toBe(150);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      const { ai } = await import('../../lib/ai.js');

      const result = await ai.getChatResponse('test', []);
      
      expect(result.content).toContain('Ошибка');
    });

    it('should include conversation history', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 100 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { ai } = await import('../../lib/ai.js');

      const history = [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ];

      await ai.getChatResponse('New message', history);

      const callArgs = global.fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      
      expect(body.messages.length).toBeGreaterThan(2); // system + history + new
    });
  });

  describe('createSummary', () => {
    it('should create brief summary', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Summary text' } }],
        usage: { total_tokens: 50 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { ai } = await import('../../lib/ai.js');

      const result = await ai.createSummary('Long text...', 'brief');
      
      expect(result.content).toBe('Summary text');
    });
  });
});
