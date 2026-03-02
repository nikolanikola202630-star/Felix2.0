// Felix Bot v7.0 - Full Database Integration
import Groq from 'groq-sdk';
import { db } from '../lib/db.js';
import { ai } from '../lib/ai.js';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const GROQ_KEY = process.env.GROQ_API_KEY || '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';
const ADMIN_ID = 8264612178;
const MINIAPP_URL = 'https://felix-black.vercel.app/miniapp/';

let groq;
try {
    groq = new Groq({ apiKey: GROQ_KEY });
} catch (e) {
    console.error('Groq init error:', e);
}

// Send message with Mini App button
async function send(chatId, text, buttons = []) {
    try {
        const inlineKeyboard = [
            ...buttons,
            [{
                text: '📱 Открыть Felix App',
                web_app: { url: MINIAPP_URL }
            }]
        ];

        const body = { 
            chat_id: chatId, 
            text, 
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: inlineKeyboard }
        };
        
        const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        return await res.json();
    } catch (e) {
        console.error('Send error:', e);
    }
}

// Get AI response with history
async function getAIResponse(userId, userMessage) {
    try {
        // Get user settings
        const settings = await db.getUserSettings(userId);
        
        // Get conversation history (last 10 messages)
        const historyData = await db.getHistory(userId, { limit: 10 });
        const history = historyData.messages || [];
        
        // Get AI response
        const response = await ai.getChatResponse(userMessage, history, {
            temperature: settings.ai_temperature,
            model: settings.ai_model,
            language: settings.language || 'ru'
        });
        
        return response;
    } catch (error) {
        console.error('AI response error:', error);
        return 'Извините, произошла ошибка при обработке запроса.';
    }
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return res.json({ status: 'ok', bot: 'Felix v7.0' });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        if (!message?.text) {
            return res.json({ ok: true });
        }

        const { chat: { id: chatId }, from: { id: userId }, text } = message;
        
        // Get or create user
        await db.getOrCreateUser(message.from);
        
        // Save user message
        await db.saveMessage(userId, 'user', text);
        
        // Get AI response
        const aiResponse = await getAIResponse(userId, text);
        
        // Save AI response
        await db.saveMessage(userId, 'assistant', aiResponse);
        
        // Send response
        await send(chatId, aiResponse);
        
        return res.json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Internal error' });
    }
}