<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/site_urls.php';

$current_page = basename($_SERVER['PHP_SELF'] ?? '');
$page_title_prefix = isset($pageTitle) ? $pageTitle . ' - ' : '';

$nav_links = [
    ['label' => 'Home', 'href' => growpal_canonical_url('/', 'index.php'), 'match' => 'index.php'],
    ['label' => 'Shop', 'href' => growpal_canonical_url('/shop', 'shop.php'), 'match' => 'shop.php'],
    ['label' => 'About', 'href' => growpal_canonical_url('/our-story', 'about.php'), 'match' => 'about.php'],
    ['label' => 'Contact', 'href' => growpal_canonical_url('/contact', 'contact.php'), 'match' => 'contact.php'],
    ['label' => 'Wishlist', 'href' => growpal_canonical_url('/wishlist', 'wishlist.php'), 'match' => 'wishlist.php'],
    ['label' => 'Cart', 'href' => growpal_canonical_url('/cart', 'cart.php'), 'match' => 'cart.php'],
];

$login_href = growpal_canonical_url('/login', 'login.php');
$register_href = growpal_canonical_url('/register', 'register.php');
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
                        <?php foreach ($nav_links as $link): ?>
                        <li>
                            <a
                                href="<?php echo htmlspecialchars($link['href']); ?>"
                                <?php echo growpal_is_canonical_path($link['match'], $current_page) ? 'aria-current="page"' : ''; ?>
                                <?php echo $link['label'] === 'Wishlist' ? 'class="wishlist-link"' : ''; ?>
                                <?php echo $link['label'] === 'Cart' ? 'class="cart-link"' : ''; ?>
                            >
                                <?php echo htmlspecialchars($link['label']); ?>
                                <?php if ($link['label'] === 'Wishlist'): ?> <span id="wishlistCount" class="badge">0</span><?php endif; ?>
                                <?php if ($link['label'] === 'Cart'): ?> <span id="cartCount" class="badge">0</span><?php endif; ?>
                            </a>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                </nav>
                <div class="header-actions">
                    <a href="<?php echo htmlspecialchars($login_href); ?>" class="btn btn-outline" <?php echo $current_page === 'login.php' ? 'aria-current="page"' : ''; ?>>Login</a>
                    <a href="<?php echo htmlspecialchars($register_href); ?>" class="btn btn-primary" <?php echo $current_page === 'register.php' ? 'aria-current="page"' : ''; ?>>Register</a>
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
