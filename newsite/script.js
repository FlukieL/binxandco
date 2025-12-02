document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const spans = menuToggle.querySelectorAll('span');
            
            // Simple hamburger animation
            if (mainNav.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    // Reset hamburger
                    const spans = menuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }

                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Create overlay for expanded items
    const overlay = document.createElement('div');
    overlay.className = 'client-overlay';
    document.body.appendChild(overlay);

    let expandedItem = null;
    let hoverTimeout = null;
    const hoverDelay = 5000; // 5 seconds in milliseconds

    // Function to expand an item
    function expandItem(item) {
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
        
        // Store original href for visit link functionality
        const originalHref = item.getAttribute('href');
        if (originalHref) {
            clone.dataset.originalHref = originalHref;
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

    // Function to collapse an item
    function collapseItem() {
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

    // Function to shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Function to calculate items per row for exactly 2 rows
    function getItemsPerRow(totalItems) {
        // Always use 2 rows, so divide total items by 2
        const itemsPerRow = Math.ceil(totalItems / 2);
        return itemsPerRow;
    }

    // Function to create client item HTML
    function createClientItemHTML(client) {
        const linkText = client.linkType === 'Instagram' ? 'Visit Instagram' : 'Visit Website';
        return `
            <a href="${client.website}" class="client-item" target="_blank" rel="noopener" data-description="${client.description || ''}">
                <img src="${client.image}" alt="${client.name}">
                <span>${client.name}</span>
                <div class="client-details">
                    <h4>${client.name}</h4>
                    <span class="visit-link">${linkText}</span>
                </div>
            </a>
        `;
    }

    // Function to render clients in exactly 2 rows with horizontal scrolling
    function renderClients(container, clients, itemsPerRow, isTalent = false) {
        const shuffled = shuffleArray(clients);
        let html = '';
        
        // Get the parent marquee-container for data attributes
        const marqueeContainer = container.closest('.marquee-container');
        
        // Calculate dimensions
        const itemWidth = 250;
        const gap = 30;
        const itemHeight = 300;
        const rowGap = 30;
        
        // Calculate how items will be distributed across exactly 2 rows
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
        
        // Render initial content
        container.innerHTML = html;
        
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
    }

    // Add drag functionality to marquee containers
    function setupMarqueeDrag() {
        const containers = document.querySelectorAll('.marquee-container');
        
        containers.forEach(container => {
            // Skip if this container doesn't need scrolling (e.g., talent that fits on screen)
            if (container.dataset.needsScroll === 'false') {
                return;
            }
            
            let isDown = false;
            let startX;
            let startTransform = 0;
            let animationWasRunning = false;
            let currentTransform = 0;
            let rafId = null;
            
            const content = container.querySelector('.marquee-content');
            if (!content) return;
            
            // Get current transform value from computed style
            const getCurrentTransform = () => {
                // Check inline style first
                if (content.style.transform) {
                    const match = content.style.transform.match(/translateX\(([^)]+)\)/);
                    if (match) {
                        return parseFloat(match[1]) || 0;
                    }
                }
                // Fall back to computed style
                const transform = window.getComputedStyle(content).transform;
                if (transform && transform !== 'none') {
                    const matrix = transform.match(/matrix\(([^)]+)\)/);
                    if (matrix) {
                        return parseFloat(matrix[1].split(',')[4]) || 0;
                    }
                }
                return 0;
            };
            
            container.addEventListener('mousedown', (e) => {
                // Don't interfere with client item clicks
                if (e.target.closest('.client-item')) return;
                
                e.preventDefault();
                isDown = true;
                container.style.cursor = 'grabbing';
                startX = e.pageX || e.clientX;
                
                // Get current transform before pausing
                startTransform = getCurrentTransform();
                currentTransform = startTransform;
                
                // Pause animation while dragging
                animationWasRunning = content.style.animationPlayState !== 'paused';
                if (animationWasRunning) {
                    content.style.animationPlayState = 'paused';
                }
            });
            
            const handleMouseMove = (e) => {
                if (!isDown) return;
                e.preventDefault();
                
                const x = e.pageX || e.clientX;
                const walk = (x - startX) * 2; // Scroll speed multiplier
                currentTransform = startTransform + walk;
                
                // Cancel any pending animation frame
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                
                // Apply drag transform smoothly
                rafId = requestAnimationFrame(() => {
                    content.style.transform = `translateX(${currentTransform}px)`;
                });
            };
            
            const handleMouseUp = () => {
                if (isDown) {
                    isDown = false;
                    container.style.cursor = 'grab';
                    
                    // Cancel any pending animation frame
                    if (rafId) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                    
                    // Resume animation from current position
                    if (animationWasRunning) {
                        // Calculate the animation progress based on current transform
                        const originalWidth = parseFloat(content.dataset.originalWidth || content.offsetWidth / 4);
                        const totalWidth = content.offsetWidth;
                        const isReverse = container.classList.contains('reverse');
                        
                        // For seamless resume, we need to restart the animation
                        // but adjust it to continue from the current position
                        // This is tricky with CSS animations, so we'll just let it reset
                        // The user can continue dragging if needed
                        content.style.animationPlayState = 'running';
                        // Don't clear transform immediately - let it blend
                        setTimeout(() => {
                            content.style.transform = '';
                        }, 50);
                    } else {
                        // If animation wasn't running, keep the transform
                        // This allows manual scrolling without animation
                    }
                }
            };
            
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseUp);
            container.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    // Load and render clients from JSON
    async function loadAndRenderClients() {
        try {
            const response = await fetch('clients.json');
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
            
            // Setup interactions after rendering
            setupClientItemInteractions();
            
            // Setup drag functionality
            setTimeout(() => {
                setupMarqueeDrag();
            }, 100);
            
        } catch (error) {
            console.error('Error loading clients data:', error);
        }
    }

    // Load clients data
    loadAndRenderClients();
    
    // Recalculate on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            loadAndRenderClients();
        }, 250);
    });

    // Setup interactions after marquee duplication (this will include all duplicated items)
    function setupClientItemInteractions() {
        const clientItems = document.querySelectorAll('.client-item');
        const hoverTimers = new WeakMap(); // Track timers per item
        
        clientItems.forEach(item => {
            // Skip if already has listeners (prevent duplicate listeners)
            if (item.dataset.listenersAttached) return;
            item.dataset.listenersAttached = 'true';
            
            // Mouse enter - start 5 second timer before expanding
            item.addEventListener('mouseenter', () => {
                if (expandedItem && expandedItem !== item) {
                    return; // Don't expand if another item is already expanded
                }
                
                // Clear any existing timeout for this item
                const existingTimer = hoverTimers.get(item);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                }
                
                // Set timeout for 5 seconds
                const timer = setTimeout(() => {
                    expandItem(item);
                }, hoverDelay);
                hoverTimers.set(item, timer);
            });

            // Mouse leave - cancel expansion timer
            item.addEventListener('mouseleave', () => {
                const timer = hoverTimers.get(item);
                if (timer) {
                    clearTimeout(timer);
                    hoverTimers.delete(item);
                }
            });

            // Click or tap to immediately expand
            item.addEventListener('click', (e) => {
                // If item is already expanded (shouldn't happen with original, but handle clone)
                if (item.classList.contains('expanded') || item.classList.contains('client-item-expanded-clone')) {
                    const visitLink = e.target.closest('.visit-link');
                    if (visitLink) {
                        // Find the original item to get the href
                        const originalItem = document.querySelector(`.client-item[href="${item.dataset.originalHref || ''}"]`) || 
                                           Array.from(document.querySelectorAll('.client-item')).find(i => 
                                               i.querySelector('img')?.src === item.querySelector('img')?.src
                                           );
                        if (originalItem) {
                            const href = originalItem.getAttribute('href');
                            if (href) {
                                window.open(href, originalItem.getAttribute('target') || '_self');
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
                
                // Clear hover timeout for this item
                const timer = hoverTimers.get(item);
                if (timer) {
                    clearTimeout(timer);
                    hoverTimers.delete(item);
                }
                
                // Expand the item
                expandItem(item);
            });
            
            // Also handle clicks on the cloned expanded item
            document.addEventListener('click', (e) => {
                const clone = e.target.closest('.client-item-expanded-clone');
                if (!clone) return;
                
                const visitLink = e.target.closest('.visit-link');
                if (visitLink) {
                    // Find original item by matching content
                    const cloneImg = clone.querySelector('img')?.src;
                    const originalItem = Array.from(document.querySelectorAll('.client-item')).find(i => {
                        const img = i.querySelector('img');
                        return img && img.src === cloneImg && !i.classList.contains('client-item-expanded-clone');
                    });
                    
                    if (originalItem) {
                        const href = originalItem.getAttribute('href');
                        if (href) {
                            window.open(href, originalItem.getAttribute('target') || '_self');
                        }
                    }
                    return;
                }
                
                // If clicking outside details area, collapse
                if (!e.target.closest('.client-details')) {
                    collapseItem();
                }
            }, true);
        });
    }

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
});
