<?php
require_once 'config/database.php';

$pageTitle = 'Shop';

$categories_query = <<<SQL
SELECT DISTINCT
    c.id,
    c.name
FROM categories c
INNER JOIN products p ON c.id = p.category_id
WHERE (p.stock_quantity > 0 OR p.stock_quantity IS NULL)
  AND (p.is_active = 1 OR p.is_active IS NULL)
ORDER BY c.name
SQL;

$products_query = <<<SQL
SELECT
    p.*,
    c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE (p.stock_quantity > 0 OR p.stock_quantity IS NULL)
  AND (p.is_active = 1 OR p.is_active IS NULL)
ORDER BY p.id
SQL;

$categories_stmt = $conn->prepare($categories_query);
$categories_stmt->execute();
$categories = $categories_stmt->fetchAll();

$products_stmt = $conn->prepare($products_query);
$products_stmt->execute();
$products = $products_stmt->fetchAll();
$has_categories = !empty($categories);
$has_products = !empty($products);

include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Our Products</h2>

        <?php if ($has_categories): ?>
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
            <?php if ($has_products): ?>
                <?php foreach ($products as $product):
                    $fallback_image = 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80';
                    $product_image = !empty($product['image_url']) ? $product['image_url'] : $fallback_image;
                    $product_price = number_format($product['price_ils'], 2);
                    $product_description = $product['description'] ?? '';
                    $short_description = mb_substr($product_description, 0, 100);
                    $category_slug = !empty($product['category_name']) ? strtolower(str_replace(' ', '-', $product['category_name'])) : 'all';
                ?>
                <div class="product-card" data-category="<?php echo htmlspecialchars($category_slug); ?>"
                     data-category-id="<?php echo $product['category_id']; ?>">
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
                            <p class="product-description" style="font-size: 0.9rem; color: #666; margin: 0.5rem 0;">
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
            <?php else: ?>
                <p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No products available at the moment. Please check back later.</p>
            <?php endif; ?>
        </div>
    </div>
</section>

<script>
const categoryButtons = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');

categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        categoryButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');

        const { category, categoryId } = button.dataset;

        productCards.forEach((productCard) => {
            const matchesCategory = category === 'all' || productCard.dataset.category === category;
            const matchesCategoryId = category === 'all' || productCard.dataset.categoryId === categoryId;
            const shouldShow = matchesCategory || matchesCategoryId;

            productCard.style.display = shouldShow ? 'block' : 'none';

            if (shouldShow) {
                productCard.classList.add('fade-in');
            }
        });
    });
});
</script>

<?php include 'includes/footer.php'; ?>
