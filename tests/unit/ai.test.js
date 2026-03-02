import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ai } from '../../lib/ai.js';

const createMockClient = (impl) => ({
  chat: {
    completions: {
      create: impl
    }
  }
});

describe('AI Module', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    ai.__resetClient();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.AI_RATE_LIMIT_PER_MINUTE;
    consoleErrorSpy.mockRestore();
  });

  describe('getChatResponse', () => {
    it('returns AI response with context', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Привет! Как дела?' } }],
        usage: { total_tokens: 150 }
      });

      ai.__setClient(createMockClient(mockCreate));

      const result = await ai.getChatResponse('Привет', [], {
        temperature: 0.7,
        model: 'llama-3.3-70b-versatile'
      });

      expect(result.content).toBe('Привет! Как дела?');
      expect(result.tokens).toBe(150);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate.mock.calls[0][0].messages[0].role).toBe('system');
    });

    it('handles API errors', async () => {
      ai.__setClient(createMockClient(vi.fn().mockRejectedValue(new Error('API Error'))));

      const result = await ai.getChatResponse('test', []);
      expect(typeof result.content).toBe('string');
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.error).toBe(true);
    });

    it('includes conversation history', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 100 }
      });

      ai.__setClient(createMockClient(mockCreate));

      const history = [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ];

      await ai.getChatResponse('New message', history);

      const payload = mockCreate.mock.calls[0][0];
      expect(payload.messages.length).toBeGreaterThan(2);
    });

    it('applies per-user rate limiting', async () => {
      process.env.AI_RATE_LIMIT_PER_MINUTE = '2';

      ai.__setClient(
        createMockClient(
          vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'ok' } }],
            usage: { total_tokens: 1 }
          })
        )
      );

      const first = await ai.getChatResponse('1', [], { userId: 1001 });
      const second = await ai.getChatResponse('2', [], { userId: 1001 });
      const third = await ai.getChatResponse('3', [], { userId: 1001 });

      expect(first.error).toBeFalsy();
      expect(second.error).toBeFalsy();
      expect(third.error).toBe(true);
      expect(third.rateLimited).toBe(true);
    });
  });

  describe('createSummary', () => {
    it('creates brief summary', async () => {
      ai.__setClient(
        createMockClient(
          vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Summary text' } }],
            usage: { total_tokens: 50 }
          })
        )
      );

      const result = await ai.createSummary('Long text...', 'brief');

      expect(result.content).toBe('Summary text');
      expect(result.tokens).toBe(50);
    });
  });
});
