import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Groq SDK
const mockCreate = vi.fn();

vi.mock('groq-sdk', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: mockCreate
      }
    }
  }))
}));

// Import after mocking
const { ai } = await import('../../lib/ai.js');

describe('AI Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChatResponse', () => {
    it('should return AI response with metadata', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hi there!'
          }
        }],
        usage: {
          total_tokens: 50
        }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await ai.getChatResponse('Hello', [], {
        temperature: 0.7,
        model: 'llama-3.3-70b-versatile',
        language: 'ru'
      });

      expect(result.content).toBe('Hi there!');
      expect(result.tokens).toBe(50);
      expect(result.model).toBe('llama-3.3-70b-versatile');
      expect(result.latency).toBeGreaterThan(0);
    });

    it('should include conversation history', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 100 }
      });

      const history = [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ];

      await ai.getChatResponse('New message', history);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user', content: 'Previous message' }),
            expect.objectContaining({ role: 'assistant', content: 'Previous response' }),
            expect.objectContaining({ role: 'user', content: 'New message' })
          ])
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        ai.getChatResponse('Hello', [])
      ).rejects.toThrow('Ошибка при обработке запроса');
    });

    it('should use English system prompt for en language', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Hello!' } }],
        usage: { total_tokens: 20 }
      });

      await ai.getChatResponse('Hi', [], { language: 'en' });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('smart Telegram assistant')
            })
          ])
        })
      );
    });
  });

  describe('createSummary', () => {
    it('should create summary from messages', async () => {
      const messages = [
        { role: 'user', content: 'Message 1' },
        { role: 'assistant', content: 'Response 1' },
        { role: 'user', content: 'Message 2' },
        { role: 'assistant', content: 'Response 2' },
        { role: 'user', content: 'Message 3' }
      ];

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Summary of conversation' } }],
        usage: { total_tokens: 100 }
      });

      const result = await ai.createSummary(messages, 'medium');

      expect(result.summary).toBe('Summary of conversation');
      expect(result.tokens).toBe(100);
    });

    it('should throw error for insufficient messages', async () => {
      const messages = [
        { role: 'user', content: 'Only one' }
      ];

      await expect(
        ai.createSummary(messages)
      ).rejects.toThrow('Недостаточно сообщений');
    });

    it('should support different detail levels', async () => {
      const messages = Array(5).fill({ role: 'user', content: 'Test' });

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Brief summary' } }],
        usage: { total_tokens: 50 }
      });

      await ai.createSummary(messages, 'brief');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('краткое саммари')
            })
          ])
        })
      );
    });
  });

  describe('analyzeText', () => {
    it('should analyze text sentiment', async () => {
      const text = 'This is a great product! I love it! Amazing quality and service.';

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Positive sentiment, confidence: 0.95' } }],
        usage: { total_tokens: 80 }
      });

      const result = await ai.analyzeText(text, 'sentiment');

      expect(result.analysis).toContain('Positive');
      expect(result.tokens).toBe(80);
    });

    it('should throw error for short text', async () => {
      const text = 'Too short';

      await expect(
        ai.analyzeText(text)
      ).rejects.toThrow('Недостаточно текста');
    });

    it('should support different analysis types', async () => {
      const text = 'A long text with more than ten words for analysis purposes here.';

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Keywords: analysis, text, purposes' } }],
        usage: { total_tokens: 60 }
      });

      await ai.analyzeText(text, 'keywords');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('ключевых слов')
            })
          ])
        })
      );
    });
  });

  describe('generateContent', () => {
    it('should generate article', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Generated article content...' } }],
        usage: { total_tokens: 500 }
      });

      const result = await ai.generateContent('AI in healthcare', 'article', {
        length: 'medium',
        tone: 'professional'
      });

      expect(result.content).toContain('Generated article');
      expect(result.tokens).toBe(500);
    });

    it('should respect length parameter', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Short content' } }],
        usage: { total_tokens: 100 }
      });

      await ai.generateContent('Test', 'article', { length: 'short' });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 512
        })
      );
    });

    it('should support different content types', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Email content' } }],
        usage: { total_tokens: 200 }
      });

      await ai.generateContent('Meeting request', 'email');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('email')
            })
          ])
        })
      );
    });
  });

  describe('organizeText', () => {
    it('should organize unstructured text', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '# Organized\n\n- Point 1\n- Point 2' } }],
        usage: { total_tokens: 150 }
      });

      const result = await ai.organizeText('Unstructured text here');

      expect(result).toContain('Organized');
    });
  });
});
