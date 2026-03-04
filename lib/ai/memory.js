// AI Memory System - Векторная память для AI ассистента
const { supabase } = require('../supabase-client');
const { getGrokClient } = require('./grok-client');

// Создать эмбеддинг для текста
async function createEmbedding(text) {
  try {
    const grok = getGrokClient();
    const result = await grok.createEmbedding(text);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return {
      success: true,
      embedding: result.embedding
    };
  } catch (error) {
    console.error('Create embedding error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Сохранить сообщение в память
async function saveToMemory(userId, userMessage, aiMessage, metadata = {}) {
  try {
    // Создаём эмбеддинги
    const userEmbedding = await createEmbedding(userMessage);
    const aiEmbedding = await createEmbedding(aiMessage);
    
    if (!userEmbedding.success || !aiEmbedding.success) {
      throw new Error('Failed to create embeddings');
    }
    
    // Сохраняем в БД
    const { data, error } = await supabase
      .from('ai_memory')
      .insert([
        {
          user_id: userId,
          text: userMessage,
          embedding: userEmbedding.embedding,
          metadata: { ...metadata, role: 'user' }
        },
        {
          user_id: userId,
          text: aiMessage,
          embedding: aiEmbedding.embedding,
          metadata: { ...metadata, role: 'assistant' }
        }
      ]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Save to memory error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Поиск релевантного контекста в памяти
async function searchMemory(userId, query, options = {}) {
  const {
    limit = 5,
    threshold = 0.7
  } = options;
  
  try {
    // Создаём эмбеддинг для запроса
    const queryEmbedding = await createEmbedding(query);
    
    if (!queryEmbedding.success) {
      throw new Error('Failed to create query embedding');
    }
    
    // Ищем похожие воспоминания
    const { data, error } = await supabase
      .rpc('match_memory', {
        query_embedding: queryEmbedding.embedding,
        match_threshold: threshold,
        match_count: limit,
        p_user_id: userId
      });
    
    if (error) throw error;
    
    return {
      success: true,
      memories: data || []
    };
  } catch (error) {
    console.error('Search memory error:', error);
    return {
      success: false,
      error: error.message,
      memories: []
    };
  }
}

// Сохранить факт о пользователе
async function saveUserFact(userId, factType, fact, options = {}) {
  const {
    confidence = 1.0,
    source = 'conversation'
  } = options;
  
  try {
    // Создаём эмбеддинг для факта
    const factEmbedding = await createEmbedding(fact);
    
    if (!factEmbedding.success) {
      throw new Error('Failed to create fact embedding');
    }
    
    // Проверяем, нет ли уже похожего факта
    const { data: existingFacts } = await supabase
      .rpc('match_user_facts', {
        query_embedding: factEmbedding.embedding,
        match_threshold: 0.9,
        match_count: 1,
        p_user_id: userId
      });
    
    if (existingFacts && existingFacts.length > 0) {
      // Обновляем существующий факт
      const { error } = await supabase
        .from('ai_user_facts')
        .update({
          fact,
          confidence,
          last_mentioned_at: new Date().toISOString()
        })
        .eq('id', existingFacts[0].id);
      
      if (error) throw error;
      
      return { success: true, updated: true };
    }
    
    // Сохраняем новый факт
    const { error } = await supabase
      .from('ai_user_facts')
      .insert({
        user_id: userId,
        fact_type: factType,
        fact,
        confidence,
        source,
        embedding: factEmbedding.embedding,
        last_mentioned_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return { success: true, updated: false };
  } catch (error) {
    console.error('Save user fact error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Получить факты о пользователе
async function getUserFacts(userId, query = null, options = {}) {
  const {
    limit = 10,
    threshold = 0.7,
    factTypes = null
  } = options;
  
  try {
    if (query) {
      // Поиск по запросу
      const queryEmbedding = await createEmbedding(query);
      
      if (!queryEmbedding.success) {
        throw new Error('Failed to create query embedding');
      }
      
      const { data, error } = await supabase
        .rpc('match_user_facts', {
          query_embedding: queryEmbedding.embedding,
          match_threshold: threshold,
          match_count: limit,
          p_user_id: userId
        });
      
      if (error) throw error;
      
      return {
        success: true,
        facts: data || []
      };
    } else {
      // Получить все факты
      let query = supabase
        .from('ai_user_facts')
        .select('*')
        .eq('user_id', userId)
        .order('confidence', { ascending: false })
        .limit(limit);
      
      if (factTypes) {
        query = query.in('fact_type', factTypes);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        facts: data || []
      };
    }
  } catch (error) {
    console.error('Get user facts error:', error);
    return {
      success: false,
      error: error.message,
      facts: []
    };
  }
}

// Извлечь факты из разговора
async function extractFactsFromConversation(userId, conversation) {
  try {
    const grok = getGrokClient();
    
    const prompt = `
Проанализируй следующий разговор и извлеки важные факты о пользователе.

РАЗГОВОР:
${conversation}

Извлеки факты в следующих категориях:
- preference: предпочтения пользователя
- goal: цели и планы
- interest: интересы и хобби
- personal: личная информация
- business: бизнес-информация (для партнёров)

Верни JSON в формате:
{
  "facts": [
    {
      "type": "preference",
      "fact": "Предпочитает краткие ответы",
      "confidence": 0.9
    }
  ]
}

Извлекай только явные и важные факты. Не придумывай.
    `.trim();
    
    const result = await grok.chat([
      { role: 'user', content: prompt }
    ], {
      temperature: 0.3,
      maxTokens: 1000
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    const parsed = JSON.parse(result.content);
    const facts = parsed.facts || [];
    
    // Сохраняем факты
    for (const factData of facts) {
      await saveUserFact(userId, factData.type, factData.fact, {
        confidence: factData.confidence,
        source: 'auto_extraction'
      });
    }
    
    return {
      success: true,
      factsCount: facts.length
    };
  } catch (error) {
    console.error('Extract facts error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Получить контекст для AI (память + факты)
async function getAIContext(userId, query, options = {}) {
  const {
    includeMemory = true,
    includeFacts = true,
    memoryLimit = 5,
    factsLimit = 10
  } = options;
  
  try {
    const context = {
      memories: [],
      facts: [],
      summary: ''
    };
    
    // Получаем релевантные воспоминания
    if (includeMemory) {
      const memoryResult = await searchMemory(userId, query, { limit: memoryLimit });
      if (memoryResult.success) {
        context.memories = memoryResult.memories;
      }
    }
    
    // Получаем релевантные факты
    if (includeFacts) {
      const factsResult = await getUserFacts(userId, query, { limit: factsLimit });
      if (factsResult.success) {
        context.facts = factsResult.facts;
      }
    }
    
    // Формируем текстовое резюме контекста
    if (context.memories.length > 0) {
      context.summary += '\n\nИз предыдущих разговоров:\n';
      context.summary += context.memories
        .map(m => `- ${m.text}`)
        .join('\n');
    }
    
    if (context.facts.length > 0) {
      context.summary += '\n\nЧто я знаю о пользователе:\n';
      context.summary += context.facts
        .map(f => `- ${f.fact}`)
        .join('\n');
    }
    
    return {
      success: true,
      context
    };
  } catch (error) {
    console.error('Get AI context error:', error);
    return {
      success: false,
      error: error.message,
      context: { memories: [], facts: [], summary: '' }
    };
  }
}

module.exports = {
  createEmbedding,
  saveToMemory,
  searchMemory,
  saveUserFact,
  getUserFacts,
  extractFactsFromConversation,
  getAIContext
};
