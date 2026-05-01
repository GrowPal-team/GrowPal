<?php
/**
 * Run this file once to add email verification columns to users table
 * Visit: http://localhost/GrowPal/run_email_verification_migration.php
 */
require_once __DIR__ . '/config/database.php';

header('Content-Type: text/html; charset=utf-8');

try {
    // Check existing columns
    $stmt = $conn->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $added = [];
    
    if (!in_array('email_verified', $columns)) {
        $conn->exec("ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0");
        $added[] = 'email_verified';
    }
    
    if (!in_array('verification_code', $columns)) {
        $conn->exec("ALTER TABLE users ADD COLUMN verification_code VARCHAR(6) DEFAULT NULL");
        $added[] = 'verification_code';
    }
    
    if (!in_array('verification_code_expires_at', $columns)) {
        $conn->exec("ALTER TABLE users ADD COLUMN verification_code_expires_at DATETIME DEFAULT NULL");
        $added[] = 'verification_code_expires_at';
    }
    
    if (!in_array('password_reset_code', $columns)) {
        $conn->exec("ALTER TABLE users ADD COLUMN password_reset_code VARCHAR(6) DEFAULT NULL");
        $added[] = 'password_reset_code';
    }
    if (!in_array('password_reset_expires_at', $columns)) {
        $conn->exec("ALTER TABLE users ADD COLUMN password_reset_expires_at DATETIME DEFAULT NULL");
        $added[] = 'password_reset_expires_at';
    }
    
    // جدول التسجيلات المعلقة — نخزن Hash للكود (مش الكود نفسه)
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('pending_registrations', $tables)) {
        $conn->exec("CREATE TABLE pending_registrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            full_name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            code_hash VARCHAR(255) DEFAULT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        $added[] = 'table pending_registrations';
    } else {
        $cols = $conn->query("SHOW COLUMNS FROM pending_registrations")->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('code', $cols)) {
            $conn->exec("ALTER TABLE pending_registrations DROP COLUMN code");
            $added[] = 'dropped pending_registrations.code';
        }
        if (!in_array('code_hash', $cols)) {
            // nullable لتجنب مشاكل وجود صفوف قديمة في الجدول
            $conn->exec("ALTER TABLE pending_registrations ADD COLUMN code_hash VARCHAR(255) DEFAULT NULL AFTER password_hash");
            $added[] = 'added pending_registrations.code_hash';
        }
    }

    // جدول أكواد إعادة تعيين كلمة المرور (نخزن Hash للكود فقط)
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('password_resets', $tables)) {
        $conn->exec("CREATE TABLE password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            code_hash VARCHAR(255) DEFAULT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        $added[] = 'table password_resets';
    } else {
        $cols = $conn->query("SHOW COLUMNS FROM password_resets")->fetchAll(PDO::FETCH_COLUMN);
        if (!in_array('code_hash', $cols)) {
            $conn->exec("ALTER TABLE password_resets ADD COLUMN code_hash VARCHAR(255) DEFAULT NULL");
            $added[] = 'added password_resets.code_hash';
        }
        if (!in_array('expires_at', $cols)) {
            $conn->exec("ALTER TABLE password_resets ADD COLUMN expires_at DATETIME NOT NULL");
            $added[] = 'added password_resets.expires_at';
        }
    }
    
    if (empty($added)) {
        echo "<h2 style='color: #0f6b3c;'>✓ Migration already applied.</h2>";
    } else {
        echo "<h2 style='color: #0f6b3c;'>✓ Migration successful! Added: " . implode(', ', $added) . "</h2>";
        $conn->exec("UPDATE users SET email_verified = 1 WHERE verification_code IS NULL");
    }
    
    echo "<p><a href='index.php'>← Back to GrowPal</a></p>";
    
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</h2>";
}
