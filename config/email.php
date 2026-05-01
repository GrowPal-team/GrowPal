<?php
/**
 * Email Configuration for GrowPal
 * 
 * Gmail: استخدم App Password (ليس كلمة المرور العادية)
 * 1. فعّل 2-Step Verification في حسابك
 * 2. أنشئ App Password من: https://myaccount.google.com/apppasswords
 */

// Sender info
define('MAIL_FROM_EMAIL', 'salynajjar909@gmail.com');  // ← غيّر للإيميل تبعك
define('MAIL_FROM_NAME', 'GrowPal');
define('MAIL_REPLY_TO', 'support@growpal.com');

// SMTP - Gmail
define('SMTP_ENABLED', true);
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'salynajjar909@gmail.com');    // ← غيّر
define('SMTP_PASSWORD', 'onzrfaqvhxudejoy');          // ← App Password بدون مسافات
define('SMTP_SECURE', 'tls');

// مسار اللوجو على السيرفر (للتضمين في الإيميل)
define('LOGO_PATH', __DIR__ . '/../public/images/ChatGPT Image 13 مارس 2026، 12_53_44 ص.png');

/** روابط الموقع في رسائل البريد (روابط مطلقة). يمكن ضبطها بـ GROWPAL_SITE_URL في البيئة */
define('SITE_PUBLIC_URL', rtrim(getenv('GROWPAL_SITE_URL') ?: 'http://localhost:3000', '/'));

// سري لتوقيع أكواد التحقق وإعادة التعيين (بدون حفظ في DB)
define('CODE_SECRET', 'growpal_secret_change_in_production_' . (getenv('GROWPAL_CODE_SECRET') ?: ''));
