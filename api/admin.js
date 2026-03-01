// Felix Bot v5.0 - Admin Panel API
// UTF-8 Encoding

const ADMIN_IDS = [8264612178]; // Telegram ID администраторов
const partnerRequests = new Map(); // Заявки на партнерство
const courses = new Map(); // Курсы академии
const partners = new Map(); // Партнеры

// Инициализация данных из JSON
let initialized = false;

async function initData() {
    if (initialized) return;
    
    // Загрузка курсов из academy.json
    try {
        const academyData = await import('../miniapp/academy.json', { assert: { type: 'json' } });
        academyData.default.courses.forEach(course => {
            courses.set(course.id, course);
        });
    } catch (e) {
        console.log('Academy data not loaded:', e.message);
    }
    
    // Загрузка партнеров из partners.json
    try {
        const partnersData = await import('../miniapp/partners.json', { assert: { type: 'json' } });
        partnersData.default.partners.forEach(partner => {
            partners.set(partner.id, partner);
        });
    } catch (e) {
        console.log('Partners data not loaded:', e.message);
    }
    
    initialized = true;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    await initData();

    try {
        const { action, userId, data } = req.method === 'GET' ? { ...req.query, data: null } : req.body;
        
        // Проверка прав администратора для защищенных действий
        const isAdmin = ADMIN_IDS.includes(parseInt(userId));
        
        switch (action) {
            // Публичные действия
            case 'submitPartnerRequest':
                return handleSubmitPartnerRequest(res, data);
            
            case 'getCourses':
                return handleGetCourses(res);
            
            case 'getPartners':
                return handleGetPartners(res);
            
            // Админские действия
            case 'getPartnerRequests':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleGetPartnerRequests(res);
            
            case 'approvePartnerRequest':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleApprovePartnerRequest(res, data);
            
            case 'rejectPartnerRequest':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleRejectPartnerRequest(res, data);
            
            case 'addCourse':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleAddCourse(res, data);
            
            case 'updateCourse':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleUpdateCourse(res, data);
            
            case 'deleteCourse':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleDeleteCourse(res, data);
            
            case 'addPartner':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleAddPartner(res, data);
            
            case 'updatePartner':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleUpdatePartner(res, data);
            
            case 'deletePartner':
                if (!isAdmin) return res.status(403).json({ error: 'Access denied' });
                return handleDeletePartner(res, data);
            
            case 'isAdmin':
                return res.status(200).json({ isAdmin });
            
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

// Публичные функции
function handleSubmitPartnerRequest(res, data) {
    const { name, description, url, category, contactName, contactTelegram, userId } = data;
    
    if (!name || !description || !url || !category || !contactName || !contactTelegram) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request = {
        id: requestId,
        name,
        description,
        url,
        category,
        contactName,
        contactTelegram,
        userId,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    partnerRequests.set(requestId, request);
    
    return res.status(200).json({
        success: true,
        message: 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.',
        requestId
    });
}

function handleGetCourses(res) {
    const coursesList = Array.from(courses.values());
    return res.status(200).json({
        success: true,
        courses: coursesList
    });
}

function handleGetPartners(res) {
    const partnersList = Array.from(partners.values());
    return res.status(200).json({
        success: true,
        partners: partnersList
    });
}

// Админские функции - Заявки на партнерство
function handleGetPartnerRequests(res) {
    const requests = Array.from(partnerRequests.values())
        .sort((a, b) => b.createdAt - a.createdAt);
    
    return res.status(200).json({
        success: true,
        requests,
        stats: {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length
        }
    });
}

function handleApprovePartnerRequest(res, data) {
    const { requestId, logo, featured } = data;
    
    const request = partnerRequests.get(requestId);
    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }
    
    // Создать партнера
    const partnerId = `partner_${Date.now()}`;
    const partner = {
        id: partnerId,
        name: request.name,
        description: request.description,
        logo: logo || '🤝',
        url: request.url,
        category: request.category,
        featured: featured || false,
        addedAt: Date.now()
    };
    
    partners.set(partnerId, partner);
    
    // Обновить статус заявки
    request.status = 'approved';
    request.updatedAt = Date.now();
    request.partnerId = partnerId;
    
    return res.status(200).json({
        success: true,
        message: 'Партнер добавлен',
        partner
    });
}

function handleRejectPartnerRequest(res, data) {
    const { requestId, reason } = data;
    
    const request = partnerRequests.get(requestId);
    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }
    
    request.status = 'rejected';
    request.rejectionReason = reason;
    request.updatedAt = Date.now();
    
    return res.status(200).json({
        success: true,
        message: 'Заявка отклонена'
    });
}

// Админские функции - Курсы
function handleAddCourse(res, data) {
    const { title, description, icon, duration, level, lessons } = data;
    
    if (!title || !description || !level || !lessons) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const courseId = `course_${Date.now()}`;
    const course = {
        id: courseId,
        title,
        description,
        icon: icon || '📚',
        duration: duration || `${lessons.length * 10} мин`,
        level,
        lessons,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    courses.set(courseId, course);
    
    return res.status(200).json({
        success: true,
        message: 'Курс добавлен',
        course
    });
}

function handleUpdateCourse(res, data) {
    const { courseId, ...updates } = data;
    
    const course = courses.get(courseId);
    if (!course) {
        return res.status(404).json({ error: 'Course not found' });
    }
    
    Object.assign(course, updates, { updatedAt: Date.now() });
    
    return res.status(200).json({
        success: true,
        message: 'Курс обновлен',
        course
    });
}

function handleDeleteCourse(res, data) {
    const { courseId } = data;
    
    if (!courses.has(courseId)) {
        return res.status(404).json({ error: 'Course not found' });
    }
    
    courses.delete(courseId);
    
    return res.status(200).json({
        success: true,
        message: 'Курс удален'
    });
}

// Админские функции - Партнеры
function handleAddPartner(res, data) {
    const { name, description, logo, url, category, featured } = data;
    
    if (!name || !description || !url || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const partnerId = `partner_${Date.now()}`;
    const partner = {
        id: partnerId,
        name,
        description,
        logo: logo || '🤝',
        url,
        category,
        featured: featured || false,
        addedAt: Date.now()
    };
    
    partners.set(partnerId, partner);
    
    return res.status(200).json({
        success: true,
        message: 'Партнер добавлен',
        partner
    });
}

function handleUpdatePartner(res, data) {
    const { partnerId, ...updates } = data;
    
    const partner = partners.get(partnerId);
    if (!partner) {
        return res.status(404).json({ error: 'Partner not found' });
    }
    
    Object.assign(partner, updates);
    
    return res.status(200).json({
        success: true,
        message: 'Партнер обновлен',
        partner
    });
}

function handleDeletePartner(res, data) {
    const { partnerId } = data;
    
    if (!partners.has(partnerId)) {
        return res.status(404).json({ error: 'Partner not found' });
    }
    
    partners.delete(partnerId);
    
    return res.status(200).json({
        success: true,
        message: 'Партнер удален'
    });
}
