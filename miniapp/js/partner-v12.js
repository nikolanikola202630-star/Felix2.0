// Felix Academy V12 - Partner Dashboard JS
// Работа с реальными данными через API

class PartnerDashboardV12 {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.API_URL = '/api/partner-v12';
    this.user = this.tg?.initDataUnsafe?.user || { id: 0 };
    this.init();
  }

  init() {
    this.tg?.ready();
    this.tg?.expand();
    this.loadDashboard();
    
    // Автозагрузка данных для вкладки рефералов
    setTimeout(() => {
      this.loadReferrals();
      this.loadEarnings();
    }, 1000);
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
    this.animateValue('totalReferrals', 0, stats.totalReferrals, 1000);
    this.animateValue('activeReferrals', 0, stats.activeReferrals, 1200);
    
    const earningsEl = document.getElementById('totalEarnings');
    if (earningsEl) {
      earningsEl.textContent = this.formatPrice(stats.totalEarnings);
    }

    const conversionEl = document.getElementById('conversionRate');
    if (conversionEl) {
      conversionEl.textContent = `${stats.conversionRate}%`;
    }

    const linkEl = document.getElementById('referralLink');
    if (linkEl) {
      linkEl.value = stats.referralLink;
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

  async loadReferrals() {
    try {
      const response = await fetch(`${this.API_URL}?action=referrals&user_id=${this.user.id}`);
      const data = await response.json();

      if (data.success) {
        this.renderReferralsTable(data.referrals);
      }
    } catch (error) {
      console.error('Failed to load referrals:', error);
    }
  }

  renderReferralsTable(referrals) {
    const tbody = document.getElementById('referralsTableBody');
    if (!tbody) return;

    tbody.innerHTML = referrals.map(ref => `
      <tr>
        <td>${ref.users?.first_name || 'Пользователь'}</td>
        <td>@${ref.users?.username || 'N/A'}</td>
        <td><span class="badge ${ref.status === 'active' ? 'badge-success' : 'badge-secondary'}">${ref.status}</span></td>
        <td>${new Date(ref.created_at).toLocaleDateString('ru-RU')}</td>
      </tr>
    `).join('');
  }

  async loadEarnings() {
    try {
      const response = await fetch(`${this.API_URL}?action=earnings&user_id=${this.user.id}`);
      const data = await response.json();

      if (data.success) {
        this.renderEarningsTable(data.earnings);
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
    }
  }

  renderEarningsTable(earnings) {
    const tbody = document.getElementById('earningsTableBody');
    if (!tbody) return;

    tbody.innerHTML = earnings.map(earning => `
      <tr>
        <td>${this.formatPrice(earning.amount)}</td>
        <td>${earning.type || 'Комиссия'}</td>
        <td>${new Date(earning.created_at).toLocaleDateString('ru-RU')}</td>
      </tr>
    `).join('');
  }

  copyReferralLink() {
    const linkEl = document.getElementById('referralLink');
    if (linkEl) {
      linkEl.select();
      document.execCommand('copy');
      this.tg?.showAlert('✅ Ссылка скопирована!');
    }
  }

  formatPrice(price) {
    return `${price.toLocaleString('ru-RU')} ₽`;
  }
}

// Инициализация
const partnerDashboardV12 = new PartnerDashboardV12();
window.partnerDashboardV12 = partnerDashboardV12;
