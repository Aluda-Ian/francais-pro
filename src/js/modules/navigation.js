// Français Pro — Dynamic Header and Footer manager
// This script simplifies the navigation across all pages and manages auth states dynamically.

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the current page filename
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    // 2. Auth State Check
    const token = localStorage.getItem('fp_token');
    const userJson = localStorage.getItem('fp_user');
    let user = null;
    if (userJson) {
        try {
            user = JSON.parse(userJson);
        } catch (e) {
            console.error("Error parsing user info", e);
        }
    }

    // 3. Render clean header (Skip on dashboard pages to preserve template designs)
    const isDashboard = page.includes('dashboard') || page.includes('dashbord');
    
    if (!isDashboard) {
        const headers = document.querySelectorAll('header.header, header.lc-header');
        headers.forEach(header => {
            // Build the dynamic menu links
            const menuItems = [
                { name: "Home", url: "index.html" },
                { name: "Courses", url: "course.html" },
                { name: "Find Tutors", url: "find-tutors.html" },
                { name: "Resources", url: "#", sub: [
                    { name: "Blog", url: "blog.html" },
                    { name: "Guide/Help", url: "faq.html" },
                    { name: "FAQs", url: "faq.html" }
                ]},
                { name: "About", url: "about.html" },
                { name: "Contact", url: "contact.html" }
            ];

            const navHtml = menuItems.map(item => {
                if (item.sub) {
                    const subHtml = item.sub.map(subItem => `
                        <li class="nav-submenu__item">
                            <a href="${subItem.url}" class="nav-submenu__link hover-bg-neutral-30 py-8 px-16 block">${subItem.name}</a>
                        </li>
                    `).join('');
                    return `<li class="nav-menu__item has-submenu group relative">
                        <a href="javascript:void(0)" class="nav-menu__link hover-text-main-600">${item.name}</a>
                        <ul class="nav-submenu scroll-sm absolute top-full left-0 bg-white shadow-md rounded-12 py-12 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            ${subHtml}
                        </ul>
                    </li>`;
                } else {
                    const isActive = page === item.url ? 'text-main-600 font-semibold' : 'text-neutral-700';
                    return `<li class="nav-menu__item">
                        <a href="${item.url}" class="nav-menu__link hover-text-main-600 ${isActive}">${item.name}</a>
                    </li>`;
                }
            }).join('');

            // Build Right Side Auth Action Buttons
            let authButtonsHtml = '';
            if (token && user) {
                const dashboardUrl = user.role === 'student' ? 'dashboard.html' : 'dashboard.html';
                authButtonsHtml = `
                    <a href="${dashboardUrl}" class="btn btn-main rounded-pill flex items-center gap-8 py-8 px-16 text-white text-sm">
                        <i class="ph ph-user-circle text-lg"></i>
                        <span>Dashboard</span>
                    </a>
                    <button id="fp-logout-btn" class="btn btn-outline-main rounded-pill flex items-center gap-8 py-8 px-16 text-sm">
                        <span>Sign Out</span>
                    </button>
                `;
            } else {
                authButtonsHtml = `
                    <a href="sign-in.html" class="btn btn-outline-main rounded-pill flex items-center gap-8 py-8 px-16 text-sm">
                        Sign In
                    </a>
                    <a href="sign-up.html" class="btn btn-accent rounded-pill flex items-center gap-8 py-8 px-16 text-white text-sm">
                        Book Free Trial
                    </a>
                `;
            }

            // Set simplified inner HTML
            header.className = 'header py-6 bg-white sticky top-0 z-1000 border-b border-neutral-10';
            header.innerHTML = `
                <div class="container">
                    <nav class="header-inner flex items-center justify-between gap-16 py-2">
                        <!-- Logo Start -->
                        <div class="logo">
                            <a href="index.html" class="link flex items-center">
                                <img src="./images/logo/logo.png" alt="Français Pro" style="max-height: 36px;">
                            </a>
                        </div>
                        <!-- Menu Start -->
                        <div class="header-menu hidden lg:block">
                            <ul class="nav-menu flex items-center gap-24">
                                ${navHtml}
                            </ul>
                        </div>
                        <!-- Actions Start -->
                        <div class="header-right flex items-center gap-12">
                            <div class="hidden lg:flex items-center gap-12">
                                ${authButtonsHtml}
                            </div>
                            <button type="button" class="toggle-mobile-menu lg:hidden text-3xl text-neutral-700">
                                <i class="ph ph-list"></i>
                            </button>
                        </div>
                    </nav>
                </div>
                <!-- Mobile Menu Drawer (simple toggle) -->
                <div id="fp-mobile-menu" class="fixed inset-0 bg-black/50 z-9999 hidden flex-col justify-end">
                    <div class="bg-white w-full max-w-sm ml-auto h-full p-24 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-32">
                                <img src="./images/logo/logo.png" alt="Français Pro" style="max-height: 32px;">
                                <button id="close-mobile-menu" class="text-3xl"><i class="ph ph-x"></i></button>
                            </div>
                            <ul class="flex flex-col gap-16 text-lg">
                                ${menuItems.map(item => {
                                    if (item.sub) {
                                        return `<li>
                                            <span class="block py-8 text-neutral-700 font-semibold">${item.name}</span>
                                            <ul class="pl-16 flex flex-col gap-8 mt-8">
                                                ${item.sub.map(subItem => `<li><a href="${subItem.url}" class="block text-neutral-600 hover:text-main-600">${subItem.name}</a></li>`).join('')}
                                            </ul>
                                        </li>`;
                                    } else {
                                        return `<li><a href="${item.url}" class="block py-8 text-neutral-700 hover:text-main-600">${item.name}</a></li>`;
                                    }
                                }).join('')}
                            </ul>
                        </div>
                        <div class="flex flex-col gap-12 border-t pt-24">
                            ${token ? `
                                <a href="${user.role === 'student' ? 'dashboard.html' : 'dashboard.html'}" class="btn btn-main py-12 rounded-pill text-center text-white">Dashboard</a>
                                <button id="fp-mobile-logout-btn" class="btn btn-outline-main py-12 rounded-pill">Sign Out</button>
                            ` : `
                                <a href="sign-in.html" class="btn btn-outline-main py-12 rounded-pill text-center">Sign In</a>
                                <a href="sign-up.html" class="btn btn-accent py-12 rounded-pill text-center text-white">Book Free Trial</a>
                            `}
                        </div>
                    </div>
                </div>
            `;
        });

        // 4. Render clean footer (Skip on dashboard pages)
        const footers = document.querySelectorAll('footer');
        footers.forEach(footer => {
            footer.className = 'footer bg-main-25 border-t border-neutral-10 py-60 mt-80';
            footer.innerHTML = `
                <div class="container">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-40 mb-40">
                        <div>
                            <div class="mb-16">
                                <img src="./images/logo/logo.png" alt="Français Pro" style="max-height: 40px;">
                            </div>
                            <p class="text-neutral-500 leading-relaxed max-w-sm">
                                Expert online French tuition tailored for IB, IGCSE, and CBSE students worldwide. Build confidence, fluency, and achieve top grades.
                            </p>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-neutral-800 mb-16">Quick Links</h4>
                            <ul class="flex flex-col gap-8">
                                <li><a href="course.html" class="text-neutral-500 hover:text-main-600">Courses</a></li>
                                <li><a href="find-tutors.html" class="text-neutral-500 hover:text-main-600">Find Tutors</a></li>
                                <li><a href="blog.html" class="text-neutral-500 hover:text-main-600">Blog / Articles</a></li>
                                <li><a href="about.html" class="text-neutral-500 hover:text-main-600">About Us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-neutral-800 mb-16">Support</h4>
                            <ul class="flex flex-col gap-8">
                                <li><a href="contact.html" class="text-neutral-500 hover:text-main-600">Contact Support</a></li>
                                <li><span class="text-neutral-500">Email: hello@francaispro.com</span></li>
                                <li><span class="text-neutral-500">WhatsApp: +1 (888) 98-FRENCH</span></li>
                            </ul>
                        </div>
                    </div>
                    <div class="border-t border-neutral-20 pt-24 flex flex-col md:flex-row items-center justify-between gap-16">
                        <p class="text-neutral-400 text-sm">© 2026 Français Pro. All rights reserved.</p>
                        <div class="flex gap-24 text-sm">
                            <a href="privacy-policy.html" class="text-neutral-400 hover:text-main-600">Privacy Policy</a>
                            <a href="index.html" class="text-neutral-400 hover:text-main-600">Terms & Conditions</a>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // 5. Setup Mobile Menu Toggle Event Handlers
    document.querySelectorAll('.toggle-mobile-menu').forEach(btn => {
        btn.addEventListener('click', () => {
            const drawer = document.getElementById('fp-mobile-menu');
            if (drawer) drawer.classList.remove('hidden');
        });
    });

    const closeBtn = document.getElementById('close-mobile-menu');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const drawer = document.getElementById('fp-mobile-menu');
            if (drawer) drawer.classList.add('hidden');
        });
    }

    // 6. Logout handler
    const handleLogout = () => {
        localStorage.removeItem('fp_token');
        localStorage.removeItem('fp_user');
        window.location.href = 'index.html';
    };

    const logoutBtn = document.getElementById('fp-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const mobileLogoutBtn = document.getElementById('fp-mobile-logout-btn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

    // 7. Dynamic Breadcrumb Cleaner (making all subpages match the tutor details breadcrumb style)
    const breadcrumb = document.querySelector('section.breadcrumb');
    if (breadcrumb) {
        // Find existing list items to extract text/hrefs
        const rawItems = Array.from(breadcrumb.querySelectorAll('.breadcrumb__item'));
        const cleanItems = [];

        rawItems.forEach(item => {
            // Skip caret icons and empty text
            const hasCaret = item.querySelector('[class*="caret"]') || item.querySelector('.ph-caret-right') || item.textContent.trim() === '>';
            if (hasCaret) return;

            const link = item.querySelector('a');
            if (link) {
                const text = link.textContent.trim();
                // Filter out icons or placeholder text
                const cleanText = text.replace(/Home/i, '').trim() ? text : 'Home';
                if (cleanText.toLowerCase() !== 'home') {
                    cleanItems.push({ text: cleanText, url: link.getAttribute('href') });
                }
            } else {
                const text = item.textContent.trim();
                if (text && text.toLowerCase() !== 'home') {
                    cleanItems.push({ text, url: null, id: item.id });
                }
            }
        });

        // Rebuild clean, compact layout
        let listHtml = `
            <li class="breadcrumb__item">
                <a href="index.html" class="text-neutral-500 hover:text-main-600">Home</a>
            </li>
        `;

        cleanItems.forEach((item, idx) => {
            listHtml += `
                <li class="breadcrumb__item">
                    <i class="ph ph-caret-right text-neutral-400"></i>
                </li>
            `;
            if (item.url) {
                listHtml += `
                    <li class="breadcrumb__item">
                        <a href="${item.url}" class="text-neutral-500 hover:text-main-600">${item.text}</a>
                    </li>
                `;
            } else {
                const isLast = idx === cleanItems.length - 1;
                const idAttr = item.id ? `id="${item.id}"` : '';
                listHtml += `
                    <li ${idAttr} class="breadcrumb__item ${isLast ? 'text-main-two-600' : 'text-neutral-700'}">
                        ${item.text}
                    </li>
                `;
            }
        });

        // Apply clean styling classes and content
        breadcrumb.className = 'breadcrumb bg-main-25 relative z-1 mb-0 overflow-hidden py-40 border-b border-neutral-10';
        breadcrumb.innerHTML = `
            <div class="container">
                <div class="breadcrumb__wrapper">
                    <ul class="breadcrumb__list flex items-center gap-8 text-sm font-medium">
                        ${listHtml}
                    </ul>
                </div>
            </div>
        `;
    }
});

