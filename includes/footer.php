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
                        <li><a href="index.php">Home</a></li>
                        <li><a href="shop.php">Shop</a></li>
                        <li><a href="about.php">About Us</a></li>
                        <li><a href="contact.php">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Customer Service</h4>
                    <ul>
                        <li><a href="#">Shipping Info</a></li>
                        <li><a href="#">Returns</a></li>
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Connect</h4>
                    <div class="social-links">
                        <a href="#" aria-label="Facebook">Facebook</a>
                        <a href="#" aria-label="Instagram">Instagram</a>
                        <a href="#" aria-label="Twitter">Twitter</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <?php echo date('Y'); ?> GrowPal. All rights reserved.</p>
            </div>
        </div>
    </footer>
    <script src="js/main.js"></script>
    <?php if (isset($showPromoLeadModal) && $showPromoLeadModal): ?>
    <?php include __DIR__ . '/promo-lead-modal.php'; ?>
    <?php endif; ?>
</body>
</html>
