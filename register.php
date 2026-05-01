<?php
$pageTitle = "Register";
include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <div class="form-container">
            <h2 class="form-title">Create Account</h2>
            <form id="registerForm">
                <div class="form-group">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" name="fullName" required>
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="terms" required> I agree to the Terms and Conditions
                    </label>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
                <p style="text-align: center; margin-top: 1rem;">
                    Already have an account? <a href="login.php" style="color: var(--primary-color);">Login here</a>
                </p>
            </form>
        </div>
    </div>
</section>

<style>
.success-notification {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.success-notification-content {
    background: white;
    padding: 3rem;
    border-radius: 20px;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.4s ease;
}

.success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: #2F6F4E;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: scaleIn 0.5s ease;
}

.success-icon::after {
    content: '✓';
    color: white;
    font-size: 50px;
    font-weight: bold;
}

.success-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2F6F4E;
    margin-bottom: 1rem;
}

.success-message {
    color: #666;
    line-height: 1.6;
    margin-bottom: 0.5rem;
}

.plant-message {
    color: #2F6F4E;
    font-style: italic;
    margin-top: 1rem;
    font-size: 0.95rem;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
}
</style>

<script>
(function () {
    var p = new URLSearchParams(window.location.search);
    var em = p.get('email');
    if (em) {
        var el = document.getElementById('email');
        if (el) el.value = decodeURIComponent(em);
    }
})();

function showSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="success-notification-content">
            <div class="success-icon"></div>
            <h2 class="success-title">Account Created Successfully!</h2>
            <p class="success-message">Welcome to GrowPal! Your account has been created.</p>
            <p class="plant-message">🌱 Start your green journey and transform any space into a sustainable environment.</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            window.location.href = 'login.php';
        }, 300);
    }, 3000);
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    // إظهار loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    try {
        console.log('Sending registration request...');
        
        // تحديد المسار الصحيح للـ API
        let apiUrl = 'api/auth.php';
        const currentPath = window.location.pathname;
        if (currentPath.includes('/GrowPal/')) {
            apiUrl = '/GrowPal/api/auth.php';
        } else if (currentPath !== '/register.php' && currentPath.includes('/')) {
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            apiUrl = basePath + '/api/auth.php';
        }
        
        console.log('Current path:', currentPath);
        console.log('API URL:', apiUrl);
        console.log('Request data:', { action: 'register', name, email, password: '***' });
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                name: name,
                email: email,
                password: password
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            console.log('Registration successful!');
            showSuccessNotification();
        } else {
            alert('Error: ' + result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please check console for details and try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});
</script>

<?php include 'includes/footer.php'; ?>
