// Groq Voice Services: STT, LLM, TTS
const Groq = require('groq-sdk');
const FormData = require('form-data');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Speech-to-Text using Groq Whisper
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} language - Language code (ru, en, etc.)
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
async function speechToText(audioBuffer, language = 'ru') {
  try {
    // Create a File-like object from buffer
    const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
    
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
      language: language,
      response_format: 'json'
    });

    return {
      success: true,
      text: transcription.text
    };
  } catch (error) {
    console.error('STT error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate AI response using Groq LLM
 * @param {string} userMessage - User's message
 * @param {string} systemPrompt - System prompt for context
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
async function generateResponse(userMessage, systemPrompt = null, conversationHistory = []) {
  try {
    const messages = [];
    
    // Add system prompt
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      messages.push({
        role: 'system',
        content: 'Ты дружелюбный голосовой помощник Felix Academy. Отвечай кратко и по делу, максимум 2-3 предложения. Будь полезным и поддерживающим.'
      });
    }
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-6)); // Last 3 exchanges
    }
    
    // Add current message
    messages.push({ role: 'user', content: userMessage });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile', // Fast and high-quality
      temperature: 0.7,
      max_tokens: 300 // Keep responses concise for voice
    });

    return {
      success: true,
      text: completion.choices[0]?.message?.content || 'Извини, не смог сформулировать ответ.'
    };
  } catch (error) {
    console.error('LLM error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Text-to-Speech using Groq Play
 * @param {string} text - Text to synthesize
 * @param {string} voice - Voice name (Jarvis, Erin, Ethan, etc.)
 * @param {number} speed - Speech speed (0.5 - 2.0)
 * @returns {Promise<{success: boolean, audio?: Buffer, error?: string}>}
 */
async function textToSpeech(text, voice = 'Jarvis', speed = 1.0) {
  try {
    const response = await groq.audio.speech.create({
      model: 'play',
      input: text,
      voice: voice,
      response_format: 'mp3',
      speed: speed
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      success: true,
      audio: buffer
    };
  } catch (error) {
    console.error('TTS error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Complete voice assistant pipeline: STT -> LLM -> TTS
 * @param {Buffer} audioBuffer - Input audio
 * @param {Object} options - Configuration options
 * @returns {Promise<{success: boolean, transcription?: string, response?: string, audio?: Buffer, error?: string}>}
 */
async function processVoiceMessage(audioBuffer, options = {}) {
  const {
    language = 'ru',
    systemPrompt = null,
    conversationHistory = [],
    voice = 'Jarvis',
    speed = 1.0
  } = options;

  try {
    // Step 1: Speech to Text
    const sttResult = await speechToText(audioBuffer, language);
    if (!sttResult.success) {
      return { success: false, error: 'Ошибка распознавания речи: ' + sttResult.error };
    }

    const userText = sttResult.text;
    console.log('User said:', userText);

    // Step 2: Generate AI Response
    const llmResult = await generateResponse(userText, systemPrompt, conversationHistory);
    if (!llmResult.success) {
      return { 
        success: false, 
        transcription: userText,
        error: 'Ошибка генерации ответа: ' + llmResult.error 
      };
    }

    const responseText = llmResult.text;
    console.log('Assistant:', responseText);

    // Step 3: Text to Speech
    const ttsResult = await textToSpeech(responseText, voice, speed);
    if (!ttsResult.success) {
      return {
        success: false,
        transcription: userText,
        response: responseText,
        error: 'Ошибка озвучивания: ' + ttsResult.error
      };
    }

    return {
      success: true,
      transcription: userText,
      response: responseText,
      audio: ttsResult.audio
    };
  } catch (error) {
    console.error('Voice processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  speechToText,
  generateResponse,
  textToSpeech,
  processVoiceMessage
};
