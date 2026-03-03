// Felix Academy - Admin Courses Management
// Управление курсами

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
}

const CONFIG = {
  API_URL: 'https://felix2-0.vercel.app/api',
  DATA_FILE: '../data/courses-structure.json'
};

let courses = [];
let currentCourse = null;
let themeCounter = 0;
let lessonCounter = 0;

// Инициализация
async function init() {
  console.log('🚀 Admin Courses - Initializing...');
  await loadCourses();
  updateStats();
}

// Загрузка курсов
async function loadCourses() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/courses-full`);
    const data = await response.json();
    
    if (data.success) {
      courses = data.courses;
      renderCourses(courses);
      updateStats();
    }
  } catch (error) {
    console.error('Error loading courses:', error);
    document.getElementById('coursesContainer').innerHTML = `
      <div class="loading">
        <p style="color: var(--danger);">❌ Ошибка загрузки курсов</p>
        <p style="font-size: 14px; color: var(--text-light);">${error.message}</p>
      </div>
    `;
  }
}

// Рендер курсов
function renderCourses(coursesToRender) {
  const container = document.getElementById('coursesContainer');
  
  if (coursesToRender.length === 0) {
    container.innerHTML = `
      <div class="loading">
        <p>📚 Курсов пока нет</p>
        <p style="font-size: 14px; color: var(--text-light);">Нажмите "Добавить курс" чтобы создать первый курс</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="courses-grid">
      ${coursesToRender.map(course => renderCourseCard(course)).join('')}
    </div>
  `;
}

// Рендер карточки курса
function renderCourseCard(course) {
  const totalLessons = course.themes?.reduce((sum, theme) => sum + (theme.lessons?.length || 0), 0) || 0;
  const freeLessons = course.themes?.reduce((sum, theme) => 
    sum + (theme.lessons?.filter(l => l.is_free).length || 0), 0) || 0;

  return `
    <div class="course-card">
      <img src="${course.image || 'https://via.placeholder.com/350x180/667eea/ffffff?text=' + encodeURIComponent(course.title)}" 
           alt="${course.title}" 
           class="course-image">
      <div class="course-content">
        <div class="course-header">
          <div>
            <div class="course-title">${course.title}</div>
            <span class="course-category">${getCategoryName(course.category)}</span>
          </div>
        </div>
        
        <div class="course-meta">
          <div class="meta-item">
            <div class="meta-label">Цена</div>
            <div class="meta-value">${course.price > 0 ? course.price + ' ₽' : 'Бесплатно'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Рейтинг</div>
            <div class="meta-value">⭐ ${course.rating || 0}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Уроков</div>
            <div class="meta-value">${totalLessons} (${freeLessons} 🆓)</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Длительность</div>
            <div class="meta-value">${course.duration_hours}ч</div>
          </div>
        </div>

        <div style="margin: 12px 0; padding: 12px; background: var(--bg); border-radius: 8px;">
          <div style="font-size: 12px; color: var(--text-light); margin-bottom: 4px;">Преподаватель</div>
          <div style="font-size: 14px; font-weight: 600;">
            ${course.instructor?.avatar || '👨‍🎓'} ${course.instructor?.name || 'Не указан'}
          </div>
          <div style="font-size: 12px; color: var(--text-light);">${course.instructor?.title || ''}</div>
        </div>

        <div style="margin: 12px 0; padding: 12px; background: var(--bg); border-radius: 8px;">
          <div style="font-size: 12px; color: var(--text-light); margin-bottom: 4px;">Студентов</div>
          <div style="font-size: 14px; font-weight: 600;">👥 ${course.students || 0}</div>
        </div>

        <div class="course-actions">
          <button onclick="editCourse(${course.id})" style="background: var(--primary); color: white;">
            ✏️ Редактировать
          </button>
          <button onclick="duplicateCourse(${course.id})" style="background: var(--success); color: white;">
            📋 Дублировать
          </button>
          <button onclick="deleteCourse(${course.id})" style="background: var(--danger); color: white;">
            🗑️ Удалить
          </button>
        </div>
      </div>
    </div>
  `;
}

// Получить название категории
function getCategoryName(category) {
  const names = {
    'psychology': 'Психология',
    'self-development': 'Саморазвитие',
    'business': 'Бизнес',
    'it': 'IT',
    'marketing': 'Маркетинг',
    'finance': 'Финансы'
  };
  return names[category] || category;
}

// Обновить статистику
function updateStats() {
  const totalCourses = courses.length;
  const totalLessons = courses.reduce((sum, course) => 
    sum + (course.themes?.reduce((s, t) => s + (t.lessons?.length || 0), 0) || 0), 0);
  const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0);
  const totalHours = courses.reduce((sum, course) => sum + (course.duration_hours || 0), 0);

  document.getElementById('totalCourses').textContent = totalCourses;
  document.getElementById('totalLessons').textContent = totalLessons;
  document.getElementById('totalStudents').textContent = totalStudents;
  document.getElementById('totalHours').textContent = totalHours + 'ч';
}

// Поиск курсов
function searchCourses(query) {
  if (!query.trim()) {
    renderCourses(courses);
    return;
  }

  const filtered = courses.filter(course => 
    course.title.toLowerCase().includes(query.toLowerCase()) ||
    course.description.toLowerCase().includes(query.toLowerCase()) ||
    course.category.toLowerCase().includes(query.toLowerCase())
  );

  renderCourses(filtered);
}

// Открыть модальное окно добавления курса
function openAddCourseModal() {
  currentCourse = null;
  document.getElementById('modalTitle').textContent = 'Добавить курс';
  document.getElementById('courseForm').reset();
  document.getElementById('themesContainer').innerHTML = '';
  themeCounter = 0;
  lessonCounter = 0;
  document.getElementById('courseModal').classList.add('active');
}

// Закрыть модальное окно
function closeCourseModal() {
  document.getElementById('courseModal').classList.remove('active');
}

// Редактировать курс
function editCourse(courseId) {
  currentCourse = courses.find(c => c.id === courseId);
  if (!currentCourse) return;

  document.getElementById('modalTitle').textContent = 'Редактировать курс';
  
  const form = document.getElementById('courseForm');
  form.title.value = currentCourse.title;
  form.slug.value = currentCourse.slug;
  form.description.value = currentCourse.description;
  form.category.value = currentCourse.category;
  form.level.value = currentCourse.level;
  form.price.value = currentCourse.price;
  form.duration_hours.value = currentCourse.duration_hours;
  form.image.value = currentCourse.image || '';
  form.instructor_name.value = currentCourse.instructor?.name || '';
  form.instructor_title.value = currentCourse.instructor?.title || '';
  form.instructor_avatar.value = currentCourse.instructor?.avatar || '';

  // Загрузить темы
  const themesContainer = document.getElementById('themesContainer');
  themesContainer.innerHTML = '';
  themeCounter = 0;
  lessonCounter = 0;

  if (currentCourse.themes) {
    currentCourse.themes.forEach(theme => {
      addTheme(theme);
    });
  }

  document.getElementById('courseModal').classList.add('active');
}

// Добавить тему
function addTheme(themeData = null) {
  themeCounter++;
  const themeId = `theme-${themeCounter}`;
  
  const themeHtml = `
    <div class="theme-item" id="${themeId}">
      <div class="theme-header">
        <input type="text" 
               placeholder="Название темы" 
               value="${themeData?.title || ''}"
               style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 6px;"
               data-theme-title>
        <button type="button" class="remove-btn" onclick="removeTheme('${themeId}')">Удалить тему</button>
      </div>
      <div style="margin: 8px 0;">
        <input type="text" 
               placeholder="Файл PDF (например: tema1.pdf)" 
               value="${themeData?.file || ''}"
               style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 6px;"
               data-theme-file>
      </div>
      <div class="lessons-list" data-lessons-container></div>
      <button type="button" class="add-btn" onclick="addLesson('${themeId}')">+ Добавить урок</button>
    </div>
  `;

  document.getElementById('themesContainer').insertAdjacentHTML('beforeend', themeHtml);

  // Добавить уроки если есть
  if (themeData?.lessons) {
    themeData.lessons.forEach(lesson => {
      addLesson(themeId, lesson);
    });
  }
}

// Удалить тему
function removeTheme(themeId) {
  if (confirm('Удалить тему и все её уроки?')) {
    document.getElementById(themeId).remove();
  }
}

// Добавить урок
function addLesson(themeId, lessonData = null) {
  lessonCounter++;
  const lessonId = `lesson-${lessonCounter}`;
  
  const lessonHtml = `
    <div class="lesson-item" id="${lessonId}">
      <div style="flex: 1;">
        <input type="text" 
               placeholder="Название урока" 
               value="${lessonData?.title || ''}"
               style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 4px; margin-bottom: 6px;"
               data-lesson-title>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
          <input type="number" 
                 placeholder="Минут" 
                 value="${lessonData?.duration || ''}"
                 style="padding: 6px; border: 1px solid var(--border); border-radius: 4px;"
                 data-lesson-duration>
          <input type="url" 
                 placeholder="URL видео" 
                 value="${lessonData?.video_url || ''}"
                 style="padding: 6px; border: 1px solid var(--border); border-radius: 4px;"
                 data-lesson-video>
          <label style="display: flex; align-items: center; gap: 6px; padding: 6px;">
            <input type="checkbox" 
                   ${lessonData?.is_free ? 'checked' : ''}
                   data-lesson-free>
            <span style="font-size: 12px;">Бесплатный</span>
          </label>
        </div>
      </div>
      <button type="button" class="remove-btn" onclick="removeLesson('${lessonId}')">✕</button>
    </div>
  `;

  const container = document.querySelector(`#${themeId} [data-lessons-container]`);
  container.insertAdjacentHTML('beforeend', lessonHtml);
}

