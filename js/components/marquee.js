/**
 * Marquee component
 * Handles seamless scrolling marquees with drag and momentum
 */

/**
 * Setup drag functionality for marquee containers
 */
export function setupMarqueeDrag() {
    const containers = document.querySelectorAll('.marquee-container');
    
    containers.forEach(container => {
        // Skip if this container doesn't need scrolling (e.g., talent that fits on screen)
        if (container.dataset.needsScroll === 'false') {
            return;
        }
        
        const content = container.querySelector('.marquee-content');
        if (!content) return;
        
        const isBrandsRestaurants = container.classList.contains('brands-restaurants');
        const isReverse = container.classList.contains('reverse');
        
        // For brands-restaurants, use seamless JavaScript-based scrolling
        if (isBrandsRestaurants) {
            setupSeamlessMarquee(container, content, false);
        } else if (isReverse) {
            // For talent section (reverse), use seamless marquee with reverse direction
            setupSeamlessMarquee(container, content, true);
        } else {
            // For other marquees, use the original drag approach
            setupOriginalMarqueeDrag(container, content);
        }
    });
}

/**
 * Seamless marquee with drag and momentum scrolling
 * @param {HTMLElement} container - The marquee container
 * @param {HTMLElement} content - The marquee content element
 * @param {boolean} isReverse - Whether to scroll in reverse direction
 */
