import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const ai = {
  // Get AI response with conversation history
  async getChatResponse(userMessage, history = []) {
    const messages = [
      {
        role: 'system',
        content: `Ты Felix - умный ассистент для Telegram. 
Отвечай кратко, по делу, на русском языке.
Будь дружелюбным и полезным.
Если не знаешь ответа - так и скажи.`
      }
    ];

    // Add conversation history
    history.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      const completion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1
      });

      return completion.choices[0]?.message?.content || 'Не могу ответить';
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Ошибка при обработке запроса');
    }
  },

  // Transcribe voice message
  async transcribeVoice(audioBuffer) {
    try {
      // Create a File object from buffer
      const file = new File([audioBuffer], 'voice.ogg', { type: 'audio/ogg' });
      
      const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3',
        language: 'ru'
      });

      return transcription.text;
    } catch (error) {
      console.error('Whisper API error:', error);
      throw new Error('Ошибка при транскрибации');
    }
  },

  // Create summary
  async createSummary(messages) {
    const text = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Создай краткое саммари следующих сообщений на русском языке. Выдели ключевые моменты.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 512
    });

    return completion.choices[0]?.message?.content;
  }
};
