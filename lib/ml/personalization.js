// Machine Learning & Personalization Engine
const db = require('../db').db;
const ai = require('../ai').ai;

class PersonalizationEngine {
  constructor() {
    this.userProfiles = new Map();
  }

  // Analyze user behavior and build profile
  async analyzeUserBehavior(userId) {
    try {
      // Get user history
      const history = await db.getHistory(userId, { limit: 100 });
      const stats = await db.getUserStats(userId);
      
      // Analyze patterns
      const patterns = {
        // Communication style
        communicationStyle: this.detectCommunicationStyle(history.messages),
        
        // Preferred topics
        preferredTopics: this.extractTopics(history.messages),
        
        // Activity patterns
        activityPattern: this.analyzeActivityPattern(stats.by_hour),
        
        // Response preferences
        responsePreferences: this.analyzeResponsePreferences(history.messages),
        
        // Learning style
        learningStyle: this.detectLearningStyle(history.messages),
        
        // Engagement level
        engagementLevel: this.calculateEngagement(stats),
        
        // Skill level
        skillLevel: this.assessSkillLevel(history.messages)
      };

      // Update user profile
      await this.updateUserProfile(userId, patterns);
      
      return patterns;
    } catch (error) {
      console.error('Analyze behavior error:', error);
      return null;
    }
  }

  // Detect communication style (formal/casual)
  detectCommunicationStyle(messages) {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return 'casual';

    let formalScore = 0;
    const formalIndicators = ['пожалуйста', 'благодарю', 'здравствуйте', 'уважаемый'];
    const casualIndicators = ['привет', 'спасибо', 'пока', 'ок', 'круто'];

    userMessages.forEach(msg => {
      const text = msg.content.toLowerCase();
      formalIndicators.forEach(word => {
        if (text.includes(word)) formalScore += 1;
      });
      casualIndicators.forEach(word => {
        if (text.includes(word)) formalScore -= 1;
      });
    });

    return formalScore > 0 ? 'formal' : 'casual';
  }

