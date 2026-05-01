// LocalStorage Management
const Storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// Cart Management
const Cart = {
    get: () => Storage.get('cart') || [],
    add: (product) => {
        const cart = Cart.get();
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += product.quantity || 1;
        } else {
            cart.push({ ...product, quantity: product.quantity || 1 });
        }
        Storage.set('cart', cart);
        Cart.updateCount();
        return cart;
    },
    remove: (id) => {
        const cart = Cart.get().filter(item => item.id !== id);
        Storage.set('cart', cart);
        Cart.updateCount();
        return cart;
    },
    updateQuantity: (id, quantity) => {
        const cart = Cart.get();
        const item = cart.find(item => item.id === id);
        if (item) {
            if (quantity <= 0) {
                return Cart.remove(id);
            }
            item.quantity = quantity;
        }
        Storage.set('cart', cart);
        Cart.updateCount();
        return cart;
    },
    clear: () => {
        Storage.remove('cart');
        Cart.updateCount();
    },
    getTotal: () => {
        const cart = Cart.get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    updateCount: () => {
        const count = Cart.get().reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cartCount');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }
};

// Wishlist Management
const Wishlist = {
    get: () => Storage.get('wishlist') || [],
    add: (product) => {
        const wishlist = Wishlist.get();
        if (!wishlist.find(item => item.id === product.id)) {
            wishlist.push(product);
            Storage.set('wishlist', wishlist);
            Wishlist.updateCount();
        }
        return wishlist;
    },
    remove: (id) => {
        const wishlist = Wishlist.get().filter(item => item.id !== id);
        Storage.set('wishlist', wishlist);
        Wishlist.updateCount();
        return wishlist;
    },
    isInWishlist: (id) => {
        return Wishlist.get().some(item => item.id === id);
    },
    updateCount: () => {
        const count = Wishlist.get().length;
        const badge = document.getElementById('wishlistCount');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }
};

// Comments Management
const Comments = {
    get: (page) => {
        const key = `comments_${page || 'index'}`;
        return Storage.get(key) || [];
    },
    add: (page, comment) => {
        const key = `comments_${page || 'index'}`;
        const comments = Comments.get(page);
        comments.unshift({
            ...comment,
            id: Date.now(),
            date: new Date().toLocaleDateString()
        });
        Storage.set(key, comments);
        return comments;
    }
};

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Update cart and wishlist counts on page load
    Cart.updateCount();
    Wishlist.updateCount();

    // Initialize sliders
    initSliders();

    // Initialize FAQ
    initFAQ();

    // Initialize product interactions
    initProductInteractions();
});

// Slider Functionality
function initSliders() {
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(container => {
        const slides = container.querySelectorAll('.slide');
        const dots = container.querySelectorAll('.dot');
        let currentSlide = 0;

        if (slides.length === 0) return;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            if (dots.length > 0) {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            }
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        };

        // Navigation buttons
        const nextBtn = container.parentElement.querySelector('.next');
        const prevBtn = container.parentElement.querySelector('.prev');
        
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });

        // Auto-play
        if (slides.length > 1) {
            setInterval(nextSlide, 5000);
        }

        showSlide(0);
    });
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        }
    });
}

// Product Interactions
function initProductInteractions() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = btn.dataset.id;
            const productName = btn.dataset.name;
            const productPrice = parseFloat(btn.dataset.price);
            const productImage = btn.dataset.image || '';

            Cart.add({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            });

            // Show feedback
            btn.textContent = 'Added!';
            btn.style.background = 'var(--success-color)';
            setTimeout(() => {
                btn.textContent = 'Add to Cart';
                btn.style.background = '';
            }, 1000);
        });
    });

    // Add to wishlist buttons
    document.querySelectorAll('.add-to-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = btn.dataset.id;
            const productName = btn.dataset.name;
            const productPrice = parseFloat(btn.dataset.price);
            const productImage = btn.dataset.image || '';

            if (Wishlist.isInWishlist(productId)) {
                Wishlist.remove(productId);
                btn.textContent = '♡ Add to Wishlist';
            } else {
                Wishlist.add({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage
                });
                btn.textContent = '♥ In Wishlist';
            }
        });
    });
}

