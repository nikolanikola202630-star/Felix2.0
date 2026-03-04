// Grok AI Client - интеграция с xAI API
const fetch = require('node-fetch');

const GROK_API_BASE = 'https://api.x.ai/v1';
const GROK_API_KEY = process.env.XAI_API_KEY;

class GrokClient {
  constructor(apiKey = GROK_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = GROK_API_BASE;
  }

  // Создать чат completion
  async chat(messages, options = {}) {
    const {
      model = 'grok-2-1212',
      temperature = 0.7,
      maxTokens = 2000,
      tools = null,
      stream = false
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          tools,
          stream
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Grok API error');
      }

      const data = await response.json();
      
      return {
        success: true,
        content: data.choices[0]?.message?.content || '',
        toolCalls: data.choices[0]?.message?.tool_calls || [],
        usage: data.usage
      };
    } catch (error) {
      console.error('Grok chat error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Создать эмбеддинг
  async createEmbedding(text) {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-embedding',
          input: text
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Grok embedding error');
      }

      const data = await response.json();
      
      return {
        success: true,
        embedding: data.data[0].embedding
      };
    } catch (error) {
      console.error('Grok embedding error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Голосовой агент (Voice Agent API)
  async voiceChat(audioBuffer, options = {}) {
    const {
      systemPrompt = 'Ты полезный ассистент.',
      history = [],
      tools = null,
      language = 'ru',
      voice = 'alloy'
    } = options;

    try {
      // Формируем сообщения с системным промптом и историей
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history
      ];

      // Отправляем аудио в Voice Agent
      const formData = new FormData();
      formData.append('audio', audioBuffer);
      formData.append('model', 'grok-voice');
      formData.append('messages', JSON.stringify(messages));
      formData.append('language', language);
      formData.append('voice', voice);
      
      if (tools) {
        formData.append('tools', JSON.stringify(tools));
      }

      const response = await fetch(`${this.baseUrl}/audio/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Grok voice error');
      }

      const data = await response.json();
      
      return {
        success: true,
        transcript: data.transcript, // что сказал пользователь
        text: data.response.text, // текстовый ответ AI
        audio: data.response.audio, // аудио ответ (base64)
        toolCalls: data.response.tool_calls || [],
        usage: data.usage
      };
    } catch (error) {
      console.error('Grok voice chat error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Live Search (поиск актуальной информации)
  async liveSearch(query, options = {}) {
    const {
      maxResults = 5,
      language = 'ru'
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          max_results: maxResults,
          language
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Grok search error');
      }

      const data = await response.json();
      
      return {
        success: true,
        results: data.results || []
      };
    } catch (error) {
      console.error('Grok live search error:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  // Транскрибация аудио (STT)
  async transcribe(audioBuffer, options = {}) {
    const {
      language = 'ru',
      prompt = ''
    } = options;

    try {
      const formData = new FormData();
      formData.append('file', audioBuffer);
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      
      if (prompt) {
        formData.append('prompt', prompt);
      }

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Grok transcription error');
      }

      const data = await response.json();
      
      return {
        success: true,
        text: data.text
      };
    } catch (error) {
      console.error('Grok transcribe error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Text-to-Speech
  async textToSpeech(text, options = {}) {
    const {
      voice = 'alloy',
      speed = 1.0
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/audio/speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice,
          speed
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Grok TTS error');
      }

      const audioBuffer = await response.buffer();
      
      return {
        success: true,
        audio: audioBuffer
      };
    } catch (error) {
      console.error('Grok TTS error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Проверка баланса и использования
  async getUsage() {
    try {
      const response = await fetch(`${this.baseUrl}/usage`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get usage');
      }

      const data = await response.json();
      
      return {
        success: true,
        usage: data
      };
    } catch (error) {
      console.error('Get usage error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Singleton instance
let grokInstance = null;

function getGrokClient() {
  if (!grokInstance) {
    grokInstance = new GrokClient();
  }
  return grokInstance;
}

module.exports = {
  GrokClient,
  getGrokClient
};
