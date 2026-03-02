const referralSystem = require('../lib/partners/referral-system');

function readPayload(req) {
  if (req.method === 'GET') return req.query || {};
  return req.body || {};
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const payload = readPayload(req);
    const action = payload.action;

    if (req.method === 'GET') {
      if (action === 'dashboard') {
        const userId = payload.userId;
        if (!userId) return res.status(400).json({ success: false, error: 'userId required' });

        const data = await referralSystem.getPartnerDashboard(req, userId);
        return res.status(200).json({ success: true, ...data });
      }

      if (action === 'trackReferral') {
        const referralCode = payload.ref || payload.referralCode;
        const sessionId = payload.sessionId || null;
        const tracked = await referralSystem.trackReferralClick(req, referralCode, sessionId);
        return res.status(200).json({ success: true, ...tracked });
      }

      if (action === 'adminList') {
        const userId = payload.userId;
        const partners = await referralSystem.getAdminPartners(userId);
        return res.status(200).json({ success: true, partners });
      }

      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    if (req.method === 'POST') {
      if (action === 'assignPartner') {
        const { userId, targetUserId } = payload;
        if (!userId || !targetUserId) return res.status(400).json({ success: false, error: 'userId and targetUserId required' });

        const account = await referralSystem.assignPartner(userId, targetUserId);
        return res.status(200).json({ success: true, account });
      }

      if (action === 'deactivatePartner') {
        const { userId, targetUserId } = payload;
        if (!userId || !targetUserId) return res.status(400).json({ success: false, error: 'userId and targetUserId required' });

        const account = await referralSystem.deactivatePartner(userId, targetUserId);
        return res.status(200).json({ success: true, account });
      }

      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Partner API error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};
