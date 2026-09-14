<?php
/**
 * Signed token for verification/reset codes - لا نحفظ الأكواد في DB
 * base64url لتفادي تلف التوكن في الرابط (الـ + والـ /)
 */
function createCodeToken($email, $code, $expiresInSeconds = 900) {
    if (!defined('CODE_SECRET')) {
        require_once __DIR__ . '/../config/email.php';
    }
    // Email comparison يجب أن يكون ثابت (case-insensitive)
    $email = strtolower(trim((string) $email));
    $code = (string) $code;

    $payload = json_encode([
        'e' => $email,
        'c' => $code,
        'x' => time() + $expiresInSeconds
    ]);
    $sig = hash_hmac('sha256', $payload, CODE_SECRET);
    $b64 = base64_encode($payload . '.' . $sig);
    return strtr(rtrim($b64, '='), '+/', '-_');
}

function verifyCodeToken($token, $email, $code) {
    if (!defined('CODE_SECRET') || empty($token)) return false;

    $token = trim((string) $token);
    // إذا كان التوكن القديم اتخرب بسبب '+' -> space في query string
    $token = str_replace(' ', '+', $token);

    $email = strtolower(trim((string) $email));
    $code = (string) $code;

    // جرّب فك الترميز بصيغتين: base64url (الجديد) و base64 العادي (قديم)
    $raw = false;

    // 1) base64url decode
    $b64url = strtr($token, '-_', '+/');
    $pad = strlen($b64url) % 4;
    if ($pad) $b64url .= str_repeat('=', 4 - $pad);
    $raw = base64_decode($b64url, true);

    // 2) fallback: base64 decode العادي
    if ($raw === false) {
        $raw = base64_decode($token, true);
    }
    if ($raw === false) return false;
    $parts = explode('.', $raw, 2);
    if (count($parts) !== 2) return false;
    list($payload, $sig) = $parts;
    if (hash_hmac('sha256', $payload, CODE_SECRET) !== $sig) {
        error_log("GrowPal verifyCodeToken: signature mismatch (tokenLen=" . strlen($token) . ")");
        return false;
    }
    $data = json_decode($payload, true);
    if (!$data || !isset($data['e'], $data['c'], $data['x'])) {
        error_log("GrowPal verifyCodeToken: invalid payload (tokenLen=" . strlen($token) . ")");
        return false;
    }
    if ($data['x'] < time()) return false;

    $tokenEmail = strtolower((string) $data['e']);
    $tokenCode = (string) $data['c'];
    if ($tokenEmail !== $email || $tokenCode !== $code) {
        error_log(
            "GrowPal verifyCodeToken: mismatch (inputEmail={$email}, tokenEmail={$tokenEmail}, inputCode={$code}, tokenCode={$tokenCode})"
        );
        return false;
    }
    return true;
}
