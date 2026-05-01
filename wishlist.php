<?php
$pageTitle = "Wishlist";
include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">My Wishlist</h2>
        
        <div id="wishlistItems" class="wishlist-items"></div>
        
        <div style="text-align: center; margin-top: 2rem;">
            <a href="shop.php" class="btn btn-outline">Continue Shopping</a>
        </div>
    </div>
</section>

<script>
// Render wishlist on page load
renderWishlist();
</script>

<?php include 'includes/footer.php'; ?>
