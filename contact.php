<?php
$pageTitle = 'Contact Us';
$contact_details = [
    ['label' => 'Address', 'value' => 'Palestine'],
    ['label' => 'Email', 'value' => 'info@growpal.com'],
    ['label' => 'Phone', 'value' => '+970 9 XXX XXXX'],
];
$maps_embed_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.5!2d35.2606!3d32.2211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDEzJzE2LjAiTiAzNcKwMTUnMzguMiJF!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s';
$contact_highlights = [
    [
        'title' => 'Practical Guidance',
        'description' => 'We focus on simple plant care advice and product recommendations that people can actually use day to day.',
    ],
    [
        'title' => 'Thoughtful Product Selection',
        'description' => 'Our goal is to make it easier to find plants, accessories, and care essentials that fit real homes and spaces.',
    ],
    [
        'title' => 'Local Relevance',
        'description' => 'GrowPal is built around the needs of users in Palestine, with a more familiar and accessible experience.',
    ],
];

include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Get in Touch</h2>
        
        <div class="contact-layout">
            <div>
                <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">Contact Form</h3>
                <form id="contactForm" class="comment-form" style="background: transparent; padding: 0;">
                    <div class="form-group">
                        <label for="contactName">Your Name</label>
                        <input type="text" id="contactName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="contactEmail">Email Address</label>
                        <input type="email" id="contactEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="contactSubject">Subject</label>
                        <input type="text" id="contactSubject" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label for="contactMessage">Message</label>
                        <textarea id="contactMessage" name="message" required style="min-height: 150px;"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Send Message</button>
                </form>
            </div>
            
            <div>
                <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">Contact Information</h3>
                <?php foreach ($contact_details as $detail): ?>
                <div style="margin-bottom: 2rem;">
                    <p style="margin-bottom: 0.5rem;"><strong><?php echo htmlspecialchars($detail['label']); ?>:</strong></p>
                    <p style="color: var(--text-light);"><?php echo htmlspecialchars($detail['value']); ?></p>
                </div>
                <?php endforeach; ?>
                
                <h3 style="margin: 2rem 0 1.5rem; color: var(--primary-color);">Our Location</h3>
                <div class="map-container">
                    <iframe src="<?php echo htmlspecialchars($maps_embed_url); ?>"
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="section" style="background: var(--bg-light);">
    <div class="container">
        <h2 class="section-title">Why GrowPal</h2>
        <div class="info-grid">
            <?php foreach ($contact_highlights as $highlight): ?>
            <div class="info-card">
                <h3><?php echo htmlspecialchars($highlight['title']); ?></h3>
                <p><?php echo htmlspecialchars($highlight['description']); ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<script>
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}
</script>

<?php include 'includes/footer.php'; ?>
