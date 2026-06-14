document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    if (!page.includes('settings.html')) return;

    const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
    if (!token) return;

    // Handle calendar connection success notice
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calendar_connected') === 'true') {
        alert('🎉 Google Calendar connected successfully! Your booked classes will now sync automatically.');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Form elements with fallbacks for role-specific pages
    const firstNameInput = document.getElementById('settings-firstName') || document.querySelector('input[placeholder="Courtney"]');
    const lastNameInput = document.getElementById('settings-lastName') || document.querySelector('input[placeholder="Name"]');
    const emailInput = document.getElementById('settings-email') || document.querySelector('input[placeholder="Example@email.com "]');
    const phoneInput = document.getElementById('settings-phone') || document.querySelector('input[placeholder="Example@email.com"]');
    const saveBtn = document.getElementById('settings-save-btn') || Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'Save Change');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview') || document.getElementById('imagenextPreview');
    const removeAvatarBtn = document.getElementById('settings-remove-avatar-btn') || Array.from(document.querySelectorAll('button, label')).find(el => el.textContent.trim().toLowerCase().includes('cancel') && el.closest('.avatar-upload'));

    let currentAvatarBase64 = null;
    let removeAvatarFlag = false;
    let initialUser = null;

    try {
        // Fetch current user
        const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;

        const data = await res.json();
        const user = data.user;
        initialUser = user;

        // Inject Google Calendar connection section under profile settings
        if (saveBtn && !document.getElementById('google-calendar-sync-container')) {
            const container = document.createElement('div');
            container.id = 'google-calendar-sync-container';
            container.className = 'border-top mt-32 pt-32 border-dashed border-neutral-30 w-100';
            container.innerHTML = `
                <h4 class="text-18 mb-16 font-medium text-neutral-700">Google Calendar Integration</h4>
                <div class="bg-neutral-20 rounded-16 p-24 border border-neutral-30 flex items-center justify-between flex-wrap gap-16" style="background-color: #f8f9ff; border-radius: 16px; border: 1px solid #e4e4e7; padding: 24px;">
                    <div class="flex items-center gap-16">
                        <span style="color: #1754bf; font-size: 32px; display: inline-flex; align-items: center;"><i class="ph ph-calendar"></i></span>
                        <div>
                            <h6 class="mb-4 text-16 text-neutral-700 font-semibold" style="font-weight: 700;">Sync with Google Calendar</h6>
                            <p class="text-xs text-neutral-500 mb-0" style="font-size: 13px; color: #71717a; margin-bottom: 0;">Automatically sync booked classes to your Google Calendar with Meet links.</p>
                        </div>
                    </div>
                    <div id="google-calendar-status-area"></div>
                </div>
            `;
            
            const targetParent = saveBtn.closest('.rounded-10') || saveBtn.parentElement;
            if (targetParent) {
                const actionContainer = saveBtn.closest('div.align-items-center, div.flex');
                if (actionContainer) {
                    actionContainer.parentNode.insertBefore(container, actionContainer);
                } else {
                    saveBtn.parentNode.appendChild(container);
                }
            }

            const statusArea = document.getElementById('google-calendar-status-area');
            if (statusArea) {
                if (user.isGoogleConnected) {
                    statusArea.innerHTML = `
                        <span class="rounded-pill px-16 py-8 text-xs font-bold" style="background-color: #d1fae5; color: #065f46; font-weight: 700; font-size: 13px; padding: 8px 16px; border-radius: 50px;">
                            <i class="ph ph-check-circle"></i> Connected
                        </span>
                    `;
                } else {
                    statusArea.innerHTML = `
                        <button type="button" id="connect-google-btn" class="btn btn-main rounded-pill px-20 py-10 text-white font-medium text-xs">
                            Connect Google Calendar
                        </button>
                    `;
                    
                    const connectBtn = document.getElementById('connect-google-btn');
                    if (connectBtn) {
                        connectBtn.addEventListener('click', async () => {
                            connectBtn.disabled = true;
                            connectBtn.textContent = 'Connecting...';
                            try {
                                const redirectUrl = window.location.href.split('?')[0];
                                const res = await fetch(`http://localhost:5000/api/auth/google-url?connectCalendar=true&userId=${user.id}&redirect=${encodeURIComponent(redirectUrl)}`);
                                const data = await res.json();
                                if (data.url) {
                                    window.location.href = data.url;
                                } else {
                                    alert('Failed to initiate calendar connection OAuth.');
                                    connectBtn.disabled = false;
                                    connectBtn.textContent = 'Connect Google Calendar';
                                }
                            } catch (err) {
                                console.error(err);
                                alert('Error connecting calendar.');
                                connectBtn.disabled = false;
                                connectBtn.textContent = 'Connect Google Calendar';
                            }
                        });
                    }
                }
            }
        }

        // Populate fields
        if (user.name) {
            const parts = user.name.split(' ');
            if (firstNameInput) firstNameInput.value = parts[0] || '';
            if (lastNameInput) lastNameInput.value = parts.slice(1).join(' ') || '';
        }
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone || '';

        // Gender radio buttons
        if (user.gender) {
            const genderRadio = document.getElementById(user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase());
            if (genderRadio) genderRadio.checked = true;
        }

        // Bio editor
        const bioEl = document.querySelector('#editor p') || document.querySelector('#student-editor p');
        if (bioEl && user.bio) {
            bioEl.textContent = user.bio;
        }

        // Avatar preview
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=4f46e5&color=fff`;
        if (imagePreview) {
            imagePreview.style.backgroundImage = `url('${user.avatar || defaultAvatar}')`;
        }

        // Handle Image Upload
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    currentAvatarBase64 = event.target.result;
                    if (imagePreview) {
                        imagePreview.style.backgroundImage = `url('${currentAvatarBase64}')`;
                    }
                    removeAvatarFlag = false;
                };
                reader.readAsDataURL(file);
            });
        }

        // Handle Remove Image
        if (removeAvatarBtn) {
            removeAvatarBtn.addEventListener('click', () => {
                removeAvatarFlag = true;
                currentAvatarBase64 = '';
                if (imageUpload) imageUpload.value = ''; // clear input
                const currentName = `${firstNameInput?.value || ''} ${lastNameInput?.value || ''}`.trim() || 'User';
                const resetAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentName)}&background=4f46e5&color=fff`;
                if (imagePreview) {
                    imagePreview.style.backgroundImage = `url('${resetAvatar}')`;
                }
            });
        }

        // Handle Save Changes
        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';

                const firstName = firstNameInput?.value?.trim() || '';
                const lastName = lastNameInput?.value?.trim() || '';
                const fullName = `${firstName} ${lastName}`.trim();

                const email = emailInput?.value?.trim() || '';
                const phone = phoneInput?.value?.trim() || '';

                // Get selected gender
                let gender = '';
                const genderRadios = document.querySelectorAll('input[name="gender"]');
                genderRadios.forEach(radio => {
                    if (radio.checked) {
                        gender = radio.id.toLowerCase();
                    }
                });

                // Get bio editor content
                const bioEl = document.querySelector('#editor p') || document.querySelector('#student-editor p');
                const bioText = bioEl ? bioEl.textContent?.trim() : '';

                // Setup payload
                const payload = {
                    name: fullName,
                    email,
                    phone,
                    gender,
                    tagline: bioText
                };

                if (removeAvatarFlag) {
                    payload.avatar = ''; // Empty string removes avatar
                } else if (currentAvatarBase64) {
                    payload.avatar = currentAvatarBase64;
                }

                try {
                    const saveRes = await fetch('http://localhost:5000/api/auth/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!saveRes.ok) {
                        const errData = await saveRes.json();
                        alert(`Failed to save changes: ${errData.error || 'Unknown error'}`);
                        return;
                    }

                    const saveData = await saveRes.json();
                    if (saveData.success) {
                        // Update local user info
                        localStorage.setItem('fp_user', JSON.stringify(saveData.user));
                        
                        // Update display elements in header/sidebar immediately
                        const nameElements = document.querySelectorAll('.user-display-name');
                        nameElements.forEach(el => {
                            el.textContent = saveData.user.name;
                        });

                        const avatarUrl = saveData.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(saveData.user.name)}&background=4f46e5&color=fff`;
                        const avatarImgs = document.querySelectorAll('.dropdown > button.dropdown-toggle.rounded-pill img, img[src*="testimonials-three-img1.png"]');
                        avatarImgs.forEach(img => {
                            img.src = avatarUrl;
                        });

                        alert('Profile updated successfully!');
                        // Reload settings page to reflect changes
                        window.location.reload();
                    }
                } catch (err) {
                    console.error('Error saving profile changes:', err);
                    alert('Error saving changes. Please try again.');
                } finally {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Change';
                }
            });
        }

    } catch (err) {
        console.error('Error initializing settings profile:', err);
    }
});