// Удалить урок
function removeLesson(lessonId) {
  document.getElementById(lessonId).remove();
}

// Сохранить курс
async function saveCourse(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);

  // Собрать данные курса
  const courseData = {
    id: currentCourse?.id || (courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1),
    slug: formData.get('slug'),
    title: formData.get('title'),
    category: formData.get('category'),
    description: formData.get('description'),
    price: parseInt(formData.get('price')),
    rating: currentCourse?.rating || 0,
    students: currentCourse?.students || 0,
    duration_hours: parseInt(formData.get('duration_hours')),
    level: formData.get('level'),
    image: formData.get('image') || `https://via.placeholder.com/800x450/667eea/ffffff?text=${encodeURIComponent(formData.get('title'))}`,
    instructor: {
      name: formData.get('instructor_name'),
      title: formData.get('instructor_title'),
      avatar: formData.get('instructor_avatar') || '👨‍🎓'
    },
    themes: []
  };

  // Собрать темы и уроки
  const themeElements = document.querySelectorAll('.theme-item');
  themeElements.forEach((themeEl, themeIndex) => {
    const theme = {
      id: themeIndex + 1,
      title: themeEl.querySelector('[data-theme-title]').value,
      file: themeEl.querySelector('[data-theme-file]').value,
      lessons: []
    };

    const lessonElements = themeEl.querySelectorAll('.lesson-item');
    lessonElements.forEach((lessonEl, lessonIndex) => {
      const lesson = {
        id: (themeIndex * 100) + lessonIndex + 1,
        title: lessonEl.querySelector('[data-lesson-title]').value,
        duration: parseInt(lessonEl.querySelector('[data-lesson-duration]').value) || 0,
        is_free: lessonEl.querySelector('[data-lesson-free]').checked,
        video_url: lessonEl.querySelector('[data-lesson-video]').value || '',
        description: ''
      };
      theme.lessons.push(lesson);
    });

    courseData.themes.push(theme);
  });

  // Сохранить
  try {
    if (currentCourse) {
      // Обновить существующий
      const index = courses.findIndex(c => c.id === currentCourse.id);
      courses[index] = courseData;
    } else {
      // Добавить новый
      courses.push(courseData);
    }

    // Сохранить в JSON (в реальности - отправить на сервер)
    await saveCourses ToJSON();
    
    closeCourseModal();
    renderCourses(courses);
    updateStats();
    
    if (tg) {
      tg.showAlert('✅ Курс успешно сохранен!');
    } else {
      alert('✅ Курс успешно сохранен!');
    }
  } catch (error) {
    console.error('Error saving course:', error);
    if (tg) {
      tg.showAlert('❌ Ошибка сохранения: ' + error.message);
    } else {
      alert('❌ Ошибка сохранения: ' + error.message);
    }
  }
}

