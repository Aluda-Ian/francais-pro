document.addEventListener('DOMContentLoaded', () => {
    // Inject a toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-0 right-0 p-16 z-50 flex flex-col gap-8';
        container.style.zIndex = '9999';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        document.body.appendChild(container);
    }

    const showToast = (message, type = 'error') => {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'border-danger-600' : 'border-success-600';
        const iconColor = type === 'error' ? 'text-danger-600' : 'text-success-600';
        toast.className = `p-16 rounded-8 bg-white border-start border-4 ${bgColor} shadow-lg flex items-start gap-12 transform transition-all duration-300 translate-x-full opacity-0`;
        toast.style.padding = '16px 24px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
        toast.style.marginBottom = '12px';
        toast.style.transition = 'all 0.3s ease-in-out';
        toast.style.minWidth = '300px';
        toast.style.borderLeftWidth = '4px';
        toast.style.borderLeftStyle = 'solid';
        toast.style.borderLeftColor = type === 'error' ? '#ef4444' : '#22c55e';
        
        toast.innerHTML = `
            <div class="flex-shrink-0 mt-4">
                <i class="ph-fill ${type === 'error' ? 'ph-warning-circle' : 'ph-check-circle'} text-24 ${iconColor}"></i>
            </div>
            <div class="flex-grow-1">
                <div class="flex items-center gap-8 mb-4">
                    <img src="./images/logo/logo.png" alt="Français Pro" style="height: 16px; object-fit: contain;">
                    <span class="text-12 text-neutral-400 font-medium tracking-wide text-uppercase">Notification</span>
                </div>
                <span class="font-medium text-14 text-neutral-700 block">${message}</span>
            </div>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const loginForm = document.querySelector('form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (!emailInput || !passwordInput) return;

        const email = emailInput.value;
        const password = passwordInput.value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (submitBtn) submitBtn.disabled = true;

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || 'Login failed', 'error');
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            showToast('Login successful! Redirecting...', 'success');

            // Store token
            localStorage.setItem('token', data.token);

            // Redirect based on role
            const role = data.user?.role;
            if (role === 'admin') {
                window.location.href = 'admin-dashbord.html';
            } else if (role === 'instructor') {
                window.location.href = 'instructor-dashboard.html';
            } else {
                window.location.href = 'student-dashbord.html';
            }
        } catch (err) {
            console.error('Login error:', err);
            // Check if it's a "Failed to fetch" error
            if (err.message === 'Failed to fetch') {
                showToast('Unable to connect to the server. Please check your internet connection or try again later.', 'error');
            } else {
                showToast('An error occurred during login. Please try again.', 'error');
            }
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});