// Cart Page Functions
function renderCart() {
    const cart = Cart.get();
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">Your cart is empty.</p>';
        if (summary) summary.innerHTML = '';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item fade-in">
            <div class="item-image">
                <span style="font-size: 3rem;">🧼</span>
            </div>
            <div class="item-details">
                <h3 class="item-title">${item.name}</h3>
                <p class="item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                           onchange="updateCartQuantity('${item.id}', parseInt(this.value))">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <button class="btn btn-outline" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        </div>
    `).join('');

    if (summary) {
        const subtotal = Cart.getTotal();
        summary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
        `;
    }
}

function updateCartQuantity(id, quantity) {
    Cart.updateQuantity(id, quantity);
    renderCart();
}

function removeFromCart(id) {
    const item = document.querySelector(`[onclick*="'${id}'"]`)?.closest('.cart-item');
    if (item) {
        item.classList.add('slide-out');
        setTimeout(() => {
            Cart.remove(id);
            renderCart();
        }, 300);
    }
}

// Wishlist Page Functions
function renderWishlist() {
    const wishlist = Wishlist.get();
    const container = document.getElementById('wishlistItems');
    
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">Your wishlist is empty.</p>';
        return;
    }

    container.innerHTML = wishlist.map(item => `
        <div class="wishlist-item fade-in">
            <div class="item-image">
                <span style="font-size: 3rem;">🧼</span>
            </div>
            <div class="item-details">
                <h3 class="item-title">${item.name}</h3>
                <p class="item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-primary" onclick="addToCartFromWishlist('${item.id}')">Add to Cart</button>
                <button class="btn btn-outline" onclick="removeFromWishlist('${item.id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

function addToCartFromWishlist(id) {
    const wishlist = Wishlist.get();
    const item = wishlist.find(i => i.id === id);
    if (item) {
        Cart.add(item);
        const wishlistItem = document.querySelector(`[onclick*="'${id}'"]`)?.closest('.wishlist-item');
        if (wishlistItem) {
            wishlistItem.style.background = 'var(--success-color)';
            wishlistItem.style.color = 'white';
            setTimeout(() => {
                removeFromWishlist(id);
            }, 500);
        }
    }
}

function removeFromWishlist(id) {
    const item = document.querySelector(`[onclick*="'${id}'"]`)?.closest('.wishlist-item');
    if (item) {
        item.classList.add('slide-out');
        setTimeout(() => {
            Wishlist.remove(id);
            renderWishlist();
        }, 300);
    }
}

// Comments Functions
function renderComments(page) {
    const comments = Comments.get(page);
    const container = document.getElementById('commentsList');
    
    if (!container) return;

    if (comments.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No comments yet. Be the first to comment!</p>';
        return;
    }

    container.innerHTML = comments.map(comment => `
        <div class="comment-item fade-in">
            <div class="comment-author">${comment.name}</div>
            <div class="comment-date">${comment.date}</div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
}

function submitComment(page) {
    const form = document.getElementById('commentForm');
    if (!form) return;

    const name = form.querySelector('[name="name"]').value;
    const text = form.querySelector('[name="comment"]').value;

    if (!name || !text) {
        alert('Please fill in all fields');
        return;
    }

    Comments.add(page, { name, text });
    form.reset();
    renderComments(page);
}

// Checkout Form
function handleCheckout(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Simulate form submission
    alert('Thank you for your order! Your cart has been cleared.');
    Cart.clear();
    window.location.href = 'index.php';
}

// Initialize page-specific functions
if (document.getElementById('cartItems')) {
    renderCart();
}

if (document.getElementById('wishlistItems')) {
    renderWishlist();
}

if (document.getElementById('commentsList')) {
    const page = document.body.dataset.page || 'index';
    renderComments(page);
    
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitComment(page);
        });
    }
}

if (document.getElementById('checkoutForm')) {
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
}
