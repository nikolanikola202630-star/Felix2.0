// Профиль пользователя Felix Academy - Brandbook Version
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Загрузка данных профиля
async function loadProfileData() {
    const userId = tg?.initDataUnsafe?.user?.id;
    if (!userId) return;
    
    try {
        const response = await fetch(`/api/settings?userId=${userId}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const data = await response.json();
        updateProfile(data);
        
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось загрузить данные профиля');
    }
}

function updateProfile(data) {
    // Обновляем имя
    const user = tg?.initDataUnsafe?.user;
    if (user?.first_name) {
        document.getElementById('profileName').textContent = user.first_name;
    }
    
    // Обновляем статистику
    document.getElementById('completedCourses').textContent = data.completed_courses || 0;
    document.getElementById('certificates').textContent = data.certificates || 0;
    document.getElementById('favorites').textContent = data.favorites || 0;
}

function editProfile() {
    if (tg?.showAlert) {
        tg.showAlert('Редактирование профиля будет доступно в следующей версии');
    }
}

function logout() {
    if (tg?.showConfirm) {
        tg.showConfirm('Вы уверены, что хотите выйти?', (confirmed) => {
            if (confirmed) {
                // Очищаем локальные данные
                localStorage.clear();
                sessionStorage.clear();
                
                // Закрываем Mini App
                if (tg?.close) {
                    tg.close();
                } else {
                    window.location.href = 'main-brandbook.html';
                }
            }
        });
    }
}

function showError(message) {
    if (tg?.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

// Загружаем данные при открытии страницы
loadProfileData();