// Дублировать курс
function duplicateCourse(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  const newCourse = JSON.parse(JSON.stringify(course));
  newCourse.id = Math.max(...courses.map(c => c.id)) + 1;
  newCourse.title = course.title + ' (копия)';
  newCourse.slug = course.slug + '-copy';
  newCourse.students = 0;

  courses.push(newCourse);
  renderCourses(courses);
  updateStats();
  
  if (tg) {
    tg.showAlert('✅ Курс продублирован!');
  } else {
    alert('✅ Курс продублирован!');
  }
}

// Удалить курс
function deleteCourse(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  const confirmMsg = `Удалить курс "${course.title}"?\n\nЭто действие нельзя отменить!`;
  
  if (confirm(confirmMsg)) {
    courses = courses.filter(c => c.id !== courseId);
    renderCourses(courses);
    updateStats();
    
    if (tg) {
      tg.showAlert('✅ Курс удален');
    } else {
      alert('✅ Курс удален');
    }
  }
}

// Экспорт в JSON
function exportToJSON() {
  const dataStr = JSON.stringify({ courses }, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'courses-structure.json';
  link.click();
  URL.revokeObjectURL(url);
  
  if (tg) {
    tg.showAlert('✅ Файл скачан!');
  }
}

// Импорт из JSON
function importFromJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.courses && Array.isArray(data.courses)) {
        courses = data.courses;
        renderCourses(courses);
        updateStats();
        
        if (tg) {
          tg.showAlert(`✅ Импортировано ${courses.length} курсов!`);
        } else {
          alert(`✅ Импортировано ${courses.length} курсов!`);
        }
      } else {
        throw new Error('Неверный формат файла');
      }
    } catch (error) {
      console.error('Import error:', error);
      if (tg) {
        tg.showAlert('❌ Ошибка импорта: ' + error.message);
      } else {
        alert('❌ Ошибка импорта: ' + error.message);
      }
    }
  };
  input.click();
}

// Сохранить курсы в JSON (заглушка - в реальности отправить на сервер)
async function saveCoursesToJSON() {
  // TODO: Отправить на сервер через API
  console.log('Saving courses:', courses);
  
  // Для локального тестирования - сохраняем в localStorage
  localStorage.setItem('felix_courses', JSON.stringify({ courses }));
  
  return Promise.resolve();
}

// Закрытие модального окна по клику вне его
document.getElementById('courseModal').addEventListener('click', (e) => {
  if (e.target.id === 'courseModal') {
    closeCourseModal();
  }
});

// Запуск
init();

console.log('🎓 Admin Courses loaded');
