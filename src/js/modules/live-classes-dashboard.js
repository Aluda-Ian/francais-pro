document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    if (!path.includes('live-classes.html') || !path.includes('dashboard')) return;

    const tbody = document.getElementById('live-classes-tbody');
    if (!tbody) return;

    const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
    if (!token) return;

    try {
        // 1. Get user profile
        const meRes = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!meRes.ok) return;
        const meData = await meRes.json();
        const role = meData.user.role;

        // 2. Fetch the appropriate data based on role
        let apiEndpoint = 'http://localhost:5000/api/live-classes'; // admin sees all
        if (role === 'instructor') {
            apiEndpoint = 'http://localhost:5000/api/live-classes/my-classes';
        } else if (role === 'student') {
            // For students, fetch bookings
            apiEndpoint = 'http://localhost:5000/api/bookings/my-bookings';
        }

        const res = await fetch(apiEndpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load classes</td></tr>';
            return;
        }

        const data = await res.json();
        
        let items = [];
        if (role === 'student') {
            items = data.bookings.filter(b => b.liveClass); // only bookings that have a liveClass populated
        } else {
            items = data.liveClasses || [];
        }

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-24 text-neutral-500">No live classes found.</td></tr>';
            return;
        }

        // Render rows
        tbody.innerHTML = items.map(item => {
            const classInfo = role === 'student' ? item.liveClass : item;
            const status = role === 'student' ? item.status : classInfo.status;
            const instructorName = classInfo.instructor?.name || 'Unknown';
            const date = new Date(classInfo.scheduledAt).toLocaleString();
            
            return `
                <tr class="hover-bg-neutral-20 border-bottom transition-03">
                    <td class="px-20 py-22 text-14 fw-medium">${classInfo.title}</td>
                    <td class="px-20 py-22 text-14">${instructorName}</td>
                    <td class="px-20 py-22 text-14">
                        <span class="badge ${status === 'scheduled' || status === 'confirmed' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'} px-12 py-6 rounded-pill">${status}</span>
                    </td>
                    <td class="px-20 py-22 text-14">${date}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Error fetching dashboard live classes:', err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading classes</td></tr>';
    }
});
