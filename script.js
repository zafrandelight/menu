// Function to dynamically set the scroll-padding-top
function updateScrollPadding() {
    const header = document.querySelector('header');
    if (header) {
        // Get the height of the header
        const headerHeight = header.offsetHeight;
        // Set a CSS variable on the html element
        document.documentElement.style.setProperty('scroll-padding-top', `${headerHeight}px`);
    }
}

// --- Main Event Listener ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Popup Logic ---
    const popupOverlay = document.getElementById('popup-overlay');
    const closePopupButton = document.getElementById('close-popup');

    // Show popup after a delay
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
            // Check if we can scroll right
            const maxScroll = navLinksContainer.scrollWidth - navLinksContainer.clientWidth;
            scrollRightBtn.classList.toggle('hidden', navLinksContainer.scrollLeft >= maxScroll - 1); // -1 for precision
            
            // Check if we can scroll left
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
        
        // Initial check
        updateArrowVisibility();
    }

    // --- 3. Dynamic Scroll Padding ---
    // Initial call when page loads
    updateScrollPadding();
});

// Also update on window resize, as header height will change
window.addEventListener('resize', updateScrollPadding);
