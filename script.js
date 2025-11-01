// --- CONFIGURATION ---
// 1. ADD YOUR WHATSAPP NUMBER HERE (with country code, no + or 00)
const WHATSAPP_NUMBER = "49123456789"; // Example: "49123456789" (for Germany)

// --- END CONFIGURATION ---


// Global cart variable
let cart = [];

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
    const cartTotalEl = document.getElementById('cart-total');
    const cartItemCountEl = document.getElementById('cart-item-count');

    // Show/Hide Cart Modal
    if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => cartOverlay.classList.remove('hidden'));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => cartOverlay.classList.add('hidden'));

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
        // Clear the cart UI
        cartItemsContainer.innerHTML = "";
        let total = 0;
        let itemCount = 0;

        cart.forEach(item => {
            // Create cart item element
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

            total += item.price * item.quantity;
            itemCount += item.quantity;
        });

        // Update total price and item count
        cartTotalEl.innerText = `Gesamt: ${total.toFixed(2)} €`;
        cartItemCountEl.innerText = itemCount;
        
        // Show or hide the floating cart button
        cartToggleBtn.classList.toggle('hidden', itemCount === 0);

        // Add event listeners for the new +/- buttons
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
            // Remove item from cart if quantity is 0 or less
            cart = cart.filter(item => item.id !== id);
        }
        updateCart();
    }

    // --- 5. Checkout Logic ---
    const orderForm = document.getElementById('order-form');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    // Option 1: Formspree Email Submit
    orderForm.addEventListener('submit', (e) => {
        // Prepare the form for submission
        const { summaryText, total } = generateOrderSummary();
        document.getElementById('order-details-input').value = summaryText;
        document.getElementById('order-total-input').value = `${total.toFixed(2)} €`;
        // Let the form submit normally
    });

    // Option 2: WhatsApp Submit
    whatsappBtn.addEventListener('click', () => {
        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;

        if (!name || !phone) {
            alert("Bitte geben Sie Ihren Namen und Ihre Telefonnummer an.");
            return;
        }

        const { summaryText, total } = generateOrderSummary();
        
        let whatsappMessage = `*Neue Abhol-Bestellung*\n\n*Kunde:* ${name}\n*Telefon:* ${phone}\n\n*Bestellung:*\n${summaryText}\n*Gesamt: ${total.toFixed(2)} €*`;
        
        // Encode for URL
        let encodedMessage = encodeURIComponent(whatsappMessage);
        let whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        window.open(whatsappURL, '_blank');
    });

    function generateOrderSummary() {
        let summaryText = "";
        let total = 0;
        
        cart.forEach(item => {
            summaryText += `${item.quantity}x ${item.name} (${(item.price * item.quantity).toFixed(2)} €)\n`;
            total += item.price * item.quantity;
        });

        return { summaryText, total };
    }
});
