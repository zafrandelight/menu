// Function to dynamically set the scroll-padding-top
function updateScrollPadding() {
    // UPDATED: Now targets the 'nav' element
    const stickyNav = document.querySelector('nav');
    if (stickyNav) {
        const navHeight = stickyNav.offsetHeight;
        document.documentElement.style.setProperty('scroll-padding-top', `${navHeight}px`);
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
        // that might affect scroll width.
        if (typeof ResizeObserver === 'function') {
            new ResizeObserver(updateArrowVisibility).observe(navLinksContainer);
        }
        
        // Initial check
        updateArrowVisibility();
    }

    // --- 3. Dynamic Scroll Padding ---
    updateScrollPadding();
});

// Also update on window resize
window.addEventListener('resize', updateScrollPadding);
