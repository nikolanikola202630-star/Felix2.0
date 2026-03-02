// Self-Learning System - Safe Version with Singleton Pattern
const db = require('../db').db;
const { ai } = require('../ai');

class SelfLearningSystem {
  constructor() {
    this.learningQueue = [];
    this.patterns = new Map();
    this.isRunning = false;
    this.intervals = [];
  }

  // Start autonomous learning (singleton)
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Self-learning already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Self-learning system started');

    try {
      // Check if required tables exist
      const tablesExist = await this.checkTables();
      if (!tablesExist) {
        console.warn('⚠️ Required tables missing, self-learning disabled');
        this.isRunning = false;
        return;
      }

      // Run learning cycles with error handling
      this.intervals.push(
        setInterval(() => this.runLearningCycle().catch(console.error), 3600000) // Every hour
      );
      
      this.intervals.push(
        setInterval(() => this.analyzeAllUsers().catch(console.error), 86400000) // Every day
      );
      
      this.intervals.push(
        setInterval(() => this.optimizeSystem().catch(console.error), 604800000) // Every week
      );

      // Initial run (delayed to avoid cold start issues)
      setTimeout(() => this.runLearningCycle().catch(console.error), 60000); // After 1 minute
    } catch (error) {
      console.error('Self-learning start error:', error);
      this.isRunning = false;
    }
  }

  // Stop system gracefully
  async stop() {
    if (!this.isRunning) return;

    console.log('🛑 Stopping self-learning system...');
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    this.isRunning = false;
    console.log('✅ Self-learning system stopped');
  }

  // Check if required tables exist
  async checkTables() {
    try {
      const result = await db.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('user_learning_data', 'system_patterns', 'system_insights', 'system_logs')
      `);

      return parseInt(result.rows[0].count) === 4;
    } catch (error) {
      console.error('Check tables error:', error);
      return false;
    }
  }

  // Run learning cycle with error handling
  async runLearningCycle() {
    if (!this.isRunning) return;

    try {
      console.log('📚 Running learning cycle...');

      await this.analyzeRecentInteractions();
      await this.updatePatterns();
      await this.generateInsights();
      await this.autoOptimize();

      console.log('✅ Learning cycle completed');
    } catch (error) {
      console.error('Learning cycle error:', error);
      await this.logError('learning_cycle', error);
    }
  }

  // Analyze recent interactions
  async analyzeRecentInteractions() {
    try {
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
      throw error;
    }
  }

  // Learn from individual message
  async learnFromMessage(message) {
    try {
      const patterns = {
        isQuestion: message.content.includes('?'),
        questionType: this.detectQuestionType(message.content),
        isCommand: message.content.startsWith('/'),
        commandType: message.content.split(' ')[0],
        sentiment: this.analyzeSentiment(message.content),
        complexity: this.assessComplexity(message.content),
        intent: 'general' // Simplified - no AI call
      };

      // Store pattern
      const key = `${message.user_id}_${patterns.intent}`;
      if (!this.patterns.has(key)) {
        this.patterns.set(key, []);
      }
      this.patterns.get(key).push(patterns);

      // Save to database
      if (message.role === 'user') {
        await db.query(`
          INSERT INTO user_learning_data (user_id, pattern_type, pattern_data, learned_at)
          VALUES ($1, $2, $3, NOW())
        `, [message.user_id, 'interaction', JSON.stringify(patterns)]);
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

  // Analyze sentiment (simple version)
  analyzeSentiment(text) {
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

  // Update patterns database
  async updatePatterns() {
    try {
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
      throw error;
    }
  }

  // Generate insights (simplified - no AI)
  async generateInsights() {
    try {
      const patterns = await db.query(`
        SELECT * FROM system_patterns
        WHERE updated_at > NOW() - INTERVAL '7 days'
      `);
      
      for (const pattern of patterns.rows) {
        const data = JSON.parse(pattern.pattern_data);
        
        // Simple rule-based insights
        let insight = `Pattern: ${pattern.pattern_type}, Count: ${data.count}`;
        
        if (data.sentiments.negative > data.sentiments.positive) {
          insight += '. High negative sentiment detected.';
        }
        
        if (data.complexities.complex > data.complexities.simple * 2) {
          insight += '. Users prefer detailed responses.';
        }
        
        await db.query(`
          INSERT INTO system_insights (insight_type, insight_text, insight_data, created_at)
          VALUES ($1, $2, $3, NOW())
        `, [pattern.pattern_type, insight, JSON.stringify(data)]);
      }
      
      console.log(`📊 Generated ${patterns.rows.length} insights`);
    } catch (error) {
      console.error('Generate insights error:', error);
      throw error;
    }
  }

  // Auto-optimize system
  async autoOptimize() {
    try {
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
      throw error;
    }
  }

  // Apply optimization
  async applyOptimization(insight) {
    try {
      const data = JSON.parse(insight.insight_data);
      
      if (data.sentiments.negative > data.sentiments.positive) {
        console.log('⚠️ Detected negative sentiment, logging for review');
      }
      
      if (data.complexities.complex > data.complexities.simple * 2) {
        console.log('📈 Users prefer detailed responses');
      }
    } catch (error) {
      console.error('Apply optimization error:', error);
    }
  }

  // Analyze all users (simplified)
  async analyzeAllUsers() {
    try {
      console.log('👥 Analyzing all users...');
      
      const users = await db.query(`
        SELECT id FROM users
        WHERE updated_at > NOW() - INTERVAL '30 days'
        LIMIT 100
      `);
      
      console.log(`✅ Found ${users.rows.length} active users`);
    } catch (error) {
      console.error('Analyze all users error:', error);
      throw error;
    }
  }

  // Optimize system performance
  async optimizeSystem() {
    try {
      console.log('⚙️ Optimizing system...');
      
      // Clean old data
      await db.query(`
        DELETE FROM user_learning_data
        WHERE learned_at < NOW() - INTERVAL '30 days'
      `);
      
      await db.query(`
        DELETE FROM system_logs
        WHERE created_at < NOW() - INTERVAL '7 days'
      `);
      
      console.log('✅ System optimized');
    } catch (error) {
      console.error('Optimize system error:', error);
      throw error;
    }
  }

  // Get system health
  async getSystemHealth() {
    try {
      const health = {
        status: 'healthy',
        isRunning: this.isRunning,
        metrics: {},
        issues: []
      };
      
      // Check active users
      const activeUsers = await db.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM messages
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);
      health.metrics.activeUsers = parseInt(activeUsers.rows[0].count);
      
      // Check error rate
      const errors = await db.query(`
        SELECT COUNT(*) as count
        FROM system_logs
        WHERE level = 'error'
        AND created_at > NOW() - INTERVAL '1 hour'
      `);
      health.metrics.errorRate = parseInt(errors.rows[0].count);
      
      if (health.metrics.errorRate > 10) {
        health.status = 'degraded';
        health.issues.push('High error rate detected');
      }
      
      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        isRunning: this.isRunning,
        error: error.message
      };
    }
  }

  // Log error to database
  async logError(context, error) {
    try {
      await db.query(`
        INSERT INTO system_logs (level, message, context, created_at)
        VALUES ($1, $2, $3, NOW())
      `, ['error', error.message, JSON.stringify({ context, stack: error.stack })]);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

// Export singleton instance
const instance = new SelfLearningSystem();
module.exports = instance;
