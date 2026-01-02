/**
 * Main entry point
 * Initializes all components and services
 */

import { setupImageLoading } from './utils/imageLoader.js';
import { setupScrollAnimations } from './utils/animations.js';
import { setupParallax, setupHeaderScroll, setupActiveSectionHighlighting, setupScrollToTop, setupUrlHashManagement } from './utils/scrollEffects.js';
import { setupMobileMenu, setupSmoothScroll } from './components/navigation.js';
import { initClientItems, setupClientItemInteractions } from './components/clientItems.js';
import { setupMarqueeDrag } from './components/marquee.js';
import { loadAndRenderClients } from './services/clientService.js';

document.addEventListener('DOMContentLoaded', () => {
    // Setup scroll-triggered animations
    const observer = setupScrollAnimations();
    
    // Setup scroll effects
    setupParallax();
    setupHeaderScroll();
    setupActiveSectionHighlighting();
    setupScrollToTop();
    setupUrlHashManagement();
    
    // Setup image loading
    setupImageLoading();
    
    // Setup navigation
    setupMobileMenu();
    setupSmoothScroll();
    
    // Initialize client items component
    initClientItems();
    
    // Setup mobile touch interactions (currently minimal, handled by marquee)
    setupMobileTouchInteractions();
    
    // Load and render clients
    loadAndRenderClients(observer).then((result) => {
        if (result) {
            // Setup interactions after rendering
            setupClientItemInteractions();
            
            // Setup drag functionality
            setTimeout(() => {
                setupMarqueeDrag();
            }, 100);
        }
    });
    
    // Recalculate on window resize - only if size change is significant
    let resizeTimeout;
    let lastWindowWidth = window.innerWidth;
    let lastWindowHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;
            // Only reload if crossing mobile/desktop breakpoint (768px) or significant size change
            const crossedBreakpoint = (lastWindowWidth <= 768 && currentWidth > 768) || 
                                     (lastWindowWidth > 768 && currentWidth <= 768);
            const significantChange = Math.abs(currentWidth - lastWindowWidth) > 100 || 
                                    Math.abs(currentHeight - lastWindowHeight) > 100;
            
            if (crossedBreakpoint || significantChange) {
                lastWindowWidth = currentWidth;
                lastWindowHeight = currentHeight;
                // Reload clients and reinitialize
                loadAndRenderClients(observer).then((result) => {
                    if (result) {
                        setupClientItemInteractions();
                        setTimeout(() => {
                            setupMarqueeDrag();
                        }, 100);
                    }
                });
            }
        }, 250);
    });
});

/**
 * Enhanced mobile touch interactions
 * Currently minimal as most touch handling is done by marquee component
 */
function setupMobileTouchInteractions() {
    if (window.innerWidth > 768) return; // Desktop only
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;

        // Horizontal swipe (for marquee navigation)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            // Swipe handled by marquee drag functionality
        }
    }
}

