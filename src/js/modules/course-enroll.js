document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('course-enrollment-action-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    if (!courseId) return;

    const API_BASE = 'http://localhost:5000/api';
    const token = localStorage.getItem('fp_token') || localStorage.getItem('token');

    // 1. If not logged in, show "Sign In to Enroll"
    if (!token) {
        container.innerHTML = `
            <a href="sign-in.html" class="btn btn-main rounded-pill w-100 py-16 flex items-center justify-center gap-8 text-white">
                <i class="ph ph-sign-in text-lg"></i>
                <span>Sign In to Enroll</span>
            </a>
        `;
        return;
    }

    try {
        // 2. Fetch current user profile
        const meRes = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!meRes.ok) {
            container.innerHTML = `
                <a href="sign-in.html" class="btn btn-main rounded-pill w-100 py-16 flex items-center justify-center gap-8 text-white">
                    <i class="ph ph-sign-in text-lg"></i>
                    <span>Sign In to Enroll</span>
                </a>
            `;
            return;
        }

        const meData = await meRes.json();
        const user = meData.user;

        if (user.role !== 'student') {
            container.innerHTML = `
                <button class="btn btn-outline-main rounded-pill w-100 py-16 flex items-center justify-center gap-8 text-neutral-500" disabled>
                    <i class="ph ph-info text-lg"></i>
                    <span>Available for Students Only</span>
                </button>
            `;
            return;
        }

        // 3. Check enrollment status
        const statusRes = await fetch(`${API_BASE}/courses/${courseId}/enrollment-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!statusRes.ok) {
            container.innerHTML = `<div class="text-danger text-sm">Failed to verify enrollment status</div>`;
            return;
        }

        const statusData = await statusRes.json();

        if (statusData.enrolled) {
            container.innerHTML = `
                <a href="lesson-details.html?id=${courseId}" class="btn btn-outline-main rounded-pill w-100 py-16 flex items-center justify-center gap-8 text-main-600 font-semibold">
                    <i class="ph ph-play-circle text-lg"></i>
                    <span>Start Learning</span>
                </a>
            `;
        } else {
            // Render Enroll button
            container.innerHTML = `
                <button id="enroll-course-btn" class="btn btn-main rounded-pill w-100 py-16 flex items-center justify-center gap-8 text-white">
                    <i class="ph ph-graduation-cap text-lg"></i>
                    <span>Enroll in Course</span>
                </button>
            `;

            const enrollBtn = document.getElementById('enroll-course-btn');
            enrollBtn.addEventListener('click', async () => {
                enrollBtn.disabled = true;
                enrollBtn.innerHTML = `
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Enrolling...</span>
                `;

                try {
                    const enrollRes = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await enrollRes.json();
                    if (!enrollRes.ok) {
                        alert(data.error || 'Enrollment failed');
                        enrollBtn.disabled = false;
                        enrollBtn.innerHTML = `
                            <i class="ph ph-graduation-cap text-lg"></i>
                            <span>Enroll in Course</span>
                        `;
                    } else {
                        alert(data.message || '🎉 Enrollment successful!');
                        location.reload();
                    }
                } catch (err) {
                    console.error('Enroll error:', err);
                    alert('An error occurred during enrollment. Please try again.');
                    enrollBtn.disabled = false;
                    enrollBtn.innerHTML = `
                        <i class="ph ph-graduation-cap text-lg"></i>
                        <span>Enroll in Course</span>
                    `;
                }
            });
        }

    } catch (err) {
        console.error('Failed to load enrollment view:', err);
        container.innerHTML = `<div class="text-danger text-sm">Failed to load enrollment status</div>`;
    }
});
