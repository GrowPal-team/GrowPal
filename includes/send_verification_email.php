<?php
/**
 * Send verification email to user via SMTP
 * Returns true on success, false on failure
 */
function sendVerificationEmail($toEmail, $userName, $verificationCode) {
    if (!defined('MAIL_FROM_EMAIL')) {
        require_once __DIR__ . '/../config/email.php';
    }
    
    $userName = $userName ?? 'there';
    $verificationCode = $verificationCode ?? '000000';
    $subject = 'GrowPal - Verify Your Email Address';

    // Use PHPMailer if available and SMTP enabled
    if (defined('SMTP_ENABLED') && SMTP_ENABLED && file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require __DIR__ . '/../vendor/autoload.php';
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USERNAME;
            $mail->Password   = SMTP_PASSWORD;
            $mail->SMTPSecure = SMTP_SECURE;
            $mail->Port       = SMTP_PORT;
            $mail->CharSet    = 'UTF-8';
            $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
            $mail->addAddress($toEmail, $userName);
            $mail->addReplyTo(MAIL_REPLY_TO, 'GrowPal Support');
            $mail->isHTML(true);
            $mail->Subject = $subject;

            $logoUrl = '';
            if (defined('LOGO_PATH') && file_exists(LOGO_PATH)) {
                $mail->addEmbeddedImage(LOGO_PATH, 'growpalogo', 'logo.png');
                $logoUrl = 'cid:growpalogo';
            }
            ob_start();
            include __DIR__ . '/../emails/verification-template.php';
            $htmlBody = ob_get_clean();
            $mail->Body = $htmlBody;
            $mail->AltBody = "Hi $userName,\n\nYour GrowPal verification code is: $verificationCode\n\nThis code expires in 15 minutes.";
            
            $mail->send();
            return true;
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            error_log("GrowPal PHPMailer Error: " . $mail->ErrorInfo);
            return false;
        }
    }

    // Fallback: PHP mail() — بناء الهيدر بدون cid
    $logoUrl = '';
    if (defined('LOGO_PATH') && file_exists(LOGO_PATH)) {
        $logoData = base64_encode(file_get_contents(LOGO_PATH));
        $logoUrl = 'data:image/png;base64,' . $logoData;
    }
    ob_start();
    include __DIR__ . '/../emails/verification-template.php';
    $htmlBody = ob_get_clean();

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . MAIL_REPLY_TO . "\r\n";
    
    $sent = @mail($toEmail, $subject, $htmlBody, $headers);
    if (!$sent) {
        error_log("GrowPal: Failed to send to $toEmail. Code: $verificationCode");
    }
    return $sent;
}

/**
 * Send password reset code to user
 */
function sendPasswordResetEmail($toEmail, $userName, $resetCode) {
    if (!defined('MAIL_FROM_EMAIL')) {
        require_once __DIR__ . '/../config/email.php';
    }
    $userName = $userName ?? 'there';
    $resetCode = $resetCode ?? '000000';
    $subject = 'GrowPal - Reset Your Password';

    if (defined('SMTP_ENABLED') && SMTP_ENABLED && file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require __DIR__ . '/../vendor/autoload.php';
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USERNAME;
            $mail->Password   = SMTP_PASSWORD;
            $mail->SMTPSecure = SMTP_SECURE;
            $mail->Port       = SMTP_PORT;
            $mail->CharSet    = 'UTF-8';
            $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
            $mail->addAddress($toEmail, $userName);
            $mail->addReplyTo(MAIL_REPLY_TO, 'GrowPal Support');
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $logoUrl = '';
            if (defined('LOGO_PATH') && file_exists(LOGO_PATH)) {
                $mail->addEmbeddedImage(LOGO_PATH, 'growpalogo', 'logo.png');
                $logoUrl = 'cid:growpalogo';
            }
            ob_start();
            include __DIR__ . '/../emails/password-reset-template.php';
            $htmlBody = ob_get_clean();
            $mail->Body = $htmlBody;
            $mail->AltBody = "Hi $userName,\n\nYour GrowPal password reset code is: $resetCode\n\nThis code expires in 15 minutes.";
            $mail->send();
            return true;
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            error_log("GrowPal PHPMailer Reset Error: " . $mail->ErrorInfo);
            return false;
        }
    }
    $logoUrl = defined('LOGO_PATH') && file_exists(LOGO_PATH) ? 'data:image/png;base64,' . base64_encode(file_get_contents(LOGO_PATH)) : '';
    ob_start();
    $resetCode = $resetCode;
    include __DIR__ . '/../emails/password-reset-template.php';
    $htmlBody = ob_get_clean();
    $headers = "MIME-Version: 1.0\r\nContent-type: text/html; charset=UTF-8\r\nFrom: " . MAIL_FROM_NAME . " <" . MAIL_FROM_EMAIL . ">\r\nReply-To: " . MAIL_REPLY_TO . "\r\n";
    return @mail($toEmail, $subject, $htmlBody, $headers);
}

