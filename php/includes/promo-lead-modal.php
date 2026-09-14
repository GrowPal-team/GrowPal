<?php
/**
 * Promo modal: ببلك يوزر فقط، لوكال فقط، بعد 10 ثوان، مرة واحدة (localStorage).
 */
$rawHost = $_SERVER['HTTP_HOST'] ?? '';
$isLocalPromoHost = (bool) preg_match('/^localhost(:\d+)?$/i', $rawHost)
    || (bool) preg_match('/^127\.0\.0\.1(:\d+)?$/', $rawHost)
    || (bool) preg_match('/^\[::1\](:\d+)?$/', $rawHost);
if (!$isLocalPromoHost) {
    return;
}
if (!empty($_SESSION['user_id'])) {
    return;
}
?>
<script>window.__GROWPAL_PHP_LOGGED_IN__ = false;</script>
<div
    id="growpal-promo-overlay"
    class="growpal-promo-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="growpal-promo-title"
    aria-hidden="true"
    hidden
>
    <div class="growpal-promo-backdrop" data-growpal-promo-close></div>
    <div class="growpal-promo-card">
        <button type="button" class="growpal-promo-x" data-growpal-promo-close aria-label="Close">&times;</button>
        <div class="growpal-promo-visual" aria-hidden="true"></div>
        <div class="growpal-promo-panel">
            <h2 id="growpal-promo-title" class="growpal-promo-heading">Get 10% OFF</h2>
            <p class="growpal-promo-sub">Backed by our growing community &amp; care tips</p>
            <div class="growpal-promo-fields">
                <input type="email" id="growpal-promo-email" class="growpal-promo-input" placeholder="Email" autocomplete="email" />
                <p id="growpal-promo-err" class="growpal-promo-err" hidden></p>
                <button type="button" id="growpal-promo-submit" class="growpal-promo-cta">GET OFFER</button>
            </div>
            <p class="growpal-promo-legal">By signing up, you agree to receive email marketing from GrowPal.</p>
            <button type="button" class="growpal-promo-dismiss" data-growpal-promo-close>No, thanks</button>
        </div>
    </div>
</div>
<style>
.growpal-promo-overlay {
    position: fixed;
    inset: 0;
    z-index: 10050;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.growpal-promo-overlay.growpal-promo-visible {
    display: flex;
}
.growpal-promo-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
}
.growpal-promo-card {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 48rem;
    width: 100%;
    max-height: 90vh;
    border-radius: 1rem;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}
@media (min-width: 768px) {
    .growpal-promo-card {
        flex-direction: row;
        max-height: 520px;
    }
}
.growpal-promo-x {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 2;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.95);
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}
@media (min-width: 768px) {
    .growpal-promo-x {
        top: 1rem;
        right: 1rem;
    }
}
.growpal-promo-visual {
    display: none;
    width: 100%;
    min-height: 200px;
    background: #e8efe8 center/cover no-repeat;
    background-image: url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80");
}
@media (min-width: 768px) {
    .growpal-promo-visual {
        display: block;
        width: 45%;
        min-height: auto;
    }
}
.growpal-promo-panel {
    width: 100%;
    padding: 2.5rem 1.5rem;
    background: #1e4a32;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
@media (min-width: 768px) {
    .growpal-promo-panel {
        width: 55%;
        padding: 2.5rem 2.5rem;
    }
}
.growpal-promo-heading {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.15;
}
@media (min-width: 768px) {
    .growpal-promo-heading {
        font-size: 2.25rem;
    }
}
.growpal-promo-sub {
    margin: 0.5rem 0 0;
    font-size: 0.95rem;
    opacity: 0.92;
}
.growpal-promo-fields {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.growpal-promo-input {
    height: 2.75rem;
    border: none;
    border-radius: 0.5rem;
    padding: 0 0.75rem;
    font-size: 1rem;
    color: #1a1a1a;
}
.growpal-promo-err {
    margin: 0;
    font-size: 0.875rem;
    color: #fde68a;
}
.growpal-promo-cta {
    height: 2.75rem;
    border: none;
    border-radius: 0.5rem;
    background: #3fa36a;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
}
.growpal-promo-cta:hover {
    background: #358f5b;
}
.growpal-promo-cta:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
.growpal-promo-legal {
    margin: 1rem 0 0;
    font-size: 0.75rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.75);
}
.growpal-promo-dismiss {
    margin-top: 1.5rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    align-self: center;
}
</style>
<script>
(function () {
    var DELAY_MS = 10000;

    if (!/^localhost$|^127\.0\.0\.1$|^\[::1\]$/i.test(location.hostname)) {
        return;
    }

    function apiPromoUrl() {
        return "api/promo-lead.php";
    }

    function registerUrlWithPromo(email) {
        return "register.php?promo=10&email=" + encodeURIComponent(email);
    }

    function phpLoggedIn() {
        return window.__GROWPAL_PHP_LOGGED_IN__ === true;
    }

    function clientLoggedIn() {
        try {
            var u = JSON.parse(localStorage.getItem("user") || "null");
            var id = u && u.id != null ? Number(u.id) : 0;
            if (!id) return false;
            var li = localStorage.getItem("isLoggedIn") === "true";
            var tok = localStorage.getItem("growpal_token");
            return !!(li || tok);
        } catch (e) {
            return false;
        }
    }

    function isLoggedIn() {
        return phpLoggedIn() || clientLoggedIn();
    }

    function dismiss() {
        var el = document.getElementById("growpal-promo-overlay");
        if (el) {
            el.classList.remove("growpal-promo-visible");
            el.setAttribute("aria-hidden", "true");
            el.setAttribute("hidden", "");
        }
    }

    function openModal() {
        var el = document.getElementById("growpal-promo-overlay");
        if (!el) return;
        el.classList.add("growpal-promo-visible");
        el.removeAttribute("hidden");
        el.setAttribute("aria-hidden", "false");
    }

    function schedule() {
        if (isLoggedIn()) return;
        window.setTimeout(function () {
            if (isLoggedIn()) return;
            openModal();
        }, DELAY_MS);
    }

    function initPromoModal() {
        var overlay = document.getElementById("growpal-promo-overlay");
        if (!overlay) return;

        overlay.querySelectorAll("[data-growpal-promo-close]").forEach(function (btn) {
            btn.addEventListener("click", dismiss);
        });

        var submit = document.getElementById("growpal-promo-submit");
        var emailEl = document.getElementById("growpal-promo-email");
        var errEl = document.getElementById("growpal-promo-err");

        if (submit && emailEl) {
            submit.addEventListener("click", function () {
                var email = (emailEl.value || "").trim().toLowerCase();
                var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (!ok) {
                    if (errEl) {
                        errEl.textContent = "Please enter a valid email.";
                        errEl.hidden = false;
                    }
                    return;
                }
                if (errEl) errEl.hidden = true;
                submit.disabled = true;
                fetch(apiPromoUrl(), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email, discount_label: "10%", source: "php_home_modal" }),
                })
                    .catch(function () {})
                    .finally(function () {
                        submit.disabled = false;
                        dismiss();
                        window.location.href = registerUrlWithPromo(email);
                    });
            });
        }

        schedule();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPromoModal);
    } else {
        initPromoModal();
    }
})();
</script>
