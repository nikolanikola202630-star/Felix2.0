#!/usr/bin/env node
// Скрипт для загрузки тестовых курсов в Supabase

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Проверка переменных окружения
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL и SUPABASE_KEY должны быть установлены в .env');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Тестовые курсы
const testCourses = [
  {
    id: 'ai-basics',
    title: 'Основы искусственного интеллекта',
    description: 'Изучите основы AI с нуля. Узнайте, как работают нейронные сети, машинное обучение и глубокое обучение.',
    icon: '🤖',
    level: 'Начальный',
    duration: '2 часа',
    category: 'Технологии',
    price: 0,
    rating: 4.8,
    students: 1250,
    instructor: {
      name: 'Иван Петров',
      avatar: '👨‍🏫',
      bio: 'AI исследователь с 10-летним опытом'
    },
    themes: [
      {
        id: 1,
        title: 'Введение в AI',
        lessons: [
          {
            id: 1,
            title: 'Что такое искусственный интеллект?',
            type: 'text',
            duration: '15 мин',
            content: '# Что такое AI?\n\nИскусственный интеллект (AI) - это область компьютерных наук, которая занимается созданием интеллектуальных машин...'
          },
          {
            id: 2,
            title: 'История развития AI',
            type: 'video',
            duration: '20 мин',
            content: 'https://youtube.com/watch?v=example',
            videoId: 'example',
            platform: 'youtube'
          },
          {
            id: 3,
            title: 'Проверка знаний',
            type: 'quiz',
            duration: '10 мин',
            content: {
              questions: [
                {
                  id: 1,
                  question: 'Что такое AI?',
                  options: [
                    'Искусственный интеллект',
                    'Автоматизация процессов',
                    'Робототехника',
                    'Программирование'
                  ],
                  correct: 0
                }
              ]
            }
          }
        ]
      },
      {
        id: 2,
        title: 'Машинное обучение',
        lessons: [
          {
            id: 4,
            title: 'Основы ML',
            type: 'text',
            duration: '20 мин',
            content: '# Машинное обучение\n\nМашинное обучение - это подраздел AI...'
          }
        ]
      }
    ]
  },
  {
    id: 'python-basics',
    title: 'Python для начинающих',
    description: 'Изучите Python с нуля. Переменные, функции, классы и многое другое.',
    icon: '🐍',
    level: 'Начальный',
    duration: '3 часа',
    category: 'Программирование',
    price: 0,
    rating: 4.9,
    students: 2500,
    instructor: {
      name: 'Мария Сидорова',
      avatar: '👩‍🏫',
      bio: 'Python разработчик с 8-летним опытом'
    },
    themes: [
      {
        id: 1,
        title: 'Основы Python',
        lessons: [
          {
            id: 1,
            title: 'Установка Python',
            type: 'text',
            duration: '10 мин',
            content: '# Установка Python\n\nШаг 1: Скачайте Python с официального сайта...'
          },
          {
            id: 2,
            title: 'Первая программа',
            type: 'practice',
            duration: '15 мин',
            content: {
              task: 'Напишите программу, которая выводит "Hello, World!"',
              hints: ['Используйте функцию print()', 'Строки в Python заключаются в кавычки'],
              solution: 'print("Hello, World!")'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'Переменные и типы данных',
        lessons: [
          {
            id: 3,
            title: 'Что такое переменные?',
            type: 'text',
            duration: '15 мин',
            content: '# Переменные в Python\n\nПеременная - это контейнер для хранения данных...'
          }
        ]
      }
    ]
  },
  {
    id: 'web-development',
    title: 'Веб-разработка с нуля',
    description: 'HTML, CSS, JavaScript - все что нужно для создания сайтов.',
    icon: '🌐',
    level: 'Начальный',
    duration: '4 часа',
    category: 'Веб-разработка',
    price: 0,
    rating: 4.7,
    students: 1800,
    instructor: {
      name: 'Алексей Иванов',
      avatar: '👨‍💻',
      bio: 'Full-stack разработчик'
    },
    themes: [
      {
        id: 1,
        title: 'HTML основы',
        lessons: [
          {
            id: 1,
            title: 'Структура HTML документа',
            type: 'text',
            duration: '20 мин',
            content: '# HTML документ\n\nHTML - это язык разметки...'
          }
        ]
      }
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science для начинающих',
    description: 'Анализ данных, визуализация, статистика.',
    icon: '📊',
    level: 'Средний',
    duration: '5 часов',
    category: 'Аналитика',
    price: 0,
    rating: 4.6,
    students: 980,
    instructor: {
      name: 'Елена Смирнова',
      avatar: '👩‍🔬',
      bio: 'Data Scientist'
    },
    themes: [
      {
        id: 1,
        title: 'Введение в Data Science',
        lessons: [
          {
            id: 1,
            title: 'Что такое Data Science?',
            type: 'text',
            duration: '25 мин',
            content: '# Data Science\n\nНаука о данных...'
          }
        ]
      }
    ]
  },
  {
    id: 'ml-advanced',
    title: 'Продвинутое машинное обучение',
    description: 'Глубокое обучение, нейронные сети, компьютерное зрение.',
    icon: '🧠',
    level: 'Продвинутый',
    duration: '8 часов',
    category: 'Технологии',
    price: 0,
    rating: 4.9,
    students: 650,
    instructor: {
      name: 'Дмитрий Козлов',
      avatar: '👨‍🔬',
      bio: 'ML Engineer'
    },
    themes: [
      {
        id: 1,
        title: 'Глубокое обучение',
        lessons: [
          {
            id: 1,
            title: 'Нейронные сети',
            type: 'text',
            duration: '30 мин',
            content: '# Нейронные сети\n\nГлубокое обучение...'
          }
        ]
      }
    ]
  }
];

// Загрузить курсы
async function uploadCourses() {
  console.log('🚀 Загрузка тестовых курсов в Supabase...\n');

  let uploaded = 0;
  let failed = 0;

  for (const course of testCourses) {
    try {
      console.log(`📚 Загрузка: ${course.title}...`);

      const { data, error } = await supabase
        .from('courses')
        .upsert(course, { onConflict: 'id' })
        .select();

      if (error) {
        throw error;
      }

      console.log(`✅ Загружено: ${course.title}`);
      uploaded++;

    } catch (error) {
      console.error(`❌ Ошибка при загрузке ${course.title}:`, error.message);
      failed++;
    }

    console.log('');
  }

  // Итоги
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Результаты загрузки:\n`);
  console.log(`✅ Загружено: ${uploaded}`);
  console.log(`❌ Ошибок: ${failed}`);
  console.log(`📈 Всего: ${testCourses.length}\n`);

  if (failed === 0) {
    console.log('🎉 Все курсы загружены успешно!');
  } else {
    console.log('⚠️  Некоторые курсы не загружены. Проверьте логи.');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Проверить подключение к Supabase
async function checkConnection() {
  try {
    console.log('🔍 Проверка подключения к Supabase...');
    
    const { data, error } = await supabase
      .from('courses')
      .select('count')
      .limit(1);

    if (error) throw error;

    console.log('✅ Подключение успешно\n');
    return true;

  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    console.error('\nПроверьте:');
    console.error('1. SUPABASE_URL в .env');
    console.error('2. SUPABASE_KEY в .env');
    console.error('3. Таблица courses существует в базе данных\n');
    return false;
  }
}

// Главная функция
async function main() {
  const connected = await checkConnection();

  if (!connected) {
    process.exit(1);
  }

  await uploadCourses();
}

// Запуск
main().catch((error) => {
  console.error('💥 Критическая ошибка:', error.message);
  process.exit(1);
});
