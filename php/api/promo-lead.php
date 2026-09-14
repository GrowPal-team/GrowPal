<?php
/**
 * POST JSON { "email": "a@b.com", "discount_label": "10%" }
 * Stores promo signup; idempotent on email (updates timestamp via INSERT IGNORE + ON DUPLICATE not in all MySQL — use simple INSERT or check first).
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/send_verification_email.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$email = strtolower(trim($data['email'] ?? ''));
$discount = trim($data['discount_label'] ?? '10%');
$source = trim($data['source'] ?? 'homepage_modal');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email']);
    exit;
}

try {
    $conn->exec("
        CREATE TABLE IF NOT EXISTS promo_leads (
            id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL,
            discount_label VARCHAR(50) DEFAULT '10%',
            source VARCHAR(50) DEFAULT 'homepage_modal',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_promo_email (email),
            INDEX idx_created (created_at)
        )
    ");
    $chk = $conn->prepare('SELECT 1 FROM promo_leads WHERE email = ? LIMIT 1');
    $chk->execute([$email]);
    $wasExisting = (bool) $chk->fetchColumn();

    $stmt = $conn->prepare(
        "INSERT INTO promo_leads (email, discount_label, source) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE discount_label = VALUES(discount_label), source = VALUES(source)"
    );
    $stmt->execute([$email, $discount, $source]);

    $emailSent = false;
    if (!$wasExisting) {
        $emailSent = sendPromoLeadWelcomeEmail($email, $discount);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Saved',
        'welcome_email_sent' => $emailSent,
    ]);
} catch (PDOException $e) {
    error_log('promo-lead: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
