// Felix Bot v5.0 - Mini App API
// UTF-8 Encoding

import userLearning from '../lib/user-learning.js';
import groupAdmin from '../lib/group-admin.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { action, userId, groupId } = req.method === 'GET' ? req.query : req.body;

        switch (action) {
            case 'getProfile':
                return handleGetProfile(res, userId);
            
            case 'getGroupStats':
                return handleGetGroupStats(res, groupId);
            
            case 'updateSettings':
                return handleUpdateSettings(res, req.body);
            
            default:
                return res.status(400).json({ 
                    error: 'Invalid action',
                    availableActions: ['getProfile', 'getGroupStats', 'updateSettings']
                });
        }
    } catch (error) {
        console.error('Mini App API Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

function handleGetProfile(res, userId) {
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const stats = userLearning.getUserStats(userId);
    const profile = userLearning.getProfile(userId);

    const response = {
        success: true,
        profile: {
            userId: profile.userId,
            username: profile.username,
            firstName: profile.firstName,
            learningScore: Math.round(stats.learningScore),
            totalMessages: stats.totalMessages,
            style: {
                formality: stats.style.formality,
                formalityEmoji: stats.style.formality === 'formal' ? '🎩' : 
                               stats.style.formality === 'casual' ? '😎' : '🤝',
                emojiUsage: stats.style.emojiUsage,
                avgMessageLength: Math.round(stats.style.avgMessageLength)
            },
            interests: stats.topTopics.slice(0, 10).map(([topic, count]) => ({
                topic,
                count
            })),
            topCommands: stats.topCommands.slice(0, 10).map(([cmd, count]) => ({
                command: cmd,
                count
            })),
            memberSince: stats.memberSince,
            lastActive: stats.lastActive
        }
    };

    return res.status(200).json(response);
}

function handleGetGroupStats(res, groupId) {
    if (!groupId) {
        return res.status(400).json({ error: 'groupId is required' });
    }

    const stats = groupAdmin.getGroupStats(groupId);
    const settings = groupAdmin.getGroupSettings(groupId);

    const response = {
        success: true,
        group: {
            groupId: settings.groupId,
            groupName: settings.groupName,
            totalMessages: stats.totalMessages,
            activeUsers: stats.activeUsers,
            topUsers: stats.topUsers.slice(0, 10).map(([userId, count]) => ({
                userId,
                messageCount: count
            })),
            moderation: {
                enabled: settings.moderation.enabled,
                autoDelete: settings.moderation.autoDelete,
                warnLimit: settings.moderation.warnLimit,
                filters: settings.moderation.filters
            },
            welcome: {
                enabled: settings.welcome.enabled,
                message: settings.welcome.message,
                rulesCount: settings.welcome.rules.length
            },
            faqCount: settings.faq.size,
            memberSince: stats.memberSince
        }
    };

    return res.status(200).json(response);
}

function handleUpdateSettings(res, data) {
    const { userId, groupId, settings } = data;

    if (!userId && !groupId) {
        return res.status(400).json({ error: 'userId or groupId is required' });
    }

    // Update user settings
    if (userId && settings.user) {
        const profile = userLearning.getProfile(userId);
        
        if (settings.user.language) {
            profile.style.preferredLanguage = settings.user.language;
        }
        
        // Add more user settings as needed
    }

    // Update group settings
    if (groupId && settings.group) {
        const groupSettings = groupAdmin.getGroupSettings(groupId);
        
        if (settings.group.moderation !== undefined) {
            Object.assign(groupSettings.moderation, settings.group.moderation);
        }
        
        if (settings.group.welcome !== undefined) {
            Object.assign(groupSettings.welcome, settings.group.welcome);
        }
        
        // Add more group settings as needed
    }

    return res.status(200).json({
        success: true,
        message: 'Settings updated successfully'
    });
}
