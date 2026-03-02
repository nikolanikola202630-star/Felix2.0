#!/usr/bin/env node
// Автоматическая система коммитов для GitHub Desktop

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// ============================================
// Конфигурация
// ============================================

const CONFIG = {
  // Автоматические коммиты
  autoCommit: true,
  commitInterval: 300000, // 5 минут
  
  // Типы изменений для автоматического коммита
  autoCommitPatterns: [
    '*.md',
    '*.json',
    'lib/**/*.js',
    'api/**/*.js',
    'tests/**/*.js'
  ],
  
  // Исключения (не коммитить автоматически)
  excludePatterns: [
    '.env',
    '.env.local',
    'node_modules/**',
    '.vercel/**',
    'coverage/**'
  ],
  
  // Префиксы коммитов
  commitPrefixes: {
    feat: '✨ feat',
    fix: '🐛 fix',
    docs: '📚 docs',
    style: '💎 style',
    refactor: '♻️ refactor',
    test: '🧪 test',
    chore: '🔧 chore',
    perf: '⚡ perf',
    ci: '👷 ci',
    build: '📦 build'
  }
};

// ============================================
// Утилиты Git
// ============================================

class GitAutomation {
  constructor() {
    this.isRunning = false;
    this.lastCommitTime = Date.now();
  }
  
