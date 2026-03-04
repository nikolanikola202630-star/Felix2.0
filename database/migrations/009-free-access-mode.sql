-- ============================================
-- Migration 009: Free Access Mode
-- Date: March 4, 2026
-- Purpose: Add support for free access period
-- ============================================

-- Add is_free column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;

-- Update all existing courses to free
UPDATE courses SET is_free = true WHERE is_free IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_courses_is_free ON courses(is_free);

-- Add comment
COMMENT ON COLUMN courses.is_free IS 'Indicates if course is free. true during free access period, false for paid courses.';

-- ============================================
-- Rollback instructions (to restore paid mode)
-- ============================================

-- To restore paid mode, run:
-- UPDATE courses SET is_free = false WHERE price > 0;
-- Then uncomment payment code marked with /* PAYMENT: ...

-- ============================================
-- Verification
-- ============================================

-- Check all courses are free
SELECT 
  id,
  title,
  price,
  is_free,
  CASE 
    WHEN is_free = true THEN '✅ Free'
    ELSE '💰 Paid'
  END as status
FROM courses
ORDER BY id;

-- Expected: All courses should show '✅ Free'
