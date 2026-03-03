// Felix Academy V12 - Health Monitor
// Мониторинг здоровья системы

const { createClient } = require('@supabase/supabase-js');
const https = require('https');

class HealthMonitorV12 {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    this.checkInterval = 2 * 60 * 1000; // 2 минуты
    this.endpoints = [
      { name: 'Main App', url: 'https://felix2-0.vercel.app/miniapp/app-v12.html' },
      { name: 'Admin API', url: 'https://felix2-0.vercel.app/api/admin-v12?action=stats&user_id=0' },
      { name: 'Partner API', url: 'https://felix2-0.vercel.app/api/partner-v12?action=stats&user_id=0' },
      { name: 'Courses API', url: 'https://felix2-0.vercel.app/api/courses-full' }
    ];
    this.alerts = [];
  }

  // Запуск мониторинга
  async start() {
    console.log('🏥 Health Monitor V12 - Starting...');
    
    // Первая проверка
    await this.checkAll();
    
    // Периодическая проверка
    setInterval(() => this.checkAll(), this.checkInterval);
    
    console.log('✅ Health Monitor V12 - Running');
  }

  // Проверка всех систем
  async checkAll() {
    const startTime = Date.now();
    console.log('🔍 Checking system health...');

    const results = await Promise.all([
      this.checkEndpoints(),
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDisk()
    ]);

    const [endpoints, database, memory, disk] = results;
    
    const health = {
      timestamp: new Date().toISOString(),
      endpoints,
      database,
      memory,
      disk,
      overall: this.calculateOverallHealth(results)
    };

    // Сохранение результатов
    await this.saveHealth(health);

    // Проверка алертов
    await this.checkAlerts(health);

    const duration = Date.now() - startTime;
    console.log(`✅ Health check completed in ${duration}ms - Status: ${health.overall}`);

    return health;
  }

  // Проверка эндпоинтов
  async checkEndpoints() {
    const results = await Promise.all(
      this.endpoints.map(endpoint => this.checkEndpoint(endpoint))
    );

    const healthy = results.filter(r => r.status === 'healthy').length;
    const total = results.length;

    return {
      status: healthy === total ? 'healthy' : healthy > 0 ? 'degraded' : 'down',
      healthy,
      total,
      endpoints: results
    };
  }

  // Проверка одного эндпоинта
  async checkEndpoint(endpoint) {
    const startTime = Date.now();
    
    try {
      const response = await this.httpGet(endpoint.url);
      const duration = Date.now() - startTime;

      return {
        name: endpoint.name,
        url: endpoint.url,
        status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
        responseTime: duration,
        statusCode: response.statusCode
      };
    } catch (error) {
      return {
        name: endpoint.name,
        url: endpoint.url,
        status: 'down',
        error: error.message
      };
    }
  }

  // HTTP GET запрос
  httpGet(url) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 10000);

      https.get(url, (res) => {
        clearTimeout(timeout);
        resolve(res);
        res.resume(); // Consume response data
      }).on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  // Проверка базы данных
  async checkDatabase() {
    try {
      const startTime = Date.now();
      
      // Простой запрос для проверки
      const { error } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);

      const duration = Date.now() - startTime;

      if (error) throw error;

      return {
        status: 'healthy',
        responseTime: duration
      };
    } catch (error) {
      return {
        status: 'down',
        error: error.message
      };
    }
  }

  // Проверка памяти
  async checkMemory() {
    const used = process.memoryUsage();
    const total = used.heapTotal;
    const usage = (used.heapUsed / total) * 100;

    return {
      status: usage < 80 ? 'healthy' : usage < 90 ? 'warning' : 'critical',
      usage: Math.round(usage),
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      heapTotal: Math.round(total / 1024 / 1024)
    };
  }

  // Проверка диска
  async checkDisk() {
    // Упрощенная проверка для Vercel
    return {
      status: 'healthy',
      usage: 0
    };
  }

  // Расчет общего здоровья
  calculateOverallHealth(results) {
    const [endpoints, database, memory] = results;

    if (database.status === 'down') return 'critical';
    if (endpoints.status === 'down') return 'critical';
    if (memory.status === 'critical') return 'critical';
    if (endpoints.status === 'degraded' || memory.status === 'warning') return 'degraded';
    
    return 'healthy';
  }

  // Сохранение результатов
  async saveHealth(health) {
    try {
      await this.supabase.from('health_checks').insert({
        timestamp: health.timestamp,
        overall: health.overall,
        endpoints: health.endpoints,
        database: health.database,
        memory: health.memory,
        disk: health.disk
      });
    } catch (error) {
      console.error('Failed to save health check:', error);
    }
  }

  // Проверка алертов
  async checkAlerts(health) {
    const alerts = [];

    // Критические алерты
    if (health.overall === 'critical') {
      alerts.push({
        level: 'critical',
        message: 'System is in critical state',
        timestamp: new Date().toISOString()
      });
    }

    // Алерты по эндпоинтам
    health.endpoints.endpoints.forEach(endpoint => {
      if (endpoint.status === 'down') {
        alerts.push({
          level: 'critical',
          message: `Endpoint ${endpoint.name} is down`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Алерты по памяти
    if (health.memory.status === 'critical') {
      alerts.push({
        level: 'warning',
        message: `Memory usage is critical: ${health.memory.usage}%`,
        timestamp: new Date().toISOString()
      });
    }

    // Отправка алертов
    if (alerts.length > 0) {
      await this.sendAlerts(alerts);
    }

    this.alerts = alerts;
  }

  // Отправка алертов
  async sendAlerts(alerts) {
    console.log('🚨 Alerts:', alerts);
    
    // Сохранение в БД
    try {
      await this.supabase.from('alerts').insert(alerts);
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }

    // Можно добавить отправку в Telegram
  }

  // Получение статуса
  async getStatus() {
    const { data } = await this.supabase
      .from('health_checks')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    return data || { overall: 'unknown' };
  }
}

// Экспорт
module.exports = HealthMonitorV12;

// Автозапуск если запущен напрямую
if (require.main === module) {
  const monitor = new HealthMonitorV12();
  monitor.start().catch(console.error);
}
