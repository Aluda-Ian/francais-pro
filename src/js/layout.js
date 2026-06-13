document.addEventListener('DOMContentLoaded', async () => {
    // Dynamically load header and footer partials
    const headerPlaceholder = document.getElementById('app-header');
    const footerPlaceholder = document.getElementById('app-footer');

    try {
        if (headerPlaceholder) {
            const headerRes = await fetch('./partials/header.html');
            if (headerRes.ok) {
                headerPlaceholder.innerHTML = await headerRes.text();
            }
        }

        if (footerPlaceholder) {
            const footerRes = await fetch('./partials/footer.html');
            if (footerRes.ok) {
                footerPlaceholder.innerHTML = await footerRes.text();
            }
        }
        
        // Re-initialize select2 if available, since the newly injected header might have selects
        if (window.jQuery && typeof window.jQuery.fn.select2 !== 'undefined') {
            window.jQuery('.js-example-basic-single').select2({
                minimumResultsForSearch: Infinity
            });
        }
        
        // Mobile menu toggle logic
        if (headerPlaceholder) {
            const mobileMenu = document.querySelector('.mobile-menu');
            const toggleMobileMenu = document.querySelector('.toggle-mobileMenu');
            const closeButton = document.querySelector('.close-button');
            const overlay = document.querySelector('.side-overlay');

            if (toggleMobileMenu && mobileMenu) {
                toggleMobileMenu.addEventListener('click', () => {
                    mobileMenu.classList.add('active');
                    if(overlay) overlay.classList.add('show');
                });
            }

            if (closeButton && mobileMenu) {
                closeButton.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    if(overlay) overlay.classList.remove('show');
                });
            }
            if (overlay && mobileMenu) {
                overlay.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    overlay.classList.remove('show');
                });
            }
        }

    } catch (err) {
        console.error('Error loading layout partials:', err);
    }
});