/**
 * اسم ظاهر بسيط من جزء الإيميل قبل @
 */
function growpal_promo_display_name(string $email): string {
    $local = strstr($email, '@', true);
    if ($local === false || $local === '') {
        return 'there';
    }
    $local = str_replace(['.', '_', '-'], ' ', $local);
    return ucwords(strtolower($local));
}

/**
 * بريد ترحيب بعد إدخال الإيميل في عرض Get Offer (ببلك يوزر)
 */
function sendPromoLeadWelcomeEmail(string $toEmail, string $discountLabel = '10%'): bool {
    if (!defined('MAIL_FROM_EMAIL')) {
        require_once __DIR__ . '/../config/email.php';
    }

    $displayName = growpal_promo_display_name($toEmail);
    $recipientEmail = $toEmail;
    $registerUrl = SITE_PUBLIC_URL . '/register?promo=10&email=' . rawurlencode($toEmail);
    $loginUrl = SITE_PUBLIC_URL . '/login?promo=10&email=' . rawurlencode($toEmail);
    $subject = 'GrowPal — Your ' . $discountLabel . ' welcome offer is waiting';

    if (defined('SMTP_ENABLED') && SMTP_ENABLED && file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require __DIR__ . '/../vendor/autoload.php';
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USERNAME;
            $mail->Password   = SMTP_PASSWORD;
            $mail->SMTPSecure = SMTP_SECURE;
            $mail->Port       = SMTP_PORT;
            $mail->CharSet    = 'UTF-8';
            $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
            $mail->addAddress($toEmail, $displayName);
            $mail->addReplyTo(MAIL_REPLY_TO, 'GrowPal Support');
            $mail->isHTML(true);
            $mail->Subject = $subject;

            $logoUrl = '';
            if (defined('LOGO_PATH') && file_exists(LOGO_PATH)) {
                $mail->addEmbeddedImage(LOGO_PATH, 'growpalogo', 'logo.png');
                $logoUrl = 'cid:growpalogo';
            }
            ob_start();
            include __DIR__ . '/../emails/promo-lead-welcome-template.php';
            $htmlBody = ob_get_clean();
            $mail->Body = $htmlBody;
            $mail->AltBody = "Hi {$displayName},\n\nThanks for joining GrowPal. Your {$discountLabel} discount activates when you create an account with this email: {$toEmail}\n\nRegister: {$registerUrl}\nSign in: {$loginUrl}\n";
            $mail->send();
            return true;
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            error_log('GrowPal PHPMailer Promo Lead Error: ' . $mail->ErrorInfo);
            return false;
        }
    }

    $logoUrl = '';
    if (defined('LOGO_PATH') && file_exists(LOGO_PATH)) {
        $logoUrl = 'data:image/png;base64,' . base64_encode(file_get_contents(LOGO_PATH));
    }
    ob_start();
    include __DIR__ . '/../emails/promo-lead-welcome-template.php';
    $htmlBody = ob_get_clean();
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . MAIL_REPLY_TO . "\r\n";
    $sent = @mail($toEmail, $subject, $htmlBody, $headers);
    if (!$sent) {
        error_log("GrowPal: Failed to send promo welcome to {$toEmail}");
    }
    return $sent;
}
