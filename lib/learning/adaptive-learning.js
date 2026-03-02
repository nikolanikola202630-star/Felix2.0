// Adaptive Learning System
// Система адаптивного обучения с персонализацией

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class AdaptiveLearning {
  constructor() {
    this.userProfiles = new Map();
  }

  // Analyze user learning style
  async analyzeLearningStyle(userId, interactions) {
    const profile = this.userProfiles.get(userId) || {
      learningStyle: 'visual', // visual, auditory, kinesthetic
      pace: 'medium', // slow, medium, fast
      preferredTopics: [],
      strengths: [],
      weaknesses: [],
      lastAnalysis: null
    };

    // Analyze interactions
    if (interactions && interactions.length > 0) {
      const prompt = `Проанализируй стиль обучения пользователя на основе его активности:
      
${interactions.map(i => `- ${i.type}: ${i.description}`).join('\n')}

Определи:
1. Стиль обучения (визуальный/аудиальный/кинестетический)
2. Темп обучения (медленный/средний/быстрый)
3. Предпочитаемые темы
4. Сильные стороны
5. Слабые стороны

Ответь в формате JSON.`;

      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');
        
        profile.learningStyle = analysis.learningStyle || profile.learningStyle;
        profile.pace = analysis.pace || profile.pace;
        profile.preferredTopics = analysis.preferredTopics || profile.preferredTopics;
        profile.strengths = analysis.strengths || profile.strengths;
        profile.weaknesses = analysis.weaknesses || profile.weaknesses;
        profile.lastAnalysis = new Date().toISOString();

        this.userProfiles.set(userId, profile);
      } catch (error) {
        console.error('Learning style analysis error:', error);
      }
    }

    return profile;
  }

  // Generate personalized content
  async generatePersonalizedContent(userId, topic, contentType = 'lesson') {
    const profile = this.userProfiles.get(userId) || {};
    
    const styleDescriptions = {
      visual: 'с визуальными примерами, диаграммами и схемами',
      auditory: 'с подробными объяснениями и аудио-примерами',
      kinesthetic: 'с практическими заданиями и интерактивными упражнениями'
    };

    const paceDescriptions = {
      slow: 'медленно, с детальными объяснениями каждого шага',
      medium: 'в среднем темпе, с балансом теории и практики',
      fast: 'быстро, фокусируясь на ключевых концепциях'
    };

    const prompt = `Создай ${contentType} на тему "${topic}" для пользователя со следующим профилем:
    
- Стиль обучения: ${profile.learningStyle || 'visual'} (${styleDescriptions[profile.learningStyle] || styleDescriptions.visual})
- Темп: ${profile.pace || 'medium'} (${paceDescriptions[profile.pace] || paceDescriptions.medium})
- Сильные стороны: ${profile.strengths?.join(', ') || 'не определены'}
- Слабые стороны: ${profile.weaknesses?.join(', ') || 'не определены'}

Адаптируй контент под этот профиль. Сделай его максимально эффективным для обучения.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2000
      });

      return completion.choices[0]?.message?.content || 'Ошибка генерации контента';
    } catch (error) {
      console.error('Content generation error:', error);
      return 'Ошибка генерации контента';
    }
  }

  // Recommend next lesson
  async recommendNextLesson(userId, completedLessons = []) {
    const profile = this.userProfiles.get(userId) || {};
    
    const prompt = `На основе профиля пользователя и пройденных уроков, порекомендуй следующий урок:

Профиль:
- Предпочитаемые темы: ${profile.preferredTopics?.join(', ') || 'не определены'}
- Сильные стороны: ${profile.strengths?.join(', ') || 'не определены'}
- Слабые стороны: ${profile.weaknesses?.join(', ') || 'не определены'}

Пройденные уроки: ${completedLessons.join(', ') || 'нет'}

Порекомендуй следующий урок, который будет наиболее эффективным для развития пользователя.
Ответь в формате JSON с полями: title, description, difficulty, estimatedTime.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Recommendation error:', error);
      return null;
    }
  }

  // Track learning progress
  async trackProgress(userId, lessonId, score, timeSpent) {
    const profile = this.userProfiles.get(userId) || {};
    
    if (!profile.progress) {
      profile.progress = [];
    }

    profile.progress.push({
      lessonId,
      score,
      timeSpent,
      timestamp: new Date().toISOString()
    });

    // Analyze progress
    if (profile.progress.length >= 5) {
      const avgScore = profile.progress.reduce((sum, p) => sum + p.score, 0) / profile.progress.length;
      const avgTime = profile.progress.reduce((sum, p) => sum + p.timeSpent, 0) / profile.progress.length;

      // Update pace based on performance
      if (avgScore > 90 && avgTime < 300) {
        profile.pace = 'fast';
      } else if (avgScore < 70 || avgTime > 600) {
        profile.pace = 'slow';
      } else {
        profile.pace = 'medium';
      }
    }

    this.userProfiles.set(userId, profile);
    return profile;
  }

  // Get user profile
  getUserProfile(userId) {
    return this.userProfiles.get(userId) || null;
  }

  // Update user profile
  updateUserProfile(userId, updates) {
    const profile = this.userProfiles.get(userId) || {};
    this.userProfiles.set(userId, { ...profile, ...updates });
    return this.userProfiles.get(userId);
  }
}

module.exports = new AdaptiveLearning();
