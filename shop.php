<?php
require_once 'config/database.php';
$pageTitle = "Shop";
include 'includes/header.php';

// جلب الفئات من قاعدة البيانات
$categories_stmt = $conn->prepare("SELECT DISTINCT c.id, c.name 
                                   FROM categories c 
                                   INNER JOIN products p ON c.id = p.category_id 
                                   WHERE (p.stock_quantity > 0 OR p.stock_quantity IS NULL) 
                                   AND (p.is_active = 1 OR p.is_active IS NULL)
                                   ORDER BY c.name");
$categories_stmt->execute();
$categories = $categories_stmt->fetchAll();

// جلب جميع المنتجات من قاعدة البيانات
$products_stmt = $conn->prepare("SELECT p.*, c.name as category_name 
                                 FROM products p 
                                 LEFT JOIN categories c ON p.category_id = c.id 
                                 WHERE (p.stock_quantity > 0 OR p.stock_quantity IS NULL) 
                                 AND (p.is_active = 1 OR p.is_active IS NULL)
                                 ORDER BY p.id");
$products_stmt->execute();
$products = $products_stmt->fetchAll();
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Our Products</h2>
        
        <?php if (count($categories) > 0): ?>
        <div class="categories">
            <button class="category-btn active" data-category="all">All Products</button>
            <?php foreach ($categories as $category): 
                $category_slug = strtolower(str_replace(' ', '-', $category['name']));
            ?>
                <button class="category-btn" data-category="<?php echo htmlspecialchars($category_slug); ?>" 
                        data-category-id="<?php echo $category['id']; ?>">
                    <?php echo htmlspecialchars($category['name']); ?>
                </button>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <div class="products-grid" id="productsGrid">
            <?php if (count($products) > 0): ?>
                <?php foreach ($products as $product): 
                    $image = !empty($product['image_url']) ? $product['image_url'] : '/images/placeholder.jpg';
                    $price = number_format($product['price_ils'], 2);
                    $category_slug = !empty($product['category_name']) ? strtolower(str_replace(' ', '-', $product['category_name'])) : 'all';
                ?>
                <div class="product-card" data-category="<?php echo htmlspecialchars($category_slug); ?>" 
                     data-category-id="<?php echo $product['category_id']; ?>">
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
                            <p class="product-description" style="font-size: 0.9rem; color: #666; margin: 0.5rem 0;">
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
            <?php else: ?>
                <p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No products available at the moment. Please check back later.</p>
            <?php endif; ?>
        </div>
    </div>
</section>

<script>
// Category filtering
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        const categoryId = btn.dataset.categoryId;
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            if (category === 'all' || product.dataset.category === category || product.dataset.categoryId === categoryId) {
                product.style.display = 'block';
                product.classList.add('fade-in');
            } else {
                product.style.display = 'none';
            }
        });
    });
});
</script>

<?php include 'includes/footer.php'; ?>
