<?php
require_once 'config/database.php';

$pageTitle = 'Home';
$showPromoLeadModal = true;

$featured_products_query = <<<SQL
SELECT
    p.*,
    c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE (p.stock_quantity > 0 OR p.stock_quantity IS NULL)
  AND (p.is_active = 1 OR p.is_active IS NULL)
ORDER BY p.id
LIMIT 6
SQL;

$featured_products_stmt = $conn->prepare($featured_products_query);
$featured_products_stmt->execute();
$featured_products = $featured_products_stmt->fetchAll();
$has_featured_products = !empty($featured_products);
$hero_copy = 'Smart Green Marketplace - Transform any space into a sustainable green environment.';

include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Welcome to GrowPal</h2>
        <p style="text-align: center; margin-bottom: 3rem;"><?php echo htmlspecialchars($hero_copy); ?></p>

        <?php if ($has_featured_products): ?>
        <h2 class="section-title" style="margin-top: 3rem;">Featured Products</h2>
        <div class="products-grid">
            <?php foreach ($featured_products as $product):
                $fallback_image = 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80';
                $product_image = !empty($product['image_url']) ? $product['image_url'] : $fallback_image;
                $product_price = number_format($product['price_ils'], 2);
                $product_description = $product['description'] ?? '';
                $short_description = mb_substr($product_description, 0, 100);
            ?>
            <div class="product-card">
                <div class="product-image">
                    <img src="<?php echo htmlspecialchars($product_image); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>"
                         onerror="this.src='<?php echo htmlspecialchars($fallback_image); ?>'">
                </div>
                <div class="product-info">
                    <h3 class="product-title"><?php echo htmlspecialchars($product['name']); ?></h3>
                    <?php if (!empty($product['category_name'])): ?>
                        <p style="color: #666; font-size: 0.9rem; margin: 0.5rem 0;"><?php echo htmlspecialchars($product['category_name']); ?></p>
                    <?php endif; ?>
                    <p class="product-price">$<?php echo $product_price; ?></p>
                    <?php if ($product_description !== ''): ?>
                        <p style="font-size: 0.9rem; color: #666; margin: 0.5rem 0;">
                            <?php echo htmlspecialchars($short_description) . (mb_strlen($product_description) > 100 ? '...' : ''); ?>
                        </p>
                    <?php endif; ?>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small add-to-cart" 
                                data-id="<?php echo $product['id']; ?>" 
                                data-name="<?php echo htmlspecialchars($product['name']); ?>" 
                                data-price="<?php echo $product['price_ils']; ?>" 
                                data-image="<?php echo htmlspecialchars($product_image); ?>">Add to Cart</button>
                        <button class="btn btn-outline btn-small add-to-wishlist" 
                                data-id="<?php echo $product['id']; ?>" 
                                data-name="<?php echo htmlspecialchars($product['name']); ?>" 
                                data-price="<?php echo $product['price_ils']; ?>" 
                                data-image="<?php echo htmlspecialchars($product_image); ?>">♡</button>
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
