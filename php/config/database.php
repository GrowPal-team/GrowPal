<?php

function growpal_database_config(): array {
    $databaseUrl = getenv('DATABASE_URL') ?: '';

    if ($databaseUrl !== '') {
        $parts = parse_url($databaseUrl);
        if ($parts !== false) {
            parse_str($parts['query'] ?? '', $query);

            return [
                'host' => $parts['host'] ?? '127.0.0.1',
                'port' => (int)($parts['port'] ?? 3306),
                'dbname' => isset($parts['path']) ? ltrim($parts['path'], '/') : 'growpal_db',
                'username' => rawurldecode($parts['user'] ?? ''),
                'password' => rawurldecode($parts['pass'] ?? ''),
                'charset' => $query['charset'] ?? 'utf8mb4',
            ];
        }
    }

    return [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => (int)(getenv('DB_PORT') ?: 3306),
        'dbname' => getenv('DB_NAME') ?: 'growpal_db',
        'username' => getenv('DB_USERNAME') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
        'charset' => getenv('DB_CHARSET') ?: 'utf8mb4',
    ];
}

$db = growpal_database_config();
$dsn = sprintf(
    'mysql:host=%s;port=%d;dbname=%s;charset=%s',
    $db['host'],
    $db['port'],
    $db['dbname'],
    $db['charset']
);

try {
    $conn = new PDO($dsn, $db['username'], $db['password']);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}
?>
