# 5. Real-time обновления

## Проблема
- ❌ Нет real-time обновлений в Mini App
- ❌ Нужно обновлять страницу для новых данных
- ❌ Нет live уведомлений

## Решение

### Вариант 1: Server-Sent Events (SSE)

#### Преимущества
- ✅ Простая реализация
- ✅ Работает с Vercel Serverless
- ✅ Автоматическое переподключение
- ✅ Односторонняя связь (сервер → клиент)

#### Реализация

```javascript
// api/events.js
export default async function handler(req, res) {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }
  
  // Setup SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);
  
  // Heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
  }, 30000);
  
  // Check for updates periodically
  const updateInterval = setInterval(async () => {
    try {
      // Check for new messages, achievements, etc.
      const updates = await checkForUpdates(userId);
      
      if (updates.length > 0) {
        updates.forEach(update => {
          res.write(`data: ${JSON.stringify(update)}\n\n`);
        });
      }
    } catch (error) {
      console.error('SSE update error:', error);
    }
  }, 5000);
  
  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    clearInterval(updateInterval);
    res.end();
  });
}

async function checkForUpdates(userId) {
  // Check database for new data
  // Return array of updates
  return [];
}
```

#### Клиент

```javascript
// miniapp/js/sse-client.js
class SSEClient {
  constructor(userId) {
    this.userId = userId;
    this.eventSource = null;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
  }
  
  connect() {
    this.eventSource = new EventSource(`/api/events?userId=${this.userId}`);
    
    this.eventSource.onopen = () => {
      console.log('SSE connected');
      this.reconnectDelay = 1000;
    };
    
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleUpdate(data);
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.eventSource.close();
      this.reconnect();
    };
  }
  
  handleUpdate(data) {
    switch (data.type) {
      case 'connected':
        console.log('Connected to SSE');
        break;
      
      case 'heartbeat':
        // Connection alive
        break;
      
      case 'new_message':
        this.onNewMessage(data);
        break;
      
      case 'achievement_unlocked':
        this.onAchievement(data);
        break;
      
      case 'stats_updated':
        this.onStatsUpdate(data);
        break;
    }
  }
  
  reconnect() {
    setTimeout(() => {
      console.log('Reconnecting SSE...');
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }, this.reconnectDelay);
  }
  
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
  
  onNewMessage(data) {
    // Update UI with new message
    console.log('New message:', data);
  }
  
  onAchievement(data) {
    // Show achievement notification
    showNotification('🏆 Достижение разблокировано!', data.achievement);
  }
  
  onStatsUpdate(data) {
    // Update stats in UI
    updateStats(data.stats);
  }
}

// Usage
const sseClient = new SSEClient(userId);
sseClient.connect();
```

### Вариант 2: Pusher (Рекомендуется)

#### Преимущества
- ✅ Полноценный real-time
- ✅ Двусторонняя связь
- ✅ Каналы и приватные каналы
- ✅ Presence (кто онлайн)
- ✅ Бесплатный тариф (100 подключений)

#### Установка

```bash
npm install pusher pusher-js
```

#### Сервер

```javascript
// lib/pusher.js
import Pusher from 'pusher';

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Отправить событие пользователю
export async function sendToUser(userId, event, data) {
  await pusher.trigger(`user-${userId}`, event, data);
}

// Отправить событие в группу
export async function sendToGroup(groupId, event, data) {
  await pusher.trigger(`group-${groupId}`, event, data);
}

// Broadcast всем
export async function broadcast(event, data) {
  await pusher.trigger('global', event, data);
}
```

#### Использование в webhook

```javascript
// api/webhook.js
import { sendToUser } from '../lib/pusher.js';

// После обработки сообщения
await sendToUser(userId, 'new-message', {
  role: 'assistant',
  content: response.content,
  timestamp: Date.now()
});

// При разблокировке достижения
await sendToUser(userId, 'achievement-unlocked', {
  achievement: 'first_message',
  title: 'Первое сообщение',
  icon: '💬'
});
```

#### Клиент

```javascript
// miniapp/js/pusher-client.js
import Pusher from 'pusher-js';

class PusherClient {
  constructor(userId) {
    this.userId = userId;
    this.pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER
    });
    
    this.userChannel = this.pusher.subscribe(`user-${userId}`);
    this.globalChannel = this.pusher.subscribe('global');
    
    this.setupListeners();
  }
  
  setupListeners() {
    // User-specific events
    this.userChannel.bind('new-message', (data) => {
      this.onNewMessage(data);
    });
    
    this.userChannel.bind('achievement-unlocked', (data) => {
      this.onAchievement(data);
    });
    
    this.userChannel.bind('stats-updated', (data) => {
      this.onStatsUpdate(data);
    });
    
    // Global events
    this.globalChannel.bind('announcement', (data) => {
      this.onAnnouncement(data);
    });
  }
  
  onNewMessage(data) {
    // Add message to chat
    const messageEl = document.createElement('div');
    messageEl.className = 'message assistant';
    messageEl.textContent = data.content;
    document.getElementById('messages').appendChild(messageEl);
    
    // Scroll to bottom
    messageEl.scrollIntoView({ behavior: 'smooth' });
  }
  
  onAchievement(data) {
    // Show achievement popup
    showAchievementPopup(data);
    
    // Update achievements list
    updateAchievementsList();
  }
  
  onStatsUpdate(data) {
    // Update stats in UI
    document.getElementById('totalMessages').textContent = data.totalMessages;
    document.getElementById('xpBar').style.width = `${data.xpProgress}%`;
  }
  
  onAnnouncement(data) {
    // Show announcement banner
    showBanner(data.message, data.type);
  }
  
  disconnect() {
    this.pusher.disconnect();
  }
}

// Usage
const pusherClient = new PusherClient(userId);
```

### Вариант 3: Polling (Fallback)

```javascript
// miniapp/js/polling.js
class PollingClient {
  constructor(userId, interval = 5000) {
    this.userId = userId;
    this.interval = interval;
    this.lastUpdate = Date.now();
    this.polling = false;
  }
  
  start() {
    this.polling = true;
    this.poll();
  }
  
  stop() {
    this.polling = false;
  }
  
  async poll() {
    if (!this.polling) return;
    
    try {
      const res = await fetch(`/api/updates?userId=${this.userId}&since=${this.lastUpdate}`);
      const updates = await res.json();
      
      if (updates.length > 0) {
        updates.forEach(update => this.handleUpdate(update));
        this.lastUpdate = Date.now();
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
    
    setTimeout(() => this.poll(), this.interval);
  }
  
  handleUpdate(update) {
    // Handle update
  }
}
```

## Сравнение вариантов

| Критерий | SSE | Pusher | Polling |
|----------|-----|--------|---------|
| Сложность | Средняя | Низкая | Низкая |
| Latency | ~1-2s | <100ms | 5-10s |
| Нагрузка | Средняя | Низкая | Высокая |
| Стоимость | Бесплатно | Бесплатно (лимит) | Бесплатно |
| Serverless | ✅ | ✅ | ✅ |
| Двусторонняя связь | ❌ | ✅ | ❌ |

## Рекомендация

**Для Felix Bot:** Использовать **Pusher**
- Простая интеграция
- Низкая latency
- Бесплатный тариф достаточен
- Presence и каналы

## Трудозатраты
1-2 дня на интеграцию Pusher

## Приоритет
🟢 Низкий (но улучшает UX)
