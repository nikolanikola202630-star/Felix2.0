// Admin API Endpoint
const adminSystem = require('../lib/admin/admin-system');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, userId, data } = req.method === 'GET' ? req.query : req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // Check admin access for protected actions
    const protectedActions = [
      'addCourse', 'updateCourse', 'deleteCourse',
      'addPartner', 'updatePartner', 'deletePartner',
      'reviewApplication', 'getApplications', 'getAdminStats'
    ];

    if (protectedActions.includes(action) && !adminSystem.isAdmin(userId)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    switch (action) {
      // Course Management
      case 'addCourse':
        const newCourse = await adminSystem.addCourse(data, userId);
        return res.json({ success: true, course: newCourse });

      case 'updateCourse':
        const updatedCourse = await adminSystem.updateCourse(data.courseId, data.updates, userId);
        return res.json({ success: true, course: updatedCourse });

      case 'deleteCourse':
        await adminSystem.deleteCourse(data.courseId, userId);
        return res.json({ success: true });

      case 'getCourses':
        const courses = await adminSystem.getCourses(data?.status);
        return res.json({ success: true, courses });

      // Partner Management
      case 'addPartner':
        const newPartner = await adminSystem.addPartner(data, userId);
        return res.json({ success: true, partner: newPartner });

      case 'updatePartner':
        const updatedPartner = await adminSystem.updatePartner(data.partnerId, data.updates, userId);
        return res.json({ success: true, partner: updatedPartner });

      case 'deletePartner':
        await adminSystem.deletePartner(data.partnerId, userId);
        return res.json({ success: true });

      case 'getPartners':
        const partners = await adminSystem.getPartners(data?.status);
        return res.json({ success: true, partners });

      // Application Management
      case 'submitApplication':
        const application = await adminSystem.submitApplication(data.type, data.applicationData, userId);
        return res.json({ success: true, application });

      case 'reviewApplication':
        const reviewed = await adminSystem.reviewApplication(
          data.applicationId,
          data.decision,
          data.comment,
          userId
        );
        return res.json({ success: true, application: reviewed });

      case 'getApplications':
        const applications = await adminSystem.getApplications(data?.status);
        return res.json({ success: true, applications });

      case 'getPendingApplications':
        const pending = await adminSystem.getPendingApplications();
        return res.json({ success: true, applications: pending });

      // Admin Stats
      case 'getAdminStats':
        const stats = await adminSystem.getAdminStats();
        return res.json({ success: true, stats });

      case 'isAdmin':
        const isAdmin = adminSystem.isAdmin(userId);
        return res.json({ success: true, isAdmin });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
