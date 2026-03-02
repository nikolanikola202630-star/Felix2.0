// Self-Learning & Automation System
const db = require('../db').db;
const { ai } = require('../ai');
const personalization = require('../ml/personalization');

class SelfLearningSystem {
  constructor() {
    this.learningQueue = [];
    this.patterns = new Map();
    this.isRunning = false;
  }

  // Start autonomous learning
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🤖 Self-learning system started');

    // Run learning cycles
    setInterval(() => this.runLearningCycle(), 3600000); // Every hour
    setInterval(() => this.analyzeAllUsers(), 86400000); // Every day
    setInterval(() => this.optimizeSystem(), 604800000); // Every week

    // Initial run
    await this.runLearningCycle();
  }

  // Run learning cycle
  async runLearningCycle() {
    try {
      console.log('📚 Running learning cycle...');

      // 1. Analyze recent interactions
      await this.analyzeRecentInteractions();

      // 2. Update patterns
      await this.updatePatterns();

      // 3. Generate insights
      await this.generateInsights();

      // 4. Auto-optimize
      await this.autoOptimize();

      console.log('✅ Learning cycle completed');
    } catch (error) {
      console.error('Learning cycle error:', error);
    }
  }

  // Analyze recent interactions
  async analyzeRecentInteractions() {
    try {
      // Get recent messages from all users
      const recentMessages = await db.query(`
        SELECT m.*, u.id as user_id
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.created_at > NOW() - INTERVAL '1 hour'
        ORDER BY m.created_at DESC
        LIMIT 100
      `);

      for (const msg of recentMessages.rows) {
        await this.learnFromMessage(msg);
      }
    } catch (error) {
      console.error('Analyze interactions error:', error);
    }
  }

  // Learn from individual message
  async learnFromMessage(message) {
    try {
      // Extract patterns
      const patterns = {
        // Question patterns
        isQuestion: message.content.includes('?'),
        questionType: this.detectQuestionType(message.content),
        
        // Command patterns
        isCommand: message.content.startsWith('/'),
        commandType: message.content.split(' ')[0],
        
        // Sentiment
        sentiment: await this.analyzeSentiment(message.content),
        
        // Complexity
        complexity: this.assessComplexity(message.content),
        
        // Intent
        intent: await this.detectIntent(message.content)
      };

      // Store pattern
      const key = `${message.user_id}_${patterns.intent}`;
      if (!this.patterns.has(key)) {
        this.patterns.set(key, []);
      }
      this.patterns.get(key).push(patterns);

      // Learn user preferences
      if (message.role === 'user') {
        await this.learnUserPreference(message.user_id, patterns);
      }
    } catch (error) {
      console.error('Learn from message error:', error);
    }
  }

  // Detect question type
  detectQuestionType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.startsWith('как')) return 'how';
    if (lowerText.startsWith('что')) return 'what';
    if (lowerText.startsWith('почему')) return 'why';
    if (lowerText.startsWith('когда')) return 'when';
    if (lowerText.startsWith('где')) return 'where';
    if (lowerText.startsWith('кто')) return 'who';
    
    return 'other';
  }

  // Analyze sentiment
  async analyzeSentiment(text) {
    const positiveWords = ['спасибо', 'отлично', 'хорошо', 'круто', 'супер', 'класс'];
    const negativeWords = ['плохо', 'ошибка', 'не работает', 'проблема', 'не понял'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  // Assess complexity
  assessComplexity(text) {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence > 20) return 'complex';
    if (avgWordsPerSentence > 10) return 'medium';
    return 'simple';
  }

  // Detect intent using AI
  async detectIntent(text) {
    try {
      const prompt = `Определи намерение пользователя в одно слово (вопрос, команда, обучение, помощь, обратная_связь): "${text}"`;
      
      const response = await ai.getChatResponse(prompt, [], {
        temperature: 0.1,
        max_tokens: 10
      });
      
      return response.trim().toLowerCase();
    } catch (error) {
      return 'unknown';
    }
  }

  // Learn user preference
  async learnUserPreference(userId, patterns) {
    try {
      // Update user profile based on patterns
      await db.query(`
        INSERT INTO user_learning_data (user_id, pattern_type, pattern_data, learned_at)
        VALUES ($1, $2, $3, NOW())
      `, [userId, 'interaction', JSON.stringify(patterns)]);
    } catch (error) {
      console.error('Learn preference error:', error);
    }
  }

  // Update patterns database
  async updatePatterns() {
    try {
      // Aggregate patterns
      const aggregated = new Map();
      
      for (const [key, patterns] of this.patterns.entries()) {
        const [userId, intent] = key.split('_');
        
        if (!aggregated.has(intent)) {
          aggregated.set(intent, {
            count: 0,
            sentiments: { positive: 0, negative: 0, neutral: 0 },
            complexities: { simple: 0, medium: 0, complex: 0 }
          });
        }
        
        const agg = aggregated.get(intent);
        patterns.forEach(p => {
          agg.count++;
          agg.sentiments[p.sentiment]++;
          agg.complexities[p.complexity]++;
        });
      }
      
      // Store aggregated patterns
      for (const [intent, data] of aggregated.entries()) {
        await db.query(`
          INSERT INTO system_patterns (pattern_type, pattern_data, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (pattern_type) DO UPDATE SET
            pattern_data = $2,
            updated_at = NOW()
        `, [intent, JSON.stringify(data)]);
      }
    } catch (error) {
      console.error('Update patterns error:', error);
    }
  }

  // Generate insights from learned data
  async generateInsights() {
    try {
      // Get all patterns
      const patterns = await db.query(`
        SELECT * FROM system_patterns
        WHERE updated_at > NOW() - INTERVAL '7 days'
      `);
      
      const insights = [];
      
      for (const pattern of patterns.rows) {
        const data = JSON.parse(pattern.pattern_data);
        
        // Generate insight using AI
        const prompt = `
Проанализируй следующие данные о поведении пользователей и дай 2-3 ключевых инсайта:

Тип взаимодействия: ${pattern.pattern_type}
Количество: ${data.count}
Настроение: ${JSON.stringify(data.sentiments)}
Сложность: ${JSON.stringify(data.complexities)}

Инсайты должны быть практичными и помогать улучшить систему.
        `.trim();
        
        const insight = await ai.getChatResponse(prompt, [], {
          temperature: 0.5,
          max_tokens: 200
        });
        
        insights.push({
          type: pattern.pattern_type,
          insight,
          data
        });
      }
      
      // Store insights
      for (const insight of insights) {
        await db.query(`
          INSERT INTO system_insights (insight_type, insight_text, insight_data, created_at)
          VALUES ($1, $2, $3, NOW())
        `, [insight.type, insight.insight, JSON.stringify(insight.data)]);
      }
      
      console.log(`📊 Generated ${insights.length} insights`);
    } catch (error) {
      console.error('Generate insights error:', error);
    }
  }

  // Auto-optimize system based on insights
  async autoOptimize() {
    try {
      // Get recent insights
      const insights = await db.query(`
        SELECT * FROM system_insights
        WHERE created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      for (const insight of insights.rows) {
        await this.applyOptimization(insight);
      }
    } catch (error) {
      console.error('Auto-optimize error:', error);
    }
  }

  // Apply optimization based on insight
  async applyOptimization(insight) {
    try {
      const data = JSON.parse(insight.insight_data);
      
      // Example optimizations
      if (data.sentiments.negative > data.sentiments.positive) {
        // Increase response quality
        console.log('⚠️ Detected negative sentiment, adjusting AI parameters');
        // Could adjust default temperature, add more context, etc.
      }
      
      if (data.complexities.complex > data.complexities.simple * 2) {
        // Users prefer complex answers
        console.log('📈 Users prefer detailed responses');
        // Could adjust default response length
      }
    } catch (error) {
      console.error('Apply optimization error:', error);
    }
  }

  // Analyze all users periodically
  async analyzeAllUsers() {
    try {
      console.log('👥 Analyzing all users...');
      
      const users = await db.query(`
        SELECT id FROM users
        WHERE updated_at > NOW() - INTERVAL '30 days'
      `);
      
      for (const user of users.rows) {
        await personalization.analyzeUserBehavior(user.id);
        await personalization.autoAdjustSettings(user.id);
      }
      
      console.log(`✅ Analyzed ${users.rows.length} users`);
    } catch (error) {
      console.error('Analyze all users error:', error);
    }
  }

  // Optimize system performance
  async optimizeSystem() {
    try {
      console.log('⚙️ Optimizing system...');
      
      // Clean old data
      await db.query(`
        DELETE FROM messages
        WHERE created_at < NOW() - INTERVAL '90 days'
      `);
      
      await db.query(`
        DELETE FROM user_learning_data
        WHERE learned_at < NOW() - INTERVAL '30 days'
      `);
      
      // Vacuum database
      await db.query('VACUUM ANALYZE');
      
      console.log('✅ System optimized');
    } catch (error) {
      console.error('Optimize system error:', error);
    }
  }

  // Get system health
  async getSystemHealth() {
    try {
      const health = {
        status: 'healthy',
        metrics: {},
        issues: []
      };
      
      // Check database
      const dbSize = await db.query(`
        SELECT pg_database_size(current_database()) as size
      `);
      health.metrics.dbSize = dbSize.rows[0].size;
      
      // Check active users
      const activeUsers = await db.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM messages
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);
      health.metrics.activeUsers = activeUsers.rows[0].count;
      
      // Check error rate
      const errors = await db.query(`
        SELECT COUNT(*) as count
        FROM system_logs
        WHERE level = 'error'
        AND created_at > NOW() - INTERVAL '1 hour'
      `);
      health.metrics.errorRate = errors.rows[0].count;
      
      if (health.metrics.errorRate > 10) {
        health.status = 'degraded';
        health.issues.push('High error rate detected');
      }
      
      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new SelfLearningSystem();
