<?php
$pageTitle = "Contact Us";
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
                <div style="margin-bottom: 2rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>Address:</strong></p>
                    <p style="color: var(--text-light);">Palestine</p>
                </div>
                <div style="margin-bottom: 2rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>Email:</strong></p>
                    <p style="color: var(--text-light);">info@growpal.com</p>
                </div>
                <div style="margin-bottom: 2rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>Phone:</strong></p>
                    <p style="color: var(--text-light);">+970 9 XXX XXXX</p>
                </div>
                
                <h3 style="margin: 2rem 0 1.5rem; color: var(--primary-color);">Our Location</h3>
                <div class="map-container">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.5!2d35.2606!3d32.2211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDEzJzE2LjAiTiAzNcKwMTUnMzguMiJF!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s" 
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
        <h2 class="section-title">Learn More About Us</h2>
        <div class="video-container">
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen></iframe>
            </div>
        </div>
    </div>
</section>

<script>
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    e.target.reset();
});
</script>

<?php include 'includes/footer.php'; ?>
