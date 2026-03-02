// Felix Bot v7.0 - Supabase Integration
import Groq from 'groq-sdk';
import { db } from '../lib/db.js';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROQ_KEY = process.env.GROQ_API_KEY;
const ADMIN_ID = parseInt(process.env.ADMIN_ID || '8264612178');
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix-black.vercel.app/miniapp/';
const LEARNING_API = `${process.env.VERCEL_URL || 'https://felix-black.vercel.app'}/api/learning`;

let groq;
try {
    groq = new Groq({ apiKey: GROQ_KEY });
} catch (e) {
    console.error('Groq initialization error:', e);
}

// In-memory cache для быстрого доступа (с TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

function setCache(key, value) {
    cache.set(key, { value, expires: Date.now() + CACHE_TTL });
}

function getCache(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
        cache.delete(key);
        return null;
    }
    return item.value;
}

// Добавить кнопку Mini App
function addMiniAppButton(buttons = []) {
    return [
        ...buttons,
        [{
            text: '📱 Открыть Felix App',
            web_app: { url: MINIAPP_URL }
        }]
    ];
}

// Отправить сообщение
async function send(chatId, text, buttons = []) {
    try {
        const body = { 
            chat_id: chatId, 
            text, 
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: addMiniAppButton(buttons) }
        };
        
        const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        if (!data.ok) {
            console.error('Telegram API error:', data);
        }
        return data;
    } catch (e) {
        console.error('Send error:', e);
        return { ok: false, error: e.message };
    }
}

// Обновить прогресс обучения
async function updateLearningProgress(userId, type, value = null) {
    try {
        const response = await fetch(LEARNING_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateActivity',
                userId,
                data: { type, value }
            })
        });
        
        if (!response.ok) {
            console.error('Learning API error:', response.status);
            return null;
        }
        
        const data = await response.json();
        
        // Уведомить о новых достижениях
        if (data.success && data.newAchievements?.length > 0) {
            for (const achievement of data.newAchievements) {
                await send(userId, 
                    `🎉 <b>Новое достижение!</b>\n\n` +
                    `${achievement.icon} <b>${achievement.name}</b>\n` +
                    `${achievement.description}\n\n` +
                    `+${achievement.xp} XP`
                );
            }
        }
        
        return data;
    } catch (e) {
        console.error('Learning update error:', e);
        return null;
    }
}

// AI запрос с персонализацией
async function ai(prompt, userId, context = {}) {
    try {
        if (!groq) {
            console.error('Groq not initialized');
            return 'AI временно недоступен. Попробуйте позже.';
        }

        // Получить настройки пользователя из БД
        const settings = await db.getUserSettings(userId);
        
        // Построить системный промпт
        let systemPrompt = 'You are Felix, an intelligent AI assistant. ';
        
        // Добавить стиль общения
        if (settings.ai_style === 'formal') {
            systemPrompt += 'Use formal, professional language. ';
        } else if (settings.ai_style === 'casual') {
            systemPrompt += 'Use casual, friendly language. ';
        }
        
        // Добавить контекст из истории
        if (context.recentTopics?.length > 0) {
            systemPrompt += `User's recent interests: ${context.recentTopics.join(', ')}. `;
        }
        
        systemPrompt += 'Always respond in Russian unless asked otherwise.';

        const startTime = Date.now();
        
        const response = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            model: settings.ai_model || 'llama-3.3-70b-versatile',
            temperature: settings.ai_temperature || 0.7,
            max_tokens: 1024
        });

        const latency = Date.now() - startTime;
        const content = response.choices[0]?.message?.content || 'Нет ответа';
        const tokens = response.usage?.total_tokens || 0;

        return { content, latency, tokens };
    } catch (e) {
        console.error('AI error:', e);
        return { 
            content: 'Произошла ошибка при обработке запроса. Попробуйте еще раз.', 
            latency: 0, 
            tokens: 0 
        };
    }
}

