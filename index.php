<?php
require_once 'config/database.php';
$pageTitle = "Home";
$showPromoLeadModal = true;
include 'includes/header.php';

// جلب المنتجات المميزة من قاعدة البيانات
$stmt = $conn->prepare("SELECT p.*, c.name as category_name 
                        FROM products p 
                        LEFT JOIN categories c ON p.category_id = c.id 
                        WHERE (p.stock_quantity > 0 OR p.stock_quantity IS NULL) 
                        AND (p.is_active = 1 OR p.is_active IS NULL)
                        ORDER BY p.id 
                        LIMIT 6");
$stmt->execute();
$featured_products = $stmt->fetchAll();
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Welcome to GrowPal</h2>
        <p style="text-align: center; margin-bottom: 3rem;">Smart Green Marketplace - Transform any space into a sustainable green environment.</p>
        
        <?php if (count($featured_products) > 0): ?>
        <h2 class="section-title" style="margin-top: 3rem;">Featured Products</h2>
        <div class="products-grid">
            <?php foreach ($featured_products as $product): 
                $image = !empty($product['image_url']) ? $product['image_url'] : '/images/placeholder.jpg';
                $price = number_format($product['price_ils'], 2);
            ?>
            <div class="product-card">
                <div class="product-image">
                    <img src="<?php echo htmlspecialchars($image); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>" 
                         onerror="this.src='/images/placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-title"><?php echo htmlspecialchars($product['name']); ?></h3>
                    <?php if (!empty($product['category_name'])): ?>
                        <p style="color: #666; font-size: 0.9rem; margin: 0.5rem 0;"><?php echo htmlspecialchars($product['category_name']); ?></p>
                    <?php endif; ?>
                    <p class="product-price">$<?php echo $price; ?></p>
                    <?php if (!empty($product['description'])): ?>
                        <p style="font-size: 0.9rem; color: #666; margin: 0.5rem 0;">
                            <?php echo htmlspecialchars(substr($product['description'], 0, 100)) . (strlen($product['description']) > 100 ? '...' : ''); ?>
                        </p>
                    <?php endif; ?>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small add-to-cart" 
                                data-id="<?php echo $product['id']; ?>" 
                                data-name="<?php echo htmlspecialchars($product['name']); ?>" 
                                data-price="<?php echo $product['price_ils']; ?>" 
                                data-image="<?php echo htmlspecialchars($image); ?>">Add to Cart</button>
                        <button class="btn btn-outline btn-small add-to-wishlist" 
                                data-id="<?php echo $product['id']; ?>" 
                                data-name="<?php echo htmlspecialchars($product['name']); ?>" 
                                data-price="<?php echo $product['price_ils']; ?>" 
                                data-image="<?php echo htmlspecialchars($image); ?>">♡</button>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php else: ?>
            <p style="text-align: center; color: #666;">No products available at the moment.</p>
        <?php endif; ?>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
