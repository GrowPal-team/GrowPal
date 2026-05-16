<?php
$pageTitle = 'Shopping Cart';
$continueShoppingUrl = 'shop.php';
$checkoutUrl = 'checkout.php';

include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Shopping Cart</h2>
        
        <div class="cart-layout">
            <div>
                <div id="cartItems" class="cart-items"></div>
                <div style="text-align: center; margin-top: 2rem;">
                    <a href="<?php echo htmlspecialchars($continueShoppingUrl); ?>" class="btn btn-outline">Continue Shopping</a>
                </div>
            </div>
            <div>
                <div id="cartSummary" class="cart-summary"></div>
                <div style="margin-top: 1rem;">
                    <a href="<?php echo htmlspecialchars($checkoutUrl); ?>" class="btn btn-primary" style="width: 100%;">Proceed to Checkout</a>
                </div>
            </div>
        </div>
    </div>
</section>

<script>
const cartItemsContainer = document.getElementById('cartItems');

if (cartItemsContainer) {
    renderCart();
}
</script>

<?php include 'includes/footer.php'; ?>