// Получить или создать пользователя
async function getOrCreateUser(telegramUser) {
    const cacheKey = `user:${telegramUser.id}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const user = await db.getOrCreateUser(telegramUser);
        setCache(cacheKey, user);
        return user;
    } catch (e) {
        console.error('Error getting user:', e);
        return null;
    }
}

// Анализ текста для персонализации
function analyzeText(text) {
    const analysis = {
        style: 'mixed',
        topics: [],
        sentiment: 'neutral'
    };

    const lowerText = text.toLowerCase();
    
    // Определить стиль
    const formalWords = ['пожалуйста', 'спасибо', 'благодарю', 'извините'];
    const casualWords = ['привет', 'пока', 'ок', 'круто', 'класс'];
    
    const formalCount = formalWords.filter(w => lowerText.includes(w)).length;
    const casualCount = casualWords.filter(w => lowerText.includes(w)).length;
    
    if (formalCount > casualCount) analysis.style = 'formal';
    else if (casualCount > formalCount) analysis.style = 'casual';
    
    // Извлечь темы (слова длиннее 4 символов)
    const words = lowerText
        .replace(/[^\wа-яё\s]/gi, '')
        .split(/\s+/)
        .filter(w => w.length > 4);
    
    analysis.topics = [...new Set(words)].slice(0, 5);
    
    return analysis;
}

// Модерация контента
function moderate(text) {
    // Проверка на спам (повторяющиеся символы)
    if (/(.)\1{5,}/.test(text)) {
        return { ok: false, reason: 'spam', action: 'warn' };
    }
    
    // Проверка на CAPS
    const capsRatio = (text.match(/[A-ZА-Я]/g) || []).length / text.length;
    if (capsRatio > 0.7 && text.length > 10) {
        return { ok: false, reason: 'excessive_caps', action: 'warn' };
    }
    
    // Проверка на запрещенные слова (базовая)
    const bannedWords = ['spam', 'реклама'];
    const hasBanned = bannedWords.some(word => text.toLowerCase().includes(word));
    if (hasBanned) {
        return { ok: false, reason: 'banned_content', action: 'delete' };
    }
    
    return { ok: true };
}

// Обработчик callback query
async function handleCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    try {
        // Получить пользователя
        const user = await getOrCreateUser(callbackQuery.from);
        if (!user) {
            await send(chatId, '❌ Ошибка получения данных пользователя');
            return;
        }

        // Получить статистику
        const stats = await db.getUserStats(userId);

        if (data === 'help') {
            const buttons = [
                [{text: '🤖 AI Команды', callback_data: 'ai_cmds'}],
                [{text: '👤 Профиль', callback_data: 'profile'}, {text: '📊 Статистика', callback_data: 'stats'}],
                [{text: '⚙️ Настройки', callback_data: 'settings'}]
            ];
            await send(chatId, '📚 <b>Felix Bot v7.0</b>\n\nВыберите раздел:', buttons);
        }
        
        else if (data === 'ai_cmds') {
            const buttons = [
                [{text: '💬 Задать вопрос', callback_data: 'cmd_ask'}],
                [{text: '📝 Краткое содержание', callback_data: 'cmd_summary'}, {text: '🔍 Анализ', callback_data: 'cmd_analyze'}],
                [{text: '✨ Генерация', callback_data: 'cmd_generate'}, {text: '🌐 Перевод', callback_data: 'cmd_translate'}],
                [{text: '✍️ Улучшить', callback_data: 'cmd_improve'}, {text: '💡 Идеи', callback_data: 'cmd_brainstorm'}],
                [{text: '📖 Объяснить', callback_data: 'cmd_explain'}],
                [{text: '« Назад', callback_data: 'help'}]
            ];
            await send(chatId, '🤖 <b>AI Команды</b>\n\nВыберите команду:', buttons);
        }
        
        else if (data === 'profile') {
            const settings = await db.getUserSettings(userId);
            const tags = await db.getTagsForUser(userId);
            
            const styleEmoji = settings.ai_style === 'formal' ? '🎩' : '😎';
            
            let msg = `👤 <b>Ваш профиль</b>\n\n`;
            msg += `📊 Всего сообщений: ${stats.total_messages || 0}\n`;
            msg += `${styleEmoji} Стиль: ${settings.ai_style || 'mixed'}\n`;
            msg += `🤖 Модель: ${settings.ai_model || 'llama-3.3-70b-versatile'}\n`;
            
            if (tags.length > 0) {
                msg += `\n🎯 <b>Ваши интересы:</b>\n`;
                tags.slice(0, 5).forEach(tag => {
                    msg += `• ${tag.name} (${tag.count})\n`;
                });
            }
            
            await send(chatId, msg, [[{text: '« Назад', callback_data: 'help'}]]);
        }
        
        else if (data === 'stats') {
            let msg = `📊 <b>Статистика</b>\n\n`;
            msg += `💬 Всего сообщений: ${stats.total_messages || 0}\n`;
            msg += `📝 Текстовых: ${stats.by_type?.text || 0}\n`;
            msg += `🎤 Голосовых: ${stats.by_type?.voice || 0}\n`;
            msg += `🖼 Изображений: ${stats.by_type?.image || 0}\n`;
            msg += `📄 Документов: ${stats.by_type?.document || 0}\n\n`;
            msg += `⚡ Токенов использовано: ${stats.total_tokens || 0}\n`;
            msg += `⏱ Среднее время ответа: ${stats.avg_response_time || 0}ms`;
            
            await send(chatId, msg, [[{text: '« Назад', callback_data: 'help'}]]);
        }
        
        else if (data === 'settings') {
            const settings = await db.getUserSettings(userId);
            
            let msg = `⚙️ <b>Настройки</b>\n\n`;
            msg += `🤖 Модель: ${settings.ai_model || 'llama-3.3-70b-versatile'}\n`;
            msg += `🌡 Температура: ${settings.ai_temperature || 0.7}\n`;
            msg += `💬 Стиль: ${settings.ai_style || 'mixed'}\n`;
            msg += `🎨 Тема: ${settings.theme || 'auto'}\n`;
            msg += `🔔 Уведомления: ${settings.notifications_enabled ? 'Вкл' : 'Выкл'}\n\n`;
            msg += `Для изменения настроек используйте Mini App`;
            
            await send(chatId, msg, [[{text: '« Назад', callback_data: 'help'}]]);
        }
        
        else if (data.startsWith('cmd_')) {
            const cmd = data.replace('cmd_', '');
            const cmdInfo = {
                ask: { name: 'Задать вопрос', example: 'что такое AI?' },
                summary: { name: 'Краткое содержание', example: '[ваш длинный текст]' },
                analyze: { name: 'Анализ текста', example: '[текст для анализа]' },
                generate: { name: 'Генерация контента', example: 'статья про космос' },
                translate: { name: 'Перевод текста', example: 'hello world' },
                improve: { name: 'Улучшить текст', example: '[текст для улучшения]' },
                brainstorm: { name: 'Генерация идей', example: 'стартап в сфере AI' },
                explain: { name: 'Объяснение', example: 'квантовая физика' }
            };
            
            const info = cmdInfo[cmd];
            if (info) {
                await send(chatId, 
                    `📝 <b>${info.name}</b>\n\n` +
                    `Использование:\n<code>/${cmd} ${info.example}</code>`,
                    [[{text: '« Назад', callback_data: 'ai_cmds'}]]
                );
            }
        }
    } catch (e) {
        console.error('Callback handler error:', e);
        await send(chatId, '❌ Произошла ошибка. Попробуйте позже.');
    }
}

// Обработчик команд
async function handleCommand(message) {
    const { chat: { id: chatId, type }, from, text } = message;
    const userId = from.id;
    const isGroup = type !== 'private';
    
    const [cmd, ...args] = text.split(' ');
    const arg = args.join(' ');

    try {
        // Получить пользователя
        const user = await getOrCreateUser(from);
        if (!user) {
            await send(chatId, '❌ Ошибка инициализации пользователя');
            return;
        }

        // Сохранить команду в БД
        await db.saveMessage(userId, 'user', text, 'command');
        
        // Обновить прогресс
        await updateLearningProgress(userId, 'command');

        // /start
        if (cmd === '/start') {
            const msg = 
                `👋 Привет, ${from.first_name}!\n\n` +
                `🤖 Я Felix v7.0 - AI-ассистент с персонализацией.\n\n` +
                `✨ Я адаптируюсь под ваш стиль и запоминаю интересы.\n` +
                `📊 Вся история сохраняется в защищенной БД.\n\n` +
                `📱 Откройте Mini App для полного функционала!`;
            
            await send(chatId, msg, [[{text: '📚 Помощь', callback_data: 'help'}]]);
            await db.saveMessage(userId, 'assistant', msg, 'text');
            return;
        }

        // /help
        if (cmd === '/help') {
            const buttons = [
                [{text: '🤖 AI Команды', callback_data: 'ai_cmds'}],
                [{text: '👤 Профиль', callback_data: 'profile'}, {text: '📊 Статистика', callback_data: 'stats'}],
                [{text: '⚙️ Настройки', callback_data: 'settings'}]
            ];
            await send(chatId, '📚 <b>Felix Bot v7.0</b>\n\nВыберите раздел:', buttons);
            return;
        }

        // /profile
        if (cmd === '/profile') {
            const stats = await db.getUserStats(userId);
            const settings = await db.getUserSettings(userId);
            const tags = await db.getTagsForUser(userId);
            
            const styleEmoji = settings.ai_style === 'formal' ? '🎩' : '😎';
            
            let msg = `👤 <b>Ваш профиль</b>\n\n`;
            msg += `📊 Всего сообщений: ${stats.total_messages || 0}\n`;
            msg += `${styleEmoji} Стиль: ${settings.ai_style || 'mixed'}\n`;
            
            if (tags.length > 0) {
                msg += `\n🎯 <b>Ваши интересы:</b>\n`;
                tags.slice(0, 5).forEach(tag => {
                    msg += `• ${tag.name} (${tag.count})\n`;
                });
            }
            
            await send(chatId, msg);
            return;
        }

        // /stats
        if (cmd === '/stats') {
            const stats = await db.getUserStats(userId);
            
            let msg = `📊 <b>Статистика</b>\n\n`;
            msg += `💬 Всего сообщений: ${stats.total_messages || 0}\n`;
            msg += `📝 Текстовых: ${stats.by_type?.text || 0}\n`;
            msg += `🎤 Голосовых: ${stats.by_type?.voice || 0}\n`;
            msg += `⚡ Токенов: ${stats.total_tokens || 0}\n`;
            msg += `⏱ Среднее время: ${stats.avg_response_time || 0}ms`;
            
            await send(chatId, msg);
            return;
        }

        // /admin
        if (cmd === '/admin') {
            if (userId !== ADMIN_ID) {
                await send(chatId, '❌ Доступ запрещен');
                return;
            }
            
            await send(chatId, 
                '🔐 <b>Admin Panel</b>\n\n' +
                'Добро пожаловать, администратор!\n\n' +
                'Управление:\n' +
                '• 📝 Заявки на партнерство\n' +
                '• 🎓 Курсы академии\n' +
                '• 🤝 Партнеры\n' +
                '• 👥 Прогресс пользователей',
                [[{text: '🔐 Открыть Admin Panel', web_app: {url: `${MINIAPP_URL}admin.html`}}]]
            );
            return;
        }

        // AI команды
        if (!arg) {
            await send(chatId, '❌ Укажите текст после команды');
            return;
        }

        // Получить контекст пользователя
        const tags = await db.getTagsForUser(userId);
        const context = {
            recentTopics: tags.slice(0, 5).map(t => t.name)
        };

        let aiPrompt = '';
        let responsePrefix = '';

        switch (cmd) {
            case '/ask':
                aiPrompt = arg;
                responsePrefix = '💬 <b>Ответ:</b>\n\n';
                break;
            case '/summary':
                aiPrompt = `Сделай краткое содержание: ${arg}`;
                responsePrefix = '📝 <b>Краткое содержание:</b>\n\n';
                break;
            case '/analyze':
                aiPrompt = `Проанализируй тональность и ключевые моменты: ${arg}`;
                responsePrefix = '🔍 <b>Анализ:</b>\n\n';
                break;
            case '/generate':
                aiPrompt = `Сгенерируй контент на тему: ${arg}`;
                responsePrefix = '✨ <b>Сгенерировано:</b>\n\n';
                break;
            case '/translate':
                aiPrompt = `Переведи на английский: ${arg}`;
                responsePrefix = '🌐 <b>Перевод:</b>\n\n';
                break;
            case '/improve':
                aiPrompt = `Улучши текст, сделай профессиональнее: ${arg}`;
                responsePrefix = '✍️ <b>Улучшенный текст:</b>\n\n';
                break;
            case '/brainstorm':
                aiPrompt = `Сгенерируй 5 креативных идей: ${arg}`;
                responsePrefix = '💡 <b>Идеи:</b>\n\n';
                break;
            case '/explain':
                aiPrompt = `Объясни простыми словами: ${arg}`;
                responsePrefix = '📖 <b>Объяснение:</b>\n\n';
                break;
            default:
                await send(chatId, '❓ Неизвестная команда', [[{text: '📚 Помощь', callback_data: 'help'}]]);
                return;
        }

        // Получить AI ответ
        const aiResponse = await ai(aiPrompt, userId, context);
        const responseText = responsePrefix + aiResponse.content;
        
        // Отправить ответ
        await send(chatId, responseText);
        
        // Сохранить в БД
        await db.saveMessage(userId, 'assistant', responseText, 'text', {
            tokens: aiResponse.tokens,
            latency: aiResponse.latency,
            model: 'llama-3.3-70b-versatile'
        });
        
        // Анализ и сохранение тегов
        const analysis = analyzeText(arg);
        if (analysis.topics.length > 0) {
            const messageId = (await db.getHistory(userId, { limit: 1 })).messages[0]?.id;
            if (messageId) {
                await db.saveTags(messageId, analysis.topics);
            }
        }

    } catch (e) {
        console.error('Command handler error:', e);
        await send(chatId, '❌ Произошла ошибка при обработке команды');
    }
}

// Обработчик обычных сообщений
async function handleMessage(message) {
    const { chat: { id: chatId, type }, from, text } = message;
    const userId = from.id;
    const isGroup = type !== 'private';

    try {
        // Получить пользователя
        const user = await getOrCreateUser(from);
        if (!user) return;

        // Модерация в группах
        if (isGroup) {
            const modResult = moderate(text);
            if (!modResult.ok) {
                await send(chatId, `⚠️ Нарушение правил: ${modResult.reason}`);
                return;
            }
        }

        // Сохранить сообщение
        await db.saveMessage(userId, 'user', text, 'text');
        
        // Обновить прогресс
        await updateLearningProgress(userId, 'message');

        // Анализ текста
        const analysis = analyzeText(text);
        
        // Получить контекст
        const tags = await db.getTagsForUser(userId);
        const context = {
            recentTopics: tags.slice(0, 5).map(t => t.name)
        };

        // AI ответ
        const aiResponse = await ai(text, userId, context);
        
        // Отправить ответ
        await send(chatId, aiResponse.content);
        
        // Сохранить ответ
        const savedMessage = await db.saveMessage(userId, 'assistant', aiResponse.content, 'text', {
            tokens: aiResponse.tokens,
            latency: aiResponse.latency
        });
        
        // Сохранить теги
        if (analysis.topics.length > 0 && savedMessage?.id) {
            await db.saveTags(savedMessage.id, analysis.topics);
        }

    } catch (e) {
        console.error('Message handler error:', e);
        await send(chatId, '❌ Произошла ошибка. Попробуйте позже.');
    }
}

// Главный обработчик
export default async function handler(req, res) {
    // Health check
    if (req.method === 'GET') {
        return res.json({ 
            status: 'ok', 
            bot: 'Felix v7.0',
            timestamp: new Date().toISOString()
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, callback_query } = req.body;

        // Обработка callback query
        if (callback_query) {
            await handleCallback(callback_query);
            return res.json({ ok: true });
        }

        // Проверка сообщения
        if (!message?.text) {
            return res.json({ ok: true });
        }

        // Обработка команд
        if (message.text.startsWith('/')) {
            await handleCommand(message);
        } else {
            // Обработка обычных сообщений
            await handleMessage(message);
        }

        return res.json({ ok: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
