<?php
function growpal_load_mail_config(): void {
    if (!defined('MAIL_FROM_EMAIL')) {
        require_once __DIR__ . '/../config/email.php';
    }
}

function growpal_can_use_smtp(): bool {
    return defined('SMTP_ENABLED')
        && SMTP_ENABLED
        && file_exists(__DIR__ . '/../vendor/autoload.php');
}

function growpal_create_mailer(
    string $toEmail,
    string $recipientName,
    string $subject
): \PHPMailer\PHPMailer\PHPMailer {
    require_once __DIR__ . '/../vendor/autoload.php';

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port = SMTP_PORT;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
    $mail->addAddress($toEmail, $recipientName);
    $mail->addReplyTo(MAIL_REPLY_TO, 'GrowPal Support');
    $mail->isHTML(true);
    $mail->Subject = $subject;

    return $mail;
}

function growpal_get_logo_url(
    bool $embedForMailer = false,
    ?\PHPMailer\PHPMailer\PHPMailer $mail = null
): string {
    if (!defined('LOGO_PATH') || !file_exists(LOGO_PATH)) {
        return '';
    }

    if ($embedForMailer && $mail !== null) {
        $mail->addEmbeddedImage(LOGO_PATH, 'growpalogo', 'logo.png');
        return 'cid:growpalogo';
    }

    return 'data:image/png;base64,' . base64_encode(file_get_contents(LOGO_PATH));
}

function growpal_render_email_template(string $templatePath, array $variables = []): string {
    extract($variables, EXTR_SKIP);
    ob_start();
    include $templatePath;
    return ob_get_clean();
}

function growpal_send_fallback_html_mail(string $toEmail, string $subject, string $htmlBody): bool {
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . MAIL_REPLY_TO . "\r\n";

    return @mail($toEmail, $subject, $htmlBody, $headers);
}

function growpal_send_template_via_smtp(
    string $toEmail,
    string $recipientName,
    string $subject,
    string $templatePath,
    array $templateVariables,
    string $altBody,
    string $errorLogPrefix
): bool {
    try {
        $mail = growpal_create_mailer($toEmail, $recipientName, $subject);
        $templateVariables['logoUrl'] = growpal_get_logo_url(true, $mail);
        $htmlBody = growpal_render_email_template($templatePath, $templateVariables);

        $mail->Body = $htmlBody;
        $mail->AltBody = $altBody;
        $mail->send();

        return true;
    } catch (\PHPMailer\PHPMailer\Exception $exception) {
        error_log($errorLogPrefix . $mail->ErrorInfo);
        return false;
    }
}

function sendVerificationEmail($toEmail, $userName, $verificationCode) {
    growpal_load_mail_config();

    $userName = $userName ?? 'there';
    $verificationCode = $verificationCode ?? '000000';
    $subject = 'GrowPal - Verify Your Email Address';

    if (growpal_can_use_smtp()) {
        return growpal_send_template_via_smtp(
            $toEmail,
            $userName,
            $subject,
            __DIR__ . '/../emails/verification-template.php',
            [
                'userName' => $userName,
                'verificationCode' => $verificationCode,
            ],
            "Hi $userName,\n\nYour GrowPal verification code is: $verificationCode\n\nThis code expires in 15 minutes.",
            'GrowPal PHPMailer Error: '
        );
    }

    $logoUrl = growpal_get_logo_url();
    $htmlBody = growpal_render_email_template(
        __DIR__ . '/../emails/verification-template.php',
        [
            'userName' => $userName,
            'verificationCode' => $verificationCode,
            'logoUrl' => $logoUrl,
        ]
    );

    $sent = growpal_send_fallback_html_mail($toEmail, $subject, $htmlBody);
    if (!$sent) {
        error_log("GrowPal: Failed to send to $toEmail. Code: $verificationCode");
    }
    return $sent;
}

function sendPasswordResetEmail($toEmail, $userName, $resetCode) {
    growpal_load_mail_config();

    $userName = $userName ?? 'there';
    $resetCode = $resetCode ?? '000000';
    $subject = 'GrowPal - Reset Your Password';

    if (growpal_can_use_smtp()) {
        return growpal_send_template_via_smtp(
            $toEmail,
            $userName,
            $subject,
            __DIR__ . '/../emails/password-reset-template.php',
            [
                'userName' => $userName,
                'resetCode' => $resetCode,
            ],
            "Hi $userName,\n\nYour GrowPal password reset code is: $resetCode\n\nThis code expires in 15 minutes.",
            'GrowPal PHPMailer Reset Error: '
        );
    }

    $logoUrl = growpal_get_logo_url();
    $htmlBody = growpal_render_email_template(
        __DIR__ . '/../emails/password-reset-template.php',
        [
            'userName' => $userName,
            'resetCode' => $resetCode,
            'logoUrl' => $logoUrl,
        ]
    );

    return growpal_send_fallback_html_mail($toEmail, $subject, $htmlBody);
}

function growpal_promo_display_name(string $email): string {
    $local = strstr($email, '@', true);
    if ($local === false || $local === '') {
        return 'there';
    }
    $local = str_replace(['.', '_', '-'], ' ', $local);
    return ucwords(strtolower($local));
}

function sendPromoLeadWelcomeEmail(string $toEmail, string $discountLabel = '10%'): bool {
    growpal_load_mail_config();

    $displayName = growpal_promo_display_name($toEmail);
    $recipientEmail = $toEmail;
    $registerUrl = SITE_PUBLIC_URL . '/register?promo=10&email=' . rawurlencode($toEmail);
    $loginUrl = SITE_PUBLIC_URL . '/login?promo=10&email=' . rawurlencode($toEmail);
    $subject = 'GrowPal — Your ' . $discountLabel . ' welcome offer is waiting';

    if (growpal_can_use_smtp()) {
        return growpal_send_template_via_smtp(
            $toEmail,
            $displayName,
            $subject,
            __DIR__ . '/../emails/promo-lead-welcome-template.php',
            [
                'displayName' => $displayName,
                'recipientEmail' => $recipientEmail,
                'discountLabel' => $discountLabel,
                'registerUrl' => $registerUrl,
                'loginUrl' => $loginUrl,
                'toEmail' => $toEmail,
            ],
            "Hi {$displayName},\n\nThanks for joining GrowPal. Your {$discountLabel} discount activates when you create an account with this email: {$toEmail}\n\nRegister: {$registerUrl}\nSign in: {$loginUrl}\n",
            'GrowPal PHPMailer Promo Lead Error: '
        );
    }

    $logoUrl = growpal_get_logo_url();
    $htmlBody = growpal_render_email_template(
        __DIR__ . '/../emails/promo-lead-welcome-template.php',
        [
            'displayName' => $displayName,
            'recipientEmail' => $recipientEmail,
            'discountLabel' => $discountLabel,
            'registerUrl' => $registerUrl,
            'loginUrl' => $loginUrl,
            'logoUrl' => $logoUrl,
            'toEmail' => $toEmail,
        ]
    );
    $sent = growpal_send_fallback_html_mail($toEmail, $subject, $htmlBody);
    if (!$sent) {
        error_log("GrowPal: Failed to send promo welcome to {$toEmail}");
    }
    return $sent;
}
