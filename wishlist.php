<?php
$pageTitle = 'Wishlist';
require_once __DIR__ . '/includes/site_urls.php';
$continueShoppingUrl = growpal_canonical_url('/shop', 'shop.php');

include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">My Wishlist</h2>
        
        <div id="wishlistItems" class="wishlist-items"></div>
        
        <div style="text-align: center; margin-top: 2rem;">
            <a href="<?php echo htmlspecialchars($continueShoppingUrl); ?>" class="btn btn-outline">Continue Shopping</a>
        </div>
    </div>
</section>

<script>
const wishlistItemsContainer = document.getElementById('wishlistItems');

if (wishlistItemsContainer) {
    renderWishlist();
}
</script>

<?php include 'includes/footer.php'; ?>
