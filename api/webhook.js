// Felix Bot v5.0 - Self-Learning AI Admin & Group Concierge
import Groq from 'groq-sdk';
import userLearning from '../lib/user-learning.js';
import groupAdmin from '../lib/group-admin.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const groq = new Groq({ apiKey: GROQ_API_KEY });

async function sendMessage(chatId, text, options = {}) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: options.parse_mode || 'HTML', ...options })
    });
    return response.json();
}

async function deleteMessage(chatId, messageId) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ chat_id: chatId, message_id: messageId }) });
}

async function banUser(chatId, userId, duration = 86400) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/banChatMember`;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ chat_id: chatId, user_id: userId, until_date: Math.floor(Date.now() / 1000) + duration }) });
}

async function getAIResponse(prompt, userId) {
    const personalPrompt = userLearning.getPersonalizedPrompt(userId);
    const completion = await groq.chat.completions.create({
        messages: [{ role: 'system', content: personalPrompt }, { role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile', temperature: 0.7, max_tokens: 1024
    });
    return completion.choices[0]?.message?.content || 'Извините, не могу ответить.';
}

async function handleStart(chatId, userId, username, firstName) {
    userLearning.getProfile(userId, username, firstName);
    await sendMessage(chatId, `👋 Привет! Я Felix - умный AI-ассистент с самообучением!\n\n🧠 Я умею адаптироваться под ваш стиль, модерировать группы, отвечать на вопросы!\n\n📝 Команды: /help /profile /ask\n\nПросто начните общаться! 🚀`);
}

async function handleHelp(chatId, isGroup) {
    let msg = `📚 Felix Bot v5.0\n\n🤖 AI: /ask /summary /analyze /generate /translate /improve /brainstorm /explain\n\n👤 Профиль: /profile /stats`;
    if (isGroup) msg += `\n\n👥 Группа: /groupstats`;
    await sendMessage(chatId, msg);
}

async function handleProfile(chatId, userId) {
    const stats = userLearning.getUserStats(userId);
    const emoji = stats.style.formality === 'formal' ? '🎩' : stats.style.formality === 'casual' ? '😎' : '🤝';
    let msg = `👤 Профиль\n\n📊 Прогресс: ${stats.learningScore}%\n💬 Сообщений: ${stats.totalMessages}\n${emoji} Стиль: ${stats.style.formality}`;
    if (stats.topTopics.length > 0) {
        msg += `\n\n🎯 Интересы:\n`;
        stats.topTopics.slice(0, 5).forEach(([topic, count]) => msg += `• ${topic} (${count})\n`);
    }
    await sendMessage(chatId, msg);
}

async function handleGroupStats(chatId, groupId, userId) {
    if (!groupAdmin.isAdmin(groupId, userId)) {
        await sendMessage(chatId, '❌ Только для админов');
        return;
    }
    const stats = groupAdmin.getGroupStats(groupId);
    await sendMessage(chatId, `📊 Статистика\n\n💬 Сообщений: ${stats.totalMessages}\n👥 Активных: ${stats.activeUsers}`);
}

async function handleAICommand(chatId, userId, command, text, prompt) {
    if (!text) {
        await sendMessage(chatId, `❓ Использование: ${command} [текст]`);
        return;
    }
    userLearning.trackCommand(userId, command);
    const response = await getAIResponse(prompt + text, userId);
    await sendMessage(chatId, response);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).json({ ok: true });
    try {
        const update = req.body;
        if (update.message?.new_chat_members) {
            const welcome = groupAdmin.getWelcomeMessage(update.message.chat.id);
            if (welcome) await sendMessage(update.message.chat.id, welcome);
            return res.status(200).json({ ok: true });
        }
        if (!update.message?.text) return res.status(200).json({ ok: true });
        
        const { chat: { id: chatId, type }, from: { id: userId, username = '', first_name: firstName = '' }, text, message_id } = update.message;
        const isGroup = type !== 'private';
        
        userLearning.getProfile(userId, username, firstName);
        userLearning.analyzeMessage(userId, text);
        
        if (isGroup) {
            groupAdmin.updateStats(chatId, userId);
            const modResult = await groupAdmin.moderateMessage(chatId, userId, text);
            if (!modResult.allowed) {
                await deleteMessage(chatId, message_id);
                const warnResult = await groupAdmin.warnUser(chatId, userId, modResult.violations);
                if (warnResult.action === 'ban') {
                    await banUser(chatId, userId);
                    await sendMessage(chatId, `🚫 Забанен (${warnResult.warnings}/${warnResult.limit})`);
                } else {
                    await sendMessage(chatId, `⚠️ Предупреждение ${warnResult.warnings}/${warnResult.limit}`);
                }
                return res.status(200).json({ ok: true });
            }
        }
        
        if (text.startsWith('/')) {
            const [cmd, ...args] = text.split(' ');
            const arg = args.join(' ');
            switch (cmd) {
                case '/start': await handleStart(chatId, userId, username, firstName); break;
                case '/help': await handleHelp(chatId, isGroup); break;
                case '/profile': await handleProfile(chatId, userId); break;
                case '/groupstats': if (isGroup) await handleGroupStats(chatId, chatId, userId); break;
                case '/ask': await handleAICommand(chatId, userId, cmd, arg, ''); break;
                case '/summary': await handleAICommand(chatId, userId, cmd, arg, 'Summarize in Russian:\n'); break;
                case '/analyze': await handleAICommand(chatId, userId, cmd, arg, 'Analyze in Russian:\n'); break;
                case '/generate': await handleAICommand(chatId, userId, cmd, arg, 'Generate in Russian about: '); break;
                case '/translate': await handleAICommand(chatId, userId, cmd, arg, 'Translate:\n'); break;
                case '/improve': await handleAICommand(chatId, userId, cmd, arg, 'Improve in Russian:\n'); break;
                case '/brainstorm': await handleAICommand(chatId, userId, cmd, arg, 'Brainstorm in Russian: '); break;
                case '/explain': await handleAICommand(chatId, userId, cmd, arg, 'Explain in Russian:\n'); break;
                case '/stats': 
                    const stats = userLearning.getUserStats(userId);
                    await sendMessage(chatId, `📊 Статистика\n\n💬 Сообщений: ${stats.totalMessages}\n📈 Прогресс: ${stats.learningScore}%`);
                    break;
                default: await sendMessage(chatId, '❓ /help');
            }
        } else {
            const response = await getAIResponse(text, userId);
            await sendMessage(chatId, response);
        }
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(200).json({ ok: true });
    }
}