  async checkGitStatus() {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      return stdout.trim();
    } catch (error) {
      console.error('❌ Git status error:', error.message);
      return '';
    }
  }
  
  async getChangedFiles() {
    const status = await this.checkGitStatus();
    if (!status) return [];
    
    return status.split('\n').map(line => {
      const match = line.match(/^\s*[MADRCU?!]\s+(.+)$/);
      return match ? match[1] : null;
    }).filter(Boolean);
  }
  
  async analyzeChanges(files) {
    const changes = {
      feat: [],
      fix: [],
      docs: [],
      style: [],
      refactor: [],
      test: [],
      chore: [],
      perf: [],
      ci: [],
      build: []
    };
    
    for (const file of files) {
      // Определить тип изменения по пути файла
      if (file.includes('test')) {
        changes.test.push(file);
      } else if (file.endsWith('.md')) {
        changes.docs.push(file);
      } else if (file.includes('api/') || file.includes('lib/')) {
        // Проверить содержимое для определения типа
        const type = await this.detectChangeType(file);
        changes[type].push(file);
      } else if (file.includes('.github/')) {
        changes.ci.push(file);
      } else if (file === 'package.json' || file === 'package-lock.json') {
        changes.build.push(file);
      } else {
        changes.chore.push(file);
      }
    }
    
    return changes;
  }
  
  async detectChangeType(file) {
    try {
      const { stdout } = await execAsync(`git diff HEAD -- "${file}"`);
      const diff = stdout.toLowerCase();
      
      // Анализ diff для определения типа
      if (diff.includes('fix') || diff.includes('bug')) {
        return 'fix';
      } else if (diff.includes('new') || diff.includes('add')) {
        return 'feat';
      } else if (diff.includes('refactor') || diff.includes('rename')) {
        return 'refactor';
      } else if (diff.includes('performance') || diff.includes('optimize')) {
        return 'perf';
      }
      
      return 'chore';
    } catch (error) {
      return 'chore';
    }
  }
  
  generateCommitMessage(changes) {
    // Найти основной тип изменений
    const types = Object.entries(changes)
      .filter(([_, files]) => files.length > 0)
      .sort((a, b) => b[1].length - a[1].length);
    
    if (types.length === 0) return null;
    
    const [mainType, mainFiles] = types[0];
    const prefix = CONFIG.commitPrefixes[mainType];
    
    // Создать описание
    let description = '';
    
    if (mainType === 'feat') {
      description = `add new features (${mainFiles.length} files)`;
    } else if (mainType === 'fix') {
      description = `fix bugs (${mainFiles.length} files)`;
    } else if (mainType === 'docs') {
      description = `update documentation (${mainFiles.length} files)`;
    } else if (mainType === 'test') {
      description = `add/update tests (${mainFiles.length} files)`;
    } else if (mainType === 'refactor') {
      description = `refactor code (${mainFiles.length} files)`;
    } else {
      description = `update ${mainType} (${mainFiles.length} files)`;
    }
    
    // Добавить детали о других типах
    const otherTypes = types.slice(1, 3);
    if (otherTypes.length > 0) {
      const details = otherTypes.map(([type, files]) => 
        `${type}(${files.length})`
      ).join(', ');
      description += `\n\nAlso: ${details}`;
    }
    
    // Список измененных файлов
    const fileList = mainFiles.slice(0, 5).map(f => `- ${f}`).join('\n');
    if (mainFiles.length > 5) {
      description += `\n\nFiles:\n${fileList}\n... and ${mainFiles.length - 5} more`;
    } else {
      description += `\n\nFiles:\n${fileList}`;
    }
    
    return `${prefix}: ${description}`;
  }
  
  async createCommit(message) {
    try {
      // Добавить все изменения
      await execAsync('git add .');
      
      // Создать коммит
      await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`);
      
      console.log('✅ Commit created:', message.split('\n')[0]);
      return true;
    } catch (error) {
      console.error('❌ Commit error:', error.message);
      return false;
    }
  }
  
  async push() {
    try {
      await execAsync('git push');
      console.log('✅ Changes pushed to remote');
      return true;
    } catch (error) {
      console.error('❌ Push error:', error.message);
      return false;
    }
  }
  
  async autoCommitAndPush() {
    console.log('🔍 Checking for changes...');
    
    const files = await this.getChangedFiles();
    
    if (files.length === 0) {
      console.log('✨ No changes to commit');
      return;
    }
    
    console.log(`📝 Found ${files.length} changed files`);
    
    // Анализировать изменения
    const changes = await this.analyzeChanges(files);
    
    // Создать сообщение коммита
    const message = this.generateCommitMessage(changes);
    
    if (!message) {
      console.log('⚠️  No valid changes to commit');
      return;
    }
    
    // Создать коммит
    const committed = await this.createCommit(message);
    
    if (!committed) return;
    
    // Push в remote
    await this.push();
    
    this.lastCommitTime = Date.now();
  }
  
  async startAutoCommit() {
    if (this.isRunning) {
      console.log('⚠️  Auto-commit already running');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Auto-commit started');
    console.log(`⏱️  Interval: ${CONFIG.commitInterval / 1000}s`);
    
    // Первая проверка сразу
    await this.autoCommitAndPush();
    
    // Затем по интервалу
    this.interval = setInterval(async () => {
      await this.autoCommitAndPush();
    }, CONFIG.commitInterval);
  }
  
  stopAutoCommit() {
    if (this.interval) {
      clearInterval(this.interval);
      this.isRunning = false;
      console.log('🛑 Auto-commit stopped');
    }
  }
}

// ============================================
// Интеграция с GitHub Desktop
// ============================================

class GitHubDesktopIntegration {
  async openInGitHubDesktop() {
    try {
      const cwd = process.cwd();
      
      // Открыть в GitHub Desktop
      if (process.platform === 'win32') {
        await execAsync(`start github-desktop://openRepo/${cwd}`);
      } else if (process.platform === 'darwin') {
        await execAsync(`open github-desktop://openRepo/${cwd}`);
      } else {
        console.log('⚠️  GitHub Desktop integration not available on Linux');
      }
      
      console.log('✅ Opened in GitHub Desktop');
    } catch (error) {
      console.error('❌ Failed to open GitHub Desktop:', error.message);
    }
  }
  
  async createPullRequest(title, body) {
    try {
      const branch = await this.getCurrentBranch();
      
      // Открыть PR в GitHub Desktop
      const url = `github-desktop://pr/create?branch=${branch}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
      
      if (process.platform === 'win32') {
        await execAsync(`start "${url}"`);
      } else if (process.platform === 'darwin') {
        await execAsync(`open "${url}"`);
      }
      
      console.log('✅ Pull request dialog opened');
    } catch (error) {
      console.error('❌ Failed to create PR:', error.message);
    }
  }
  
  async getCurrentBranch() {
    const { stdout } = await execAsync('git branch --show-current');
    return stdout.trim();
  }
  
  async syncWithRemote() {
    try {
      // Fetch
      await execAsync('git fetch');
      
      // Pull
      await execAsync('git pull');
      
      console.log('✅ Synced with remote');
    } catch (error) {
      console.error('❌ Sync error:', error.message);
    }
  }
}

// ============================================
// Умные коммиты с AI
// ============================================

class SmartCommit {
  async generateSmartMessage(files) {
    // Анализ изменений с помощью AI (опционально)
    // Можно интегрировать с Groq для генерации умных сообщений
    
    const summary = await this.summarizeChanges(files);
    return summary;
  }
  
  async summarizeChanges(files) {
    // Получить diff для каждого файла
    const diffs = await Promise.all(
      files.map(async (file) => {
        try {
          const { stdout } = await execAsync(`git diff HEAD -- "${file}"`);
          return { file, diff: stdout };
        } catch {
          return { file, diff: '' };
        }
      })
    );
    
    // Создать краткое описание
    const summary = diffs
      .filter(d => d.diff)
      .map(d => {
        const lines = d.diff.split('\n');
        const added = lines.filter(l => l.startsWith('+')).length;
        const removed = lines.filter(l => l.startsWith('-')).length;
        return `${d.file}: +${added} -${removed}`;
      })
      .join('\n');
    
    return summary;
  }
}

// ============================================
// CLI
// ============================================

const git = new GitAutomation();
const github = new GitHubDesktopIntegration();
const smart = new SmartCommit();

const command = process.argv[2];

switch (command) {
  case 'start':
    git.startAutoCommit();
    break;
  
  case 'stop':
    git.stopAutoCommit();
    break;
  
  case 'commit':
    git.autoCommitAndPush();
    break;
  
  case 'open':
    github.openInGitHubDesktop();
    break;
  
  case 'pr':
    const title = process.argv[3] || 'New Pull Request';
    const body = process.argv[4] || 'Automated PR';
    github.createPullRequest(title, body);
    break;
  
  case 'sync':
    github.syncWithRemote();
    break;
  
  case 'smart':
    (async () => {
      const files = await git.getChangedFiles();
      const message = await smart.generateSmartMessage(files);
      console.log('Smart commit message:\n', message);
    })();
    break;
  
  default:
    console.log('Usage: node auto-commit.js <command>');
    console.log('\nCommands:');
    console.log('  start  - Start auto-commit (every 5 minutes)');
    console.log('  stop   - Stop auto-commit');
    console.log('  commit - Create commit now');
    console.log('  open   - Open in GitHub Desktop');
    console.log('  pr     - Create pull request');
    console.log('  sync   - Sync with remote');
    console.log('  smart  - Generate smart commit message');
    process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  git.stopAutoCommit();
  process.exit(0);
});

process.on('SIGTERM', () => {
  git.stopAutoCommit();
  process.exit(0);
});
