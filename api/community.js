// Felix Bot v6.0 - Community API
// Управление сообществом, событиями и ресурсами

import { simpleStorage } from '../lib/storage-simple.js';

// Load community data
let communityData;
try {
    const data = await import('../miniapp/community.json', { assert: { type: 'json' } });
    communityData = data.default.community;
} catch (e) {
    console.error('Failed to load community data:', e);
    communityData = { channels: [], events: [], resources: [] };
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { action, userId, eventId, channelId, data } = req.method === 'GET' ? req.query : req.body;

        switch (action) {
            case 'getChannels':
                return handleGetChannels(res);
            
            case 'getEvents':
                return handleGetEvents(res, userId);
            
            case 'registerEvent':
                return handleRegisterEvent(res, userId, eventId);
            
            case 'getLeaderboard':
                return handleGetLeaderboard(res, userId);
            
            case 'getResources':
                return handleGetResources(res);
            
            case 'getStats':
                return handleGetStats(res);
            
            case 'joinChannel':
                return handleJoinChannel(res, userId, channelId);
            
            case 'getUserActivity':
                return handleGetUserActivity(res, userId);
            
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Community API Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

// Get all channels
function handleGetChannels(res) {
    return res.status(200).json({
        success: true,
        channels: communityData.channels,
        totalMembers: communityData.members,
        activeToday: communityData.activeToday
    });
}

// Get events with user registration status
async function handleGetEvents(res, userId) {
    try {
        const userRegistrations = await simpleStorage.get(`event_registrations:${userId}`) || [];
        
        const eventsWithStatus = communityData.events.map(event => ({
            ...event,
            registered: userRegistrations.includes(event.id),
            isPast: new Date(event.date || event.endDate) < new Date()
        }));
        
        // Sort: upcoming first, then past
        eventsWithStatus.sort((a, b) => {
            if (a.isPast && !b.isPast) return 1;
            if (!a.isPast && b.isPast) return -1;
            return new Date(a.date || a.startDate) - new Date(b.date || b.startDate);
        });
        
        return res.status(200).json({
            success: true,
            events: eventsWithStatus
        });
    } catch (error) {
        console.error('Get events error:', error);
        return res.status(500).json({ error: 'Failed to get events' });
    }
}

// Register for an event
async function handleRegisterEvent(res, userId, eventId) {
    if (!eventId) {
        return res.status(400).json({ error: 'eventId is required' });
    }
    
    try {
        const event = communityData.events.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Check if event is in the past
        if (new Date(event.date || event.endDate) < new Date()) {
            return res.status(400).json({ error: 'Event has already passed' });
        }
        
        // Check if already registered
        const userRegistrations = await simpleStorage.get(`event_registrations:${userId}`) || [];
        
        if (userRegistrations.includes(eventId)) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }
        
        // Register user
        userRegistrations.push(eventId);
        await simpleStorage.set(`event_registrations:${userId}`, userRegistrations);
        
        // Increment event attendees count
        const eventStats = await simpleStorage.get(`event_stats:${eventId}`) || { attendees: 0 };
        eventStats.attendees++;
        await simpleStorage.set(`event_stats:${eventId}`, eventStats);
        
        // Award XP for registration
        await awardXP(userId, 15, `Registered for event: ${event.title}`);
        
        return res.status(200).json({
            success: true,
            message: 'Successfully registered for event',
            event: {
                ...event,
                attendees: eventStats.attendees
            }
        });
    } catch (error) {
        console.error('Register event error:', error);
        return res.status(500).json({ error: 'Failed to register for event' });
    }
}

// Get leaderboard with user position
async function handleGetLeaderboard(res, userId) {
    try {
        // Get leaderboard from Learning API
        const LEARNING_API = process.env.LEARNING_API || 'https://felix-black.vercel.app/api/learning';
        
        const response = await fetch(`${LEARNING_API}?action=getLeaderboard`);
        const data = await response.json();
        
        if (!data.success) {
            return res.status(500).json({ error: 'Failed to get leaderboard' });
        }
        
        // Find user position
        const userPosition = data.leaderboard.findIndex(u => u.userId === userId) + 1;
        
        return res.status(200).json({
            success: true,
            leaderboard: data.leaderboard,
            userPosition: userPosition || null,
            totalUsers: communityData.stats.totalUsers
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        return res.status(500).json({ error: 'Failed to get leaderboard' });
    }
}

// Get resources
function handleGetResources(res) {
    return res.status(200).json({
        success: true,
        resources: communityData.resources,
        support: communityData.support
    });
}

// Get community stats
function handleGetStats(res) {
    return res.status(200).json({
        success: true,
        stats: communityData.stats
    });
}

// Join a channel (track user activity)
async function handleJoinChannel(res, userId, channelId) {
    if (!channelId) {
        return res.status(400).json({ error: 'channelId is required' });
    }
    
    try {
        const channel = communityData.channels.find(c => c.id === channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        
        // Track user joined channels
        const userChannels = await simpleStorage.get(`user_channels:${userId}`) || [];
        
        if (!userChannels.includes(channelId)) {
            userChannels.push(channelId);
            await simpleStorage.set(`user_channels:${userId}`, userChannels);
            
            // Award XP for joining channel
            await awardXP(userId, 10, `Joined channel: ${channel.name}`);
        }
        
        return res.status(200).json({
            success: true,
            message: 'Channel joined',
            channel
        });
    } catch (error) {
        console.error('Join channel error:', error);
        return res.status(500).json({ error: 'Failed to join channel' });
    }
}

// Get user activity in community
async function handleGetUserActivity(res, userId) {
    try {
        const userChannels = await simpleStorage.get(`user_channels:${userId}`) || [];
        const userRegistrations = await simpleStorage.get(`event_registrations:${userId}`) || [];
        
        // Get channels info
        const joinedChannels = communityData.channels.filter(c => userChannels.includes(c.id));
        
        // Get events info
        const registeredEvents = communityData.events.filter(e => userRegistrations.includes(e.id));
        
        return res.status(200).json({
            success: true,
            activity: {
                channelsJoined: joinedChannels.length,
                eventsRegistered: registeredEvents.length,
                channels: joinedChannels,
                events: registeredEvents
            }
        });
    } catch (error) {
        console.error('Get user activity error:', error);
        return res.status(500).json({ error: 'Failed to get user activity' });
    }
}

// Helper function to award XP
async function awardXP(userId, amount, reason) {
    try {
        const LEARNING_API = process.env.LEARNING_API || 'https://felix-black.vercel.app/api/learning';
        
        await fetch(LEARNING_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'addXP',
                userId: String(userId),
                data: { amount, reason }
            })
        });
    } catch (error) {
        console.error('Award XP error:', error);
    }
}
