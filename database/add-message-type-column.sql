-- Migration: Add message_type column to messages table
-- This fixes the error: column "message_type" does not exist

-- Add message_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'message_type'
    ) THEN
        -- Add the column with default value
        ALTER TABLE messages 
        ADD COLUMN message_type VARCHAR(20) NOT NULL DEFAULT 'text' 
        CHECK (message_type IN ('text', 'voice', 'image', 'document'));
        
        -- Create index for better performance
        CREATE INDEX idx_messages_type ON messages(message_type);
        
        RAISE NOTICE 'Column message_type added successfully';
    ELSE
        RAISE NOTICE 'Column message_type already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'messages' AND column_name = 'message_type';
