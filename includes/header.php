<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$current_page = basename($_SERVER['PHP_SELF'] ?? '');
$page_title_prefix = isset($pageTitle) ? $pageTitle . ' - ' : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($page_title_prefix); ?>GrowPal</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="main-header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <a href="index.php">
                        <h1>GrowPal</h1>
                    </a>
                </div>
                <nav class="main-nav" id="mainNav">
                    <ul>
                        <li><a href="index.php" <?php echo $current_page === 'index.php' ? 'aria-current="page"' : ''; ?>>Home</a></li>
                        <li><a href="shop.php" <?php echo $current_page === 'shop.php' ? 'aria-current="page"' : ''; ?>>Shop</a></li>
                        <li><a href="about.php" <?php echo $current_page === 'about.php' ? 'aria-current="page"' : ''; ?>>About</a></li>
                        <li><a href="contact.php" <?php echo $current_page === 'contact.php' ? 'aria-current="page"' : ''; ?>>Contact</a></li>
                        <li><a href="wishlist.php" class="wishlist-link" <?php echo $current_page === 'wishlist.php' ? 'aria-current="page"' : ''; ?>>Wishlist <span id="wishlistCount" class="badge">0</span></a></li>
                        <li><a href="cart.php" class="cart-link" <?php echo $current_page === 'cart.php' ? 'aria-current="page"' : ''; ?>>Cart <span id="cartCount" class="badge">0</span></a></li>
                    </ul>
                </nav>
                <div class="header-actions">
                    <a href="login.php" class="btn btn-outline" <?php echo $current_page === 'login.php' ? 'aria-current="page"' : ''; ?>>Login</a>
                    <a href="register.php" class="btn btn-primary" <?php echo $current_page === 'register.php' ? 'aria-current="page"' : ''; ?>>Register</a>
                    <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </div>
    </header>
    <main class="main-content">
