document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = 'http://localhost:5000/api';
    const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
    const userJson = localStorage.getItem('fp_user');
    
    if (!token || !userJson) return; // Not logged in

    const user = JSON.parse(userJson);
    const path = window.location.pathname;

    // Helper: Safely clear a container's dummy list items but keep structure
    const clearContainer = (selector) => {
        const containers = document.querySelectorAll(selector);
        containers.forEach(container => {
            // we don't want to clear the sidebar or navigation tabs
            if (container.closest('.dashboard-sidebar')) return;
            container.innerHTML = '<div class="col-12 w-100"><p class="text-neutral-500 py-40 px-24">No items available yet.</p></div>';
        });
    };

    const isStudent = user.role === 'student';
    const isInstructor = user.role === 'instructor';

    // ==========================================
    // 1. COURSES (Enrolled / My Courses)
    // ==========================================
    if (path.includes('-courses.html')) {
        const gridContainers = document.querySelectorAll('.tab-pane .row');
        if (gridContainers.length > 0) {
            gridContainers.forEach(grid => grid.innerHTML = ''); // clear dummy

            try {
                const roleEndpoint = isInstructor ? 'instructor' : 'student';
                const res = await fetch(`${API_BASE}/dashboard/${roleEndpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch dashboard data');
                const data = await res.json();

                let coursesToRender = [];
                if (isStudent || path.includes('enrolled')) {
                    coursesToRender = (data.enrollments || []).map(e => e.course).filter(Boolean);
                } else if (isInstructor && path.includes('my-courses')) {
                    // Fetch specifically my courses
                    const coursesRes = await fetch(`${API_BASE}/courses/my-courses`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const coursesData = await coursesRes.json();
                    coursesToRender = coursesData.data || [];
                } else {
                    coursesToRender = data.recentCourses || [];
                }

                // Render courses into the FIRST tab pane (Active)
                const targetGrid = gridContainers[0];
                if (coursesToRender.length === 0) {
                    targetGrid.innerHTML = '<div class="col-12"><p class="text-neutral-500 py-40">No courses found.</p></div>';
                } else {
                    coursesToRender.forEach(course => {
                        const thumbnail = course.thumbnail || './images/thumbs/course-img1.png';
                        const cardHtml = `
                            <div class="col-xl-4 col-md-6 col-sm-6 mb-24">
                                <div class="course-item rounded-16 box-shadow-md h-100 bg-white p-12">
                                    <div class="course-item__thumb rounded-12 overflow-hidden">
                                        <a href="course-details.html?id=${course._id}" class="h-100 w-100">
                                            <img src="${thumbnail}" alt="Course" class="course-item__img rounded-12 cover-img">
                                        </a>
                                    </div>
                                    <div class="course-item__content mt-16">
                                        <span class="text-success-600 text-12 bg-success-50 border-success-100 rounded-10 border px-12 py-6 font-medium mb-12 block w-fit">
                                            ${course.curriculum || 'General'}
                                        </span>
                                        <h4 class="mb-16 text-lg">
                                            <a href="course-details.html?id=${course._id}" class="link text-line-2 fw-semibold">${course.title}</a>
                                        </h4>
                                        <a href="course-details.html?id=${course._id}" class="btn btn-outline-main rounded-pill py-8 px-16 w-100 mt-auto">View Course</a>
                                    </div>
                                </div>
                            </div>
                        `;
                        targetGrid.insertAdjacentHTML('beforeend', cardHtml);
                    });
                }
            } catch (error) {
                console.error('Error populating dashboard courses:', error);
                gridContainers[0].innerHTML = '<div class="col-12 text-danger">Error loading courses.</div>';
            }
        }
    }

    // ==========================================
    // 2. CLEAR OTHER DEMO DATA PAGES
    // ==========================================
    const pagesToWipe = [
        '-wishlist.html',
        '-reviews.html',
        '-quiz-attempts.html',
        '-assignment.html',
        '-order-history.html',
        '-announcements.html'
    ];

    if (pagesToWipe.some(p => path.includes(p))) {
        // Clear all rows inside the main dashboard body
        const containers = document.querySelectorAll('.dashbord-body .tab-content, .dashbord-body .row, .dashbord-body table tbody');
        containers.forEach(container => {
            if (!container.closest('.dashboard-sidebar')) {
                container.innerHTML = '<div class="w-100 p-24"><p class="text-neutral-500">No items available yet.</p></div>';
            }
        });
    }

    // ==========================================
    // 3. MESSAGES (Clear dummy chats)
    // ==========================================
    if (path.includes('-message.html')) {
        const chatList = document.querySelector('.message-sidebar__list');
        const chatBox = document.querySelector('.message-box__body');
        
        if (chatList) chatList.innerHTML = '<p class="text-neutral-500 p-16 text-center">No messages.</p>';
        if (chatBox) chatBox.innerHTML = '<div class="flex items-center justify-center h-100 text-neutral-500">Select a chat to view messages</div>';
    }

    // ==========================================
    // 4. "ADD NEW COURSE" INJECTION
    // ==========================================
    if (isInstructor && path.includes('instructor-dashboard-my-courses.html')) {
        const headerDiv = document.querySelector('.align-items-center.justify-content-between.flex.flex-wrap.gap-8');
        if (headerDiv) {
            // Append a Create Course Button
            const createBtnHtml = `
                <a href="instructor-dashboard-create-course.html" class="btn btn-main rounded-pill flex items-center gap-8 py-10 px-24">
                    <i class="ph ph-plus"></i> Add New Course
                </a>
            `;
            headerDiv.insertAdjacentHTML('beforeend', createBtnHtml);
        }
    }
});
