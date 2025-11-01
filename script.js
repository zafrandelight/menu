// Global cart variables
let cart = [];
let appliedCoupon = null;

// --- Main function to load config first ---
document.addEventListener("DOMContentLoaded", async () => {
    
    let config;
    try {
        // Fetch the config file (add cache-buster)
        const response = await fetch('config.json?v=7'); // Match v=7
        config = await response.json();
    } catch (error) {
        console.error("Failed to load config.json", error);
        // If config fails, use empty defaults
        config = { promoPopup: {}, coupons: [], whatsappNumber: "" };
    }

    // --- 1. Sticky Header Scroll Padding ---
    const header = document.querySelector('header');
    function updateScrollPadding() {
        if (header) {
            const headerHeight = header.offsetHeight;
            document.documentElement.style.setProperty('scroll-padding-top', `${headerHeight}px`);
        }
    }
    updateScrollPadding();
    window.addEventListener('resize', updateScrollPadding);

    // --- 2. Nav Scroller ---
    const navLinksContainer = document.getElementById('nav-links-container');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');
    if (navLinksContainer && scrollLeftBtn && scrollRightBtn) {
        const scrollAmount = 150;
        const updateArrowVisibility = () => {
            const maxScroll = navLinksContainer.scrollWidth - navLinksContainer.clientWidth;
            scrollRightBtn.classList.toggle('hidden', navLinksContainer.scrollLeft >= maxScroll - 1);
            scrollLeftBtn.classList.toggle('hidden', navLinksContainer.scrollLeft <= 0);
        };
        scrollLeftBtn.addEventListener('click', () => navLinksContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
        scrollRightBtn.addEventListener('click', () => navLinksContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
        navLinksContainer.addEventListener('scroll', updateArrowVisibility);
        window.addEventListener('resize', updateArrowVisibility);
        if (typeof ResizeObserver === 'function') {
            new ResizeObserver(updateArrowVisibility).observe(navLinksContainer);
        }
        setTimeout(updateArrowVisibility, 100);
    }

    // --- 3. DYNAMIC Promotional Popup ---
    const promo = config.promoPopup;
    const promoPopup = document.getElementById('popup-overlay');
    const closePromoBtn = document.getElementById('close-popup');

    if (promoPopup && closePromoBtn && promo.startDate && promo.endDate) {
        try {
            const today = new Date();
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            endDate.setHours(23, 59, 59, 999); // Set end date to end of day

            if (today >= startDate && today <= endDate) {
                document.getElementById('promo-line-1').innerText = promo.line1;
                document.getElementById('promo-line-2').innerText = promo.line2;
                setTimeout(() => promoPopup.classList.remove('hidden'), 3000);
            }
        } catch (e) {
            console.error("Error with promo dates:", e);
        }
        closePromoBtn.addEventListener('click', () => promoPopup.classList.add('hidden'));
    }

    // --- 4. Shopping Cart Logic ---
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const addButtons = document.querySelectorAll('.add-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemCountEl = document.getElementById('cart-item-count');

    const subtotalAmountEl = document.getElementById('subtotal-amount');
    const discountAmountEl = document.getElementById('discount-amount');
    const totalAmountEl = document.getElementById('total-amount');
    const summaryDiscountEl = document.getElementById('summary-discount');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponCodeInput = document.getElementById('coupon-code');
    const couponMessageEl = document.getElementById('coupon-message');
    const cartContentEl = document.getElementById('cart-content');
    const orderConfirmationEl = document.getElementById('order-confirmation');
    const confirmationSummaryEl = document.getElementById('confirmation-summary');
    const confirmationCloseBtn = document.getElementById('confirmation-close-btn');

    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (confirmationCloseBtn) confirmationCloseBtn.addEventListener('click', closeCart);
    
    function openCart() {
        cartContentEl.classList.remove('hidden');
        orderConfirmationEl.classList.add('hidden');
        cartOverlay.classList.remove('hidden');
        updateCart();
    }
    function closeCart() { cartOverlay.classList.add('hidden'); }

    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            const category = button.dataset.category; // NEW: Get category
            addToCart(id, name, price, category);
        });
    });

    function addToCart(id, name, price, category) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, category, quantity: 1 }); // NEW: Save category in cart
        }
        updateCart();
    }

    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let subtotal = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            appliedCoupon = null;
        }

        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <div class="cart-item-controls">
                    <button class="cart-btn-minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="cart-btn-plus" data-id="${item.id}">+</button>
                </div>
                <span class="cart-item-price">${(item.price * item.quantity).toFixed(2)} €</span>
            `;
            cartItemsContainer.appendChild(itemEl);
            subtotal += item.price * item.quantity;
            itemCount += item.quantity;
        });

        // --- NEW: Advanced Discount Calculation ---
        let discountAmount = 0;
        if (appliedCoupon) {
            let discountableSubtotal = 0;

            if (appliedCoupon.appliesToCategory === "all") {
                // Discount applies to the whole cart
                discountableSubtotal = subtotal;
            } else {
                // Discount applies ONLY to specific category
                cart.forEach(item => {
                    if (item.category === appliedCoupon.appliesToCategory) {
                        discountableSubtotal += item.price * item.quantity;
                    }
                });
            }

            // Calculate the discount
            if (appliedCoupon.discountType === 'fixed') {
                // "Fixed" now means a fixed amount *per qualifying item*
                // e.g., "LAMM2" is 2€ off *each* lamb dish
                let applicableItems = 0;
                cart.forEach(item => {
                    if (item.category === appliedCoupon.appliesToCategory) {
                        applicableItems += item.quantity;
                    }
                });
                discountAmount = appliedCoupon.value * applicableItems;
            } 
            else if (appliedCoupon.discountType === 'percent') {
                // "Percent" applies to the subtotal of qualifying items
                discountAmount = discountableSubtotal * appliedCoupon.value;
            }
            
            discountAmount = Math.min(subtotal, discountAmount); // Don't discount more than the total
            
            if (discountAmount > 0) {
                summaryDiscountEl.classList.remove('hidden');
                discountAmountEl.innerText = `-${discountAmount.toFixed(2)} €`;
            } else {
                // We applied a code, but it didn't match any items
                summaryDiscountEl.classList.add('hidden');
                couponMessageEl.innerText = `Code valid, but no matching items in cart.`;
                couponMessageEl.className = 'error';
                appliedCoupon = null; // Remove coupon
            }
        } else {
            summaryDiscountEl.classList.add('hidden');
            couponMessageEl.innerText = "";
            couponCodeInput.value = "";
        }
        
        let total = subtotal - discountAmount;

        subtotalAmountEl.innerText = `${subtotal.toFixed(2)} €`;
        totalAmountEl.innerText = `${total.toFixed(2)} €`;
        cartItemCountEl.innerText = itemCount;
        
        cartToggleBtn.classList.toggle('hidden', itemCount === 0);
        addCartItemControls();
    }

    function addCartItemControls() {
        document.querySelectorAll('.cart-btn-plus').forEach(btn => {
            btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, 1));
        });
        document.querySelectorAll('.cart-btn-minus').forEach(btn => {
            btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, -1));
        });
    }

    function adjustQuantity(id, amount) {
        const item = cart.find(item => item.id === id);
        if (!item) return;
        item.quantity += amount;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }
        // When quantity changes, must recalculate cart
        updateCart();
    }

    // --- 5. DYNAMIC Coupon Logic ---
    applyCouponBtn.addEventListener('click', () => {
        const code = couponCodeInput.value.trim().toUpperCase();
        const coupon = config.coupons.find(c => c.code.toUpperCase() === code);

        if (coupon) {
            // Check if cart contains items from this category
            if (coupon.appliesToCategory !== "all") {
                const hasMatchingItem = cart.some(item => item.category === coupon.appliesToCategory);
                if (!hasMatchingItem) {
                    appliedCoupon = null;
                    couponMessageEl.innerText = `You need a '${coupon.appliesToCategory}' item to use this code.`;
                    couponMessageEl.className = 'error';
                    updateCart();
                    return;
                }
            }
            // All checks passed
            appliedCoupon = coupon;
            couponMessageEl.innerText = `Code "${coupon.code}" applied!`;
            couponMessageEl.className = 'success';
        } else {
            appliedCoupon = null;
            couponMessageEl.innerText = "Invalid code.";
            couponMessageEl.className = 'error';
        }
        // Recalculate cart totals with/without coupon
        updateCart();
    });

    // --- 6. Checkout Logic (AJAX submission) ---
    const orderForm = document.getElementById('order-form');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { summaryText, total, discountText } = generateOrderSummary();
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;

        document.getElementById('order-details-input').value = `${summaryText}\n${discountText}`;
        document.getElementById('order-total-input').value = `${total.toFixed(2)} €`;

        const formData = new FormData(orderForm);
        const submitButton = orderForm.querySelector('.checkout-email');
        submitButton.innerText = "Sending...";
        submitButton.disabled = true;

        fetch(orderForm.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                const finalSummary = `Customer: ${customerName}\nPhone: ${customerPhone}\n\n${summaryText}\n${discountText}Total: ${total.toFixed(2)} €`;
                confirmationSummaryEl.innerText = finalSummary;
                cartContentEl.classList.add('hidden');
                orderConfirmationEl.classList.remove('hidden');
                cart = [];
                appliedCoupon = null;
                orderForm.reset();
                updateCart();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert("Error sending order. Please try again later.");
                    }
                });
            }
        }).catch(error => {
            alert("Error sending order. Please check your internet connection.");
        }).finally(() => {
            submitButton.innerText = "Send via Email";
            submitButton.disabled = false;
