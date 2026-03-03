// Felix Academy V12 - Master Automation
// Главная система автоматизации

const AutoSyncV12 = require('./auto-sync-v12');
const HealthMonitorV12 = require('./health-monitor-v12');
const AutoDeployV12 = require('./auto-deploy-v12');
const { createClient } = require('@supabase/supabase-js');

class MasterAutomationV12 {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    // Инициализация подсистем
    this.autoSync = new AutoSyncV12();
    this.healthMonitor = new HealthMonitorV12();
    this.autoDeploy = new AutoDeployV12();
    
    this.status = 'stopped';
    this.startTime = null;
  }

  // Запуск всех систем
  async start() {
    console.log('🤖 Master Automation V12 - Starting...');
    console.log('━'.repeat(50));
    
    this.startTime = Date.now();
    this.status = 'starting';

    try {
      // Запуск подсистем параллельно
      await Promise.all([
        this.startAutoSync(),
        this.startHealthMonitor(),
        this.startAutoDeploy(),
        this.startScheduledTasks()
      ]);

      this.status = 'running';
      console.log('━'.repeat(50));
      console.log('✅ Master Automation V12 - All systems operational!');
      console.log('━'.repeat(50));
      
      // Логирование запуска
      await this.logEvent('start', 'All systems started successfully');
      
      // Периодический отчет
      setInterval(() => this.printStatus(), 10 * 60 * 1000); // Каждые 10 минут
      
    } catch (error) {
      this.status = 'error';
      console.error('❌ Master Automation V12 - Failed to start:', error);
      await this.logEvent('error', error.message);
      throw error;
    }
  }

  // Запуск автосинхронизации
  async startAutoSync() {
    console.log('🔄 Starting Auto Sync...');
    await this.autoSync.start();
    console.log('✅ Auto Sync - Ready');
  }

  // Запуск мониторинга здоровья
  async startHealthMonitor() {
    console.log('🏥 Starting Health Monitor...');
    await this.healthMonitor.start();
    console.log('✅ Health Monitor - Ready');
  }

  // Запуск автодеплоя
  async startAutoDeploy() {
    console.log('🚀 Starting Auto Deploy...');
    await this.autoDeploy.start();
    console.log('✅ Auto Deploy - Ready');
  }

  // Запуск запланированных задач
  async startScheduledTasks() {
    console.log('⏰ Starting Scheduled Tasks...');
    
    // Ежедневная очистка в 3:00
    this.scheduleDaily('03:00', () => this.dailyCleanup());
    
    // Еженедельный отчет в воскресенье 20:00
    this.scheduleWeekly(0, '20:00', () => this.weeklyReport());
    
    // Ежемесячная оптимизация в 1-е число 02:00
    this.scheduleMonthly(1, '02:00', () => this.monthlyOptimization());
    
    console.log('✅ Scheduled Tasks - Ready');
  }

  // Планирование ежедневной задачи
  scheduleDaily(time, task) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const schedule = () => {
      const now = new Date();
      const scheduled = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0
      );
      
      if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
      }
      
      const timeout = scheduled - now;
      setTimeout(() => {
        task();
        schedule(); // Перепланирование
      }, timeout);
    };
    
    schedule();
  }

  // Планирование еженедельной задачи
  scheduleWeekly(dayOfWeek, time, task) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const schedule = () => {
      const now = new Date();
      const scheduled = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0
      );
      
      const daysUntil = (dayOfWeek - now.getDay() + 7) % 7;
      scheduled.setDate(scheduled.getDate() + daysUntil);
      
      if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 7);
      }
      
      const timeout = scheduled - now;
      setTimeout(() => {
        task();
        schedule();
      }, timeout);
    };
    
    schedule();
  }

  // Планирование ежемесячной задачи
  scheduleMonthly(day, time, task) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const schedule = () => {
      const now = new Date();
      const scheduled = new Date(
        now.getFullYear(),
        now.getMonth(),
        day,
        hours,
        minutes,
        0
      );
      
      if (scheduled <= now) {
        scheduled.setMonth(scheduled.getMonth() + 1);
      }
      
      const timeout = scheduled - now;
      setTimeout(() => {
        task();
        schedule();
      }, timeout);
    };
    
    schedule();
  }

  // Ежедневная очистка
  async dailyCleanup() {
    console.log('🧹 Running daily cleanup...');
    
    try {
      // Очистка старых логов
      await this.supabase
        .from('sync_logs')
        .delete()
        .lt('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      // Очистка старых health checks
      await this.supabase
        .from('health_checks')
        .delete()
        .lt('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      console.log('✅ Daily cleanup completed');
      await this.logEvent('cleanup', 'Daily cleanup completed');
    } catch (error) {
      console.error('❌ Daily cleanup failed:', error);
      await this.logEvent('error', `Daily cleanup failed: ${error.message}`);
    }
  }

  // Еженедельный отчет
  async weeklyReport() {
    console.log('📊 Generating weekly report...');
    
    try {
      const report = await this.generateReport('week');
      console.log('Weekly Report:', report);
      
      await this.logEvent('report', 'Weekly report generated');
    } catch (error) {
      console.error('❌ Weekly report failed:', error);
    }
  }

  // Ежемесячная оптимизация
  async monthlyOptimization() {
    console.log('⚡ Running monthly optimization...');
    
    try {
      // Оптимизация базы данных
      await this.optimizeDatabase();
      
      // Очистка кэша
      await this.autoSync.syncCache();
      
      console.log('✅ Monthly optimization completed');
      await this.logEvent('optimization', 'Monthly optimization completed');
    } catch (error) {
      console.error('❌ Monthly optimization failed:', error);
    }
  }

  // Оптимизация базы данных
  async optimizeDatabase() {
    // Vacuum и analyze для PostgreSQL
    // Реализация зависит от прав доступа к БД
    console.log('🗄️ Database optimization...');
  }

  // Генерация отчета
  async generateReport(period) {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Статистика синхронизаций
    const { data: syncs } = await this.supabase
      .from('sync_logs')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', now.toISOString());

    // Статистика здоровья
    const { data: health } = await this.supabase
      .from('health_checks')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', now.toISOString());

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      syncs: {
        total: syncs?.length || 0,
        successful: syncs?.filter(s => s.success).length || 0,
        failed: syncs?.filter(s => !s.success).length || 0
      },
      health: {
        total: health?.length || 0,
        healthy: health?.filter(h => h.overall === 'healthy').length || 0,
        degraded: health?.filter(h => h.overall === 'degraded').length || 0,
        critical: health?.filter(h => h.overall === 'critical').length || 0
      }
    };
  }

  // Вывод статуса
  async printStatus() {
    const uptime = Date.now() - this.startTime;
    const uptimeHours = Math.floor(uptime / (60 * 60 * 1000));
    const uptimeMinutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
    
    console.log('━'.repeat(50));
    console.log('📊 Master Automation V12 - Status Report');
    console.log('━'.repeat(50));
    console.log(`Status: ${this.status}`);
    console.log(`Uptime: ${uptimeHours}h ${uptimeMinutes}m`);
    console.log(`Auto Sync: ${this.autoSync.lastSync ? 'Active' : 'Idle'}`);
    console.log(`Health Monitor: ${this.healthMonitor.alerts.length} alerts`);
    console.log(`Auto Deploy: ${this.autoDeploy.isDeploying ? 'Deploying' : 'Ready'}`);
    console.log('━'.repeat(50));
  }

  // Логирование событий
  async logEvent(type, message) {
    try {
      await this.supabase.from('automation_logs').insert({
        type,
        message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  // Остановка всех систем
  async stop() {
    console.log('🛑 Master Automation V12 - Stopping...');
    this.status = 'stopped';
    await this.logEvent('stop', 'All systems stopped');
    console.log('✅ Master Automation V12 - Stopped');
  }

  // Получение статуса
  getStatus() {
    return {
      status: this.status,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      autoSync: {
        lastSync: this.autoSync.lastSync
      },
      healthMonitor: {
        alerts: this.healthMonitor.alerts.length
      },
      autoDeploy: {
        isDeploying: this.autoDeploy.isDeploying,
        queueLength: this.autoDeploy.deployQueue.length
      }
    };
  }
}

// Экспорт
module.exports = MasterAutomationV12;

// Автозапуск если запущен напрямую
if (require.main === module) {
  const master = new MasterAutomationV12();
  
  master.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await master.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await master.stop();
    process.exit(0);
  });
}