function setupSeamlessMarquee(container, content, isReverse) {
    // Clean up existing animation if reinitializing
    if (container.dataset.marqueeInitialized === 'true') {
        const oldFrameId = container.dataset.animationFrameId;
        if (oldFrameId) {
            cancelAnimationFrame(parseInt(oldFrameId));
        }
        // Clear the flag so we can reinitialize
        delete container.dataset.marqueeInitialized;
    }
    
    // Wait for content to be fully rendered
    // Calculate segment width - this is the width of one copy of the content
    let originalWidth = parseFloat(content.dataset.originalWidth);
    if (!originalWidth || originalWidth === 0) {
        // Fallback: measure the actual width and divide by 4 (since we duplicated 4 times)
        // Force a reflow to ensure accurate measurement
        content.offsetWidth;
        const totalWidth = content.scrollWidth || content.offsetWidth;
        originalWidth = totalWidth / 4;
        
        // If still invalid, retry after a short delay
        if (!originalWidth || originalWidth === 0) {
            setTimeout(() => setupSeamlessMarquee(container, content, isReverse), 100);
            return;
        }
    }
    
    const segmentWidth = originalWidth; // Width of one copy of content
    
    // Calculate viewport width and boundaries
    const containerWidth = container.offsetWidth || window.innerWidth;
    
    // Calculate scroll boundaries - prevent scrolling beyond the actual content
    // Max scroll is 0 (start position), min scroll ensures we never show blank space
    // If content is narrower than viewport, don't allow scrolling
    const maxScrollPosition = 0;
    const minScrollPosition = segmentWidth > containerWidth ? -(segmentWidth - containerWidth) : 0;
    
    // For reverse sections, start at the right boundary (minScrollPosition) and scroll left
    // For normal sections, start at the left boundary (maxScrollPosition = 0) and scroll right
    let scrollPosition = isReverse ? minScrollPosition : 0;
    let velocity = 0; // Current velocity for momentum
    let isDragging = false;
    let dragStartX = 0;
    let dragStartPosition = 0;
    let lastX = 0;
    let lastTime = performance.now();
    let animationFrameId = null;
    let autoScrollSpeed = isReverse ? -0.5 : -0.5; // Both scroll left initially (negative)
    let targetAutoScrollSpeed = autoScrollSpeed; // Target speed for smooth transitions
    let isReversed = false; // Track if we've reversed direction
    let isHovered = false;
    let hasMoved = false; // Track if user has actually moved during drag
    let dragThreshold = 5; // Pixels to move before considering it a drag (not a click)
    let clickedItem = null; // Track which item was clicked (if any)
    let clickStartTime = 0; // Track when click started
    
    // Disable CSS animation
    content.style.animation = 'none';
    content.style.transform = `translateX(${scrollPosition}px)`;
    content.style.willChange = 'transform';
    
    // Clamp position to boundaries - prevents scrolling beyond content
    const clampToBoundaries = (pos) => {
        // Clamp to min/max boundaries to prevent blank space
        if (pos > maxScrollPosition) {
            return maxScrollPosition;
        }
        if (pos < minScrollPosition) {
            return minScrollPosition;
        }
        return pos;
    };
    
    // Update transform - applies position with boundary clamping
    const updateTransform = () => {
        // Clamp position to boundaries to prevent blank space
        scrollPosition = clampToBoundaries(scrollPosition);
        content.style.transform = `translateX(${scrollPosition}px)`;
    };
    
    // Animation loop
    const animate = () => {
        const now = performance.now();
        lastTime = now;
        
        if (!isDragging) {
            // Apply momentum if velocity exists
            if (Math.abs(velocity) > 0.05) {
                scrollPosition += velocity;
                velocity *= 0.92; // Friction
                // Clamp momentum to boundaries
                scrollPosition = clampToBoundaries(scrollPosition);
                // Stop momentum if we hit a boundary
                if (scrollPosition === maxScrollPosition || scrollPosition === minScrollPosition) {
                    velocity = 0;
                }
            } else {
                velocity = 0;
                
                // Smooth deceleration when hovering (slower transition)
                if (isHovered) {
                    // Gradually slow down to zero with slower interpolation for smooth deceleration
                    targetAutoScrollSpeed = 0;
                    // Use slower interpolation for more gradual, visible slowdown
                    autoScrollSpeed += (targetAutoScrollSpeed - autoScrollSpeed) * 0.04;
                    // Apply the gradually reducing speed for smooth slowdown before pause
                    scrollPosition += autoScrollSpeed;
                    // Clamp to boundaries during slowdown
                    scrollPosition = clampToBoundaries(scrollPosition);
                } else {
                    // Check if next position would go beyond boundaries
                    const nextPosition = scrollPosition + autoScrollSpeed;
                    const wouldExceedRight = nextPosition < minScrollPosition;
                    const wouldExceedLeft = nextPosition > maxScrollPosition;
                    
                    // Reverse direction if we would exceed a boundary
                    if (wouldExceedRight && autoScrollSpeed < 0) {
                        // Would go past right end (scrolled all the way left) - reverse to go right
                        isReversed = true;
                        autoScrollSpeed = 0.5;
                        targetAutoScrollSpeed = 0.5;
                        scrollPosition = minScrollPosition; // Clamp to boundary
                        // Don't apply movement this frame, start reversing next frame
                    } else if (wouldExceedLeft && autoScrollSpeed > 0) {
                        // Would go past left end (scrolled all the way right) - reverse to go left
                        isReversed = false;
                        autoScrollSpeed = -0.5;
                        targetAutoScrollSpeed = -0.5;
                        scrollPosition = maxScrollPosition; // Clamp to boundary
                        // Don't apply movement this frame, start reversing next frame
                    } else {
                        // Safe to apply speed - maintain current direction
                        // Determine target speed based on reversed state
                        if (isReversed) {
                            // Reversed: scrolling right (positive)
                            targetAutoScrollSpeed = 0.5;
                        } else {
                            // Normal: scrolling left (negative)
                            targetAutoScrollSpeed = -0.5;
                        }
                        // Smoothly interpolate to target speed (only if not at boundary)
                        if (scrollPosition !== minScrollPosition && scrollPosition !== maxScrollPosition) {
                            autoScrollSpeed += (targetAutoScrollSpeed - autoScrollSpeed) * 0.03;
                        }
                        scrollPosition = nextPosition;
                    }
                }
                
                // Final clamp to ensure we never go past boundaries
                scrollPosition = clampToBoundaries(scrollPosition);
            }
        }
        
        // Update transform
        updateTransform();
        animationFrameId = requestAnimationFrame(animate);
        container.dataset.animationFrameId = animationFrameId;
    };
    
    // Start animation loop
    animate();
    
    // Mouse events - allow dragging from anywhere including images/text
    const handleMouseDown = (e) => {
        // Allow dragging from anywhere, but track if it's on a client item
        clickedItem = e.target.closest('.client-item');
        clickStartTime = Date.now();
        
        isDragging = true;
        hasMoved = false;
        container.style.cursor = 'grabbing';
        dragStartX = e.pageX || e.clientX;
        dragStartPosition = scrollPosition;
        lastX = dragStartX;
        lastTime = performance.now();
        velocity = 0;
        
        // Prevent default to allow smooth dragging
        e.preventDefault();
    };
    
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const x = e.pageX || e.clientX;
        const now = performance.now();
        const deltaTime = Math.max(now - lastTime, 1);
        const deltaX = x - lastX;
        const totalDeltaX = x - dragStartX;
        
        // Track if user has actually moved (drag threshold)
        if (Math.abs(totalDeltaX) > dragThreshold) {
            hasMoved = true;
            // Prevent click event if we've dragged
            if (clickedItem) {
                clickedItem.style.pointerEvents = 'none';
            }
        }
        
        // Calculate velocity for momentum (using exponential moving average)
        if (deltaTime > 0 && hasMoved) {
            const instantVelocity = (deltaX / deltaTime) * 16.67;
            velocity = velocity * 0.7 + instantVelocity * 0.3;
        }
        
        // Update scroll position
        const walk = (x - dragStartX) * 1.2;
        scrollPosition = dragStartPosition + walk;
        
        // Clamp position to boundaries during drag - creates barrier effect
        scrollPosition = clampToBoundaries(scrollPosition);
        
        // Update transform immediately during drag
        content.style.transform = `translateX(${scrollPosition}px)`;
        
        lastX = x;
        lastTime = now;
    };
    
    const handleMouseUp = (e) => {
        if (isDragging) {
            // Mark that we were dragging (to prevent click events)
            if (hasMoved) {
                container.dataset.wasDragging = 'true';
                // Clear the flag after a short delay
                setTimeout(() => {
                    container.dataset.wasDragging = 'false';
                }, 100);
            }
            
            isDragging = false;
            container.style.cursor = 'grab';
            
            // Restore pointer events if we disabled them
            if (clickedItem) {
                clickedItem.style.pointerEvents = '';
                clickedItem = null;
            }
            
            // Clamp position to boundaries when drag ends
            scrollPosition = clampToBoundaries(scrollPosition);
            content.style.transform = `translateX(${scrollPosition}px)`;
            
            // If user didn't move much, don't apply momentum
            if (!hasMoved || Math.abs(velocity) < 0.5) {
                velocity = 0;
            }
        }
    };
    
    // Touch events for mobile - allow dragging from anywhere
    let dragStartY = 0;
    let isHorizontalDrag = false;
    
    const handleTouchStart = (e) => {
        clickedItem = e.target.closest('.client-item');
        clickStartTime = Date.now();
        
        const touch = e.touches[0];
        if (!touch) return;
        
        isDragging = true;
        hasMoved = false;
        isHorizontalDrag = false;
        dragStartX = touch.pageX;
        dragStartY = touch.pageY;
        dragStartPosition = scrollPosition;
        lastX = dragStartX;
        lastTime = performance.now();
        velocity = 0;
    };
    
    const handleTouchMove = (e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        if (!touch) return;
        
        const x = touch.pageX;
        const y = touch.pageY;
        const now = performance.now();
        const deltaTime = Math.max(now - lastTime, 1);
        const deltaX = x - lastX;
        const totalDeltaX = x - dragStartX;
        const totalDeltaY = y - dragStartY;
        
        // Determine if this is primarily a horizontal or vertical gesture
        // Only treat as horizontal if horizontal movement is greater than vertical
        if (!isHorizontalDrag && (Math.abs(totalDeltaX) > 10 || Math.abs(totalDeltaY) > 10)) {
            isHorizontalDrag = Math.abs(totalDeltaX) > Math.abs(totalDeltaY);
        }
        
        // Only prevent default and handle horizontal scrolling if it's a horizontal gesture
        if (!isHorizontalDrag) {
            // Allow vertical scrolling - don't prevent default
            return;
        }
        
        // This is a horizontal gesture - prevent default to allow horizontal scrolling
        e.preventDefault();
        
        // Track if user has actually moved
        if (Math.abs(totalDeltaX) > dragThreshold) {
            hasMoved = true;
            // Prevent click event if we've dragged
            if (clickedItem) {
                clickedItem.style.pointerEvents = 'none';
            }
        }
        
        // Calculate velocity for momentum
        if (deltaTime > 0 && hasMoved) {
            const instantVelocity = (deltaX / deltaTime) * 16.67;
            velocity = velocity * 0.7 + instantVelocity * 0.3;
        }
        
        const walk = (x - dragStartX) * 1.2;
        scrollPosition = dragStartPosition + walk;
        
        // Clamp position to boundaries during drag - creates barrier effect
        scrollPosition = clampToBoundaries(scrollPosition);
        
        // Update transform immediately during drag
        content.style.transform = `translateX(${scrollPosition}px)`;
        
        lastX = x;
        lastTime = now;
    };
    
    const handleTouchEnd = (e) => {
        if (isDragging) {
            // Mark that we were dragging (to prevent click events)
            if (hasMoved) {
                container.dataset.wasDragging = 'true';
                // Clear the flag after a short delay
                setTimeout(() => {
                    container.dataset.wasDragging = 'false';
                }, 100);
            }
            
            isDragging = false;
            
            // Restore pointer events if we disabled them
            if (clickedItem) {
                clickedItem.style.pointerEvents = '';
                clickedItem = null;
            }
            
            // Clamp position to boundaries when drag ends
            scrollPosition = clampToBoundaries(scrollPosition);
            content.style.transform = `translateX(${scrollPosition}px)`;
            
            // If user didn't move much, don't apply momentum
            if (!hasMoved || Math.abs(velocity) < 0.5) {
                velocity = 0;
            }
        }
    };
    
    // Hover to pause auto-scroll
    container.addEventListener('mouseenter', () => {
        isHovered = true;
    });
    
    container.addEventListener('mouseleave', () => {
        isHovered = false;
        handleMouseUp();
    });
    
    // Mouse events - attach to content so we can drag from anywhere
    content.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Touch events - attach to content
    content.addEventListener('touchstart', handleTouchStart, { passive: false });
    content.addEventListener('touchmove', handleTouchMove, { passive: false });
    content.addEventListener('touchend', handleTouchEnd);
    content.addEventListener('touchcancel', handleTouchEnd);
    
    // Mark as initialized
    container.dataset.marqueeInitialized = 'true';
}

/**
 * Original drag functionality for non-brands-restaurants marquees
 * @param {HTMLElement} container - The marquee container
 * @param {HTMLElement} content - The marquee content element
 */
function setupOriginalMarqueeDrag(container, content) {
    let isDown = false;
    let startX;
    let startTransform = 0;
    let animationWasRunning = false;
    let currentTransform = 0;
    let rafId = null;
    
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
                content.style.animationPlayState = 'running';
                // Don't clear transform immediately - let it blend
                setTimeout(() => {
                    content.style.transform = '';
                }, 50);
            }
        }
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);
}

