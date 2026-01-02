/**
 * Client renderer
 * Handles rendering client items into marquee containers
 */

import { setupImageLoading } from '../utils/imageLoader.js';

/**
 * Function to shuffle array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Function to create client item HTML
 * @param {Object} client - Client data object
 * @returns {string} HTML string for client item
 */
function createClientItemHTML(client) {
    const linkText = client.linkType === 'Instagram' ? 'Visit Instagram' : 'Visit Website';
    // Use data-src for lazy loading below the fold
    const isAboveFold = false; // Client items are below the fold
    // Ensure image path exists
    const imagePath = client.image || '';
    return `
        <a href="${client.website}" class="client-item" target="_blank" rel="noopener" data-description="${client.description || ''}">
            <img ${isAboveFold ? `src="${imagePath}"` : `data-src="${imagePath}"`} alt="${client.name}" loading="lazy">
            <span>${client.name}</span>
            <div class="client-details">
                <h4>${client.name}</h4>
                <span class="visit-link">${linkText}</span>
            </div>
        </a>
    `;
}

/**
 * Render clients in exactly 2 rows with horizontal scrolling
 * @param {HTMLElement} container - Container element
 * @param {Array} clients - Array of client objects
 * @param {number} itemsPerRow - Number of items per row
 * @param {boolean} isTalent - Whether this is the talent section
 */
export function renderClients(container, clients, itemsPerRow, isTalent = false) {
    const shuffled = shuffleArray(clients);
    let html = '';
    
    // Get the parent marquee-container for data attributes
    const marqueeContainer = container.closest('.marquee-container');
    
    // Detect mobile viewport
    const isMobile = window.innerWidth <= 768;
    
    // Calculate dimensions
    const itemWidth = isMobile ? 200 : 250;
    const gap = 30;
    const itemHeight = 300;
    const rowGap = 30;
    
    // On mobile, use single row horizontal scroll instead of 2 rows
    if (isMobile) {
        // Create all items in a single horizontal row
        shuffled.forEach(client => {
            html += createClientItemHTML(client);
        });
        
        // Set container for single row horizontal scroll
        const totalWidth = (shuffled.length * itemWidth) + ((shuffled.length - 1) * gap);
        container.style.width = `${totalWidth}px`;
        container.style.height = `${itemHeight}px`;
        container.style.flexWrap = 'nowrap';
        container.style.display = 'flex';
        container.style.overflow = 'visible';
        container.style.flexDirection = 'row';
        container.style.flexBasis = 'auto';
    } else {
        // Desktop: Calculate how items will be distributed across exactly 2 rows
        const totalItems = shuffled.length;
        const itemsInFirstRow = Math.ceil(totalItems / 2);
        const itemsInSecondRow = totalItems - itemsInFirstRow;
        const maxItemsPerRow = Math.max(itemsInFirstRow, itemsInSecondRow);
        
        // Calculate width to fit max items per row - this ensures exactly 2 rows
        // Add some extra width to ensure all items fit comfortably
        const totalWidth = (maxItemsPerRow * itemWidth) + ((maxItemsPerRow - 1) * gap) + 50;
        
        // Calculate height for exactly 2 rows
        const totalHeight = (2 * itemHeight) + rowGap;
        
        // Create all items (they will wrap into exactly 2 rows due to width constraint)
        shuffled.forEach(client => {
            html += createClientItemHTML(client);
        });
        
        // Set container dimensions first to force wrapping
        container.style.width = `${totalWidth}px`;
        container.style.height = `${totalHeight}px`;
        container.style.flexWrap = 'wrap';
        container.style.display = 'flex';
        container.style.overflow = 'visible';
        container.style.flexDirection = 'row';
        container.style.flexBasis = 'auto';
    }
    
    // Render initial content
    container.innerHTML = html;
    
    // Setup lazy loading for client images
    setupImageLoading();
    
    // Force a reflow to measure the actual rendered content width
    const originalContentWidth = container.scrollWidth || container.offsetWidth;
    
    // For talent section: only duplicate and animate if content doesn't fit on screen
    if (isTalent && marqueeContainer) {
        const viewportWidth = window.innerWidth;
        const containerPadding = 40; // Account for container padding
        const availableWidth = viewportWidth - containerPadding;
        
        // If content fits on screen, don't duplicate and disable animation
        if (originalContentWidth <= availableWidth) {
            marqueeContainer.dataset.needsScroll = 'false';
            container.style.animation = 'none';
            container.style.transform = 'translateX(0)';
            // Remove fixed width to allow proper centering
            container.style.width = 'auto';
            container.style.maxWidth = '100%';
            // Center the content when it fits on screen
            container.style.justifyContent = 'center';
            return; // Exit early - no duplication needed
        }
    }
    
    // Duplicate content for seamless infinite scroll (only if needed)
    // We need at least 2 copies for the -50% animation to work seamlessly
    // Using 4 copies for extra smoothness - this ensures seamless looping
    const content = container.innerHTML;
    container.innerHTML = content + content + content + content;
    
    // Store the original content width on the container for animation calculations
    container.dataset.originalWidth = originalContentWidth;
    if (marqueeContainer) {
        marqueeContainer.dataset.needsScroll = 'true';
    }
    
    // Force a reflow after duplication to ensure dimensions are correct
    container.offsetWidth;
    
    // Setup lazy loading for duplicated images
    setupImageLoading();
}

