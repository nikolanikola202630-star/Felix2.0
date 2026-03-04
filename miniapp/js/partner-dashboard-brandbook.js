// Партнёрская панель Felix Academy - Brandbook Version
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Загрузка данных партнёра
async function loadPartnerData() {
    const userId = tg?.initDataUnsafe?.user?.id;
    if (!userId) return;
    
    try {
        const response = await fetch(`/api/partner-v12?userId=${userId}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const data = await response.json();
        updateDashboard(data);
        
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось загрузить данные');
    }
}

function updateDashboard(data) {
    // Обновляем имя
    const user = tg?.initDataUnsafe?.user;
    if (user?.first_name) {
        document.getElementById('partnerName').textContent = user.first_name;
    }
    
    // Обновляем статистику
    document.getElementById('referralsCount').textContent = data.referrals_count || 0;
    document.getElementById('totalEarned').textContent = formatCurrency(data.total_earned || 0);
    document.getElementById('conversion').textContent = `${data.conversion || 0}%`;
    document.getElementById('withdrawn').textContent = formatCurrency(data.withdrawn || 0);
    
    // Обновляем реферальную ссылку
    if (data.referral_code) {
        document.getElementById('refLink').value = `https://t.me/felix_academy_bot?start=${data.referral_code}`;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function copyLink() {
    const linkInput = document.getElementById('refLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        if (tg?.showPopup) {
            tg.showPopup({
                title: 'Готово',
                message: 'Ссылка скопирована',
                buttons: [{ type: 'ok' }]
            });
        }
    } catch (error) {
        console.error('Ошибка копирования:', error);
    }
}

async function requestPayout() {
    const userId = tg?.initDataUnsafe?.user?.id;
    if (!userId) return;
    
    if (tg?.showConfirm) {
        const confirmed = await new Promise(resolve => {
            tg.showConfirm('Запросить выплату заработанных средств?', resolve);
        });
        
        if (!confirmed) return;
    }
    
    try {
        const response = await fetch('/api/partner-v12/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        
        if (!response.ok) throw new Error('Ошибка запроса');
        
        const data = await response.json();
        
        if (tg?.showAlert) {
            tg.showAlert(data.message || 'Запрос на выплату отправлен');
        }
        
        loadPartnerData();
        
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось отправить запрос');
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
loadPartnerData();
