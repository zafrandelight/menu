// Function to dynamically set the scroll-padding-top
function updateScrollPadding() {
    // We are back to measuring the ENTIRE header
    const header = document.querySelector('header');
    if (header) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('scroll-padding-top', `${headerHeight}px`);
    }
}

// --- Main Event Listener ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Popup Logic ---
    const popupOverlay = document.getElementById('popup-overlay');
    const closePopupButton = document.getElementById('close-popup');

    setTimeout(() => {
        if (popupOverlay) {
            popupOverlay.classList.remove('hidden');
        }
    }, 5000); // 5 seconds

    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            if (popupOverlay) {
                popupOverlay.classList.add('hidden');
            }
        });
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.classList.add('hidden');
            }
        });
    }

    // --- 2. Scroll Arrows Logic ---
    const navLinksContainer = document.getElementById('nav-links-container');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');

    if (navLinksContainer && scrollLeftBtn && scrollRightBtn) {
        const scrollAmount = 150;

        const updateArrowVisibility = () => {
            const maxScroll = navLinksContainer.scrollWidth - navLinksContainer.clientWidth;
            // Use a small tolerance (1px) for calculations
            scrollRightBtn.classList.toggle('hidden', navLinksContainer.scrollLeft >= maxScroll - 1);
            scrollLeftBtn.classList.toggle('hidden', navLinksContainer.scrollLeft <= 0);
        };

        scrollLeftBtn.addEventListener('click', () => {
            navLinksContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', () => {
            navLinksContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        navLinksContainer.addEventListener('scroll', updateArrowVisibility);
        window.addEventListener('resize', updateArrowVisibility);
        
        // Use ResizeObserver to detect content changes (like images loading)
        if (typeof ResizeObserver === 'function') {
            new ResizeObserver(updateArrowVisibility).observe(navLinksContainer);
        }
        
        // Initial check
        // We run this after a short delay to let the page layout settle
        setTimeout(updateArrowVisibility, 100);
    }

    // --- 3. Dynamic Scroll Padding ---
    // Run initial calculation
    updateScrollPadding();
});

// Also update on window resize, as header height might change
window.addEventListener('resize', updateScrollPadding);
