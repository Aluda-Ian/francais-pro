document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-course-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const price = document.getElementById('price').value;
        const duration = document.getElementById('duration').value;
        const description = document.getElementById('description').value;
        const curriculum = document.getElementById('curriculum').value;
        const statusEl = document.getElementById('create-status');
        const btn = document.getElementById('create-course-btn');

        const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
        if (!token) {
            statusEl.textContent = 'You must be logged in to create a course.';
            statusEl.className = 'mt-16 text-center text-danger';
            statusEl.style.display = 'block';
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Creating...';

        try {
            const API_BASE = 'http://localhost:5000/api';
            const res = await fetch(`${API_BASE}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    price: Number(price),
                    duration: `${duration} Weeks`,
                    description,
                    curriculum,
                    isPublished: true, // Auto publish for MVP
                    isFree: Number(price) === 0
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create course');
            }

            statusEl.textContent = 'Course created successfully!';
            statusEl.className = 'mt-16 text-center text-success-600';
            statusEl.style.display = 'block';

            // Reset form
            form.reset();

            // Redirect to My Courses after 1.5s
            setTimeout(() => {
                window.location.href = 'instructor-dashboard-my-courses.html';
            }, 1500);

        } catch (error) {
            console.error('Course creation error:', error);
            statusEl.textContent = error.message;
            statusEl.className = 'mt-16 text-center text-danger';
            statusEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-plus"></i> Create Course';
        }
    });
});
