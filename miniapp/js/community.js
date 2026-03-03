// Felix Academy - Community Module
class CommunityManager {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.currentTab = 'feed';
    this.likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    this.init();
  }

  init() {
    this.tg?.ready();
    this.tg?.expand();
    this.tg?.BackButton.show();
    this.tg?.BackButton.onClick(() => window.location.href = 'index.html');
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    document.querySelectorAll('.post-action').forEach(action => {
      action.addEventListener('click', (e) => {
        const postId = e.currentTarget.closest('.post-card').dataset.postId;
        if (e.currentTarget.textContent.includes('👍')) {
          this.toggleLike(postId);
        }
      });
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    this.hapticFeedback('light');
    // В будущем здесь будет загрузка контента для разных табов
  }

  toggleLike(postId) {
    const index = this.likedPosts.indexOf(postId);
    if (index > -1) {
      this.likedPosts.splice(index, 1);
    } else {
      this.likedPosts.push(postId);
      this.hapticFeedback('success');
    }
    localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts));
  }

  hapticFeedback(type = 'light') {
    if (this.tg?.HapticFeedback) {
      if (type === 'success') {
        this.tg.HapticFeedback.notificationOccurred('success');
      } else {
        this.tg.HapticFeedback.impactOccurred(type);
      }
    }
  }
}

const communityManager = new CommunityManager();


