/**
 * Client items component
 * Handles expansion/collapse of client items
 */

let expandedItem = null;
let overlay = null;

/**
 * Initialize client items component
 * Creates overlay and sets up event listeners
 */
export function initClientItems() {
    // Create overlay for expanded items
    overlay = document.createElement('div');
    overlay.className = 'client-overlay';
    document.body.appendChild(overlay);

    // Click overlay to close expanded item
    overlay.addEventListener('click', () => {
        collapseItem();
    });

    // Escape key to close expanded item
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && expandedItem) {
            collapseItem();
        }
    });
}

/**
 * Expand a client item
 * @param {HTMLElement} item - The client item to expand
 */
export function expandItem(item) {
    if (expandedItem && expandedItem !== item) {
        return; // Don't expand if another item is already expanded
    }
    
    // Remove expansion from all items
    document.querySelectorAll('.client-item').forEach(i => {
        i.classList.remove('expanded');
        i.style.pointerEvents = '';
    });
    
    // Remove any existing expanded clone
    const existingClone = document.querySelector('.client-item-expanded-clone');
    if (existingClone) {
        existingClone.remove();
    }
    
    // Clone the item for expansion (so original stays in place)
    const clone = item.cloneNode(true);
    clone.classList.add('expanded');
    clone.classList.add('client-item-expanded-clone');
    clone.style.pointerEvents = 'auto';
    clone.style.cursor = 'default';
    
    // Store original href and target for visit link functionality
    const originalHref = item.getAttribute('href');
    const originalTarget = item.getAttribute('target') || '_blank';
    if (originalHref) {
        clone.dataset.originalHref = originalHref;
        clone.dataset.originalTarget = originalTarget;
    }
    
    // Remove duplicated text - hide the span (name) since it's also in h4
    const nameSpan = clone.querySelector('span:not(.visit-link)');
    if (nameSpan) {
        nameSpan.style.display = 'none';
    }
    
    // Get description from data attribute
    const description = item.dataset.description || '';
    
    // Add description to the clone if it exists
    if (description) {
        const detailsDiv = clone.querySelector('.client-details');
        if (detailsDiv) {
            const descP = document.createElement('p');
            descP.className = 'client-description';
            descP.textContent = description;
            // Insert description after h4 but before visit link
            const h4 = detailsDiv.querySelector('h4');
            if (h4 && h4.nextSibling) {
                detailsDiv.insertBefore(descP, h4.nextSibling);
            } else {
                detailsDiv.appendChild(descP);
            }
        }
    }
    
    // Remove the href to prevent navigation when clicking the clone itself
    clone.removeAttribute('href');
    
    // Get the original item's position for smooth animation
    const rect = item.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    // Add clone to body with initial position and scale
    clone.style.position = 'fixed';
    clone.style.left = `${startX}px`;
    clone.style.top = `${startY}px`;
    clone.style.transform = 'translate(-50%, -50%) scale(0.3)';
    clone.style.opacity = '0';
    document.body.appendChild(clone);
    
    // Show overlay with animation
    overlay.classList.add('active');
    expandedItem = clone;
    
    // Force a reflow to ensure the clone is rendered
    clone.offsetHeight;
    
    // Animate to final position with smooth transition
    // Use double requestAnimationFrame to ensure initial state is applied
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            clone.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            clone.style.left = '50%';
            clone.style.top = '50%';
            clone.style.transform = 'translate(-50%, -50%) scale(1)';
            clone.style.opacity = '1';
        });
    });
}

/**
 * Collapse the currently expanded item
 */
export function collapseItem() {
    if (expandedItem) {
        // If it's a clone, animate out before removing
        if (expandedItem.classList.contains('client-item-expanded-clone')) {
            // Animate out
            expandedItem.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            expandedItem.style.opacity = '0';
            expandedItem.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            // Hide overlay
            overlay.classList.remove('active');
            
            // Remove after animation
            setTimeout(() => {
                if (expandedItem && expandedItem.parentNode) {
                    expandedItem.remove();
                }
                expandedItem = null;
            }, 300);
        } else {
            expandedItem.classList.remove('expanded');
            expandedItem.style.pointerEvents = '';
            overlay.classList.remove('active');
            expandedItem = null;
        }
    }
}

