# 4. Оптимизация Mini App

## Проблема
- ❌ Огромный HTML файл (2926 строк)
- ❌ Все данные загружаются сразу
- ❌ Нет lazy loading
- ❌ Нет виртуализации списков
- ❌ Много DOM элементов

## Решение

### 1. Разделение на модули

```javascript
// miniapp/js/modules/courses.js
export async function loadCourses(page = 1, limit = 20) {
  const res = await fetch(`/api/courses?page=${page}&limit=${limit}`);
  return await res.json();
}

export function renderCourse(course, container) {
  const card = document.createElement('div');
  card.className = 'course-card';
  card.innerHTML = `
    <div class="course-icon">${course.icon}</div>
    <div class="course-title">${course.title}</div>
    <div class="course-desc">${course.description}</div>
  `;
  container.appendChild(card);
}
```

### 2. Lazy Loading с Intersection Observer

```javascript
// miniapp/js/lazy-load.js
export class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '100px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
  }
  
  observe(element) {
    this.observer.observe(element);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const loadFn = element.dataset.loadFn;
        
        if (loadFn && window[loadFn]) {
          window[loadFn](element);
          this.observer.unobserve(element);
        }
      }
    });
  }
}

// Использование
const lazyLoader = new LazyLoader();

document.querySelectorAll('.lazy-load').forEach(el => {
  lazyLoader.observe(el);
});
```

### 3. Пагинация

```javascript
// miniapp/js/pagination.js
export class Paginator {
  constructor(container, fetchFn, renderFn) {
    this.container = container;
    this.fetchFn = fetchFn;
    this.renderFn = renderFn;
    this.page = 1;
    this.loading = false;
    this.hasMore = true;
    
    this.setupScrollListener();
  }
  
  setupScrollListener() {
    window.addEventListener('scroll', () => {
      if (this.shouldLoadMore()) {
        this.loadMore();
      }
    });
  }
  
  shouldLoadMore() {
    const scrollBottom = window.innerHeight + window.scrollY;
    const pageBottom = document.body.offsetHeight - 500;
    
    return !this.loading && this.hasMore && scrollBottom >= pageBottom;
  }
  
  async loadMore() {
    if (this.loading || !this.hasMore) return;
    
    this.loading = true;
    this.showLoader();
    
    try {
      const data = await this.fetchFn(this.page);
      
      if (data.items.length === 0) {
        this.hasMore = false;
      } else {
        data.items.forEach(item => {
          this.renderFn(item, this.container);
        });
        this.page++;
      }
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      this.loading = false;
      this.hideLoader();
    }
  }
  
  showLoader() {
    const loader = document.createElement('div');
    loader.className = 'pagination-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    this.container.appendChild(loader);
  }
  
  hideLoader() {
    const loader = this.container.querySelector('.pagination-loader');
    if (loader) loader.remove();
  }
}

// Использование
const coursesPaginator = new Paginator(
  document.getElementById('coursesList'),
  (page) => fetch(`/api/courses?page=${page}&limit=20`).then(r => r.json()),
  (course, container) => renderCourse(course, container)
);
```

### 4. Виртуализация списков

```javascript
// miniapp/js/virtual-list.js
export class VirtualList {
  constructor(container, items, renderFn, itemHeight = 100) {
    this.container = container;
    this.items = items;
    this.renderFn = renderFn;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(window.innerHeight / itemHeight) + 2;
    this.startIndex = 0;
    
    this.setup();
    this.render();
    this.setupScrollListener();
  }
  
  setup() {
    this.container.style.position = 'relative';
    this.container.style.height = `${this.items.length * this.itemHeight}px`;
  }
  
  render() {
    // Clear visible items
    this.container.innerHTML = '';
    
    const endIndex = Math.min(
      this.startIndex + this.visibleCount,
      this.items.length
    );
    
    for (let i = this.startIndex; i < endIndex; i++) {
      const item = this.items[i];
      const element = this.renderFn(item);
      
      element.style.position = 'absolute';
      element.style.top = `${i * this.itemHeight}px`;
      element.style.height = `${this.itemHeight}px`;
      
      this.container.appendChild(element);
    }
  }
  
  setupScrollListener() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  
  handleScroll() {
    const scrollTop = window.scrollY;
    const newStartIndex = Math.floor(scrollTop / this.itemHeight);
    
    if (newStartIndex !== this.startIndex) {
      this.startIndex = newStartIndex;
      this.render();
    }
  }
}
```

### 5. Code Splitting

```html
<!-- miniapp/index.html -->
<script type="module">
  // Динамическая загрузка модулей
  async function loadTab(tabName) {
    const module = await import(`./js/tabs/${tabName}.js`);
    module.init();
  }
  
  // Загружать модули только при переключении вкладок
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      const tabName = tab.dataset.tab;
      await loadTab(tabName);
    });
  });
</script>
```

### 6. Image Lazy Loading

```html
<!-- Использовать native lazy loading -->
<img src="placeholder.jpg" 
     data-src="actual-image.jpg" 
     loading="lazy" 
     alt="Course image">

<script>
  // Fallback для старых браузеров
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.src = img.dataset.src;
    });
  } else {
    // Use Intersection Observer
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          imageObserver.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }
</script>
```

### 7. Service Worker для кэширования

```javascript
// miniapp/sw.js
const CACHE_NAME = 'felix-bot-v7.1';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/images/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

## Результаты

### До оптимизации
- Размер HTML: 2926 строк
- Время загрузки: ~3-5s
- DOM элементов: 500+
- FCP: ~2s
- LCP: ~4s

### После оптимизации
- Размер HTML: ~500 строк (модули)
- Время загрузки: ~1-2s
- DOM элементов: 100-200 (видимые)
- FCP: ~0.8s
- LCP: ~1.5s

## Трудозатраты
2-3 дня на рефакторинг и внедрение

## Приоритет
🟡 Средний
