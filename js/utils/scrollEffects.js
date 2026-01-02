/**
 * Scroll effects utility
 * Handles parallax, header scroll effects, scroll-to-top button, and active section highlighting
 */

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Setup parallax effect for hero background
 */
export function setupParallax() {
    let lastScrollY = window.scrollY;
    const heroBackground = document.querySelector('.hero-background');
    
    function updateParallax() {
        if (prefersReducedMotion || !heroBackground) return;
        
        const scrollY = window.scrollY;
        const hero = document.querySelector('.hero');
        if (hero && scrollY < hero.offsetHeight) {
            const parallaxSpeed = 0.5;
            const yPos = -(scrollY * parallaxSpeed);
            heroBackground.style.transform = `translateY(${yPos}px)`;
        }
        lastScrollY = scrollY;
        requestAnimationFrame(updateParallax);
    }
    
    if (!prefersReducedMotion) {
        window.addEventListener('scroll', updateParallax, { passive: true });
        updateParallax();
    }
}

/**
 * Setup header scroll-based styling
 */
export function setupHeaderScroll() {
    const header = document.getElementById('header');
    function updateHeader() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
}

/**
 * Setup active section highlighting in navigation and URL hash updates
 */
export function setupActiveSectionHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    let isUpdatingHash = false;
    let currentHash = '';
    
    function updateActiveSection() {
        const scrollY = window.scrollY + 100;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollBottom = window.scrollY + windowHeight;
        let activeSection = null;
        
        // Check if we're at the bottom of the page - set to contact
        if (scrollBottom >= documentHeight - 50) {
            activeSection = 'contact';
        }
        // Check if we're at the top (home section) - don't set hash for home
        else if (window.scrollY < 200) {
            activeSection = 'home';
            // Remove hash if we're at home section
            if (!isUpdatingHash && window.location.hash) {
                isUpdatingHash = true;
                currentHash = '';
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
                setTimeout(() => {
                    isUpdatingHash = false;
                }, 100);
            }
        } else {
            // Find which section we're in
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    activeSection = sectionId;
                }
            });
        }
        
        if (activeSection) {
            // Update navigation highlighting
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${activeSection}`) {
                    link.classList.add('active');
                }
            });
            
            // Update URL hash if section changed and we're not already updating (skip home)
            if (activeSection !== 'home' && !isUpdatingHash && currentHash !== activeSection) {
                const newHash = `#${activeSection}`;
                if (window.location.hash !== newHash) {
                    isUpdatingHash = true;
                    currentHash = activeSection;
                    // Use replaceState to avoid adding to history on scroll
                    window.history.replaceState(null, '', newHash);
                    // Reset flag after a short delay
                    setTimeout(() => {
                        isUpdatingHash = false;
                    }, 100);
                }
            }
        }
    }
    
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();
}

/**
 * Setup scroll-to-top button
 */
export function setupScrollToTop() {
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    function toggleScrollToTop() {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
    
    if (scrollToTopBtn) {
        window.addEventListener('scroll', toggleScrollToTop, { passive: true });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Remove hash when going to top
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        });
        toggleScrollToTop();
    }
}

/**
 * Setup URL hash management for section sharability
 * Handles initial hash on page load and ensures sections are shareable
 */
export function setupUrlHashManagement() {
    // Handle initial hash on page load
    function scrollToHash() {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                // Small delay to ensure page is fully loaded
                setTimeout(() => {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        } else {
            // No hash needed for home section - just ensure clean URL
            if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    }
    
    // Scroll to hash on initial load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scrollToHash);
    } else {
        scrollToHash();
    }
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', (e) => {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        } else {
            // Scroll to top if no hash
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

