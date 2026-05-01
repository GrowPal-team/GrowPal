<?php
$pageTitle = "Login";
include 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <div class="form-container">
            <h2 class="form-title">Login</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="remember"> Remember me
                    </label>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                <p style="text-align: center; margin-top: 1rem;">
                    Don't have an account? <a href="register.php" style="color: var(--primary-color);">Register here</a>
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
function showLoginSuccess(userName) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="success-notification-content">
            <div class="success-icon"></div>
            <h2 class="success-title">Login Successful!</h2>
            <p class="success-message">Welcome back, ${userName}! You have successfully logged in.</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            window.location.href = 'index.php';
        }, 300);
    }, 2000);
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        console.log('Sending login request...');
        
        // تحديد المسار الصحيح للـ API
        let apiUrl = 'api/auth.php';
        const currentPath = window.location.pathname;
        if (currentPath.includes('/GrowPal/')) {
            apiUrl = '/GrowPal/api/auth.php';
        } else if (currentPath !== '/login.php' && currentPath.includes('/')) {
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            apiUrl = basePath + '/api/auth.php';
        }
        
        console.log('Current path:', currentPath);
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            showLoginSuccess(result.user.name);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
</script>

<?php include 'includes/footer.php'; ?>
