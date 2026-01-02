/**
 * Scroll-triggered animations utility
 * Handles IntersectionObserver for fade-in animations
 */

/**
 * Setup scroll-triggered animations using IntersectionObserver
 * @returns {IntersectionObserver} The observer instance
 */
export function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in-up class
    document.querySelectorAll('.fade-in-up, .section-title, .about-content p').forEach(el => {
        observer.observe(el);
    });

    return observer;
}

