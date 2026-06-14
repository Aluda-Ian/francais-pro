document.addEventListener('DOMContentLoaded', async () => {
    // Only run on dashboard pages
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    const isDashboard = page.includes('dashboard') || page.includes('dashbord') || page.includes('deshbord') || page.includes('my-profile');
    if (!isDashboard) return;

    const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
    if (!token) {
        window.location.href = 'sign-in.html';
        return;
    }

    try {
        // 1. Get user profile
        const meRes = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!meRes.ok) {
            localStorage.removeItem('fp_token');
            localStorage.removeItem('token');
            window.location.href = 'sign-in.html';
            return;
        }

        const meData = await meRes.json();
        const role = meData.user.role;

        // 2. Fetch Dashboard data based on role
        const dashRes = await fetch(`http://localhost:5000/api/dashboard/${role}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!dashRes.ok) {
            console.error('Failed to fetch dashboard data');
            return;
        }

        const dashData = await dashRes.json();

        // 3. Update DOM dynamically

        // --- Sidebar Filtering ---
        const sidebarItems = document.querySelectorAll('li[data-allowed-roles]');
        sidebarItems.forEach(item => {
            const allowedRoles = item.getAttribute('data-allowed-roles').split(',');
            if (!allowedRoles.includes(role)) {
                item.style.display = 'none';
            }
        });

        // --- Metric Updating ---
        // Replace user name in sidebar and header
        const nameElements = document.querySelectorAll('.user-display-name');
        nameElements.forEach(el => {
            el.textContent = meData.user.name;
        });

        // Replace user avatar images in dropdown and sidebar
        const avatarUrl = meData.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(meData.user.name)}&background=4f46e5&color=fff`;
        const avatarImgs = document.querySelectorAll('.dropdown > button.dropdown-toggle.rounded-pill img, img[src*="testimonials-three-img1.png"]');
        avatarImgs.forEach(img => {
            img.src = avatarUrl;
        });

        // Check if we are on dashboard.html main page to update metrics & recent tables
        if (page.includes('dashboard.html')) {
            const metricCols = document.querySelectorAll('.col-xl-4.col-sm-6');
            metricCols.forEach(col => col.style.display = 'none');
            
            const updateMetricCard = (cardIndex, label, value, iconFile) => {
                if (cardIndex < metricCols.length) {
                    const col = metricCols[cardIndex];
                    col.style.display = 'block';
                    const labelEl = col.querySelector('span.fw-normal');
                    const valEl = col.querySelector('h6');
                    const imgEl = col.querySelector('img');
                    
                    if(labelEl) labelEl.textContent = label;
                    if(valEl) valEl.textContent = value;
                    if(imgEl && iconFile) imgEl.src = `./images/icons/${iconFile}`;
                }
            };

            if (role === 'admin') {
                updateMetricCard(0, 'Total Courses', dashData.metrics.totalCourses, 'dashbord-item1.png');
                updateMetricCard(1, 'Total Students', dashData.metrics.totalStudents, 'dashbord-item5.png');
                updateMetricCard(2, 'Total Instructors', dashData.metrics.totalInstructors || '0', 'dashbord-item2.png');
                updateMetricCard(3, 'Enrolled Courses', dashData.metrics.totalEnrollments, 'dashbord-item4.png');
            } else if (role === 'student') {
                updateMetricCard(0, 'Enrolled Courses', dashData.metrics.totalEnrolled, 'dashbord-item1.png');
                updateMetricCard(1, 'Active Courses', dashData.metrics.activeCourses, 'dashbord-item3.png');
                updateMetricCard(2, 'Completed Courses', dashData.metrics.completedCourses, 'dashbord-item4.png');
            } else if (role === 'instructor') {
                updateMetricCard(0, 'Total Courses', dashData.metrics.totalCourses, 'dashbord-item1.png');
                updateMetricCard(1, 'Students Enrolled', dashData.metrics.totalStudentsEnrolled, 'dashbord-item5.png');
            }

            // --- Render Admin Tables ---
            if (role === 'admin' && dashData.recentBookings) {
                // Find the table container (e.g. Recent Course table or Reviews table) and hijack it for Bookings
                const tables = document.querySelectorAll('.rounded-10.bg-white.px-24.py-24');
                if (tables.length > 0) {
                    const tableContainer = tables[0];
                    tableContainer.innerHTML = `
                        <div class="align-items-center justify-content-between mb-24 flex">
                            <h6 class="text-16 mb-0 font-medium text-neutral-500">Recent Live Class Bookings</h6>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="display min-w-max w-100 table-borderless">
                                <thead>
                                    <tr class="bg-main-25 border-bottom border-neutral-30">
                                        <th class="text-12 px-20 py-16 font-medium text-neutral-500">Student</th>
                                        <th class="text-12 px-20 py-16 font-medium text-neutral-500">Class Title</th>
                                        <th class="text-12 px-20 py-16 font-medium text-neutral-500">Status</th>
                                        <th class="text-12 px-20 py-16 font-medium text-neutral-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dashData.recentBookings.length === 0 ? '<tr><td colspan="4" class="px-20 py-22 text-neutral-500">No bookings yet.</td></tr>' : 
                                      dashData.recentBookings.map(b => `
                                      <tr class="hover-bg-neutral-20 border-bottom transition-03">
                                          <td class="px-20 py-22 text-14">${b.student?.name || 'Unknown'}</td>
                                          <td class="px-20 py-22 text-14">${b.liveClass?.title || 'Unknown'}</td>
                                          <td class="px-20 py-22 text-14"><span class="badge ${b.status === 'confirmed' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger'} px-12 py-6 rounded-pill">${b.status}</span></td>
                                          <td class="px-20 py-22 text-14">${new Date(b.createdAt).toLocaleDateString()}</td>
                                      </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }
                
                // Hijack second table for Enrollments
                if (tables.length > 1 && dashData.recentEnrollments) {
                    const tableContainer2 = tables[1];
                    tableContainer2.innerHTML = `
                        <div class="align-items-center justify-content-between mb-24 flex">
                            <h6 class="text-16 mb-0 font-medium text-neutral-500">Recent Course Enrollments</h6>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="display min-w-max w-100 table-borderless">
                                <thead>
                                    <tr class="bg-main-25 border-bottom border-neutral-30">
                                        <th class="text-12 px-20 py-16 font-medium text-neutral-500">Student</th>
                                        <th class="text-12 px-20 py-16 font-medium text-neutral-500">Course</th>
                                        <th class="text-12 px-20 py-16 font-medium text-neutral-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dashData.recentEnrollments.length === 0 ? '<tr><td colspan="3" class="px-20 py-22 text-neutral-500">No enrollments yet.</td></tr>' : 
                                      dashData.recentEnrollments.map(e => `
                                      <tr class="hover-bg-neutral-20 border-bottom transition-03">
                                          <td class="px-20 py-22 text-14">${e.student?.name || 'Unknown'}</td>
                                          <td class="px-20 py-22 text-14">${e.course?.title || 'Unknown'}</td>
                                          <td class="px-20 py-22 text-14">${new Date(e.createdAt).toLocaleDateString()}</td>
                                      </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }
            } else {
                // For instructor and student, hide the demo tables
                const tables = document.querySelectorAll('.rounded-10.bg-white.px-24.py-24');
                tables.forEach(t => t.style.display = 'none');
            }
        }

    } catch (err) {
        console.error('Dashboard Error:', err);
    }
});
