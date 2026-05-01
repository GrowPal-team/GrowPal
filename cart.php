<?php
$pageTitle = "Shopping Cart";
include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Shopping Cart</h2>
        
        <div class="cart-layout">
            <div>
                <div id="cartItems" class="cart-items"></div>
                <div style="text-align: center; margin-top: 2rem;">
                    <a href="shop.php" class="btn btn-outline">Continue Shopping</a>
                </div>
            </div>
            <div>
                <div id="cartSummary" class="cart-summary"></div>
                <div style="margin-top: 1rem;">
                    <a href="checkout.php" class="btn btn-primary" style="width: 100%;">Proceed to Checkout</a>
                </div>
            </div>
        </div>
    </div>
</section>

<script>
// Render cart on page load
renderCart();
</script>

<?php include 'includes/footer.php'; ?>
