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


### 4. Storage Service (lib/storage-docs.js)
```javascript
import { put } from '@vercel/blob';

export class StorageService {
    async uploadDocument(buffer, filename, userId) {
        const blob = await put(
            `documents/${userId}/${filename}`,
            buffer,
            { access: 'public' }
        );
        
        return {
            url: blob.url,
            size: buffer.length,
            filename: filename
        };
    }
    
    async getDocument(url) {
        const response = await fetch(url);
        return await response.arrayBuffer();
    }
}
```

## База данных

### Таблица documents
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    format VARCHAR(10) NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    pages INTEGER,
    status VARCHAR(20) DEFAULT 'generating',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_created_at ON documents(created_at);
```

### Таблица templates
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    structure JSONB NOT NULL,
    style JSONB NOT NULL,
    is_public BOOLEAN DEFAULT true,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);
```
