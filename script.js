// --- Popup Logic (Keep this if you have it, otherwise this is new) ---
document.addEventListener('DOMContentLoaded', () => {
    const popupOverlay = document.getElementById('popup-overlay');
    const closePopupButton = document.getElementById('close-popup');

    // Show popup after a delay, e.g., 2 seconds
    setTimeout(() => {
        if (popupOverlay) {
            popupOverlay.classList.remove('hidden');
        }
    }, 2000); // 2000 milliseconds = 2 seconds

    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            if (popupOverlay) {
                popupOverlay.classList.add('hidden');
            }
        });
    }

    // Close popup if clicking outside the box
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.classList.add('hidden');
            }
        });
    }
});


// --- NEW: Scroll Arrows Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.getElementById('nav-links-container');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');

    if (!navLinksContainer || !scrollLeftBtn || !scrollRightBtn) {
        // If elements are not found, stop the script
        return;
    }

    const scrollAmount = 150; // How many pixels to scroll per click

    // Function to check and update arrow visibility
    const updateArrowVisibility = () => {
        // Show right arrow if there's content to scroll to the right
        if (navLinksContainer.scrollWidth > navLinksContainer.clientWidth + navLinksContainer.scrollLeft) {
            scrollRightBtn.classList.remove('hidden');
        } else {
            scrollRightBtn.classList.add('hidden');
        }

        // Show left arrow if scrolled past the beginning
        if (navLinksContainer.scrollLeft > 0) {
            scrollLeftBtn.classList.remove('hidden');
        } else {
            scrollLeftBtn.classList.add('hidden');
        }
    };

    // Scroll left button click handler
    scrollLeftBtn.addEventListener('click', () => {
        navLinksContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    // Scroll right button click handler
    scrollRightBtn.addEventListener('click', () => {
        nav
