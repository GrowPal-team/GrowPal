<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' - ' : ''; ?>GrowPal</title>
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
                        <li><a href="index.php">Home</a></li>
                        <li><a href="shop.php">Shop</a></li>
                        <li><a href="about.php">About</a></li>
                        <li><a href="contact.php">Contact</a></li>
                        <li><a href="wishlist.php" class="wishlist-link">Wishlist <span id="wishlistCount" class="badge">0</span></a></li>
                        <li><a href="cart.php" class="cart-link">Cart <span id="cartCount" class="badge">0</span></a></li>
                    </ul>
                </nav>
                <div class="header-actions">
                    <a href="login.php" class="btn btn-outline">Login</a>
                    <a href="register.php" class="btn btn-primary">Register</a>
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
