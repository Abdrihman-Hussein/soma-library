-- =====================================================================
-- MIGRATION: 001_init.sql
-- Abuuritaanka miisaska aasaasiga ah ee nidaamka maktabadda
-- =====================================================================

CREATE DATABASE IF NOT EXISTS soma_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soma_library;

-- 1. Miiska Isticmaalayaasha (users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('reader', 'admin') DEFAULT 'reader',
    status ENUM('active', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Miiska Qaybaha Buugaagta (categories)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- 3. Miiska Buugaagta (books)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category_id INT,
    description TEXT,
    cover VARCHAR(255),
    pages INT,
    price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('PUBLISHED', 'DRAFT', 'ARCHIVED') DEFAULT 'PUBLISHED',
    pdf_path VARCHAR(255),
    pdf_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_books_category_id (category_id)
) ENGINE=InnoDB;

-- 4. Miiska Qorshayaasha Xubinnimada (plans)
CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_usd DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL,
    book_limit INT NOT NULL
) ENGINE=InnoDB;

-- 5. Miiska Diiwaangelinta Rukunka (subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_subscriptions_user_id (user_id)
) ENGINE=InnoDB;

-- 6. Miiska Lacag-bixinta (payments)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method ENUM('evc_plus', 'zaad', 'card') NOT NULL,
    status ENUM('pending', 'confirmed', 'refunded', 'failed') DEFAULT 'pending',
    reference VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_user_id (user_id)
) ENGINE=InnoDB;

-- 7. Miiska Gaariga Wax-iibsiga (cart_items)
CREATE TABLE IF NOT EXISTS cart_items (
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    qty INT NOT NULL DEFAULT 1 CHECK (qty > 0),
    PRIMARY KEY (user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Miiska Buugaagta Isticmaalaha u leeyahay (user_books)
CREATE TABLE IF NOT EXISTS user_books (
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    source ENUM('purchase', 'subscription') NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Miiska Horumarka Akhriska (reading_progress)
CREATE TABLE IF NOT EXISTS reading_progress (
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    last_page INT DEFAULT 0,
    total_pages INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_book (user_id, book_id),
    CHECK (last_page <= total_pages),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Miiska Ogeysiisyada (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    payload JSON,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Miiska Diiwaanka Hawlaha / Log-yada (audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id INT,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id INT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;