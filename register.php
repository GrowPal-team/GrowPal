<?php
$pageTitle = 'Register';
$publicSiteUrl = rtrim(getenv('GROWPAL_SITE_URL') ?: 'http://localhost:3000', '/');
require_once __DIR__ . '/includes/site_urls.php';
$loginUrl = growpal_canonical_url('/login', 'login.php');

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
                    Already have an account? <a href="<?php echo htmlspecialchars($loginUrl); ?>" style="color: var(--primary-color);">Login here</a>
                </p>
            </form>
        </div>
    </div>
</section>

<script>
const publicSiteUrl = <?php echo json_encode($publicSiteUrl); ?>;

function prefillEmailFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const emailInput = document.getElementById('email');

    if (email && emailInput) {
        emailInput.value = decodeURIComponent(email);
    }
}

function resolveAuthApiUrl() {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/GrowPal/')) {
        return '/GrowPal/api/auth.php';
    }

    if (currentPath !== '/register.php' && currentPath.includes('/')) {
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        return `${basePath}/api/auth.php`;
    }

    return 'api/auth.php';
}

function showAuthFeedback({ title, message, note, redirectUrl, delay = 2200 }) {
    const notification = document.createElement('div');
    notification.className = 'auth-feedback-overlay';
    notification.innerHTML = `
        <div class="auth-feedback-card">
            <div class="auth-feedback-icon"></div>
            <h2 class="auth-feedback-title">${title}</h2>
            <p class="auth-feedback-message">${message}</p>
            ${note ? `<p class="auth-feedback-note">${note}</p>` : ''}
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

function passwordMeetsPolicy(password) {
    return typeof password === 'string'
        && password.length >= 8
        && /[A-Z]/.test(password)
        && /[a-z]/.test(password)
        && /[0-9]/.test(password)
        && /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

function buildVerifyEmailUrl(email, token, devCode) {
    const params = new URLSearchParams({ email });

    if (token) {
        params.set('token', token);
    }

    if (devCode) {
        params.set('code', devCode);
    }

    return `${publicSiteUrl}/verify-email?${params.toString()}`;
}

prefillEmailFromQuery();

const registerForm = document.getElementById('registerForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

if (registerForm && fullNameInput && emailInput && passwordInput && confirmPasswordInput) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalLabel = submitButton ? submitButton.textContent : '';
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (!passwordMeetsPolicy(password)) {
            alert('Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol.');
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';
        }

        try {
            const response = await fetch(resolveAuthApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'register',
                    name: fullNameInput.value,
                    email: emailInput.value,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Unable to create your account right now.');
            }

            if (result.needs_verification) {
                showAuthFeedback({
                    title: 'Check your email',
                    message: result.message || 'We sent you a verification code to finish creating your account.',
                    note: 'You will be redirected to the verification page.',
                    redirectUrl: buildVerifyEmailUrl(emailInput.value, result.token, result.dev_code),
                    delay: 2500,
                });
                return;
            }

            showAuthFeedback({
                title: 'Account created',
                message: 'Welcome to GrowPal! Your account is ready.',
                note: 'Redirecting you to sign in.',
                redirectUrl: 'login.php',
                delay: 2200,
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
