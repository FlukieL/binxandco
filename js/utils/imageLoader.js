/**
 * Image loading and lazy loading utility
 * Handles IntersectionObserver-based lazy loading for images
 */

let imageObserverInstance = null;
let lastRootMargin = null;

/**
 * Setup image loading with IntersectionObserver
 * Uses a single observer instance to avoid duplicates
 */
export function setupImageLoading() {
    // Use a larger rootMargin on mobile to ensure images load earlier
    const isMobile = window.innerWidth <= 768;
    const rootMargin = isMobile ? '200px' : '50px';
    
    // Create or recreate observer with current rootMargin
    // Recreate if rootMargin changed (e.g., mobile/desktop switch)
    if (!imageObserverInstance || lastRootMargin !== rootMargin) {
        // Disconnect old observer if it exists
        if (imageObserverInstance) {
            imageObserverInstance.disconnect();
        }
        
        lastRootMargin = rootMargin;
        imageObserverInstance = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const dataSrc = img.dataset.src;
                    if (dataSrc && dataSrc !== 'undefined' && dataSrc.trim() !== '') {
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            img.src = dataSrc;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                        };
                        tempImg.onerror = () => {
                            img.classList.add('loaded');
                            img.alt = 'Image failed to load';
                        };
                        tempImg.src = dataSrc;
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: rootMargin });
    }

    // Find all images with data-src that aren't already loaded
    const imagesToLoad = document.querySelectorAll('img[data-src]');
    imagesToLoad.forEach(img => {
        // Skip if already loaded or doesn't have data-src
        if (img.classList.contains('loaded') || !img.dataset.src || img.src) {
            return;
        }
        
        // Check if image is already in viewport - load immediately if visible
        const rect = img.getBoundingClientRect();
        const viewportMargin = isMobile ? 500 : 300; // More generous margin
        const isInViewport = rect.top < window.innerHeight + viewportMargin && 
                            rect.bottom > -viewportMargin && 
                            rect.left < window.innerWidth + viewportMargin && 
                            rect.right > -viewportMargin;
        
        // Also check if image is in brands & restaurants section (load more aggressively)
        const isInBrandsSection = img.closest('#brands-restaurants-content') !== null;
        
        if (isInViewport || isInBrandsSection) {
            // Load immediately if in viewport or in brands section
            const dataSrc = img.dataset.src;
            if (dataSrc && dataSrc !== 'undefined' && dataSrc.trim() !== '') {
                const tempImg = new Image();
                tempImg.onload = () => {
                    img.src = dataSrc;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                };
                tempImg.onerror = () => {
                    img.classList.add('loaded');
                    img.alt = 'Image failed to load';
                };
                tempImg.src = dataSrc;
            }
        } else {
            // Use IntersectionObserver for lazy loading
            // Remove data-observed to allow re-observation if needed
            img.removeAttribute('data-observed');
            imageObserverInstance.observe(img);
        }
    });
}

