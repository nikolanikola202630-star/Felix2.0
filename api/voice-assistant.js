// Voice Assistant API - Full STT -> LLM -> TTS Pipeline
const { processVoiceMessage, speechToText, generateResponse, textToSpeech } = require('../lib/voice/groq-services');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

module.exports = async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse multipart form data
  return new Promise((resolve) => {
    upload.single('audio')(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        res.status(400).json({ error: 'Upload failed' });
        return resolve();
      }

      try {
        const userId = req.headers['x-user-id'] || req.body.userId;
        if (!userId) {
          res.status(401).json({ error: 'User ID required' });
          return resolve();
        }

        const action = req.body.action || 'process';

        switch (action) {
          case 'process':
            await handleProcessVoice(req, res, userId);
            break;
          
          case 'stt':
            await handleSTT(req, res);
            break;
          
          case 'llm':
            await handleLLM(req, res);
            break;
          
          case 'tts':
            await handleTTS(req, res);
            break;
          
          default:
            res.status(400).json({ error: 'Invalid action' });
        }

        resolve();
      } catch (error) {
        console.error('Voice assistant error:', error);
        res.status(500).json({ error: 'Internal error' });
        resolve();
      }
    });
  });
};

// Full pipeline: STT -> LLM -> TTS
async function handleProcessVoice(req, res, userId) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file' });
    }

    const audioBuffer = req.file.buffer;
    const language = req.body.language || 'ru';
    const voice = req.body.voice || 'Jarvis';
    const speed = parseFloat(req.body.speed) || 1.0;
    
    // Parse conversation history if provided
    let conversationHistory = [];
    if (req.body.history) {
      try {
        conversationHistory = JSON.parse(req.body.history);
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }

    // System prompt for Felix Academy context
    const systemPrompt = `Ты голосовой помощник Felix Academy - образовательной платформы для изучения программирования и технологий.

Твои задачи:
- Помогать студентам с вопросами по курсам
- Объяснять сложные концепции простым языком
- Мотивировать и поддерживать в обучении
- Отвечать кратко и по делу (2-3 предложения максимум)

Будь дружелюбным, профессиональным и полезным.`;

    // Process voice message
    const result = await processVoiceMessage(audioBuffer, {
      language,
      systemPrompt,
      conversationHistory,
      voice,
      speed
    });

    if (!result.success) {
      return res.status(400).json({ 
        error: result.error,
        transcription: result.transcription,
        response: result.response
      });
    }

    // Return audio as binary
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Transcription', encodeURIComponent(result.transcription));
    res.setHeader('X-Response-Text', encodeURIComponent(result.response));
    res.send(result.audio);

  } catch (error) {
    console.error('Process voice error:', error);
    res.status(500).json({ error: error.message });
  }
}

// STT only
async function handleSTT(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file' });
    }

    const audioBuffer = req.file.buffer;
    const language = req.body.language || 'ru';

    const result = await speechToText(audioBuffer, language);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      text: result.text
    });

  } catch (error) {
    console.error('STT error:', error);
    res.status(500).json({ error: error.message });
  }
}

// LLM only
async function handleLLM(req, res) {
  try {
    const { message, systemPrompt, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const conversationHistory = history || [];

    const result = await generateResponse(message, systemPrompt, conversationHistory);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      text: result.text
    });

  } catch (error) {
    console.error('LLM error:', error);
    res.status(500).json({ error: error.message });
  }
}

// TTS only
async function handleTTS(req, res) {
  try {
    const { text, voice = 'Jarvis', speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    const result = await textToSpeech(text, voice, speed);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(result.audio);

  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message });
  }
}
