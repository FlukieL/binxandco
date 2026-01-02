/**
 * Navigation component
 * Handles mobile menu toggle and smooth scrolling
 */

let mainNav = null;
let menuToggle = null;

/**
 * Setup mobile menu toggle
 */
export function setupMobileMenu() {
    menuToggle = document.querySelector('.mobile-menu-toggle');
    mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const spans = menuToggle.querySelectorAll('span');
            
            // Simple hamburger animation
            if (mainNav.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/**
 * Close mobile menu
 */
export function closeMobileMenu() {
    if (mainNav && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        if (menuToggle) {
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }
}

/**
 * Setup smooth scroll for anchor links
 */
export function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                closeMobileMenu();

                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // Update URL using pushState for proper history management
                // Remove hash if it's #home, otherwise set the hash
                if (targetId === '#home') {
                    window.history.pushState(null, '', window.location.pathname + window.location.search);
                } else {
                    window.history.pushState(null, '', targetId);
                }

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

