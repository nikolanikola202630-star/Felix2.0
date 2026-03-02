// Admin API Endpoint
const adminSystem = require('../lib/admin/admin-system');
const referralSystem = require('../lib/partners/referral-system');
const supportSystem = require('../lib/support/support-system');

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
      'reviewApplication', 'getApplications', 'getAdminStats',
      'assignPartner', 'deactivatePartner', 'getPartnerAccounts',
      'getSupportInbox', 'replySupport', 'setSupportThreadStatus'
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

      // Backward compatibility for legacy admin mini app
      case 'getPartnerRequests':
        const partnerRequests = await adminSystem.getPendingApplications();
        return res.json({ success: true, requests: partnerRequests });

      case 'approvePartnerRequest':
        const approvedRequest = await adminSystem.reviewApplication(
          data.requestId,
          'approved',
          'Approved from admin panel',
          userId
        );
        return res.json({ success: true, application: approvedRequest });

      case 'rejectPartnerRequest':
        const rejectedRequest = await adminSystem.reviewApplication(
          data.requestId,
          'rejected',
          data.reason || 'Rejected by admin',
          userId
        );
        return res.json({ success: true, application: rejectedRequest });

      // Referral partner accounts
      case 'assignPartner':
        const partnerAccount = await referralSystem.assignPartner(userId, data.targetUserId);
        return res.json({ success: true, account: partnerAccount });

      case 'deactivatePartner':
        const deactivatedAccount = await referralSystem.deactivatePartner(userId, data.targetUserId);
        return res.json({ success: true, account: deactivatedAccount });

      case 'getPartnerAccounts':
        const accounts = await referralSystem.getAdminPartners(userId);
        return res.json({ success: true, partners: accounts });

      // Support inbox
      case 'getSupportInbox':
        const threads = await supportSystem.getAdminInbox(userId, data?.status || null);
        return res.json({ success: true, threads });

      case 'replySupport':
        const replyResult = await supportSystem.sendAdminReply(userId, data.threadId, data.message);
        return res.json({ success: true, result: replyResult });

      case 'setSupportThreadStatus':
        const updatedThread = await supportSystem.setThreadStatus(userId, data.threadId, data.status);
        return res.json({ success: true, thread: updatedThread });

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
