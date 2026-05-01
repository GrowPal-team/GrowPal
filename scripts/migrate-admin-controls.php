<?php

require_once __DIR__ . '/../config/database.php';

function columnExists(PDO $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM {$table} LIKE ?");
    $stmt->execute([$column]);
    return (bool) $stmt->fetch();
}

try {
    if (!columnExists($conn, 'users', 'status')) {
        $conn->exec("ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active' AFTER role");
        echo "Added users.status" . PHP_EOL;
    } else {
        echo "users.status already exists" . PHP_EOL;
    }

    $conn->exec("UPDATE users SET status = 'active' WHERE status IS NULL OR TRIM(status) = ''");

    if (!columnExists($conn, 'experts', 'approval_status')) {
        $conn->exec("ALTER TABLE experts ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'approved' AFTER specialization");
        echo "Added experts.approval_status" . PHP_EOL;
    } else {
        echo "experts.approval_status already exists" . PHP_EOL;
    }

    $conn->exec("UPDATE experts SET approval_status = 'approved' WHERE approval_status IS NULL OR TRIM(approval_status) = ''");

    echo "Admin control migration completed." . PHP_EOL;
    exit(0);
} catch (Throwable $error) {
    fwrite(STDERR, 'Admin control migration failed: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}
