<?php

function growpal_env_bool(string $key, bool $default): bool {
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }

    return in_array(strtolower((string)$value), ['1', 'true', 'yes', 'on'], true);
}

define('MAIL_FROM_EMAIL', getenv('MAIL_FROM_EMAIL') ?: 'no-reply@growpal.local');
define('MAIL_FROM_NAME', getenv('MAIL_FROM_NAME') ?: 'GrowPal');
define('MAIL_REPLY_TO', getenv('MAIL_REPLY_TO') ?: MAIL_FROM_EMAIL);

define('SMTP_ENABLED', growpal_env_bool('SMTP_ENABLED', false));
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.gmail.com');
define('SMTP_PORT', (int)(getenv('SMTP_PORT') ?: 587));
define('SMTP_USERNAME', getenv('SMTP_USERNAME') ?: '');
define('SMTP_PASSWORD', getenv('SMTP_PASSWORD') ?: '');
define('SMTP_SECURE', getenv('SMTP_SECURE') ?: 'tls');

$logoPathFromEnv = getenv('GROWPAL_LOGO_PATH') ?: '';
$defaultLogoPath = __DIR__ . '/../public/images/Icon (1).jpeg';
define('LOGO_PATH', $logoPathFromEnv !== '' ? $logoPathFromEnv : $defaultLogoPath);

define('SITE_PUBLIC_URL', rtrim(getenv('GROWPAL_SITE_URL') ?: 'http://localhost:3000', '/'));
define('CODE_SECRET', getenv('GROWPAL_CODE_SECRET') ?: 'growpal-local-code-secret');
