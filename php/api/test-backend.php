<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

$result = ['ok' => true, 'checks' => []];

try {
    require_once __DIR__ . '/../config/database.php';
    $result['checks']['database'] = 'OK';
} catch (Throwable $e) {
    $result['checks']['database'] = 'FAIL: ' . $e->getMessage();
    $result['ok'] = false;
}

try {
    require_once __DIR__ . '/../config/email.php';
    $result['checks']['email_config'] = 'OK';
} catch (Throwable $e) {
    $result['checks']['email_config'] = 'FAIL: ' . $e->getMessage();
    $result['ok'] = false;
}

$result['checks']['vendor'] = file_exists(__DIR__ . '/../vendor/autoload.php') ? 'OK' : 'MISSING';

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
