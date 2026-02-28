-- Felix Bot Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Voice messages table
CREATE TABLE IF NOT EXISTS voice_messages (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    file_id VARCHAR(255) NOT NULL,
    transcription TEXT,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (for context management)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    message_count INTEGER DEFAULT 0
);
