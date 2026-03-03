// Supabase клиент для работы с базой данных
const { createClient } = require('@supabase/supabase-js');

// Конфигурация
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;
let isConnected = false;

/**
 * Инициализация Supabase клиента
 */
function initSupabase() {
  if (supabase) {
    return supabase;
  }

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    console.warn('⚠️  Supabase not configured. Using in-memory fallback.');
    return null;
  }

  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'felix-academy'
        }
      }
    });

    isConnected = true;
    console.log('✅ Supabase connected:', supabaseUrl);
    return supabase;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return null;
  }
}

/**
 * Получить Supabase клиент
 */
function getSupabase() {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
}

/**
 * Проверить подключение к БД
 */
async function checkConnection() {
  const client = getSupabase();
  
  if (!client) {
    return { connected: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await client
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return { connected: false, error: error.message };
    }

    return { connected: true, message: 'Database connection OK' };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Выполнить запрос с автоматическим fallback
 */
async function query(tableName, operation, options = {}) {
  const client = getSupabase();
  
  if (!client) {
    throw new Error('Supabase not available. Use in-memory fallback.');
  }

  try {
    let query = client.from(tableName);

    switch (operation) {
      case 'select':
        query = query.select(options.select || '*');
        if (options.eq) {
          Object.entries(options.eq).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        if (options.order) {
          query = query.order(options.order.column, { ascending: options.order.ascending });
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }
        if (options.single) {
          query = query.single();
        }
        break;

      case 'insert':
        query = query.insert(options.data);
        if (options.select) {
          query = query.select();
        }
        if (options.single) {
          query = query.single();
        }
        break;

      case 'update':
        query = query.update(options.data);
        if (options.eq) {
          Object.entries(options.eq).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        if (options.select) {
          query = query.select();
        }
        break;

      case 'delete':
        if (options.eq) {
          Object.entries(options.eq).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        query = query.delete();
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`❌ Query error (${tableName}.${operation}):`, error);
    throw error;
  }
}

/**
 * Выполнить RPC функцию
 */
async function rpc(functionName, params = {}) {
  const client = getSupabase();
  
  if (!client) {
    throw new Error('Supabase not available');
  }

  try {
    const { data, error } = await client.rpc(functionName, params);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`❌ RPC error (${functionName}):`, error);
    throw error;
  }
}

/**
 * Получить статистику подключения
 */
function getStats() {
  return {
    connected: isConnected,
    url: supabaseUrl ? supabaseUrl.replace(/https?:\/\//, '').split('.')[0] + '.supabase.co' : 'not configured',
    hasKey: !!supabaseKey,
    client: !!supabase
  };
}

// Инициализация при загрузке модуля
initSupabase();

module.exports = {
  getSupabase,
  checkConnection,
  query,
  rpc,
  getStats,
  isConnected: () => isConnected
};
