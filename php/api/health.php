<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $conn->query('SELECT 1');
    echo json_encode([
        'ok' => true,
        'app' => 'growpal-php',
        'database' => 'reachable',
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'app' => 'growpal-php',
        'database' => 'unreachable',
        'message' => $exception->getMessage(),
    ]);
}
