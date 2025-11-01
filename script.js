// --- CONFIGURATION ---
// 1. ADD YOUR WHATSAPP NUMBER HERE (with country code, no + or 00)
const WHATSAPP_NUMBER = "49123456789"; // Example: "49123456789" (for Germany)

// 2. ADD YOUR COUPON CODES HERE
const COUPON_CODES = [
    { code: "LAMM2", discountType: "fixed", value: 2.00 },
    { code: "10PROZENT", discountType: "percent", value: 0.10 }
];
// --- END CONFIGURATION ---


// Global cart variables
let cart = [];
let appliedCoupon = null;

document.addEventListener("DOMContentLoaded", () => {
    
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

    // --- 3. Promotional Popup ---
    const promoPopup = document.getElementById('popup-overlay');
    const closePromoBtn = document.getElementById('close-popup');
    if (promoPopup && closePromoBtn) {
        setTimeout(() => promoPopup.classList.remove('hidden'), 5000);
        closePromoBtn.addEventListener('click', () => promoPopup.classList.add('hidden'));
    }

    // --- 4. Shopping Cart Logic ---
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const addButtons = document.querySelectorAll('.add-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemCountEl = document.getElementById('cart-item-count');

    // Price/Summary Elements
    const subtotalAmountEl = document.getElementById('subtotal-amount');
    const discountAmountEl = document.getElementById('discount-amount');
    const totalAmountEl = document.getElementById('total-amount');
    const summaryDiscountEl = document.getElementById('summary-discount');
    
    // Coupon Elements
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponCodeInput = document.getElementById('coupon-code');
    const couponMessageEl = document.getElementById('coupon-message');
    
    // Confirmation Screen Elements
    const cartContentEl = document.getElementById('cart-content');
    const orderConfirmationEl = document.getElementById('order-confirmation');
    const confirmationSummaryEl = document.getElementById('confirmation-summary');
    const confirmationCloseBtn = document.getElementById('confirmation-close-btn');

    // Show/Hide Cart Modal
    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (confirmationCloseBtn) confirmationCloseBtn.addEventListener('click', closeCart);
    
    function openCart() {
        // Reset to default view every time cart is opened
        cartContentEl.classList.remove('hidden');
        orderConfirmationEl.classList.add('hidden');
        cartOverlay.classList.remove('hidden');
        updateCart(); // Recalculate just in case
    }
    
    function closeCart() {
        cartOverlay.classList.add('hidden');
    }

    // Add Item to Cart
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            addToCart(id, name, price);
        });
    });

    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        updateCart();
    }

    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let subtotal = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Ihr Warenkorb ist leer.</p>";
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

        let discountAmount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'fixed') {
                discountAmount = appliedCoupon.value;
            } else if (appliedCoupon.discountType === 'percent') {
                discountAmount = subtotal * appliedCoupon.value;
            }
            discountAmount = Math.min(subtotal, discountAmount);
            summaryDiscountEl.classList.remove('hidden');
            discountAmountEl.innerText = `-${discountAmount.toFixed(2)} €`;
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
        updateCart();
    }

    // --- 5. Coupon Logic ---
    applyCouponBtn.addEventListener('click', () => {
        const code = couponCodeInput.value.trim().toUpperCase();
        const coupon = COUPON_CODES.find(c => c.code.toUpperCase() === code);

        if (coupon) {
            appliedCoupon = coupon;
            couponMessageEl.innerText = `Code "${coupon.code}" angewendet!`;
            couponMessageEl.className = 'success';
        } else {
            appliedCoupon = null;
            couponMessageEl.innerText = "Ungültiger Code.";
            couponMessageEl.className = 'error';
        }
        updateCart();
    });

    // --- 6. Checkout Logic ---
    const orderForm = document.getElementById('order-form');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    // --- NEW: AJAX Form Submission ---
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop the page from redirecting
        
        const { summaryText, total, discountText } = generateOrderSummary();
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;

        // Populate hidden fields
        document.getElementById('order-details-input').value = `${summaryText}\n${discountText}`;
        document.getElementById('order-total-input').value = `${total.toFixed(2)} €`;

        const formData = new FormData(orderForm);
        const submitButton = orderForm.querySelector('.checkout-email');
        submitButton.innerText = "Sende...";
        submitButton.disabled = true;

        fetch(orderForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                // Show confirmation screen
                const finalSummary = `Kunde: ${customerName}\nTelefon: ${customerPhone}\n\n${summaryText}\n${discountText}Gesamt: ${total.toFixed(2)} €`;
                confirmationSummaryEl.innerText = finalSummary;
                
                cartContentEl.classList.add('hidden');
                orderConfirmationEl.classList.remove('hidden');
                
                // Reset everything
                cart = [];
                appliedCoupon = null;
                orderForm.reset();
                updateCart();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert("Fehler beim Senden. Bitte versuchen Sie es später erneut.");
                    }
                });
            }
        }).catch(error => {
            alert("Fehler beim Senden. Bitte prüfen Sie Ihre Internetverbindung.");
        }).finally(() => {
            // Re-enable submit button
            submitButton.innerText = "Per E-Mail an das Restaurant senden";
            submitButton.disabled = false;
        });
    });

    // WhatsApp Submit
    whatsappBtn.addEventListener('click', () => {
        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;
        if (!name || !phone) {
            alert("Bitte geben Sie Ihren Namen und Ihre Telefonnummer an.");
            return;
        }
        const { summaryText, total, discountText } = generateOrderSummary();
        let whatsappMessage = `*Neue Abhol-Bestellung*\n\n*Kunde:* ${name}\n*Telefon:* ${phone}\n\n*Bestellung:*\n${summaryText}\n${discountText}*Gesamt: ${total.toFixed(2)} €*`;
        let encodedMessage = encodeURIComponent(whatsappMessage);
        let whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');
    });

    function generateOrderSummary() {
        let summaryText = "";
        let subtotal = 0;
        
        cart.forEach(item => {
            summaryText += `${item.quantity}x ${item.name} (${(item.price * item.quantity).toFixed(2)} €)\n`;
            subtotal += item.price * item.quantity;
        });

        let discountAmount = 0;
        let discountText = "";
        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'fixed') {
                discountAmount = appliedCoupon.value;
            } else if (appliedCoupon.discountType === 'percent') {
                discountAmount = subtotal * appliedCoupon.value;
            }
            discountAmount = Math.min(subtotal, discountAmount);
            discountText = `Rabatt (${appliedCoupon.code}): -${discountAmount.toFixed(2)} €\n`;
        }
        
        let total = subtotal - discountAmount;
        return { summaryText, subtotal, discountText, total };
    }
});
