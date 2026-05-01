<?php

require_once __DIR__ . '/../config/database.php';

function columnExists(PDO $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM {$table} LIKE ?");
    $stmt->execute([$column]);
    return (bool) $stmt->fetch();
}

try {
    $conn->exec("
        CREATE TABLE IF NOT EXISTS community_feedback (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            rating DECIMAL(2,1) NOT NULL,
            title VARCHAR(150) NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_feedback_user
                FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE,
            INDEX idx_feedback_created_at (created_at),
            INDEX idx_feedback_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    if (!columnExists($conn, 'community_feedback', 'title')) {
        $conn->exec("ALTER TABLE community_feedback ADD COLUMN title VARCHAR(150) NULL AFTER rating");
    }

    if (!columnExists($conn, 'community_feedback', 'created_at')) {
        $conn->exec("ALTER TABLE community_feedback ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER body");
    }

    $conn->exec("ALTER TABLE community_feedback MODIFY COLUMN rating DECIMAL(2,1) NOT NULL");

    echo "community_feedback table is ready." . PHP_EOL;
    exit(0);
} catch (Throwable $error) {
    fwrite(STDERR, 'Feedback migration failed: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}
