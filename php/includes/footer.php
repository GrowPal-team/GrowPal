<?php
require_once __DIR__ . '/site_urls.php';

$current_year = date('Y');
$footer_quick_links = [
    ['label' => 'Home', 'href' => growpal_canonical_url('/', 'index.php')],
    ['label' => 'Shop', 'href' => growpal_canonical_url('/shop', 'shop.php')],
    ['label' => 'About Us', 'href' => growpal_canonical_url('/our-story', 'about.php')],
    ['label' => 'Contact', 'href' => growpal_canonical_url('/contact', 'contact.php')],
];
$footer_support_links = [
    ['label' => 'Shipping Info', 'href' => '#'],
    ['label' => 'Returns', 'href' => '#'],
    ['label' => 'FAQ', 'href' => '#'],
    ['label' => 'Privacy Policy', 'href' => '#'],
];
$footer_social_links = [
    ['label' => 'Facebook', 'href' => '#'],
    ['label' => 'Instagram', 'href' => '#'],
    ['label' => 'Twitter', 'href' => '#'],
];
?>
    </main>
    <footer class="main-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>GrowPal</h3>
                    <p>Smart Green Marketplace - Transform any space into a sustainable green environment.</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <?php foreach ($footer_quick_links as $link): ?>
                        <li><a href="<?php echo htmlspecialchars($link['href']); ?>"><?php echo htmlspecialchars($link['label']); ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Customer Service</h4>
                    <ul>
                        <?php foreach ($footer_support_links as $link): ?>
                        <li><a href="<?php echo htmlspecialchars($link['href']); ?>"><?php echo htmlspecialchars($link['label']); ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Connect</h4>
                    <div class="social-links">
                        <?php foreach ($footer_social_links as $link): ?>
                        <a href="<?php echo htmlspecialchars($link['href']); ?>" aria-label="<?php echo htmlspecialchars($link['label']); ?>"><?php echo htmlspecialchars($link['label']); ?></a>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <?php echo htmlspecialchars($current_year); ?> GrowPal. All rights reserved.</p>
            </div>
        </div>
    </footer>
    <script src="js/main.js"></script>
    <?php if (isset($showPromoLeadModal) && $showPromoLeadModal): ?>
    <?php include __DIR__ . '/promo-lead-modal.php'; ?>
    <?php endif; ?>
</body>
</html>