/**
 * Setup client item click interactions
 */
export function setupClientItemInteractions() {
    const clientItems = document.querySelectorAll('.client-item');
    
    clientItems.forEach(item => {
        // Skip if already has listeners (prevent duplicate listeners)
        if (item.dataset.listenersAttached) return;
        item.dataset.listenersAttached = 'true';

        // Click or tap to immediately expand
        item.addEventListener('click', (e) => {
            // Check if this was a drag (not a click)
            // If pointer events were disabled, it means we dragged
            if (item.style.pointerEvents === 'none') {
                // Reset and ignore this click
                item.style.pointerEvents = '';
                return;
            }
            
            // Check if mouse moved significantly (drag threshold)
            const marqueeContainer = item.closest('.marquee-container');
            if (marqueeContainer && marqueeContainer.dataset.wasDragging === 'true') {
                marqueeContainer.dataset.wasDragging = 'false';
                return; // Ignore click if we were dragging
            }
            
            // If item is already expanded (shouldn't happen with original, but handle clone)
            if (item.classList.contains('expanded') || item.classList.contains('client-item-expanded-clone')) {
                const visitLink = e.target.closest('.visit-link');
                if (visitLink) {
                    // Use stored href and target from dataset
                    const href = item.dataset.originalHref;
                    const target = item.dataset.originalTarget || '_blank';
                    if (href) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(href, target);
                        return;
                    }
                    // Fallback: try to find original item
                    const originalItem = Array.from(document.querySelectorAll('.client-item')).find(i => {
                        const img = i.querySelector('img');
                        const cloneImg = item.querySelector('img');
                        return img && cloneImg && img.src === cloneImg.src && !i.classList.contains('client-item-expanded-clone');
                    });
                    if (originalItem) {
                        const fallbackHref = originalItem.getAttribute('href');
                        const fallbackTarget = originalItem.getAttribute('target') || '_blank';
                        if (fallbackHref) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(fallbackHref, fallbackTarget);
                        }
                    }
                    return;
                }
                // If clicking elsewhere on expanded item (but not on details), collapse it
                if (!e.target.closest('.client-details')) {
                    e.preventDefault();
                    e.stopPropagation();
                    collapseItem();
                }
                return;
            }
            
            // If not expanded, prevent navigation and expand instead
            e.preventDefault();
            e.stopPropagation();
            
            // Expand the item
            expandItem(item);
        });
    });
    
    // Also handle clicks on the cloned expanded item (only attach once, outside the loop)
    // Use a flag to ensure this listener is only attached once
    if (!window.cloneClickListenerAttached) {
        window.cloneClickListenerAttached = true;
        document.addEventListener('click', (e) => {
            const clone = e.target.closest('.client-item-expanded-clone');
            if (!clone) return;
            
            const visitLink = e.target.closest('.visit-link');
            if (visitLink) {
                // Use stored href and target from dataset
                const href = clone.dataset.originalHref;
                const target = clone.dataset.originalTarget || '_blank';
                if (href) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(href, target);
                    return;
                }
                // Fallback: find original item by matching content
                const cloneImg = clone.querySelector('img')?.src;
                const originalItem = Array.from(document.querySelectorAll('.client-item')).find(i => {
                    const img = i.querySelector('img');
                    return img && img.src === cloneImg && !i.classList.contains('client-item-expanded-clone');
                });
                
                if (originalItem) {
                    const fallbackHref = originalItem.getAttribute('href');
                    const fallbackTarget = originalItem.getAttribute('target') || '_blank';
                    if (fallbackHref) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(fallbackHref, fallbackTarget);
                    }
                }
                return;
            }
            
            // If clicking outside details area, collapse
            if (!e.target.closest('.client-details')) {
                collapseItem();
            }
        }, true);
    }
}

