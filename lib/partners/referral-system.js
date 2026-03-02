const crypto = require('crypto');
const { db } = require('../db');
const adminSystem = require('../admin/admin-system');

class ReferralSystem {
  getBaseUrl(req) {
    return process.env.APP_BASE_URL || `https://${req?.headers?.host || 'felix2-0.vercel.app'}`;
  }

  hashIp(ip) {
    if (!ip) return null;
    return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
  }

  async assignPartner(adminId, targetUserId) {
    if (!adminSystem.isAdmin(adminId)) {
      throw new Error('Unauthorized: Admin access required');
    }

    return db.createOrActivatePartnerAccount(targetUserId, adminId);
  }

  async deactivatePartner(adminId, targetUserId) {
    if (!adminSystem.isAdmin(adminId)) {
      throw new Error('Unauthorized: Admin access required');
    }

    return db.deactivatePartnerAccount(targetUserId, adminId);
  }

  async getPartnerDashboard(req, userId) {
    const account = await db.getPartnerAccount(userId);
    if (!account || !account.is_active) {
      return { isPartner: false, account: null, stats: { total: 0, unique: 0, blocked: 0, clicks: [] } };
    }

    const stats = await db.getPartnerReferralStats(userId, 100);
    const baseUrl = this.getBaseUrl(req);
    return {
      isPartner: true,
      account,
      referralLink: `${baseUrl}/miniapp/elite.html?ref=${account.referral_code}`,
      stats
    };
  }

  async getAdminPartners(adminId) {
    if (!adminSystem.isAdmin(adminId)) {
      throw new Error('Unauthorized: Admin access required');
    }
    return db.listPartnerAccounts(300);
  }

  async trackReferralClick(req, referralCode, sessionId = null) {
    if (!referralCode) {
      return { tracked: false, reason: 'missing_referral_code' };
    }

    const account = await db.getPartnerByReferralCode(referralCode);
    if (!account || !account.is_active) {
      return { tracked: false, reason: 'partner_not_found_or_inactive' };
    }

    const forwarded = req.headers['x-forwarded-for'];
    const remoteAddress = forwarded ? String(forwarded).split(',')[0].trim() : req.socket?.remoteAddress;
    const ipHash = this.hashIp(remoteAddress);
    const userAgent = req.headers['user-agent'] || null;
    const referer = req.headers['referer'] || req.headers['referrer'] || null;

    // Anti-fraud rules
    const recentFromIp = ipHash ? await db.countRecentReferralClicks(account.user_id, ipHash, 60) : 0;
    if (recentFromIp >= 10) {
      await db.saveReferralClick({
        partnerUserId: account.user_id,
        referralCode,
        ipHash,
        userAgent,
        referer,
        sessionId,
        isUnique: false,
        blockedReason: 'ip_rate_limited'
      });
      return { tracked: false, reason: 'ip_rate_limited' };
    }

    const isDuplicateSession = sessionId
      ? await db.hasRecentSessionClick(account.user_id, sessionId, 24 * 60)
      : false;

    const click = await db.saveReferralClick({
      partnerUserId: account.user_id,
      referralCode,
      ipHash,
      userAgent,
      referer,
      sessionId,
      isUnique: !isDuplicateSession,
      blockedReason: null
    });

    return {
      tracked: true,
      partnerUserId: account.user_id,
      clickId: click.id,
      unique: click.is_unique
    };
  }
}

module.exports = new ReferralSystem();
