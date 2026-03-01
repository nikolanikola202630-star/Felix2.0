// Felix Bot v6.0 - Courses API
// Управление курсами и прогрессом обучения

import { simpleStorage } from '../lib/storage-simple.js';

// Load courses data
let coursesData;
try {
    const data = await import('../miniapp/courses-full.json', { assert: { type: 'json' } });
    coursesData = data.default;
} catch (e) {
    console.error('Failed to load courses:', e);
    coursesData = { courses: [], categories: [] };
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
        const { action, userId, courseId, lessonId, data } = req.method === 'GET' ? req.query : req.body;

        switch (action) {
            case 'getCourses':
                return handleGetCourses(res, userId);
            
            case 'getCourse':
                return handleGetCourse(res, userId, courseId);
            
            case 'startCourse':
                return handleStartCourse(res, userId, courseId);
            
            case 'completeLesson':
                return handleCompleteLesson(res, userId, courseId, lessonId, data);
            
            case 'getProgress':
                return handleGetProgress(res, userId, courseId);
            
            case 'submitQuiz':
                return handleSubmitQuiz(res, userId, courseId, lessonId, data);
            
            case 'getCategories':
                return handleGetCategories(res);
            
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Courses API Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

// Get all courses with user progress
async function handleGetCourses(res, userId) {
    try {
        const userProgress = await simpleStorage.get(`course_progress:${userId}`) || {};
        
        const coursesWithProgress = coursesData.courses.map(course => {
            const progress = userProgress[course.id] || {
                started: false,
                completed: false,
                progress: 0,
                lessonsCompleted: []
            };
            
            return {
                ...course,
                userProgress: progress
            };
        });
        
        return res.status(200).json({
            success: true,
            courses: coursesWithProgress,
            categories: coursesData.categories
        });
    } catch (error) {
        console.error('Get courses error:', error);
        return res.status(500).json({ error: 'Failed to get courses' });
    }
}

// Get single course with detailed progress
async function handleGetCourse(res, userId, courseId) {
    if (!courseId) {
        return res.status(400).json({ error: 'courseId is required' });
    }
    
    try {
        const course = coursesData.courses.find(c => c.id === courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        const userProgress = await simpleStorage.get(`course_progress:${userId}`) || {};
        const courseProgress = userProgress[courseId] || {
            started: false,
            completed: false,
            progress: 0,
            lessonsCompleted: [],
            quizScores: {},
            startedAt: null,
            completedAt: null
        };
        
        // Add completion status to each lesson
        const lessonsWithProgress = course.lessons.map(lesson => ({
            ...lesson,
            completed: courseProgress.lessonsCompleted.includes(lesson.id),
            quizScore: courseProgress.quizScores[lesson.id] || null
        }));
        
        return res.status(200).json({
            success: true,
            course: {
                ...course,
                lessons: lessonsWithProgress
            },
            progress: courseProgress
        });
    } catch (error) {
        console.error('Get course error:', error);
        return res.status(500).json({ error: 'Failed to get course' });
    }
}

// Start a course
async function handleStartCourse(res, userId, courseId) {
    if (!courseId) {
        return res.status(400).json({ error: 'courseId is required' });
    }
    
    try {
        const course = coursesData.courses.find(c => c.id === courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        const userProgress = await simpleStorage.get(`course_progress:${userId}`) || {};
        
        if (!userProgress[courseId]) {
            userProgress[courseId] = {
                started: true,
                completed: false,
                progress: 0,
                lessonsCompleted: [],
                quizScores: {},
                startedAt: Date.now(),
                completedAt: null
            };
            
            await simpleStorage.set(`course_progress:${userId}`, userProgress);
            
            // Award XP for starting course
            await awardXP(userId, 10, `Started course: ${course.title}`);
        }
        
        return res.status(200).json({
            success: true,
            message: 'Course started',
            progress: userProgress[courseId]
        });
    } catch (error) {
        console.error('Start course error:', error);
        return res.status(500).json({ error: 'Failed to start course' });
    }
}

// Complete a lesson
async function handleCompleteLesson(res, userId, courseId, lessonId, data) {
    if (!courseId || !lessonId) {
        return res.status(400).json({ error: 'courseId and lessonId are required' });
    }
    
    try {
        const course = coursesData.courses.find(c => c.id === courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        const userProgress = await simpleStorage.get(`course_progress:${userId}`) || {};
        
        if (!userProgress[courseId]) {
            userProgress[courseId] = {
                started: true,
                completed: false,
                progress: 0,
                lessonsCompleted: [],
                quizScores: {},
                startedAt: Date.now(),
                completedAt: null
            };
        }
        
        // Mark lesson as completed
        if (!userProgress[courseId].lessonsCompleted.includes(lessonId)) {
            userProgress[courseId].lessonsCompleted.push(lessonId);
            
            // Calculate progress
            const totalLessons = course.lessons.length;
            const completedLessons = userProgress[courseId].lessonsCompleted.length;
            userProgress[courseId].progress = Math.round((completedLessons / totalLessons) * 100);
            
            // Check if course is completed
            if (completedLessons === totalLessons) {
                userProgress[courseId].completed = true;
                userProgress[courseId].completedAt = Date.now();
                
                // Award XP for completing course
                await awardXP(userId, 50, `Completed course: ${course.title}`);
            } else {
                // Award XP for completing lesson
                await awardXP(userId, 20, `Completed lesson: ${lesson.title}`);
            }
            
            await simpleStorage.set(`course_progress:${userId}`, userProgress);
        }
        
        return res.status(200).json({
            success: true,
            message: 'Lesson completed',
            progress: userProgress[courseId]
        });
    } catch (error) {
        console.error('Complete lesson error:', error);
        return res.status(500).json({ error: 'Failed to complete lesson' });
    }
}

// Get user progress for a course
async function handleGetProgress(res, userId, courseId) {
    if (!courseId) {
        return res.status(400).json({ error: 'courseId is required' });
    }
    
    try {
        const userProgress = await simpleStorage.get(`course_progress:${userId}`) || {};
        const courseProgress = userProgress[courseId] || {
            started: false,
            completed: false,
            progress: 0,
            lessonsCompleted: [],
            quizScores: {}
        };
        
        return res.status(200).json({
            success: true,
            progress: courseProgress
        });
    } catch (error) {
        console.error('Get progress error:', error);
        return res.status(500).json({ error: 'Failed to get progress' });
    }
}

// Submit quiz answers
async function handleSubmitQuiz(res, userId, courseId, lessonId, data) {
    if (!courseId || !lessonId || !data || !data.answers) {
        return res.status(400).json({ error: 'courseId, lessonId and answers are required' });
    }
    
    try {
        const course = coursesData.courses.find(c => c.id === courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (!lesson || !lesson.quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Calculate score
        const questions = lesson.quiz.questions;
        let correctAnswers = 0;
        
        questions.forEach((question, index) => {
            if (data.answers[index] === question.correct) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / questions.length) * 100);
        
        // Save quiz score
        const userProgress = await simpleStorage.get(`course_progress:${userId}`) || {};
        
        if (!userProgress[courseId]) {
            userProgress[courseId] = {
                started: true,
                completed: false,
                progress: 0,
                lessonsCompleted: [],
                quizScores: {},
                startedAt: Date.now()
            };
        }
        
        userProgress[courseId].quizScores[lessonId] = score;
        await simpleStorage.set(`course_progress:${userId}`, userProgress);
        
        // Award XP based on score
        if (score === 100) {
            await awardXP(userId, 30, `Perfect quiz score: ${lesson.title}`);
        } else if (score >= 80) {
            await awardXP(userId, 20, `Good quiz score: ${lesson.title}`);
        } else if (score >= 60) {
            await awardXP(userId, 10, `Quiz completed: ${lesson.title}`);
        }
        
        return res.status(200).json({
            success: true,
            score,
            correctAnswers,
            totalQuestions: questions.length,
            passed: score >= 60
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        return res.status(500).json({ error: 'Failed to submit quiz' });
    }
}

// Get categories
function handleGetCategories(res) {
    return res.status(200).json({
        success: true,
        categories: coursesData.categories
    });
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
