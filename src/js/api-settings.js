document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Toast Notification System
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

    const showToast = (message, type = 'success') => {
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
        
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const apiForm = document.getElementById('api-settings-form');
    if (!apiForm) return; // Only run if on settings page

    // Fetch existing settings
    try {
        const res = await fetch('http://localhost:5000/api/settings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
                const settings = data.data;
                if (settings.google) {
                    document.getElementById('googleClientId').value = settings.google.clientId || '';
                    document.getElementById('googleClientSecret').value = settings.google.clientSecret || '';
                }
                if (settings.zoom) {
                    document.getElementById('zoomApiKey').value = settings.zoom.apiKey || '';
                    document.getElementById('zoomApiSecret').value = settings.zoom.apiSecret || '';
                }
                if (settings.payment) {
                    document.getElementById('stripePublicKey').value = settings.payment.stripePublicKey || '';
                    document.getElementById('stripeSecretKey').value = settings.payment.stripeSecretKey || '';
                }
            }
        } else if (res.status === 403 || res.status === 401) {
            // Not an admin, hide the section
            const section = document.getElementById('api-config-section');
            if (section) section.style.display = 'none';
        }
    } catch (err) {
        console.error('Failed to fetch API settings:', err);
    }

    // Handle form submission
    apiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            google: {
                clientId: document.getElementById('googleClientId').value,
                clientSecret: document.getElementById('googleClientSecret').value
            },
            zoom: {
                apiKey: document.getElementById('zoomApiKey').value,
                apiSecret: document.getElementById('zoomApiSecret').value
            },
            payment: {
                stripePublicKey: document.getElementById('stripePublicKey').value,
                stripeSecretKey: document.getElementById('stripeSecretKey').value
            }
        };

        const submitBtn = apiForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            const res = await fetch('http://localhost:5000/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast('API Configurations saved successfully!', 'success');
            } else {
                const errData = await res.json();
                showToast(errData.error || 'Failed to save configurations', 'error');
            }
        } catch (err) {
            console.error('Save error:', err);
            showToast('Unable to connect to the server.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save API Keys';
        }
    });
});
