<?php
/**
 * User profile: get / update (first_name, last_name, newsletter_opt_in).
 * Requires sql/add_user_profile_columns.sql applied once.
 */
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid method']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

$action = $data['action'] ?? '';
$userId = isset($data['userId']) ? (int) $data['userId'] : 0;

if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user']);
    exit;
}

function user_profile_columns_exist(PDO $conn): bool
{
    try {
        $stmt = $conn->query("SHOW COLUMNS FROM users LIKE 'first_name'");
        return $stmt && $stmt->fetch() !== false;
    } catch (PDOException $e) {
        return false;
    }
}

function build_display_name(array $row): string
{
    $fn = trim((string) ($row['first_name'] ?? ''));
    $ln = trim((string) ($row['last_name'] ?? ''));
    if ($fn !== '' || $ln !== '') {
        return trim($fn . ' ' . $ln);
    }
    return (string) ($row['full_name'] ?? '');
}

if (!user_profile_columns_exist($conn)) {
    echo json_encode([
        'success' => false,
        'message' => 'Database migration required: run sql/add_user_profile_columns.sql (or ask your admin).',
        'needs_migration' => true,
    ]);
    exit;
}

try {
    if ($action === 'get') {
        $stmt = $conn->prepare(
            'SELECT id, full_name, first_name, last_name, email, newsletter_opt_in FROM users WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }
        $display = build_display_name($row);
        echo json_encode([
            'success' => true,
            'profile' => [
                'id' => (int) $row['id'],
                'firstName' => $row['first_name'] ?? '',
                'lastName' => $row['last_name'] ?? '',
                'name' => $display,
                'email' => $row['email'],
                'newsletterOptIn' => (int) ($row['newsletter_opt_in'] ?? 0) === 1,
            ],
        ]);
        exit;
    }

    if ($action === 'update') {
        $first = trim((string) ($data['firstName'] ?? ''));
        $last = trim((string) ($data['lastName'] ?? ''));
        $newsletter = !empty($data['newsletterOptIn']) ? 1 : 0;

        if ($first === '' && $last === '') {
            echo json_encode(['success' => false, 'message' => 'First or last name is required']);
            exit;
        }

        $full = trim($first . ' ' . $last);
        if (strlen($full) > 200) {
            echo json_encode(['success' => false, 'message' => 'Name is too long']);
            exit;
        }

        $stmt = $conn->prepare(
            'UPDATE users SET full_name = ?, first_name = ?, last_name = ?, newsletter_opt_in = ? WHERE id = ?'
        );
        $stmt->execute([$full, $first, $last, $newsletter, $userId]);
        if ($stmt->rowCount() === 0) {
            $chk = $conn->prepare('SELECT id FROM users WHERE id = ?');
            $chk->execute([$userId]);
            if (!$chk->fetch()) {
                echo json_encode(['success' => false, 'message' => 'User not found']);
                exit;
            }
        }

        $emStmt = $conn->prepare('SELECT email FROM users WHERE id = ? LIMIT 1');
        $emStmt->execute([$userId]);
        $emailRow = $emStmt->fetch(PDO::FETCH_ASSOC);
        $userEmail = $emailRow ? (string) $emailRow['email'] : '';

        echo json_encode([
            'success' => true,
            'message' => 'Profile updated',
            'user' => [
                'id' => $userId,
                'firstName' => $first,
                'lastName' => $last,
                'name' => $full,
                'email' => $userEmail,
                'newsletterOptIn' => (bool) $newsletter,
            ],
        ]);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Unknown action']);
} catch (PDOException $e) {
    error_log('user-profile.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
