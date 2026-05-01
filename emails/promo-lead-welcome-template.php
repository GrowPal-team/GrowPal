<?php
/**
 * GrowPal — ترحيب بعد طلب عرض Get Offer (ببلك يوزر)
 * المتغيرات: $displayName, $recipientEmail, $registerUrl, $loginUrl, $discountLabel, $logoUrl
 */
$displayName = $displayName ?? 'there';
$recipientEmail = $recipientEmail ?? '';
$registerUrl = $registerUrl ?? '#';
$loginUrl = $loginUrl ?? '#';
$discountLabel = $discountLabel ?? '10%';
$logoUrl = $logoUrl ?? '';
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background: #f3f6f3; font-family: Arial, Helvetica, sans-serif; }
        .wrapper { width: 100%; padding: 40px 0; }
        .container { max-width: 620px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08); }
        .header { text-align: center; padding: 40px 20px; background: #0f3d22; }
        .logo { width: 100px; height: auto; max-width: 120px; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; }
        .header-text { color: #d9e8dd; font-size: 14px; letter-spacing: 0.5px; }
        .content { padding: 45px; text-align: left; }
        .title { font-size: 28px; font-weight: 700; color: #0f3d22; margin-bottom: 18px; text-align: center; }
        .text { font-size: 16px; line-height: 1.7; color: #555; margin-bottom: 25px; }
        .cta-wrap { text-align: center; margin: 32px 0; }
        .cta { display: inline-block; background: #0f6b3c; color: #ffffff !important; font-size: 17px; font-weight: bold; padding: 16px 32px; border-radius: 10px; text-decoration: none; }
        .cta-secondary { display: inline-block; margin-top: 14px; font-size: 15px; color: #0f6b3c !important; font-weight: 600; text-decoration: underline; }
        .divider { height: 1px; background: #e6e6e6; margin: 35px 0; }
        .feature { display: flex; align-items: center; margin-bottom: 18px; }
        .icon { width: 34px; margin-right: 14px; flex-shrink: 0; }
        .feature-text { font-size: 15px; color: #444; }
        .note { background: #eef7f0; border: 1px solid #cfe8d6; padding: 18px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #444; margin-top: 25px; }
        .footer { text-align: center; padding: 30px; font-size: 13px; color: #888; background: #fafafa; }
        .footer a { color: #0f6b3c; text-decoration: none; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <?php if (!empty($logoUrl)): ?>
                <img src="<?php echo htmlspecialchars($logoUrl); ?>" alt="GrowPal" class="logo" width="100" style="width:100px;height:auto;">
                <?php endif; ?>
                <div class="header-text">GrowPal &bull; Smart Green Living</div>
            </div>
            <div class="content">
                <div class="title">Your <?php echo htmlspecialchars($discountLabel); ?> Discount is Here! &#127881;</div>
                <div class="text">
                    Hi <strong><?php echo htmlspecialchars($displayName); ?></strong>,<br><br>
                    Thank you for your interest in <strong>GrowPal &#127807;</strong>. You&rsquo;ve unlocked a <strong><?php echo htmlspecialchars($discountLabel); ?> discount</strong> on your first qualifying order once your account is active.
                </div>
                <div class="text">
                    To <strong>activate your offer</strong> and start your plant journey, please <strong>create an account using the same email address</strong> you used to claim this offer: <strong><?php echo htmlspecialchars($recipientEmail); ?></strong>
                </div>
                <div class="cta-wrap">
                    <a href="<?php echo htmlspecialchars($registerUrl); ?>" class="cta">Create your account &mdash; activate <?php echo htmlspecialchars($discountLabel); ?> off</a><br>
                    <a href="<?php echo htmlspecialchars($loginUrl); ?>" class="cta-secondary">Already have an account? Sign in</a>
                </div>
                <div class="divider"></div>
                <div class="feature">
                    <img src="https://cdn-icons-png.flaticon.com/512/628/628283.png" class="icon" alt="">
                    <div class="feature-text"><strong>Discover Plants</strong> perfect for your home, balcony, rooftop or garden.</div>
                </div>
                <div class="feature">
                    <img src="https://cdn-icons-png.flaticon.com/512/1625/1625099.png" class="icon" alt="">
                    <div class="feature-text"><strong>Smart Recommendations</strong> based on your environment and growing zone.</div>
                </div>
                <div class="feature">
                    <img src="https://cdn-icons-png.flaticon.com/512/3500/3500833.png" class="icon" alt="">
                    <div class="feature-text"><strong>Track Your Orders</strong> and manage your plant journey with ease.</div>
                </div>
                <div class="note">
                    <strong>Note:</strong> The <?php echo htmlspecialchars($discountLabel); ?> welcome offer applies when you register and complete checkout with the <strong>same email</strong> you submitted. If you didn&rsquo;t request this email, you can safely ignore it.
                </div>
            </div>
            <div class="footer">
                &copy; 2026 GrowPal<br>
                Rooted in Home, Growing for Palestine<br><br>
                <a href="<?php echo htmlspecialchars(SITE_PUBLIC_URL); ?>/faq">FAQ</a> &bull; <a href="<?php echo htmlspecialchars(SITE_PUBLIC_URL); ?>/contact">Support</a>
            </div>
        </div>
    </div>
</body>
</html>
