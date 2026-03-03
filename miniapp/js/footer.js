// EGOIST ECOSYSTEM Footer Component
// Автоматически добавляется на все страницы Felix Academy

(function() {
  'use strict';
  
  const footerHTML = `
    <footer class="app-footer">
      <div class="footer-content">
        <span class="footer-text">Создано в</span>
        <a href="https://t.me/egoist_ecosystem" target="_blank" rel="noopener noreferrer" class="footer-link">
          <span class="egoist-logo">⟁</span> EGOIST ECOSYSTEM
        </a>
        <span class="footer-year">© 2026</span>
      </div>
    </footer>
  `;
  
  function addFooter() {
    // Проверяем, не добавлен ли уже футер
    if (document.querySelector('.app-footer')) {
      return;
    }
    
    // Находим контейнер или body
    const container = document.querySelector('.container') || document.body;
    
    // Создаем временный элемент для парсинга HTML
    const temp = document.createElement('div');
    temp.innerHTML = footerHTML;
    
    // Добавляем футер в конец страницы
    if (container === document.body) {
      document.body.appendChild(temp.firstElementChild);
    } else {
      container.parentElement.appendChild(temp.firstElementChild);
    }
  }
  
  // Добавляем футер после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFooter);
  } else {
    addFooter();
  }
})();
