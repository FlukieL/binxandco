/**
 * Client service
 * Handles loading and rendering client data
 */

import { setupImageLoading } from '../utils/imageLoader.js';
import { renderClients } from './clientRenderer.js';

/**
 * Load and render clients from JSON
 * @param {IntersectionObserver} observer - Observer for scroll animations
 */
export async function loadAndRenderClients(observer) {
    try {
        const response = await fetch('clients.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const brandsContainer = document.getElementById('brands-restaurants-content');
        const talentContainer = document.getElementById('talent-content');
        
        if (!brandsContainer || !talentContainer) {
            console.error('Client containers not found');
            return;
        }
        
        // Calculate items per row for exactly 2 rows
        const brandsItemsPerRow = getItemsPerRow(data.brandsAndRestaurants.length);
        const talentItemsPerRow = getItemsPerRow(data.talent.length);
        
        // Render brands & restaurants
        renderClients(brandsContainer, data.brandsAndRestaurants, brandsItemsPerRow, false);
        
        // Render talent (pass true to check if scrolling is needed)
        renderClients(talentContainer, data.talent, talentItemsPerRow, true);
        
        // Fix talent section initial position - ensure it's visible immediately
        // Only if it needs scrolling
        setTimeout(() => {
            const talentMarqueeContainer = talentContainer.closest('.marquee-container');
            if (talentMarqueeContainer && talentMarqueeContainer.dataset.needsScroll === 'true') {
                // The reverse animation should start at -50% (translateX(-50%))
                // which shows the first copy of content. The animation-fill-mode: both
                // ensures this initial state is applied immediately
                talentContainer.offsetHeight; // Force reflow to apply animation
            }
        }, 150);
        
        // Ensure all images are set up for loading (including brands & restaurants)
        // Call multiple times to catch images at different stages
        setupImageLoading();
        setTimeout(() => {
            setupImageLoading();
        }, 100);
        setTimeout(() => {
            setupImageLoading();
        }, 300);
        
        // Observe client items for scroll animations
        if (observer) {
            setTimeout(() => {
                document.querySelectorAll('.client-item').forEach((item, index) => {
                    // Add stagger delay
                    item.style.transitionDelay = `${(index % 10) * 0.05}s`;
                    observer.observe(item);
                });
            }, 200);
        }
        
        return { brandsContainer, talentContainer };
    } catch (error) {
        console.error('Error loading clients data:', error);
        // Show user-friendly error message
        const brandsContainer = document.getElementById('brands-restaurants-content');
        const talentContainer = document.getElementById('talent-content');
        if (brandsContainer) {
            brandsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Unable to load client data. Please refresh the page.</p>';
        }
        if (talentContainer) {
            talentContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Unable to load client data. Please refresh the page.</p>';
        }
    }
}

/**
 * Calculate items per row for exactly 2 rows
 * @param {number} totalItems - Total number of items
 * @returns {number} Items per row
 */
function getItemsPerRow(totalItems) {
    // Always use 2 rows, so divide total items by 2
    const itemsPerRow = Math.ceil(totalItems / 2);
    return itemsPerRow;
}

