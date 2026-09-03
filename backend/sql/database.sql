
-- LIBRARY DATABASE =====================

CREATE DATABASE IF NOT EXISTS library;

USE library;


-- BOOKS TABLE =========================

CREATE TABLE IF NOT EXISTS books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    author VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    isbn VARCHAR(13) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url VARCHAR(500),
    image_public_id VARCHAR(500),
    available BOOLEAN DEFAULT TRUE
);


-- BORROWERS TABLE ====================

CREATE TABLE IF NOT EXISTS borrowers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    address VARCHAR(255),
    unique_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- BORROW HISTORY TABLE ==================

CREATE TABLE IF NOT EXISTS borrow_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT,
    borrower_id INT,
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    promised_return_date DATE,
    returned_at TIMESTAMP NULL,
    status BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (borrower_id) REFERENCES borrowers(id)
);