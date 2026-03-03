// Felix Academy - Partner Dashboard
// Партнерская панель управления

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
}

const CONFIG = {
  API_URL: 'https://felix2-0.vercel.app/api',
  BOT_TOKEN: '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U'
};

let currentUser = null;
let partnerData = null;
let myCourses = [];
let myStudents = [];
let myChats = [];
let currentChat = null;

// Инициализация
async function init() {
  console.log('🚀 Partner Dashboard - Initializing...');
  
  // Получить данные пользователя из Telegram
  currentUser = tg?.initDataUnsafe?.user || { id: 8264612178, first_name: 'Partner' };
  
  // Загрузить данные партнера
  await loadPartnerData();
  await loadMyCourses();
  await loadMyStudents();
  await loadMyChats();
  
  updateStats();
}

// Загрузить данные партнера
async function loadPartnerData() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/partner?action=getProfile&userId=${currentUser.id}`);
    const data = await response.json();
    
    if (data.success) {
      partnerData = data.partner;
    } else {
      // Создать профиль партнера если не существует
      partnerData = {
        user_id: currentUser.id,
        username: currentUser.username,
        first_name: currentUser.first_name,
        status: 'active',
        commission_rate: 20,
        total_earnings: 0,
        total_students: 0
      };
    }
  } catch (error) {
    console.error('Error loading partner data:', error);
  }
}

// Загрузить курсы партнера
async function loadMyCourses() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/partner?action=getMyCourses&userId=${currentUser.id}`);
    const data = await response.json();
    
    if (data.success) {
      myCourses = data.courses;
      renderCourses();
    }
  } catch (error) {
    console.error('Error loading courses:', error);
    myCourses = [];
    renderCourses();
  }
}

// Загрузить студентов
async function loadMyStudents() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/partner?action=getMyStudents&userId=${currentUser.id}`);
    const data = await response.json();
    
    if (data.success) {
      myStudents = data.students;
      renderStudents();
    }
  } catch (error) {
    console.error('Error loading students:', error);
    myStudents = [];
    renderStudents();
  }
}

// Загрузить чаты
async function loadMyChats() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/partner?action=getMyChats&userId=${currentUser.id}`);
    const data = await response.json();
    
    if (data.success) {
      myChats = data.chats;
      renderChatsList();
    }
  } catch (error) {
    console.error('Error loading chats:', error);
    myChats = [];
    renderChatsList();
  }
}

// Обновить статистику
function updateStats() {
  document.getElementById('totalCourses').textContent = myCourses.length;
  document.getElementById('totalStudents').textContent = myStudents.length;
  document.getElementById('totalEarnings').textContent = (partnerData?.total_earnings || 0) + '₽';
  
  const unread = myChats.filter(c => c.unread_count > 0).length;
  document.getElementById('unreadChats').textContent = unread;
}

// Переключение табов
function switchTab(tabName) {
  // Скрыть все табы
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Убрать активный класс со всех кнопок
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Показать выбранный таб
  document.getElementById(tabName + 'Tab').classList.add('active');
  
  // Активировать кнопку
  event.target.classList.add('active');
}

