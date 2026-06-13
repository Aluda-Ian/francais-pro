// Français Pro — Authentication Handler and Page Protection

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:5000/api';
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    // ==========================================
    // 1. SIGN IN FORM HANDLER
    // ==========================================
    if (page === 'sign-in.html') {
        const loginForm = document.querySelector('form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = document.getElementById('email');
                const passwordInput = document.getElementById('password');
                if (!emailInput || !passwordInput) return;

                const email = emailInput.value.trim();
                const password = passwordInput.value;

                if (!email || !password) {
                    alert('Please enter email and password.');
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.message || 'Login failed.');
                    }

                    // Save token and user info
                    localStorage.setItem('fp_token', data.token);
                    localStorage.setItem('fp_user', JSON.stringify(data.user));

                    // Redirect based on role
                    if (data.user.role === 'student') {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } catch (err) {
                    console.error(err);
                    alert(err.message);
                }
            });
        }
    }

    // ==========================================
    // 2. SIGN UP FORM HANDLER
    // ==========================================
    if (page === 'sign-up.html') {
        const signupForm = document.querySelector('form');
        if (signupForm) {
            // Add a clean Role Selector (Student or Instructor) if it doesn't exist
            const formRow = signupForm.querySelector('.row');
            if (formRow) {
                const roleSelectHtml = `
                    <div class="col-sm-12 mb-16">
                        <label for="role" class="mb-16 text-lg font-medium text-neutral-500">I want to register as a:</label>
                        <select id="role" class="common-input rounded-pill" style="height: 52px; background: white;">
                            <option value="student">Student (Learn French)</option>
                            <option value="instructor">Instructor (Teach French)</option>
                        </select>
                    </div>
                `;
                // Insert role selector before the password field
                const passwordCol = formRow.querySelector('.col-sm-12:has(#password)') || formRow.children[2];
                if (passwordCol) {
                    passwordCol.insertAdjacentHTML('beforebegin', roleSelectHtml);
                }
            }

            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const fname = document.getElementById('fname')?.value.trim() || '';
                const lname = document.getElementById('lname')?.value.trim() || '';
                const email = document.getElementById('email')?.value.trim();
                const password = document.getElementById('password')?.value;
                const role = document.getElementById('role')?.value || 'student';

                if (!email || !password) {
                    alert('Please enter email and password.');
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: `${fname} ${lname}`.trim(),
                            email,
                            password,
                            role
                        })
                    });

                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.message || 'Registration failed.');
                    }

                    // Save token and user info
                    localStorage.setItem('fp_token', data.token);
                    localStorage.setItem('fp_user', JSON.stringify(data.user));

                    // Redirect based on role
                    if (data.user.role === 'student') {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } catch (err) {
                    console.error(err);
                    alert(err.message);
                }
            });
        }
    }

    // ==========================================
    // 3. DASHBOARD PAGE ROUTE GUARDS
    // ==========================================
    if (page === 'dashboard.html') {
        const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
        const userJson = localStorage.getItem('fp_user');
        let user = null;
        if (userJson) {
            try { user = JSON.parse(userJson); } catch (e) {}
        }

        if (!token) {
            window.location.href = 'sign-in.html';
        }
    }

    if (page === 'cms-blogs.html') {
        const token = localStorage.getItem('fp_token');
        const userJson = localStorage.getItem('fp_user');
        let user = null;
        if (userJson) {
            try { user = JSON.parse(userJson); } catch (e) {}
        }

        if (!token || !user || (user.role !== 'instructor' && user.role !== 'admin')) {
            alert('Access Denied. Please log in as an instructor or administrator.');
            window.location.href = 'sign-in.html';
        }
    }

    // Global profile UI update
    const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
    const userJson = localStorage.getItem('fp_user');
    if (token && userJson) {
        try {
            const user = JSON.parse(userJson);
            
            // Update all name placeholders
            document.querySelectorAll('.user-display-name').forEach(el => {
                el.textContent = user.name;
            });
            
            // Optional: Update global avatars
            document.querySelectorAll('.user-display-avatar').forEach(imgEl => {
                imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=002395&color=fff&size=128`;
            });

            // Update specific sidebar elements if present (legacy support)
            const sidebar = document.querySelector('.student-dashboard-sidebar');
            if (sidebar) {
                const nameEl = sidebar.querySelector('h5');
                const emailEl = sidebar.querySelector('span.text-14');
                const imgEl = sidebar.querySelector('img');

                if (nameEl) nameEl.textContent = user.name;
                if (emailEl) emailEl.textContent = user.email;
                if (imgEl) {
                    imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=002395&color=fff&size=128`;
                    imgEl.className = "mb-20 rounded-circle border border-neutral-30";
                    imgEl.style.width = "90px";
                    imgEl.style.height = "90px";
                    imgEl.style.objectFit = "cover";
                    imgEl.style.margin = "0 auto";
                }
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
});
