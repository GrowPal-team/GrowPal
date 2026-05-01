<?php

require_once __DIR__ . '/../config/database.php';

$email = 'sadeel@growpal.com';
$plainPassword = 'Sadeel@123';
$fullName = 'Sadeel Admin';
$firstName = 'Sadeel';
$lastName = 'Admin';
$passwordHash = password_hash($plainPassword, PASSWORD_DEFAULT);

function columnExists(PDO $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare("SHOW COLUMNS FROM {$table} LIKE ?");
    $stmt->execute([$column]);
    return (bool) $stmt->fetch();
}

try {
    $hasFirstName = columnExists($conn, 'users', 'first_name');
    $hasLastName = columnExists($conn, 'users', 'last_name');
    $hasEmailVerified = columnExists($conn, 'users', 'email_verified');
    $hasStatus = columnExists($conn, 'users', 'status');

    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $existing = $stmt->fetch();

    if ($existing) {
        $fields = ['full_name = ?', 'password_hash = ?', "role = 'admin'"];
        $values = [$fullName, $passwordHash];

        if ($hasFirstName) {
            $fields[] = 'first_name = ?';
            $values[] = $firstName;
        }

        if ($hasLastName) {
            $fields[] = 'last_name = ?';
            $values[] = $lastName;
        }

        if ($hasEmailVerified) {
            $fields[] = 'email_verified = 1';
        }

        if ($hasStatus) {
            $fields[] = "status = 'active'";
        }

        $values[] = (int) $existing['id'];

        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $conn->prepare($sql);
        $stmt->execute($values);

        echo "Updated admin account for {$email}" . PHP_EOL;
        exit(0);
    }

    $columns = ['full_name', 'email', 'password_hash', 'role'];
    $placeholders = ['?', '?', '?', "'admin'"];
    $values = [$fullName, $email, $passwordHash];

    if ($hasFirstName) {
        $columns[] = 'first_name';
        $placeholders[] = '?';
        $values[] = $firstName;
    }

    if ($hasLastName) {
        $columns[] = 'last_name';
        $placeholders[] = '?';
        $values[] = $lastName;
    }

    if ($hasEmailVerified) {
        $columns[] = 'email_verified';
        $placeholders[] = '1';
    }

    if ($hasStatus) {
        $columns[] = 'status';
        $placeholders[] = "'active'";
    }

    $sql = 'INSERT INTO users (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')';
    $stmt = $conn->prepare($sql);
    $stmt->execute($values);

    echo "Created admin account for {$email}" . PHP_EOL;
    exit(0);
} catch (Throwable $error) {
    fwrite(STDERR, 'Failed to seed admin account: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}
