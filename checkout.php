<?php
$pageTitle = 'Checkout';
$shipping_fields = [
    ['id' => 'firstName', 'label' => 'First Name', 'type' => 'text'],
    ['id' => 'lastName', 'label' => 'Last Name', 'type' => 'text'],
    ['id' => 'email', 'label' => 'Email Address', 'type' => 'email'],
    ['id' => 'phone', 'label' => 'Phone Number', 'type' => 'tel'],
    ['id' => 'address', 'label' => 'Street Address', 'type' => 'text'],
];
$address_detail_fields = [
    ['id' => 'city', 'label' => 'City', 'type' => 'text'],
    ['id' => 'zipCode', 'label' => 'Zip Code', 'type' => 'text'],
];
$payment_fields = [
    ['id' => 'cardName', 'label' => 'Name on Card', 'type' => 'text'],
    ['id' => 'cardNumber', 'label' => 'Card Number', 'type' => 'text', 'placeholder' => '1234 5678 9012 3456'],
];
$payment_detail_fields = [
    ['id' => 'expiry', 'label' => 'Expiry Date', 'type' => 'text', 'placeholder' => 'MM/YY'],
    ['id' => 'cvv', 'label' => 'CVV', 'type' => 'text', 'placeholder' => '123'],
];

include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Checkout</h2>
        
        <div class="checkout-layout">
            <div>
                <form id="checkoutForm" class="form-container" style="max-width: 100%;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">Shipping Information</h3>

                    <?php foreach ($shipping_fields as $field): ?>
                    <div class="form-group">
                        <label for="<?php echo htmlspecialchars($field['id']); ?>"><?php echo htmlspecialchars($field['label']); ?></label>
                        <input type="<?php echo htmlspecialchars($field['type']); ?>" id="<?php echo htmlspecialchars($field['id']); ?>" name="<?php echo htmlspecialchars($field['id']); ?>" required>
                    </div>
                    <?php endforeach; ?>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <?php foreach ($address_detail_fields as $field): ?>
                        <div class="form-group">
                            <label for="<?php echo htmlspecialchars($field['id']); ?>"><?php echo htmlspecialchars($field['label']); ?></label>
                            <input type="<?php echo htmlspecialchars($field['type']); ?>" id="<?php echo htmlspecialchars($field['id']); ?>" name="<?php echo htmlspecialchars($field['id']); ?>" required>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="form-group">
                        <label for="country">Country</label>
                        <input type="text" id="country" name="country" required>
                    </div>

                    <h3 style="margin: 2rem 0 1.5rem; color: var(--primary-color);">Payment Information</h3>

                    <?php foreach ($payment_fields as $field): ?>
                    <div class="form-group">
                        <label for="<?php echo htmlspecialchars($field['id']); ?>"><?php echo htmlspecialchars($field['label']); ?></label>
                        <input type="<?php echo htmlspecialchars($field['type']); ?>" id="<?php echo htmlspecialchars($field['id']); ?>" name="<?php echo htmlspecialchars($field['id']); ?>" required<?php echo isset($field['placeholder']) ? ' placeholder="' . htmlspecialchars($field['placeholder']) . '"' : ''; ?>>
                    </div>
                    <?php endforeach; ?>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <?php foreach ($payment_detail_fields as $field): ?>
                        <div class="form-group">
                            <label for="<?php echo htmlspecialchars($field['id']); ?>"><?php echo htmlspecialchars($field['label']); ?></label>
                            <input type="<?php echo htmlspecialchars($field['type']); ?>" id="<?php echo htmlspecialchars($field['id']); ?>" name="<?php echo htmlspecialchars($field['id']); ?>" required<?php echo isset($field['placeholder']) ? ' placeholder="' . htmlspecialchars($field['placeholder']) . '"' : ''; ?>>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Place Order</button>
                </form>
            </div>
            
            <div>
                <div id="checkoutSummary" class="cart-summary"></div>
            </div>
        </div>
    </div>
</section>

<script>
const checkoutSummary = document.getElementById('checkoutSummary');
const checkoutForm = document.getElementById('checkoutForm');
const cartItems = Cart.get();
const subtotal = Cart.getTotal();
const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

if (checkoutSummary) {
    checkoutSummary.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Order Summary</h3>
        <div class="summary-row">
            <span>Items (${itemCount})</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
    `;
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckout);
}
</script>

<?php include 'includes/footer.php'; ?>
