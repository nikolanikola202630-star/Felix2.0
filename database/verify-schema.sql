-- Verification Script for Felix Bot Database Schema
-- Run this after applying complete-schema.sql to verify everything is correct

-- ============================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================

SELECT 
  '✅ Tables Check' as test,
  COUNT(*) as found,
  9 as expected,
  CASE WHEN COUNT(*) = 9 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'users', 'messages', 'tags', 'message_tags', 
    'user_settings', 'voice_messages', 'image_messages', 
    'document_messages', 'export_history'
  );

-- ============================================
-- 2. CHECK MESSAGE_TYPE COLUMN
-- ============================================

SELECT 
  '✅ message_type Column' as test,
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'message_type' 
      AND data_type = 'character varying' 
      AND is_nullable = 'NO' 
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM information_schema.columns
WHERE table_name = 'messages' 
  AND column_name = 'message_type';

-- ============================================
-- 3. CHECK ALL INDEXES
-- ============================================

SELECT 
  '✅ Indexes Check' as test,
  COUNT(*) as found,
  CASE WHEN COUNT(*) >= 15 THEN '✅ PASS' ELSE '⚠️ WARNING' END as status
FROM pg_indexes 
WHERE schemaname = 'public';

-- ============================================
-- 4. CHECK FUNCTIONS
-- ============================================

SELECT 
  '✅ Functions Check' as test,
  routine_name,
  '✅ EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'refresh_user_stats',
    'update_updated_at_column',
    'cleanup_expired_exports',
    'get_user_message_count',
    'search_messages_ranked'
  )
ORDER BY routine_name;

-- ============================================
-- 5. CHECK MATERIALIZED VIEW
-- ============================================

SELECT 
  '✅ Materialized View' as test,
  matviewname as name,
  '✅ EXISTS' as status
FROM pg_matviews 
WHERE schemaname = 'public'
  AND matviewname = 'user_stats';

-- ============================================
-- 6. CHECK TRIGGERS
-- ============================================

SELECT 
  '✅ Triggers Check' as test,
  trigger_name,
  event_object_table as table_name,
  '✅ EXISTS' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'update_users_updated_at',
    'update_user_settings_updated_at'
  )
ORDER BY trigger_name;

-- ============================================
-- 7. CHECK EXTENSIONS
-- ============================================

SELECT 
  '✅ Extensions Check' as test,
  extname as extension_name,
  '✅ INSTALLED' as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_trgm')
ORDER BY extname;

-- ============================================
-- 8. TEST INSERT (Optional - creates test data)
-- ============================================

-- Uncomment to test:
/*
-- Create test user
INSERT INTO users (id, first_name, username) 
VALUES (999999999, 'Test User', 'testuser')
ON CONFLICT (id) DO NOTHING
RETURNING id, first_name, '✅ User Created' as status;

-- Create test message
INSERT INTO messages (user_id, role, content, message_type)
VALUES (999999999, 'user', 'Тестовое сообщение', 'text')
RETURNING id, message_type, '✅ Message Created' as status;

-- Check stats
SELECT 
  '✅ Stats Check' as test,
  user_id,
  total_messages,
  '✅ Stats Working' as status
FROM user_stats 
WHERE user_id = 999999999;

-- Cleanup test data
DELETE FROM users WHERE id = 999999999;
*/

-- ============================================
-- 9. TABLE SIZES
-- ============================================

SELECT 
  '📊 Table Sizes' as info,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 10. SUMMARY
-- ============================================

SELECT 
  '🎉 VERIFICATION COMPLETE' as summary,
  'If all checks show ✅ PASS, your database is ready!' as message;