// Рендер курсов
function renderCourses() {
  const container = document.getElementById('coursesContainer');
  
  if (myCourses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <p>У вас пока нет курсов</p>
        <button class="btn btn-primary" onclick="createCourse()" style="margin-top: 16px;">
          Создать первый курс
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = myCourses.map(course => `
    <div class="course-card">
      <img src="${course.image || 'https://via.placeholder.com/300x150/667eea/ffffff?text=' + encodeURIComponent(course.title)}" 
           alt="${course.title}" 
           class="course-image">
      <div class="course-content">
        <div class="course-title">${course.title}</div>
        <div class="course-meta">
          <span>👥 ${course.students_count || 0} студентов</span>
          <span>⭐ ${course.rating || 0}</span>
        </div>
        <div class="course-meta">
          <span>💰 ${course.price}₽</span>
          <span>📖 ${course.lessons_count || 0} уроков</span>
        </div>
        <div class="course-actions">
          <button class="btn btn-primary" onclick="editCourse(${course.id})">
            ✏️ Редактировать
          </button>
          <button class="btn btn-secondary" onclick="viewCourseStudents(${course.id})">
            👥 Студенты
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Рендер студентов
function renderStudents() {
  const container = document.getElementById('studentsContainer');
  
  if (myStudents.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <p>У вас пока нет студентов</p>
      </div>
    `;
    return;
  }

  container.innerHTML = myStudents.map(student => `
    <div class="student-item">
      <div class="student-info">
        <div class="student-avatar">${student.first_name[0].toUpperCase()}</div>
        <div class="student-details">
          <h4>${student.first_name} ${student.last_name || ''}</h4>
          <p>${student.course_title} • Прогресс: ${student.progress || 0}%</p>
          <p style="font-size: 11px;">Начал: ${formatDate(student.started_at)}</p>
        </div>
      </div>
      <div class="student-actions">
        <button class="icon-btn" onclick="openChat(${student.user_id}, ${student.course_id})" title="Написать">
          💬
        </button>
        <button class="icon-btn" onclick="viewStudentProgress(${student.user_id}, ${student.course_id})" title="Прогресс">
          📊
        </button>
      </div>
    </div>
  `).join('');
}

// Рендер списка чатов
function renderChatsList() {
  const container = document.getElementById('chatsList');
  
  if (myChats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <p>Нет активных чатов</p>
      </div>
    `;
    return;
  }

  container.innerHTML = myChats.map(chat => `
    <div class="chat-item ${currentChat?.id === chat.id ? 'active' : ''}" 
         onclick="selectChat(${chat.id})">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <strong>${chat.student_name}</strong>
        ${chat.unread_count > 0 ? `<span class="badge badge-danger">${chat.unread_count}</span>` : ''}
      </div>
      <div style="font-size: 12px; color: var(--text-light);">
        ${chat.course_title}
      </div>
      <div style="font-size: 11px; color: var(--text-light); margin-top: 4px;">
        ${formatDate(chat.last_message_at)}
      </div>
    </div>
  `).join('');
}

// Выбрать чат
async function selectChat(chatId) {
  currentChat = myChats.find(c => c.id === chatId);
  if (!currentChat) return;

  // Обновить список чатов
  renderChatsList();

  // Загрузить сообщения
  await loadChatMessages(chatId);
}

// Загрузить сообщения чата
async function loadChatMessages(chatId) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/partner?action=getChatMessages&userId=${currentUser.id}&chatId=${chatId}`);
    const data = await response.json();
    
    if (data.success) {
      renderChatWindow(data.messages);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Рендер окна чата
function renderChatWindow(messages) {
  const chatWindow = document.getElementById('chatWindow');
  
  chatWindow.innerHTML = `
    <div class="chat-header">
      <div>
        <strong>${currentChat.student_name}</strong>
        <div style="font-size: 12px; color: var(--text-light);">${currentChat.course_title}</div>
      </div>
      <button class="icon-btn" onclick="closeChatWindow()">✕</button>
    </div>
    <div class="chat-messages" id="chatMessages">
      ${messages.map(msg => `
        <div class="message ${msg.sender_id === currentUser.id ? 'own' : ''}">
          <div class="message-bubble">
            <div>${msg.message}</div>
            <div class="message-time">${formatTime(msg.created_at)}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="chat-input">
      <input type="text" 
             id="messageInput" 
             placeholder="Введите сообщение..." 
             onkeypress="if(event.key==='Enter') sendMessage()">
      <button class="btn btn-primary" onclick="sendMessage()">
        Отправить
      </button>
    </div>
  `;

  // Прокрутить вниз
  const messagesContainer = document.getElementById('chatMessages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Отправить сообщение
async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message || !currentChat) return;

  try {
    const response = await fetch(`${CONFIG.API_URL}/partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        userId: currentUser.id,
        chatId: currentChat.id,
        message
      })
    });

    const data = await response.json();
    
    if (data.success) {
      input.value = '';
      await loadChatMessages(currentChat.id);
      
      // Отправить уведомление студенту через бота
      await notifyStudent(currentChat.student_id, message);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    if (tg) {
      tg.showAlert('Ошибка отправки сообщения');
    }
  }
}

// Уведомить студента через бота
async function notifyStudent(studentId, message) {
  try {
    await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: studentId,
        text: `💬 Новое сообщение от преподавателя:\n\n${message}\n\nОтветьте в чате курса.`,
        reply_markup: {
          inline_keyboard: [[
            { text: '💬 Открыть чат', url: `https://felix2-0.vercel.app/miniapp/student-chat.html?partnerId=${currentUser.id}` }
          ]]
        }
      })
    });
  } catch (error) {
    console.error('Error notifying student:', error);
  }
}

// Открыть чат со студентом
async function openChat(studentId, courseId) {
  try {
    // Создать или получить чат
    const response = await fetch(`${CONFIG.API_URL}/partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createChat',
        userId: currentUser.id,
        studentId,
        courseId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      await loadMyChats();
      switchTab('chats');
      selectChat(data.chat.id);
    }
  } catch (error) {
    console.error('Error opening chat:', error);
  }
}

// Закрыть окно чата
function closeChatWindow() {
  currentChat = null;
  document.getElementById('chatWindow').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">💬</div>
      <p>Выберите чат для начала общения</p>
    </div>
  `;
}

// Создать курс
function createCourse() {
  if (tg) {
    tg.showAlert('Перенаправление на создание курса...');
  }
  window.location.href = 'admin-courses.html';
}

// Редактировать курс
function editCourse(courseId) {
  window.location.href = `admin-courses.html?edit=${courseId}`;
}

// Просмотр студентов курса
function viewCourseStudents(courseId) {
  const course = myCourses.find(c => c.id === courseId);
  if (!course) return;

  const courseStudents = myStudents.filter(s => s.course_id === courseId);
  
  if (tg) {
    tg.showAlert(`Студентов на курсе "${course.title}": ${courseStudents.length}`);
  }
  
  switchTab('students');
}

// Просмотр прогресса студента
async function viewStudentProgress(userId, courseId) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/partner?action=getStudentProgress&userId=${currentUser.id}&studentId=${userId}&courseId=${courseId}`);
    const data = await response.json();
    
    if (data.success) {
      const progress = data.progress;
      if (tg) {
        tg.showAlert(`Прогресс: ${progress.completed_lessons}/${progress.total_lessons} уроков (${progress.progress}%)`);
      }
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' мин назад';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч назад';
  if (diff < 604800000) return Math.floor(diff / 86400000) + ' дн назад';
  
  return date.toLocaleDateString('ru-RU');
}

// Форматирование времени
function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Запуск
init();

console.log('💼 Partner Dashboard loaded');
