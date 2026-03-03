#!/usr/bin/env node
// Felix Academy - Complete System Test
// EGOIST ECOSYSTEM Edition

const https = require('https');

const BASE_URL = 'https://felix2-0.vercel.app';
const tests = [];
let passed = 0;
let failed = 0;

console.log('🧪 Felix Academy - Complete System Test');
console.log('⟁ EGOIST ECOSYSTEM Edition\n');
console.log('🔗 Testing:', BASE_URL);
console.log('='.repeat(60) + '\n');

// Test helper
async function test(name, url, expectedStatus = 200, checkBody = null) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
    
    https.get(fullUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === expectedStatus && 
                       (!checkBody || checkBody(data));
        
        if (success) {
          console.log(`✅ ${name}`);
          passed++;
        } else {
          console.log(`❌ ${name} (Status: ${res.statusCode})`);
          if (checkBody && data) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
          failed++;
        }
        resolve(success);
      });
    }).on('error', (error) => {
      console.log(`❌ ${name} (Error: ${error.message})`);
      failed++;
      resolve(false);
    });
  });
}

// Run tests
async function runTests() {
  console.log('📋 Testing Core Endpoints:\n');
  
  // 1. Main webhook
  await test(
    'Main Bot Webhook',
    '/api/webhook',
    200,
    (data) => data.includes('Felix Academy')
  );
  
  // 2. Referral bot
  await test(
    'Referral Bot Webhook',
    '/api/referral-bot',
    200,
    (data) => data.includes('Referral Bot')
  );
  
  // 3. MiniApp
  await test(
    'MiniApp Index',
    '/miniapp/index.html',
    200,
    (data) => data.includes('Felix Academy')
  );
  
  await test(
    'MiniApp Catalog',
    '/miniapp/catalog.html',
    200
  );
  
  await test(
    'MiniApp Partner Dashboard',
    '/miniapp/partner-dashboard.html',
    200
  );
  
  await test(
    'MiniApp Admin Panel',
    '/miniapp/admin-panel.html',
    200
  );
  
  console.log('\n📋 Testing API Endpoints:\n');
  
  // 4. Partner API
  await test(
    'Partner Info API',
    '/api/partner-enhanced/info?user_id=123456',
    200,
    (data) => {
      try {
        const json = JSON.parse(data);
        return json.hasOwnProperty('is_partner');
      } catch {
        return false;
      }
    }
  );
  
  // 5. Admin API (will fail without auth, but should return 403)
  await test(
    'Admin Stats API (Auth Check)',
    '/api/admin-enhanced/stats?admin_id=999999',
    403
  );
  
  console.log('\n📋 Testing Static Assets:\n');
  
  // 6. CSS
  await test(
    'Main CSS',
    '/miniapp/css/flagship-premium.css',
    200
  );
  
  // 7. JavaScript
  await test(
    'Footer JS (EGOIST)',
    '/miniapp/js/footer.js',
    200,
    (data) => data.includes('EGOIST ECOSYSTEM')
  );
  
  await test(
    'Partner Dashboard JS',
    '/miniapp/js/partner-dashboard.js',
    200
  );
  
  // 8. Logo
  await test(
    'EGOIST Logo SVG',
    '/miniapp/assets/egoist-logo.svg',
    200
  );
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed! System is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
  
  console.log('\n⟁ EGOIST ECOSYSTEM © 2026\n');
}

runTests();
