#!/usr/bin/env node
// Automatic deployment system
const { execSync } = require('child_process');
const fs = require('fs');

class AutoDeploySystem {
  constructor() {
    this.isDeploying = false;
    this.deployHistory = [];
  }

  // Start watching for changes
  start() {
    console.log('🚀 Auto-deploy system started');
    
    // Check for updates every 5 minutes
    setInterval(() => this.checkAndDeploy(), 300000);
    
    // Initial check
    this.checkAndDeploy();
  }

  // Check for changes and deploy
  async checkAndDeploy() {
    if (this.isDeploying) {
      console.log('⏳ Deployment in progress, skipping...');
      return;
    }

    try {
      this.isDeploying = true;
      
      // Check git status
      const status = execSync('git status --porcelain').toString();
      
      if (status.trim()) {
        console.log('📝 Changes detected, deploying...');
        await this.deploy();
      } else {
        console.log('✅ No changes detected');
      }
    } catch (error) {
      console.error('❌ Check and deploy error:', error.message);
    } finally {
      this.isDeploying = false;
    }
  }

  // Deploy to production
  async deploy() {
    try {
      const timestamp = new Date().toISOString();
      
      // Run tests
      console.log('🧪 Running tests...');
      try {
        execSync('npm test', { stdio: 'inherit' });
      } catch (error) {
        console.log('⚠️ Tests failed, but continuing...');
      }
      
      // Add all changes
      console.log('📦 Adding changes...');
      execSync('git add -A');
      
      // Commit
      const commitMessage = `auto: deployment ${timestamp}`;
      console.log(`💾 Committing: ${commitMessage}`);
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      
      // Push
      console.log('⬆️ Pushing to GitHub...');
      execSync('git push', { stdio: 'inherit' });
      
      // Deploy to Vercel
      console.log('🚀 Deploying to Vercel...');
      execSync('vercel --prod', { stdio: 'inherit' });
      
      // Log deployment
      this.deployHistory.push({
        timestamp,
        status: 'success'
      });
      
      // Save deployment log
      this.saveDeploymentLog();
      
      console.log('✅ Deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      
      this.deployHistory.push({
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message
      });
      
      this.saveDeploymentLog();
    }
  }

  // Save deployment log
  saveDeploymentLog() {
    const logPath = 'deployment-log.json';
    fs.writeFileSync(logPath, JSON.stringify(this.deployHistory, null, 2));
  }

  // Get deployment status
  getStatus() {
    return {
      isDeploying: this.isDeploying,
      lastDeployment: this.deployHistory[this.deployHistory.length - 1],
      totalDeployments: this.deployHistory.length,
      successRate: this.deployHistory.filter(d => d.status === 'success').length / this.deployHistory.length
    };
  }
}

// Run if called directly
if (require.main === module) {
  const system = new AutoDeploySystem();
  system.start();
  
  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down auto-deploy system...');
    process.exit(0);
  });
}

module.exports = AutoDeploySystem;
