-- ============================================================
-- Secure Exam - Database Setup
-- Run this file in phpMyAdmin or MySQL CLI
-- ============================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS secure_exam;
USE secure_exam;

-- ============================================================
-- users table: stores registered users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- unique user ID
    name VARCHAR(100) NOT NULL,              -- full name
    email VARCHAR(150) NOT NULL UNIQUE,      -- email (must be unique)
    password VARCHAR(255) NOT NULL,          -- hashed password (bcrypt)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- results table: stores exam scores linked to users
-- ============================================================
CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- unique result ID
    user_id INT NOT NULL,                    -- foreign key to users
    score INT NOT NULL,                      -- number of correct answers
    total INT NOT NULL DEFAULT 10,           -- total questions
    percentage DECIMAL(5,2) NOT NULL,        -- calculated percentage
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Optional: seed a test user
-- Password is: test1234 (bcrypt hashed)
-- ============================================================
-- INSERT INTO users (name, email, password) VALUES
-- ('Test User', 'test@example.com', '$2b$10$examplehashedpasswordhere');