// Felix Academy - Community Page
const tg = window.Telegram.WebApp;
tg.expand();
tg.BackButton.show();
tg.BackButton.onClick(() => window.location.href = 'index.html');

const user = tg.initDataUnsafe.user || { first_name: 'Пользователь', id: 0 };
let currentTab = 'feed';
let posts = [];
let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');

const mockPosts = [
  {
    id: 1,
    author: 'Анна Смирнова',
    avatar: 'А',
    time: '2 часа назад',
    content: 'Только что завершила курс по трейдингу! Невероятно полезная информация. Особенно понравился раздел про управление рисками. Рекомендую всем начинающим! 📈',
    likes: 24,
    comments: 5
  },
  {
    id: 2,
    author: 'Дмитрий Петров',
    avatar: 'Д',
    time: '5 часов назад',
    content: 'Кто-нибудь проходил курс по Python? Стоит ли начинать с него или лучше сначала основы программирования? 🤔',
    likes: 12,
    comments: 8
  },
  {
    id: 3,
    author: 'Елена Иванова',
    avatar: 'Е',
    time: '1 день назад',
    content: 'Спасибо Felix Academy за качественные материалы! За месяц обучения уже вижу результаты. Мой доход вырос на 30%! 🚀',
    likes: 45,
    comments: 12
  },
  {
    id: 4,
    author: 'Максим Козлов',
    avatar: 'М',
    time: '2 дня назад',
    content: 'Организуем study group по курсу "Психология успеха". Кто хочет присоединиться? Будем обсуждать материалы и делиться опытом 🧠',
    likes: 18,
    comments: 15
  }
];

const mockChannels = [
  {
    id: 1,
    name: 'Трейдинг для начинающих',
    icon: '📈',
    members: 1247,
    description: 'Обсуждаем стратегии и делимся опытом'
  },
  {
    id: 2,
    name: 'Python разработка',
    icon: '🐍',
    members: 892,
    description: 'Все о программировании на Python'
  },
  {
    id: 3,
    name: 'Психология и саморазвитие',
    icon: '🧠',
    members: 2156,
    description: 'Развиваемся вместе'
  },
  {
    id: 4,
    name: 'Бизнес и стартапы',
    icon: '💼',
    members: 654,
    description: 'От идеи до реализации'
  }
];

const mockDiscussions = [
  {
    id: 1,
    title: 'Как выбрать первый курс?',
    author: 'Иван Сидоров',
    replies: 23,
    time: '1 час назад'
  },
  {
    id: 2,
    title: 'Лучшие практики в трейдинге',
    author: 'Ольга Петрова',
    replies: 45,
    time: '3 часа назад'
  },
  {
    id: 3,
    title: 'Поделитесь успехами!',
    author: 'Сергей Волков',
    replies: 67,
    time: '5 часов назад'
  }
];

const mockEvents = [
  {
    id: 1,
    title: 'Вебинар: Основы технического анализа',
    date: '5 марта, 19:00',
    participants: 156
  },
  {
    id: 2,
    title: 'Q&A сессия с экспертом',
    date: '7 марта, 18:00',
    participants: 89
  },
  {
    id: 3,
    title: 'Meetup: Нетворкинг для студентов',
    date: '10 марта, 17:00',
    participants: 234
  }
];

function switchTab(tab) {
  currentTab = tab;
  
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  tg.HapticFeedback?.selectionChanged();
  
  renderContent();
}

