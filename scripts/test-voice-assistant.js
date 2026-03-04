#!/usr/bin/env node
// Test Voice Assistant API
require('dotenv').config();
const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test-user-123';

console.log('🎙️ Testing Voice Assistant API\n');

// Test 1: LLM only (text generation)
async function testLLM() {
  console.log('1️⃣ Testing LLM (text generation)...');
  
  const data = JSON.stringify({
    action: 'llm',
    message: 'Привет! Расскажи кратко, что такое JavaScript?',
    systemPrompt: 'Ты дружелюбный учитель программирования. Отвечай кратко, максимум 2-3 предложения.'
  });

  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/voice-assistant`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-User-Id': TEST_USER_ID
      }
    };

    const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success) {
            console.log('✅ LLM Response:', result.text);
            console.log('');
            resolve(result);
          } else {
            console.error('❌ LLM Error:', result.error);
            reject(new Error(result.error));
          }
        } catch (e) {
          console.error('❌ Parse error:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

// Test 2: TTS only (text to speech)
async function testTTS() {
  console.log('2️⃣ Testing TTS (text to speech)...');
  
  const data = JSON.stringify({
    action: 'tts',
    text: 'Привет! Я голосовой помощник Felix Academy.',
    voice: 'Jarvis',
    speed: 1.0
  });

  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/voice-assistant`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-User-Id': TEST_USER_ID
      }
    };

    const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      if (res.headers['content-type'] === 'audio/mpeg') {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const audioBuffer = Buffer.concat(chunks);
          const outputPath = './test-tts-output.mp3';
          fs.writeFileSync(outputPath, audioBuffer);
          console.log(`✅ TTS Audio saved to: ${outputPath}`);
          console.log(`   Size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
          console.log('');
          resolve(audioBuffer);
        });
      } else {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            console.error('❌ TTS Error:', result.error);
            reject(new Error(result.error));
          } catch (e) {
            console.error('❌ Unexpected response:', body);
            reject(e);
          }
        });
      }
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

// Test 3: Check Groq API key
function testGroqKey() {
  console.log('3️⃣ Checking Groq API key...');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in .env');
    console.log('   Please add: GROQ_API_KEY=gsk_your_key_here');
    return false;
  }
  
  if (!process.env.GROQ_API_KEY.startsWith('gsk_')) {
    console.error('❌ Invalid GROQ_API_KEY format (should start with gsk_)');
    return false;
  }
  
  console.log('✅ GROQ_API_KEY found:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
  console.log('');
  return true;
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Voice Assistant API Test Suite');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Check API key first
  if (!testGroqKey()) {
    console.log('\n❌ Tests aborted: Missing or invalid GROQ_API_KEY\n');
    process.exit(1);
  }
  
  let passed = 0;
  let failed = 0;
  
  // Test LLM
  try {
    await testLLM();
    passed++;
  } catch (e) {
    failed++;
  }
  
  // Test TTS
  try {
    await testTTS();
    passed++;
  } catch (e) {
    failed++;
  }
  
  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════\n');
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Voice Assistant is ready.\n');
    console.log('Next steps:');
    console.log('1. Open miniapp/voice-assistant.html in your browser');
    console.log('2. Or add to Telegram Mini App menu');
    console.log('3. Start talking to your voice assistant!\n');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err.message);
  process.exit(1);
});
