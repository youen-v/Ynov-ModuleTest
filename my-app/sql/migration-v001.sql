CREATE DATABASE IF NOT EXISTS ynov_ci;
USE ynov_ci;
CREATE TABLE IF NOT EXISTS utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);
INSERT INTO utilisateur (name, email) VALUES ('Alice', 'alice@example.com');