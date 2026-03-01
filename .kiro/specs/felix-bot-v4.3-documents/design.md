# Felix Bot v4.3 - Дизайн системы генерации документов

## Архитектура

```
Telegram Bot
    ↓
api/webhook.js (обработка команд)
    ↓
lib/documents.js (логика генерации)
    ↓
┌─────────────────┬──────────────────┬─────────────────┐
│   AI Service    │  Template Engine │  Export Service │
│  (Groq LLaMA)   │   (Handlebars)   │  (PDF/DOCX)     │
└─────────────────┴──────────────────┴─────────────────┘
    ↓                    ↓                    ↓
Database (Supabase)  Storage (Vercel Blob)  Telegram API
```

## Модули

### 1. Document Generator (lib/documents.js)
```javascript
export class DocumentGenerator {
    constructor(type, topic, options) {
        this.type = type;        // 'referat', 'dogovor', 'resume'
        this.topic = topic;      // тема документа
        this.options = options;  // параметры (страницы, стиль, формат)
    }
    
    async generate() {
        // 1. Создать структуру
        const structure = await this.createStructure();
        
        // 2. Сгенерировать контент
        const content = await this.generateContent(structure);
        
        // 3. Применить шаблон
        const formatted = await this.applyTemplate(content);
        
        // 4. Экспортировать
        const file = await this.export(formatted);
        
        return file;
    }
}
```

### 2. Template Engine (lib/templates.js)
```javascript
export const templates = {
    referat: {
        structure: [
            'Титульный лист',
            'Оглавление',
            'Введение',
            'Основная часть',
            'Заключение',
            'Список литературы'
        ],
        style: {
            font: 'Times New Roman',
            size: 14,
            lineHeight: 1.5,
            margins: { top: 20, right: 15, bottom: 20, left: 30 }
        }
    },
    dogovor: {
        structure: [
            'Шапка договора',
            'Предмет договора',
            'Цена и порядок расчетов',
            'Права и обязанности сторон',
            'Ответственность сторон',
            'Срок действия',
            'Заключительные положения',
            'Реквизиты сторон'
        ],
        style: {
            font: 'Arial',
            size: 12,
            lineHeight: 1.0,
            margins: { top: 20, right: 20, bottom: 20, left: 20 }
        }
    }
};
```

### 3. Export Service (lib/export-docs.js)
```javascript
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph } from 'docx';

export class ExportService {
    async toPDF(content, options) {
        const doc = new PDFDocument(options);
        // Генерация PDF
        return doc;
    }
    
    async toDOCX(content, options) {
        const doc = new Document({
            sections: [/* секции */]
        });
        return await Packer.toBuffer(doc);
    }
}
```

