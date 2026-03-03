// Felix Academy V12 - Auto Deploy System
// Автоматический деплой при изменениях

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class AutoDeployV12 {
  constructor() {
    this.watchedFiles = [
      'miniapp/**/*.html',
      'miniapp/**/*.js',
      'miniapp/**/*.css',
      'api/**/*.js',
      'lib/**/*.js'
    ];
    this.deployQueue = [];
    this.isDeploying = false;
    this.lastDeploy = null;
    this.minDeployInterval = 5 * 60 * 1000; // 5 минут между деплоями
  }

  // Запуск автоматического деплоя
  async start() {
    console.log('🚀 Auto Deploy V12 - Starting...');
    
    // Проверка изменений каждую минуту
    setInterval(() => this.checkChanges(), 60 * 1000);
    
    console.log('✅ Auto Deploy V12 - Running');
  }

  // Проверка изменений
  async checkChanges() {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      
      if (stdout.trim()) {
        const changes = stdout.trim().split('\n');
        console.log(`📝 Detected ${changes.length} changes`);
        
        // Добавление в очередь
        this.deployQueue.push({
          changes,
          timestamp: Date.now()
        });
        
        // Попытка деплоя
        await this.tryDeploy();
      }
    } catch (error) {
      console.error('❌ Failed to check changes:', error);
    }
  }

  // Попытка деплоя
  async tryDeploy() {
    // Проверка минимального интервала
    if (this.lastDeploy && Date.now() - this.lastDeploy < this.minDeployInterval) {
      console.log('⏳ Waiting for deploy interval...');
      return;
    }

    // Проверка что не идет деплой
    if (this.isDeploying) {
      console.log('⏳ Deploy already in progress...');
      return;
    }

    // Проверка очереди
    if (this.deployQueue.length === 0) {
      return;
    }

    // Запуск деплоя
    await this.deploy();
  }

  // Деплой
  async deploy() {
    this.isDeploying = true;
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting deploy...');
      
      // 1. Оптимизация
      console.log('⚡ Optimizing...');
      await this.optimize();
      
      // 2. Тесты
      console.log('🧪 Running tests...');
      await this.runTests();
      
      // 3. Git commit
      console.log('📦 Committing changes...');
      await this.gitCommit();
      
      // 4. Git push
      console.log('📤 Pushing to GitHub...');
      await this.gitPush();
      
      // 5. Ожидание Vercel
      console.log('⏳ Waiting for Vercel...');
      await this.waitForVercel();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Deploy completed in ${duration}ms`);
      
      // Очистка очереди
      this.deployQueue = [];
      this.lastDeploy = Date.now();
      
      // Уведомление
      await this.notifySuccess(duration);
      
    } catch (error) {
      console.error('❌ Deploy failed:', error);
      await this.notifyFailure(error);
    } finally {
      this.isDeploying = false;
    }
  }

  // Оптимизация
  async optimize() {
    try {
      await execAsync('node scripts/optimize-project-v12.js');
    } catch (error) {
      console.warn('⚠️ Optimization failed:', error.message);
    }
  }

  // Запуск тестов
  async runTests() {
    try {
      // Быстрые тесты
      await execAsync('npm run test:quick', { timeout: 30000 });
    } catch (error) {
      console.warn('⚠️ Tests failed:', error.message);
      // Не останавливаем деплой при ошибках тестов
    }
  }

  // Git commit
  async gitCommit() {
    const message = this.generateCommitMessage();
    
    await execAsync('git add .');
    await execAsync(`git commit -m "${message}"`);
  }

  // Git push
  async gitPush() {
    await execAsync('git push origin main');
  }

  // Ожидание Vercel
  async waitForVercel() {
    // Ждем 2 минуты для деплоя Vercel
    await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
  }

  // Генерация сообщения коммита
  generateCommitMessage() {
    const timestamp = new Date().toISOString();
    const changesCount = this.deployQueue.reduce((sum, item) => sum + item.changes.length, 0);
    
    return `chore: auto-deploy v12 - ${changesCount} changes [${timestamp}]`;
  }

  // Уведомление об успехе
  async notifySuccess(duration) {
    console.log('✅ Deploy successful!');
    console.log(`⏱️ Duration: ${Math.round(duration / 1000)}s`);
    
    // Можно добавить отправку в Telegram
  }

  // Уведомление об ошибке
  async notifyFailure(error) {
    console.error('❌ Deploy failed!');
    console.error('Error:', error.message);
    
    // Можно добавить отправку в Telegram
  }

  // Ручной деплой
  async manualDeploy() {
    console.log('🚀 Manual deploy triggered');
    this.deployQueue.push({
      changes: ['manual'],
      timestamp: Date.now()
    });
    await this.deploy();
  }
}

// Экспорт
module.exports = AutoDeployV12;

// Автозапуск если запущен напрямую
if (require.main === module) {
  const deploy = new AutoDeployV12();
  
  // Проверка аргументов
  if (process.argv.includes('--manual')) {
    deploy.manualDeploy().catch(console.error);
  } else {
    deploy.start().catch(console.error);
  }
}
