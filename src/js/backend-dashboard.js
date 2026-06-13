document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
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
        // Replace user name in sidebar
        const nameElements = Array.from(document.querySelectorAll('span')).filter(el => el.textContent.includes('Welcome'));
        nameElements.forEach(el => {
            el.textContent = `Welcome ${meData.user.name},`;
        });

        const updateMetric = (label, value) => {
            document.querySelectorAll('span').forEach(el => {
                if (el.textContent.trim() === label) {
                    const h6 = el.nextElementSibling;
                    if (h6 && h6.tagName === 'H6') {
                        h6.textContent = value;
                    }
                }
            });
        };

        if (role === 'admin') {
            updateMetric('Total Courses', dashData.metrics.totalCourses);
            updateMetric('Total Students', dashData.metrics.totalStudents);
            updateMetric('Total Instructors', dashData.metrics.totalInstructors || '0');
            updateMetric('Enrolled Courses', dashData.metrics.totalEnrollments);
        } else if (role === 'student') {
            updateMetric('Enrolled Courses', dashData.metrics.totalEnrolled);
            updateMetric('Active Courses', dashData.metrics.activeCourses);
            updateMetric('Completed Courses', dashData.metrics.completedCourses);
        } else if (role === 'instructor') {
            updateMetric('Total Courses', dashData.metrics.totalCourses);
            updateMetric('Total Students Enrolled', dashData.metrics.totalStudentsEnrolled);
        }

    } catch (err) {
        console.error('Dashboard Error:', err);
    }
});
