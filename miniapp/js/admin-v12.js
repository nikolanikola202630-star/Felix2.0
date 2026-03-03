// Felix Academy V12 - Admin Panel JS
// Работа с реальными данными через API

class AdminPanelV12 {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.API_URL = '/api/admin-v12';
    this.user = this.tg?.initDataUnsafe?.user || { id: 0 };
    this.init();
  }

  init() {
    this.tg?.ready();
    this.tg?.expand();
    this.loadDashboard();
  }

  async loadDashboard() {
    try {
      const response = await fetch(`${this.API_URL}?action=stats&user_id=${this.user.id}`);
      const data = await response.json();

      if (data.success) {
        this.updateStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }

  updateStats(stats) {
    this.animateValue('totalUsers', 0, stats.totalUsers, 1000);
    this.animateValue('totalCourses', 0, stats.totalCourses, 1200);
    this.animateValue('totalPurchases', 0, stats.totalPurchases, 1400);
    this.animateValue('totalPartners', 0, stats.totalPartners, 800);
    this.animateValue('aiRequests', 0, stats.aiRequests, 1600);
    
    const revenueEl = document.getElementById('totalRevenue');
    if (revenueEl) {
      revenueEl.textContent = this.formatPrice(stats.totalRevenue);
    }
  }

  animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        element.textContent = Math.floor(end).toLocaleString('ru-RU');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString('ru-RU');
      }
    }, 16);
  }

  async loadUsers() {
    try {
      const response = await fetch(`${this.API_URL}?action=users&user_id=${this.user.id}`);
      const data = await response.json();

      if (data.success) {
        this.renderUsersTable(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.user_id}</td>
        <td>${user.first_name}</td>
        <td>@${user.username || 'N/A'}</td>
        <td>${user.user_stats?.level || 1}</td>
        <td>${user.user_stats?.message_count || 0}</td>
        <td>${new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
        <td>
          <button class="btn btn-sm" onclick="adminPanelV12.viewUser(${user.user_id})">
            👁️ Просмотр
          </button>
        </td>
      </tr>
    `).join('');
  }

  async loadCourses() {
    try {
      const response = await fetch(`${this.API_URL}?action=courses&user_id=${this.user.id}`);
      const data = await response.json();

      if (data.success) {
        this.renderCoursesGrid(data.courses);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  }

  renderCoursesGrid(courses) {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    grid.innerHTML = courses.map(course => `
      <div class="card">
        <img src="${course.image}" alt="${course.title}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:12px;">
        <h3 style="font-size:16px;margin-bottom:8px;">${course.title}</h3>
        <p style="color:var(--text-secondary);font-size:14px;margin-bottom:12px;">${course.description || ''}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;color:var(--primary);">${this.formatPrice(course.price)}</span>
          <button class="btn btn-sm" onclick="adminPanelV12.editCourse(${course.id})">✏️ Редактировать</button>
        </div>
      </div>
    `).join('');
  }

  async loadPartners() {
    try {
      const response = await fetch(`${this.API_URL}?action=partners&user_id=${this.user.id}`);
      const data = await response.json();

      if (data.success) {
        this.renderPartnersTable(data.partners);
      }
    } catch (error) {
      console.error('Failed to load partners:', error);
    }
  }

  renderPartnersTable(partners) {
    const tbody = document.getElementById('partnersTableBody');
    if (!tbody) return;

    tbody.innerHTML = partners.map(partner => `
      <tr>
        <td>${partner.id}</td>
        <td>${partner.name}</td>
        <td>${partner.email || 'N/A'}</td>
        <td><span class="badge ${partner.status === 'active' ? 'badge-success' : 'badge-secondary'}">${partner.status}</span></td>
        <td>${partner.commission_rate || 0}%</td>
        <td>${new Date(partner.created_at).toLocaleDateString('ru-RU')}</td>
        <td>
          <button class="btn btn-sm" onclick="adminPanelV12.viewPartner(${partner.id})">👁️ Просмотр</button>
        </td>
      </tr>
    `).join('');
  }

  formatPrice(price) {
    if (price === 0) return 'Бесплатно';
    return `${price.toLocaleString('ru-RU')} ₽`;
  }

  viewUser(userId) {
    console.log('View user:', userId);
    this.tg?.showAlert(`Просмотр пользователя #${userId}`);
  }

  editCourse(courseId) {
    console.log('Edit course:', courseId);
    this.tg?.showAlert(`Редактирование курса #${courseId}`);
  }

  viewPartner(partnerId) {
    console.log('View partner:', partnerId);
    this.tg?.showAlert(`Просмотр партнера #${partnerId}`);
  }
}

// Инициализация
const adminPanelV12 = new AdminPanelV12();
window.adminPanelV12 = adminPanelV12;
