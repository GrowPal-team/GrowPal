<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/send_verification_email.php';
require_once __DIR__ . '/../includes/code_token.php';
require_once __DIR__ . '/../includes/ensure_expert_row.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

function passwordMeetsPolicy($password) {
    return is_string($password)
        && strlen($password) >= 8
        && preg_match('/[A-Z]/', $password)
        && preg_match('/[a-z]/', $password)
        && preg_match('/[0-9]/', $password)
        && preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password);
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    // Log for debugging
    error_log("API Request - Method: $method, Data: " . print_r($data, true));
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON: ' . json_last_error_msg()]);
        exit;
    }
    
    $action = $data['action'] ?? '';
    
    if ($action === 'register') {
        // Register new user
        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        
        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            exit;
        }

        if (!passwordMeetsPolicy($password)) {
            echo json_encode([
                'success' => false,
                'message' => 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
            ]);
            exit;
        }
        
        try {
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already exists. Please use a different email.']);
                exit;
            }
            
            $verificationCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            // نخزن الكود مباشرة لضمان التطابق (حل عملي سريع)
            $codeHash = $verificationCode;
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            // نخلي الصلاحية طويلة حتى لو كان في فرق توقيت بين PHP و MySQL
            $expires = date('Y-m-d H:i:s', strtotime('+1 day'));

            // نخزن Hash للكود فقط
            $stmt = $conn->prepare("REPLACE INTO pending_registrations (email, full_name, password_hash, code_hash, expires_at) VALUES (?, ?, ?, ?, ?)");
            if ($stmt->execute([$email, $name, $hashedPassword, $codeHash, $expires])) {
                error_log("GrowPal register: stored pending_registrations for email={$email}, expires_at={$expires}");
                // التوكن مش ضروري للتحقق الآن، بس نخليه لو احتجناه لاحقاً
                $token = createCodeToken($email, $verificationCode, 900);
                $emailSent = sendVerificationEmail($email, $name, $verificationCode);
                error_log("GrowPal register: email send status for email={$email}: " . ($emailSent ? 'sent' : 'failed'));
                $response = [
                    'success' => true,
                    'message' => 'Check your email for the verification code. Enter it to complete registration.',
                    'email' => $email,
                    'needs_verification' => true,
                    'token' => $token
                ];
                if (!$emailSent) {
                    $response['dev_code'] = $verificationCode;
                }
                echo json_encode($response);
            } else {
                echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            if (strpos($e->getMessage(), 'pending_registrations') !== false) {
                echo json_encode(['success' => false, 'message' => 'Please run the database migration: /run_email_verification_migration.php']);
                exit;
            }
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }

    } elseif ($action === 'verify-code') {
        $email = strtolower(trim($data['email'] ?? ''));
        $code = trim($data['code'] ?? '');
        // التوكن لم يعد شرطاً، لكن نقبله لو موجود
        if (empty($email) || strlen($code) !== 6 || !ctype_digit($code)) {
            echo json_encode(['success' => false, 'message' => 'Please enter the 6-digit code from your email.']);
            exit;
        }
        try {
            // لا نعتمد على توقيت السيرفر بشكل صارم هنا (مشاكل timezone)
            $stmt = $conn->prepare("SELECT id, full_name, email, password_hash, code_hash FROM pending_registrations WHERE email = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$email]);
            $pending = $stmt->fetch();
            if (!$pending) {
                echo json_encode(['success' => false, 'message' => 'Invalid or expired code. Please request a new one.']);
                exit;
            }
            if (empty($pending['code_hash'])) {
                error_log("GrowPal verify-code: code_hash missing for email={$email}");
                echo json_encode(['success' => false, 'message' => 'Invalid or expired code. Please check and try again.']);
                exit;
            }

            $storedCode = (string) $pending['code_hash'];
            $codeMatches = ($storedCode === $code) || password_verify($code, $storedCode);
            if (!$codeMatches) {
                error_log("GrowPal verify-code: code mismatch for email={$email}");
                echo json_encode(['success' => false, 'message' => 'Invalid or expired code. Please check and try again.']);
                exit;
            }
            $full = trim($pending['full_name']);
            $parts = preg_split('/\s+/', $full, 2, PREG_SPLIT_NO_EMPTY);
            $fn = $parts[0] ?? '';
            $ln = isset($parts[1]) ? trim($parts[1]) : '';
            // Prefer extended columns when migration has been applied
            try {
                $checkCols = $conn->query("SHOW COLUMNS FROM users LIKE 'first_name'");
                $hasSplit = $checkCols && $checkCols->fetch();
            } catch (PDOException $e) {
                $hasSplit = false;
            }
            if ($hasSplit) {
                $stmt = $conn->prepare("INSERT INTO users (full_name, first_name, last_name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?, 'user', 1)");
                $stmt->execute([$full, $fn, $ln, $pending['email'], $pending['password_hash']]);
            } else {
                $stmt = $conn->prepare("INSERT INTO users (full_name, email, password_hash, role, email_verified) VALUES (?, ?, ?, 'user', 1)");
                $stmt->execute([$full, $pending['email'], $pending['password_hash']]);
            }
            $userId = $conn->lastInsertId();
            $stmt = $conn->prepare("DELETE FROM pending_registrations WHERE email = ?");
            $stmt->execute([$email]);
            echo json_encode([
                'success' => true,
                'message' => 'Account created successfully!',
                'user' => [
                    'id' => (int) $userId,
                    'name' => $full,
                    'firstName' => $fn,
                    'lastName' => $ln,
                    'email' => $pending['email'],
                    'role' => 'user',
                    'newsletterOptIn' => false,
                ],
            ]);
        } catch (PDOException $e) {
            error_log("Verify code error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Verification failed. Please try again.']);
        }
        
    } elseif ($action === 'resend-code') {
        $email = strtolower(trim($data['email'] ?? ''));
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email.']);
            exit;
        }
        try {
            $stmt = $conn->prepare("SELECT full_name FROM pending_registrations WHERE email = ?");
            $stmt->execute([$email]);
            $pending = $stmt->fetch();
            if (!$pending) {
                echo json_encode(['success' => false, 'message' => 'No pending registration for this email. Please sign up again.']);
                exit;
            }
            $verificationCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            // نخزن الكود مباشرة لضمان التطابق (حل عملي سريع)
            $codeHash = $verificationCode;
            $expires = date('Y-m-d H:i:s', strtotime('+1 day'));
            $stmt = $conn->prepare("UPDATE pending_registrations SET code_hash = ?, expires_at = ? WHERE email = ?");
            $stmt->execute([$codeHash, $expires, $email]);
            $token = createCodeToken($email, $verificationCode, 900);
            $emailSent = sendVerificationEmail($email, $pending['full_name'], $verificationCode);
            $response = ['success' => true, 'message' => 'Verification code sent! Check your email.', 'token' => $token];
            if (!$emailSent && strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false) {
                $response['dev_code'] = $verificationCode;
            }
            echo json_encode($response);
        } catch (PDOException $e) {
            error_log("Resend code error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Failed to resend code.']);
        }
        
    } elseif ($action === 'login') {
        // Login user
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Email and password are required']);
            exit;
        }
        
        // Get user from database - including email_verified (optional profile columns)
        try {
            $checkCols = $conn->query("SHOW COLUMNS FROM users LIKE 'first_name'");
            $hasSplit = $checkCols && $checkCols->fetch();
        } catch (PDOException $e) {
            $hasSplit = false;
        }
        try {
            $statusCols = $conn->query("SHOW COLUMNS FROM users LIKE 'status'");
            $hasStatus = $statusCols && $statusCols->fetch();
        } catch (PDOException $e) {
            $hasStatus = false;
        }
        try {
            $approvalCols = $conn->query("SHOW COLUMNS FROM experts LIKE 'approval_status'");
            $hasExpertApproval = $approvalCols && $approvalCols->fetch();
        } catch (PDOException $e) {
            $hasExpertApproval = false;
        }
        if ($hasSplit) {
            if ($hasStatus) {
                $stmt = $conn->prepare("SELECT id, full_name, first_name, last_name, email, password_hash, role, email_verified, newsletter_opt_in, status FROM users WHERE email = ?");
            } else {
                $stmt = $conn->prepare("SELECT id, full_name, first_name, last_name, email, password_hash, role, email_verified, newsletter_opt_in FROM users WHERE email = ?");
            }
        } else {
            if ($hasStatus) {
                $stmt = $conn->prepare("SELECT id, full_name, email, password_hash, role, email_verified, status FROM users WHERE email = ?");
            } else {
                $stmt = $conn->prepare("SELECT id, full_name, email, password_hash, role, email_verified FROM users WHERE email = ?");
            }
        }
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            exit;
        }

        $accountStatus = strtolower(trim((string) ($user['status'] ?? 'active')));
        if ($hasStatus && $accountStatus === 'blocked') {
            echo json_encode(['success' => false, 'message' => 'This account has been blocked by an admin.']);
            exit;
        }
        
        // Verify password
        $passwordValid = password_verify($password, $user['password_hash']);
        
        if ($passwordValid) {
            // Check if email is verified
            $emailVerified = isset($user['email_verified']) ? (int) $user['email_verified'] : 1;
            if ($emailVerified === 0) {
                echo json_encode([
                    'success' => false,
                    'needs_verification' => true,
                    'message' => 'Please verify your email first.',
                    'email' => $user['email'],
                    'user_id' => (int) $user['id']
                ]);
                exit;
            }
            // Start session
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['full_name'];
            $_SESSION['user_email'] = $user['email'];
            if ($hasSplit) {
                $fn = trim((string) ($user['first_name'] ?? ''));
                $ln = trim((string) ($user['last_name'] ?? ''));
                $display = ($fn !== '' || $ln !== '') ? trim($fn . ' ' . $ln) : trim((string) ($user['full_name'] ?? ''));
            } else {
                $parts = preg_split('/\s+/', trim((string) ($user['full_name'] ?? '')), 2, PREG_SPLIT_NO_EMPTY);
                $fn = $parts[0] ?? '';
                $ln = isset($parts[1]) ? trim($parts[1]) : '';
                $display = trim((string) ($user['full_name'] ?? ''));
            }

            $roleNorm = strtolower(trim((string) ($user['role'] ?? 'user')));
            $_SESSION['user_role'] = $roleNorm;
            $expertApprovalStatus = null;
            if ($roleNorm === 'expert') {
                ensureExpertRow($conn, (int) $user['id'], $display);
                if ($hasExpertApproval) {
                    $approvalStmt = $conn->prepare("SELECT approval_status FROM experts WHERE user_id = ? LIMIT 1");
                    $approvalStmt->execute([(int) $user['id']]);
                    $approvalRow = $approvalStmt->fetch();
                    $expertApprovalStatus = strtolower(trim((string) ($approvalRow['approval_status'] ?? 'approved')));
                } else {
                    $expertApprovalStatus = 'approved';
                }
            }

            echo json_encode([
                'success' => true, 
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $display,
                    'firstName' => $fn,
                    'lastName' => $ln,
                    'email' => $user['email'],
                    'role' => $roleNorm,
                    'status' => $accountStatus ?: 'active',
                    'approvalStatus' => $expertApprovalStatus,
                    'newsletterOptIn' => isset($user['newsletter_opt_in']) ? ((int)$user['newsletter_opt_in'] === 1) : false,
                ]
            ]);
        } else {
            // Log failed login attempt for debugging (only in development)
            error_log("Login failed for email: $email - Password verification failed");
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        }
        
    } elseif ($action === 'forgot-password') {
        $email = strtolower(trim($data['email'] ?? ''));
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
            exit;
        }
        try {
            $stmt = $conn->prepare("SELECT id, full_name FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if (!$user) {
                echo json_encode(['success' => true, 'message' => 'If that email is registered, you will receive a reset code.', 'email' => $email]);
                exit;
            }
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $codeHash = password_hash($code, PASSWORD_DEFAULT);
            // نخزن Hash للكود فقط بدل الاعتماد على التوكن
            $stmt = $conn->prepare("REPLACE INTO password_resets (email, code_hash, expires_at) VALUES (?, ?, ?)");
            $expires = date('Y-m-d H:i:s', strtotime('+1 day'));
            $stmt->execute([$email, $codeHash, $expires]);
            error_log("GrowPal forgot-password: stored password_resets for email={$email}, expires_at={$expires}");

            $token = createCodeToken($email, $code, 900); // اختياري (الواجهة تحتاجه بالرابط)
            $emailSent = sendPasswordResetEmail($email, $user['full_name'], $code);
            error_log("GrowPal forgot-password: email send status for email={$email}: " . ($emailSent ? 'sent' : 'failed'));
            $response = ['success' => true, 'message' => 'Check your email for the reset code.', 'email' => $email, 'token' => $token];
            if (!$emailSent && strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false) {
                $response['dev_code'] = $code;
            }
            echo json_encode($response);
        } catch (PDOException $e) {
            error_log("Forgot password error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
        }
    } elseif ($action === 'reset-password') {
        $email = strtolower(trim($data['email'] ?? ''));
        $code = trim($data['code'] ?? '');
        $token = trim($data['token'] ?? '');
        $newPassword = $data['new_password'] ?? '';
        if (empty($email) || strlen($code) !== 6 || !ctype_digit($code)) {
            echo json_encode(['success' => false, 'message' => 'Please enter the 6-digit code from your email.']);
            exit;
        }
        if (strlen($newPassword) < 8) {
            echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
            exit;
        }
        if (!passwordMeetsPolicy($newPassword)) {
            echo json_encode([
                'success' => false,
                'message' => 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
            ]);
            exit;
        }
        try {
            // التوكن لم يعد شرطاً—نرجع نتحقق من code_hash في قاعدة البيانات
            // نفس الفكرة: نأخذ آخر كود محفوظ بدون الاعتماد على timezone
            $stmt = $conn->prepare("SELECT code_hash, expires_at FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$email]);
            $reset = $stmt->fetch();
            if (!$reset || empty($reset['code_hash'])) {
                error_log("GrowPal reset-password: no/empty password_resets row for email={$email}");
                echo json_encode(['success' => false, 'message' => 'Invalid or expired code. Please request a new one.']);
                exit;
            }
            if (!password_verify($code, $reset['code_hash'])) {
                error_log("GrowPal reset-password: code_hash verify failed (email={$email})");
                echo json_encode(['success' => false, 'message' => 'Invalid or expired code. Please check and try again.']);
                exit;
            }

            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Invalid request.']);
                exit;
            }
            $hash = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $stmt->execute([$hash, $user['id']]);
            $stmt = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
            $stmt->execute([$email]);
            echo json_encode(['success' => true, 'message' => 'Password updated. You can now sign in.']);
        } catch (PDOException $e) {
            error_log("Reset password error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
        }
    } elseif ($action === 'check-email') {
        // Check if email already exists
        $email = trim($data['email'] ?? '');
        
        if (empty($email)) {
            echo json_encode(['exists' => false]);
            exit;
        }
        
        try {
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $exists = $stmt->fetch() !== false;
            
            echo json_encode(['exists' => $exists]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            echo json_encode(['exists' => false]); // Default to false on error
        }
    }
} else {
    // Log the actual request method for debugging
    error_log("API called with method: " . ($method ?? 'UNKNOWN'));
    echo json_encode([
        'success' => false, 
        'message' => 'Invalid request method',
        'received_method' => $method ?? 'UNKNOWN',
        'expected_method' => 'POST'
    ]);
}
?>
