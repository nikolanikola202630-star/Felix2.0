// Voice transcription and lecture notes generation
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Transcribe audio using Groq Whisper
async function transcribeAudio(audioBuffer, language = 'ru') {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-large-v3',
      language: language,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    return {
      success: true,
      text: transcription.text,
      segments: transcription.segments,
      language: transcription.language,
      duration: transcription.duration
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate structured lecture notes from transcription
async function generateLectureNotes(transcription, options = {}) {
  const {
    language = 'ru',
    style = 'detailed', // detailed, brief, outline
    includeTimestamps = true,
    includeSummary = true,
    includeKeyPoints = true,
    includeQuestions = true
  } = options;

  const prompt = `
Ты профессиональный конспектировщик лекций. Создай структурированный конспект на основе следующей транскрипции лекции.

ТРАНСКРИПЦИЯ:
${transcription}

ТРЕБОВАНИЯ К КОНСПЕКТУ:
1. Структура:
   - Заголовок и тема лекции
   - Основные разделы с подразделами
   - Четкая иерархия информации
   
2. Форматирование:
   - Используй маркированные списки
   - Выдели ключевые термины и определения
   - Добавь нумерацию для последовательных шагов
   
3. Содержание:
   ${includeSummary ? '- Краткое резюме (2-3 предложения)' : ''}
   ${includeKeyPoints ? '- Ключевые моменты (5-7 пунктов)' : ''}
   - Подробное содержание по разделам
   - Важные примеры и иллюстрации
   ${includeQuestions ? '- Контрольные вопросы для самопроверки' : ''}
   
4. Стиль: ${style === 'detailed' ? 'Подробный с примерами' : style === 'brief' ? 'Краткий и лаконичный' : 'Структурированный план'}

5. Язык: ${language === 'ru' ? 'Русский' : 'English'}

ФОРМАТ ОТВЕТА:
# [Название темы]

## 📝 Краткое резюме
[2-3 предложения о чем лекция]

## 🎯 Ключевые моменты
- Пункт 1
- Пункт 2
...

## 📚 Подробное содержание

### Раздел 1: [Название]
- Подпункт 1
  - Детали
- Подпункт 2

### Раздел 2: [Название]
...

## 💡 Важные термины
- **Термин 1**: Определение
- **Термин 2**: Определение

## ❓ Контрольные вопросы
1. Вопрос 1
2. Вопрос 2

Создай максимально структурированный и полезный конспект!
  `.trim();

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 4000
    });

    const notes = completion.choices[0]?.message?.content || '';

    return {
      success: true,
      notes,
      metadata: {
        generatedAt: new Date().toISOString(),
        style,
        language,
        wordCount: notes.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('Generate notes error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate notes from multiple audio segments
async function generateNotesFromMultipleSegments(segments, options = {}) {
  try {
    // Transcribe all segments
    const transcriptions = [];
    for (const segment of segments) {
      const result = await transcribeAudio(segment.audio, segment.language || 'ru');
      if (result.success) {
        transcriptions.push({
          text: result.text,
          timestamp: segment.timestamp,
          duration: result.duration
        });
      }
    }

    // Combine transcriptions
    const fullTranscription = transcriptions
      .map((t, i) => `[Часть ${i + 1}]\n${t.text}`)
      .join('\n\n');

    // Generate notes
    const notes = await generateLectureNotes(fullTranscription, options);

    return {
      success: true,
      notes: notes.notes,
      transcriptions,
      metadata: {
        ...notes.metadata,
        segmentsCount: segments.length,
        totalDuration: transcriptions.reduce((sum, t) => sum + t.duration, 0)
      }
    };
  } catch (error) {
    console.error('Generate notes from segments error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Enhance existing notes with AI
async function enhanceNotes(notes, enhancements = []) {
  const enhancementPrompts = {
    addExamples: 'Добавь практические примеры к каждому ключевому пункту',
    addDiagrams: 'Предложи текстовые диаграммы или схемы для визуализации',
    addQuiz: 'Создай тест из 10 вопросов с вариантами ответов',
    simplify: 'Упрости язык, сделай более понятным для начинающих',
    expand: 'Расширь каждый раздел, добавь больше деталей',
    addReferences: 'Добавь рекомендации для дальнейшего изучения'
  };

  const selectedEnhancements = enhancements
    .map(e => enhancementPrompts[e])
    .filter(Boolean)
    .join('\n- ');

  const prompt = `
Улучши следующий конспект лекции:

${notes}

УЛУЧШЕНИЯ:
- ${selectedEnhancements}

Сохрани структуру и форматирование, добавь запрошенные улучшения.
  `.trim();

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 4000
    });

    return {
      success: true,
      enhancedNotes: completion.choices[0]?.message?.content || notes
    };
  } catch (error) {
    console.error('Enhance notes error:', error);
    return {
      success: false,
      error: error.message,
      originalNotes: notes
    };
  }
}

// Extract key information from notes
async function extractKeyInfo(notes) {
  const prompt = `
Проанализируй следующий конспект и извлеки ключевую информацию:

${notes}

Верни JSON со следующей структурой:
{
  "title": "Название темы",
  "summary": "Краткое резюме в 2-3 предложениях",
  "keyPoints": ["пункт 1", "пункт 2", ...],
  "terms": [{"term": "термин", "definition": "определение"}, ...],
  "topics": ["тема 1", "тема 2", ...],
  "difficulty": "beginner|intermediate|advanced",
  "estimatedReadTime": "время чтения в минутах"
}
  `.trim();

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const info = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return {
      success: true,
      info
    };
  } catch (error) {
    console.error('Extract key info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  transcribeAudio,
  generateLectureNotes,
  generateNotesFromMultipleSegments,
  enhanceNotes,
  extractKeyInfo
};
