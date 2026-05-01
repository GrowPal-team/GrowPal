<?php
$userName = $userName ?? 'there';
$resetCode = $resetCode ?? '000000';
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
        .code-box { text-align: center; margin: 35px 0; }
        .code { display: inline-block; background: #0f6b3c; color: #ffffff !important; font-size: 28px; font-weight: bold; padding: 16px 32px; border-radius: 8px; letter-spacing: 8px; }
        .security { background: #f6faf7; border: 1px solid #e2eee6; padding: 16px; border-radius: 6px; font-size: 14px; color: #555; margin-top: 25px; text-align: center; }
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
                <div class="title">Reset Your Password</div>
                <div class="text">
                    Hi <strong><?php echo htmlspecialchars($userName); ?></strong>,<br><br>
                    You requested a password reset for your <strong>GrowPal 🌿</strong> account.
                    Enter the code below on our website to set a new password:
                </div>
                <div class="code-box">
                    <span class="code"><?php echo htmlspecialchars($resetCode); ?></span>
                </div>
                <div class="text" style="text-align: center; font-size: 14px; color: #666;">
                    This code expires in 15 minutes.
                </div>
                <div class="security">If you didn't request this, you can safely ignore this email. Your password will stay the same.</div>
            </div>
            <div class="footer">
                &copy; 2026 GrowPal<br>
                Rooted in Home, Growing for Palestine<br><br>
                <a href="#">Privacy Policy</a> &bull; <a href="#">Support</a>
            </div>
        </div>
    </div>
</body>
</html>
