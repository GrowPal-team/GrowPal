<?php
$pageTitle = 'Login';
$publicSiteUrl = rtrim(getenv('GROWPAL_SITE_URL') ?: 'http://localhost:3000', '/');

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

<script>
const publicSiteUrl = <?php echo json_encode($publicSiteUrl); ?>;

function resolveAuthApiUrl() {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/GrowPal/')) {
        return '/GrowPal/api/auth.php';
    }

    if (currentPath !== '/login.php' && currentPath.includes('/')) {
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        return `${basePath}/api/auth.php`;
    }

    return 'api/auth.php';
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[character]));
}

function showAuthFeedback({ title, message, redirectUrl, delay = 2000 }) {
    const notification = document.createElement('div');
    notification.className = 'auth-feedback-overlay';
    notification.innerHTML = `
        <div class="auth-feedback-card">
            <div class="auth-feedback-icon"></div>
            <h2 class="auth-feedback-title">${title}</h2>
            <p class="auth-feedback-message">${message}</p>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 300);
    }, delay);
}

function buildVerifyEmailUrl(email) {
    const params = new URLSearchParams({ email });
    return `${publicSiteUrl}/verify-email?${params.toString()}`;
}

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

if (loginForm && emailInput && passwordInput) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalLabel = submitButton ? submitButton.textContent : '';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Signing In...';
        }

        try {
            const response = await fetch(resolveAuthApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    email: emailInput.value,
                    password: passwordInput.value,
                }),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const result = await response.json();

            if (result.needs_verification) {
                showAuthFeedback({
                    title: 'Email verification required',
                    message: 'Please verify your email before signing in.',
                    redirectUrl: buildVerifyEmailUrl(result.email || emailInput.value),
                    delay: 2200,
                });
                return;
            }

            if (!result.success) {
                throw new Error(result.message || 'Unable to sign in right now.');
            }

            showAuthFeedback({
                title: 'Login successful',
                message: `Welcome back, ${escapeHtml(result.user.name)}!`,
                redirectUrl: 'index.php',
                delay: 2000,
            });
        } catch (error) {
            alert(error.message || 'An error occurred. Please try again.');

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalLabel;
            }
        }
    });
}
</script>

<?php include 'includes/footer.php'; ?>
