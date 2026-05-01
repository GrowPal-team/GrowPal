<?php
$pageTitle = "Checkout";
include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Checkout</h2>
        
        <div class="checkout-layout">
            <div>
                <form id="checkoutForm" class="form-container" style="max-width: 100%;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">Shipping Information</h3>
                    
                    <div class="form-group">
                        <label for="firstName">First Name</label>
                        <input type="text" id="firstName" name="firstName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="lastName">Last Name</label>
                        <input type="text" id="lastName" name="lastName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="address">Street Address</label>
                        <input type="text" id="address" name="address" required>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="city">City</label>
                            <input type="text" id="city" name="city" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="zipCode">Zip Code</label>
                            <input type="text" id="zipCode" name="zipCode" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="country">Country</label>
                        <input type="text" id="country" name="country" required>
                    </div>
                    
                    <h3 style="margin: 2rem 0 1.5rem; color: var(--primary-color);">Payment Information</h3>
                    
                    <div class="form-group">
                        <label for="cardName">Name on Card</label>
                        <input type="text" id="cardName" name="cardName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="cardNumber">Card Number</label>
                        <input type="text" id="cardNumber" name="cardNumber" required placeholder="1234 5678 9012 3456">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="expiry">Expiry Date</label>
                            <input type="text" id="expiry" name="expiry" required placeholder="MM/YY">
                        </div>
                        
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" name="cvv" required placeholder="123">
                        </div>
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
// Display cart summary in checkout
const cart = Cart.get();
const subtotal = Cart.getTotal();

if (document.getElementById('checkoutSummary')) {
    document.getElementById('checkoutSummary').innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Order Summary</h3>
        <div class="summary-row">
            <span>Items (${cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
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

// Handle checkout form submission
document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
</script>

<?php include 'includes/footer.php'; ?>