  // Extract preferred topics using AI
  extractTopics(messages) {
    const topics = new Map();
    const keywords = [
      'программирование', 'дизайн', 'маркетинг', 'бизнес', 
      'наука', 'технологии', 'образование', 'искусство'
    ];

    messages.forEach(msg => {
      const text = msg.content.toLowerCase();
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          topics.set(keyword, (topics.get(keyword) || 0) + 1);
        }
      });
    });

    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  // Analyze activity pattern
  analyzeActivityPattern(byHour) {
    if (!byHour || byHour.length === 0) return 'mixed';

    const hourCounts = new Array(24).fill(0);
    byHour.forEach(({ hour, count }) => {
      hourCounts[hour] = parseInt(count);
    });

    const morningActivity = hourCounts.slice(6, 12).reduce((a, b) => a + b, 0);
    const afternoonActivity = hourCounts.slice(12, 18).reduce((a, b) => a + b, 0);
    const eveningActivity = hourCounts.slice(18, 24).reduce((a, b) => a + b, 0);
    const nightActivity = hourCounts.slice(0, 6).reduce((a, b) => a + b, 0);

    const max = Math.max(morningActivity, afternoonActivity, eveningActivity, nightActivity);
    
    if (max === morningActivity) return 'morning';
    if (max === afternoonActivity) return 'afternoon';
    if (max === eveningActivity) return 'evening';
    if (max === nightActivity) return 'night';
    return 'mixed';
  }

  // Analyze response preferences
  analyzeResponsePreferences(messages) {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    if (assistantMessages.length === 0) return { length: 'medium', detail: 'balanced' };

    const avgLength = assistantMessages.reduce((sum, m) => sum + m.content.length, 0) / assistantMessages.length;
    
    return {
      length: avgLength < 500 ? 'short' : avgLength > 1500 ? 'long' : 'medium',
      detail: avgLength > 1000 ? 'detailed' : 'concise',
      format: 'structured' // можно анализировать наличие списков, заголовков
    };
  }

  // Detect learning style
  detectLearningStyle(messages) {
    const userMessages = messages.filter(m => m.role === 'user');
    
    let visualScore = 0;
    let practicalScore = 0;
    let theoreticalScore = 0;

    const visualKeywords = ['покажи', 'пример', 'схема', 'диаграмма', 'картинка'];
    const practicalKeywords = ['как сделать', 'практика', 'задача', 'упражнение'];
    const theoreticalKeywords = ['теория', 'концепция', 'принцип', 'почему', 'объясни'];

    userMessages.forEach(msg => {
      const text = msg.content.toLowerCase();
      visualKeywords.forEach(word => text.includes(word) && visualScore++);
      practicalKeywords.forEach(word => text.includes(word) && practicalScore++);
      theoreticalKeywords.forEach(word => text.includes(word) && theoreticalScore++);
    });

    const max = Math.max(visualScore, practicalScore, theoreticalScore);
    if (max === visualScore) return 'visual';
    if (max === practicalScore) return 'practical';
    if (max === theoreticalScore) return 'theoretical';
    return 'mixed';
  }

  // Calculate engagement level
  calculateEngagement(stats) {
    const messagesPerDay = stats.total_messages / 30; // за последний месяц
    
    if (messagesPerDay > 20) return 'high';
    if (messagesPerDay > 5) return 'medium';
    return 'low';
  }

  // Assess skill level
  assessSkillLevel(messages) {
    const userMessages = messages.filter(m => m.role === 'user');
    
    let complexityScore = 0;
    const advancedKeywords = ['оптимизация', 'архитектура', 'паттерн', 'алгоритм', 'производительность'];
    const beginnerKeywords = ['как начать', 'что такое', 'основы', 'для начинающих'];

    userMessages.forEach(msg => {
      const text = msg.content.toLowerCase();
      advancedKeywords.forEach(word => text.includes(word) && complexityScore++);
      beginnerKeywords.forEach(word => text.includes(word) && complexityScore--);
    });

    if (complexityScore > 5) return 'advanced';
    if (complexityScore > 0) return 'intermediate';
    return 'beginner';
  }

  // Update user profile in database
  async updateUserProfile(userId, patterns) {
    try {
      await db.query(`
        INSERT INTO user_profiles (
          user_id, 
          communication_style, 
          preferred_topics,
          activity_pattern,
          response_preferences,
          learning_style,
          engagement_level,
          skill_level,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          communication_style = $2,
          preferred_topics = $3,
          activity_pattern = $4,
          response_preferences = $5,
          learning_style = $6,
          engagement_level = $7,
          skill_level = $8,
          updated_at = NOW()
      `, [
        userId,
        patterns.communicationStyle,
        JSON.stringify(patterns.preferredTopics),
        patterns.activityPattern,
        JSON.stringify(patterns.responsePreferences),
        patterns.learningStyle,
        patterns.engagementLevel,
        patterns.skillLevel
      ]);

      this.userProfiles.set(userId, patterns);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  }

  // Get personalized AI prompt
  async getPersonalizedPrompt(userId, basePrompt) {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = await this.analyzeUserBehavior(userId);
    }

    if (!profile) return basePrompt;

    let personalizedPrompt = basePrompt + '\n\nПЕРСОНАЛИЗАЦИЯ:\n';

    // Communication style
    if (profile.communicationStyle === 'formal') {
      personalizedPrompt += '- Используй формальный стиль общения\n';
    } else {
      personalizedPrompt += '- Используй неформальный, дружелюбный стиль\n';
    }

    // Response preferences
    if (profile.responsePreferences.length === 'short') {
      personalizedPrompt += '- Давай краткие ответы (до 500 символов)\n';
    } else if (profile.responsePreferences.length === 'long') {
      personalizedPrompt += '- Давай подробные развернутые ответы\n';
    }

    // Learning style
    if (profile.learningStyle === 'visual') {
      personalizedPrompt += '- Используй больше примеров и визуальных описаний\n';
    } else if (profile.learningStyle === 'practical') {
      personalizedPrompt += '- Фокусируйся на практических примерах и упражнениях\n';
    } else if (profile.learningStyle === 'theoretical') {
      personalizedPrompt += '- Объясняй теоретические концепции и принципы\n';
    }

    // Skill level
    if (profile.skillLevel === 'beginner') {
      personalizedPrompt += '- Объясняй простым языком, избегай сложных терминов\n';
    } else if (profile.skillLevel === 'advanced') {
      personalizedPrompt += '- Используй профессиональную терминологию, углубляйся в детали\n';
    }

    // Preferred topics
    if (profile.preferredTopics.length > 0) {
      personalizedPrompt += `- Интересы пользователя: ${profile.preferredTopics.join(', ')}\n`;
    }

    return personalizedPrompt;
  }

  // Recommend content based on profile
  async recommendContent(userId) {
    const profile = this.userProfiles.get(userId) || await this.analyzeUserBehavior(userId);
    
    if (!profile) return [];

    const recommendations = [];

    // Recommend courses based on topics and skill level
    const courses = await db.getCourses({
      topics: profile.preferredTopics,
      difficulty: profile.skillLevel,
      limit: 5
    });

    recommendations.push(...courses.map(c => ({
      type: 'course',
      item: c,
      reason: 'Соответствует твоим интересам'
    })));

    return recommendations;
  }

  // Auto-adjust settings based on behavior
  async autoAdjustSettings(userId) {
    const profile = this.userProfiles.get(userId) || await this.analyzeUserBehavior(userId);
    
    if (!profile) return;

    const settings = await db.getUserSettings(userId);
    let updated = false;

    // Adjust AI temperature based on learning style
    if (profile.learningStyle === 'practical' && settings.ai_temperature > 0.5) {
      settings.ai_temperature = 0.3; // More precise for practical tasks
      updated = true;
    } else if (profile.learningStyle === 'theoretical' && settings.ai_temperature < 0.7) {
      settings.ai_temperature = 0.7; // More creative for explanations
      updated = true;
    }

    if (updated) {
      await db.updateUserSettings(userId, settings);
    }
  }
}

module.exports = new PersonalizationEngine();