function renderContent() {
  const container = document.getElementById('feedContent');
  
  if (currentTab === 'feed') {
    container.innerHTML = mockPosts.map((post, index) => `
      <div class="post-card stagger-item" style="animation-delay: ${index * 50}ms">
        <div class="post-header">
          <div class="post-avatar">${post.avatar}</div>
          <div class="post-author">
            <div class="post-name">${post.author}</div>
            <div class="post-time">${post.time}</div>
          </div>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-actions">
          <div class="post-action ${likedPosts.includes(post.id) ? 'liked' : ''}" onclick="toggleLike(${post.id})">
            <span>${likedPosts.includes(post.id) ? '❤️' : '🤍'}</span>
            <span id="likes-${post.id}">${post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
          </div>
          <div class="post-action" onclick="openComments(${post.id})">
            <span>💬</span>
            <span>${post.comments}</span>
          </div>
          <div class="post-action" onclick="sharePost(${post.id})">
            <span>📤</span>
            <span>Поделиться</span>
          </div>
        </div>
      </div>
    `).join('');
  } else if (currentTab === 'channels') {
    container.innerHTML = mockChannels.map((channel, index) => `
      <div class="channel-card stagger-item" style="animation-delay: ${index * 50}ms" onclick="openChannel(${channel.id})">
        <div class="channel-icon">${channel.icon}</div>
        <div class="channel-info">
          <div class="channel-name">${channel.name}</div>
          <div class="channel-members">${channel.members} участников</div>
          <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
            ${channel.description}
          </div>
        </div>
        <button class="btn btn-primary" onclick="joinChannel(${channel.id}); event.stopPropagation();">
          Вступить
        </button>
      </div>
    `).join('');
  } else if (currentTab === 'discussions') {
    container.innerHTML = mockDiscussions.map((discussion, index) => `
      <div class="post-card stagger-item" style="animation-delay: ${index * 50}ms" onclick="openDiscussion(${discussion.id})">
        <div class="post-name" style="margin-bottom: var(--space-2);">${discussion.title}</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 14px; color: var(--text-secondary);">
            ${discussion.author} • ${discussion.time}
          </div>
          <div style="font-size: 14px; color: var(--text-secondary);">
            💬 ${discussion.replies} ответов
          </div>
        </div>
      </div>
    `).join('');
  } else if (currentTab === 'events') {
    container.innerHTML = mockEvents.map((event, index) => `
      <div class="post-card stagger-item" style="animation-delay: ${index * 50}ms">
        <div class="post-name" style="margin-bottom: var(--space-2);">${event.title}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
          <div style="font-size: 14px; color: var(--text-secondary);">
            📅 ${event.date}
          </div>
          <div style="font-size: 14px; color: var(--text-secondary);">
            👥 ${event.participants} участников
          </div>
        </div>
        <button class="btn btn-primary" style="width: 100%;" onclick="registerEvent(${event.id})">
          Зарегистрироваться
        </button>
      </div>
    `).join('');
  }
}

function toggleLike(postId) {
  const index = likedPosts.indexOf(postId);
  if (index > -1) {
    likedPosts.splice(index, 1);
  } else {
    likedPosts.push(postId);
    tg.HapticFeedback?.notificationOccurred('success');
  }
  
  localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  renderContent();
}

function openComments(postId) {
  tg.HapticFeedback?.impactOccurred('medium');
  tg.showAlert('Комментарии к посту #' + postId);
}

function sharePost(postId) {
  tg.HapticFeedback?.impactOccurred('medium');
  tg.showAlert('Поделиться постом #' + postId);
}

function createPost() {
  tg.HapticFeedback?.impactOccurred('medium');
  tg.showAlert('Создание поста доступно в полной версии');
}

function openChannel(channelId) {
  tg.HapticFeedback?.impactOccurred('medium');
  tg.showAlert('Открыть канал #' + channelId);
}

function joinChannel(channelId) {
  tg.HapticFeedback?.notificationOccurred('success');
  tg.showAlert('✅ Вы вступили в канал!');
}

function openDiscussion(discussionId) {
  tg.HapticFeedback?.impactOccurred('medium');
  tg.showAlert('Открыть обсуждение #' + discussionId);
}

function registerEvent(eventId) {
  tg.HapticFeedback?.notificationOccurred('success');
  tg.showAlert('✅ Вы зарегистрированы на событие!');
}

// Инициализация
renderContent();

console.log('👥 Community page loaded');
