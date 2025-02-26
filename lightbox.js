/*==============================================
                LIGHTBOX FUNCTIONALITY
================================================*/
document.addEventListener('DOMContentLoaded', function() {
    // Create a mutation observer to detect when content changes
    const contentElement = document.getElementById('content');
    if (contentElement) {
        const contentObserver = new MutationObserver(() => {
            // Short delay to ensure DOM is fully updated
            setTimeout(initLightbox, 100);
        });
        contentObserver.observe(contentElement, { childList: true, subtree: true });
    }

    // Run once on initial page load
    initLightbox();
});

function initLightbox() {
    // Create lightbox elements if they don't exist
    if (!document.getElementById('lightbox-container')) {
        createLightboxElements();
    }

    // Get all gallery images and add click events
    setupGalleryImages();
}

function setupGalleryImages() {
    // Find all gallery images
    const galleryLinks = document.querySelectorAll('.image-gallery figure a');

    // Store all images for navigation
    const galleryImages = Array.from(galleryLinks).map(link => ({
        src: link.getAttribute('href'),
        caption: link.querySelector('figcaption')?.textContent || ''
    }));

    // Add click event to all gallery images
    galleryLinks.forEach((link, index) => {
        // Check if this gallery should have lightbox disabled
        const gallery = link.closest('.image-gallery');
        const lightboxDisabled = gallery && gallery.classList.contains('no-lightbox');

        if (lightboxDisabled) {
            // For galleries with lightbox disabled, preserve the link's default behavior
            // This allows the link to navigate as configured in the href or onclick

            // Make sure we keep any existing onclick handlers
            if (!link.hasAttribute('data-has-custom-click')) {
                const originalOnClick = link.onclick;
                link.setAttribute('data-has-custom-click', 'true');

                // Only preserve the original onclick if it exists
                if (originalOnClick) {
                    // No further modification needed for links in no-lightbox galleries
                    // The original onclick handler will work as intended
                } else {
                    // If no onclick exists, make sure the link works normally
                    link.onclick = null;
                }
            }
        } else {
            // For regular galleries with lightbox enabled

            // Remove existing target="_blank" attribute
            link.removeAttribute('target');

            // Create new click handler for lightbox
            link.onclick = function(e) {
                e.preventDefault();
                openLightbox(index, galleryImages);
                return false;
            };
        }
    });
}

function openLightbox(index, images) {
    const lightboxContainer = document.getElementById('lightbox-container');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxImageContainer = document.getElementById('lightbox-image-container');

    // Set current image index
    let currentIndex = index;

    // Update the image and caption
    function updateLightboxContent() {
        // Set image and caption
        lightboxImage.src = images[currentIndex].src;
        lightboxCaption.textContent = images[currentIndex].caption;
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;

        // Update navigation buttons
        lightboxPrev.classList.toggle('disabled', currentIndex === 0);
        lightboxNext.classList.toggle('disabled', currentIndex === images.length - 1);
    }

    // Set initial content
    updateLightboxContent();

    // Show lightbox
    lightboxContainer.style.display = 'flex';
    setTimeout(() => {
        lightboxContainer.classList.add('active');
    }, 10);

    // Disable page scrolling
    document.body.classList.add('lightbox-open');

    // Navigation functions
    function prevImage() {
        if (currentIndex > 0) {
            currentIndex--;
            updateLightboxContent();
        }
    }

    function nextImage() {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateLightboxContent();
        }
    }

    // Close function
    function closeLightbox() {
        lightboxContainer.classList.remove('active');
        setTimeout(() => {
            lightboxContainer.style.display = 'none';
        }, 300); // Match transition time

        // Re-enable page scrolling
        document.body.classList.remove('lightbox-open');

        // Remove event listeners
        document.removeEventListener('keydown', handleKeyboard);
        lightboxContainer.removeEventListener('click', handleOutsideClick);
        lightboxPrev.removeEventListener('click', prevImage);
        lightboxNext.removeEventListener('click', nextImage);
    }

    // Handle keyboard navigation
    function handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'Escape':
                closeLightbox();
                break;
            case 'a':
                prevImage();
                break
            case 'd':
                nextImage();
                break
        }
    }

    // Handle clicks outside the image
    function handleOutsideClick(e) {
        if (e.target === lightboxContainer) {
            closeLightbox();
        }
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyboard);
    lightboxContainer.addEventListener('click', handleOutsideClick);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightboxContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;

        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left -> next image
            nextImage();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right -> previous image
            prevImage();
        }
    });
}

function createLightboxElements() {
    const lightboxHTML = `
        <div id="lightbox-container" class="lightbox-container">
            <div class="lightbox-content">
                <div class="lightbox-header">
                    <div id="lightbox-counter" class="lightbox-counter"></div>
                    <div id="lightbox-caption" class="lightbox-caption"></div>
                    <button id="lightbox-close" class="lightbox-close" aria-label="Close lightbox">×</button>
                </div>
                <div id="lightbox-image-container" class="lightbox-image-container">
                    <img id="lightbox-image" class="lightbox-image" src="" alt="Enlarged view">
                </div>
                <div class="lightbox-controls">
                    <button id="lightbox-prev" class="lightbox-nav" aria-label="Previous image">❮</button>
                    <button id="lightbox-next" class="lightbox-nav" aria-label="Next image">❯</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
}