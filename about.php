<?php
$pageTitle = 'About Us';
$about_paragraphs = [
    'GrowPal is a smart green marketplace built to make plant shopping, greener homes, and everyday care simpler for people across Palestine.',
    'We combine practical plant guidance, curated products, and a more approachable shopping experience so users can confidently build healthier indoor and outdoor spaces.',
];

include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">About GrowPal</h2>
        <?php foreach ($about_paragraphs as $index => $paragraph): ?>
        <p style="text-align: center; max-width: 760px; margin: 0 auto <?php echo $index === 0 ? '1.5rem' : '0'; ?>; line-height: 1.8; color: var(--text-light);">
            <?php echo htmlspecialchars($paragraph); ?>
        </p>
        <?php endforeach; ?>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
