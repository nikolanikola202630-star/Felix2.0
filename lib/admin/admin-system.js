const { db } = require('../db');

const ADMIN_IDS = [8264612178];

class AdminSystem {
  constructor() {
    this.courses = new Map();
    this.partners = new Map();
    this.applications = new Map();
    this.nextCourseId = 1;
    this.nextPartnerId = 1;
    this.nextApplicationId = 1;
  }

  isAdmin(userId) {
    return ADMIN_IDS.includes(parseInt(userId, 10));
  }

  ensureAdmin(adminId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Admin access required');
    }
  }

  async addCourse(courseData, adminId) {
    this.ensureAdmin(adminId);

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
    this.ensureAdmin(adminId);
    const id = parseInt(courseId, 10);
    const existing = this.courses.get(id);
    if (!existing) throw new Error('Course not found');

    const next = { ...existing, ...updates, updated_at: new Date().toISOString(), updated_by: adminId };
    this.courses.set(id, next);
    return next;
  }

  async deleteCourse(courseId, adminId) {
    this.ensureAdmin(adminId);
    return this.courses.delete(parseInt(courseId, 10));
  }

  async getCourses(status = null) {
    try {
      const rows = await db.getCourses({ limit: 200 });
      if (rows && rows.length > 0) return rows;
    } catch (error) {
      // DB fallback to in-memory
    }

    const courses = Array.from(this.courses.values());
    return status ? courses.filter((c) => c.status === status) : courses;
  }

  async addPartner(partnerData, adminId) {
    this.ensureAdmin(adminId);

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
    this.ensureAdmin(adminId);
    const id = parseInt(partnerId, 10);
    const existing = this.partners.get(id);
    if (!existing) throw new Error('Partner not found');

    const next = { ...existing, ...updates, updated_at: new Date().toISOString(), updated_by: adminId };
    this.partners.set(id, next);
    return next;
  }

  async deletePartner(partnerId, adminId) {
    this.ensureAdmin(adminId);
    return this.partners.delete(parseInt(partnerId, 10));
  }

  async getPartners(status = null) {
    try {
      const rows = await db.getPartners();
      if (rows && rows.length > 0) return rows;
    } catch (error) {
      // DB fallback to in-memory
    }

    const partners = Array.from(this.partners.values());
    return status ? partners.filter((p) => p.status === status) : partners;
  }

  async submitApplication(type, data, userId) {
    const application = {
      id: this.nextApplicationId++,
      type,
      data,
      user_id: userId,
      status: 'pending',
      created_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      review_comment: null
    };

    this.applications.set(application.id, application);
    return application;
  }

  async reviewApplication(applicationId, decision, comment, adminId) {
    this.ensureAdmin(adminId);

    const id = parseInt(applicationId, 10);
    const application = this.applications.get(id);
    if (!application) throw new Error('Application not found');

    application.status = decision;
    application.reviewed_at = new Date().toISOString();
    application.reviewed_by = adminId;
    application.review_comment = comment || null;
    this.applications.set(id, application);

    if (decision === 'approved') {
      if (application.type === 'course') await this.addCourse(application.data, adminId);
      if (application.type === 'partner') await this.addPartner(application.data, adminId);
    }

    return application;
  }

  async getApplications(status = null) {
    const applications = Array.from(this.applications.values());
    return status ? applications.filter((a) => a.status === status) : applications;
  }

  async getPendingApplications() {
    return this.getApplications('pending');
  }

  async getAdminStats() {
    const [courses, partners, applications] = await Promise.all([
      this.getCourses(),
      this.getPartners(),
      this.getApplications()
    ]);

    return {
      total_courses: courses.length,
      active_courses: courses.filter((c) => c.status !== 'archived').length,
      total_partners: partners.length,
      active_partners: partners.filter((p) => p.status !== 'inactive').length,
      pending_applications: applications.filter((a) => a.status === 'pending').length,
      total_applications: applications.length
    };
  }
}

module.exports = new AdminSystem();
