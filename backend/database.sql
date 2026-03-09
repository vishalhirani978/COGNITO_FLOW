CREATE DATABASE IF NOT EXISTS cognitoflow;

USE cognitoflow;

CREATE TABLE IF NOT EXISTS papers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    teacher_name VARCHAR(255),
    file_content TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_subject (subject),
    INDEX idx_year (year),
    INDEX idx_teacher_name (teacher_name)
);
