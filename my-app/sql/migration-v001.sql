CREATE DATABASE ynov_ci;
CREATE TABLE ynov_ci.utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);
INSERT INTO ynov_ci.utilisateur (nom, email) VALUES ('Alice', 'alice@example.com');