// Admin System - Course & Partner Management
const ADMIN_IDS = [
  8264612178, // Твой Telegram ID
];

class AdminSystem {
  constructor() {
    this.courses = new Map();
    this.partners = new Map();
    this.applications = new Map();
    this.nextCourseId = 1;
    this.nextPartnerId = 1;
    this.nextApplicationId = 1;
  }

  // Check if user is admin
  isAdmin(userId) {
    return ADMIN_IDS.includes(parseInt(userId));
  }

  // Course Management
  async addCourse(courseData, adminId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can add courses');
    }

    const course = {
      id: this.nextCourseId++,
      ...courseData,
      created_at: new Date().toISOString(),
      created_by: adminId,
      status: 'active'
    };

    this.courses.set(course.id, course);
    return course;
  }

  async updateCourse(courseId, updates, adminId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can update courses');
    }

    const course = this.courses.get(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const updated = {
      ...course,
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: adminId
    };

    this.courses.set(courseId, updated);
    return updated;
  }

  async deleteCourse(courseId, adminId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can delete courses');
    }

    return this.courses.delete(courseId);
  }

  async getCourses(status = 'active') {
    const courses = Array.from(this.courses.values());
    return status ? courses.filter(c => c.status === status) : courses;
  }

  // Partner Management
  async addPartner(partnerData, adminId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can add partners');
    }

    const partner = {
      id: this.nextPartnerId++,
      ...partnerData,
      created_at: new Date().toISOString(),
      created_by: adminId,
      status: 'active'
    };

    this.partners.set(partner.id, partner);
    return partner;
  }

  async updatePartner(partnerId, updates, adminId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can update partners');
    }

    const partner = this.partners.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const updated = {
      ...partner,
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: adminId
    };

    this.partners.set(partnerId, updated);
    return updated;
  }

  async deletePartner(partnerId, adminId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can delete partners');
    }

    return this.partners.delete(partnerId);
  }

  async getPartners(status = 'active') {
    const partners = Array.from(this.partners.values());
    return status ? partners.filter(p => p.status === status) : partners;
  }

  // Application Management
  async submitApplication(type, data, userId) {
    const application = {
      id: this.nextApplicationId++,
      type, // 'course' or 'partner'
      data,
      user_id: userId,
      status: 'pending', // pending, approved, rejected
      created_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      review_comment: null
    };

    this.applications.set(application.id, application);
    
    // Notify admins
    await this.notifyAdmins(application);
    
    return application;
  }

  async reviewApplication(applicationId, decision, comment, adminId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can review applications');
    }

    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    application.status = decision; // 'approved' or 'rejected'
    application.reviewed_at = new Date().toISOString();
    application.reviewed_by = adminId;
    application.review_comment = comment;

    this.applications.set(applicationId, application);

    // If approved, add to courses/partners
    if (decision === 'approved') {
      if (application.type === 'course') {
        await this.addCourse(application.data, adminId);
      } else if (application.type === 'partner') {
        await this.addPartner(application.data, adminId);
      }
    }

    return application;
  }

  async getApplications(status = null) {
    const applications = Array.from(this.applications.values());
    return status ? applications.filter(a => a.status === status) : applications;
  }

  async getPendingApplications() {
    return this.getApplications('pending');
  }

  // Notify admins about new application
  async notifyAdmins(application) {
    // This will be called from webhook to send Telegram notifications
    return {
      adminIds: ADMIN_IDS,
      message: `🔔 Новая заявка!\n\nТип: ${application.type === 'course' ? 'Курс' : 'Партнер'}\nID: ${application.id}\nОт: ${application.user_id}\n\nПроверьте в админ-панели.`
    };
  }

  // Get admin stats
  async getAdminStats() {
    return {
      total_courses: this.courses.size,
      active_courses: Array.from(this.courses.values()).filter(c => c.status === 'active').length,
      total_partners: this.partners.size,
      active_partners: Array.from(this.partners.values()).filter(p => p.status === 'active').length,
      pending_applications: Array.from(this.applications.values()).filter(a => a.status === 'pending').length,
      total_applications: this.applications.size
    };
  }
}

module.exports = new AdminSystem();
