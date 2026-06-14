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

        // 2. Hide tutor column header if instructor
        if (role === 'instructor') {
            const thTutor = document.getElementById('th-tutor-name');
            if (thTutor) thTutor.style.display = 'none';
        }

        // 3. Fetch bookings (scoped on backend based on role)
        const res = await fetch('http://localhost:5000/api/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-24">Failed to load bookings</td></tr>';
            return;
        }

        const data = await res.json();
        const bookings = data.bookings || [];

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-24 text-neutral-500">No bookings found.</td></tr>';
            return;
        }

        // 4. Render rows
        tbody.innerHTML = bookings.map(b => {
            const studentName = b.student?.name || 'Unknown Student';
            const tutorName = b.liveClass?.instructor?.name || 'Unknown Tutor';
            const classTitle = b.liveClass?.title || 'Unknown Class';
            const time = b.liveClass?.scheduledAt ? new Date(b.liveClass.scheduledAt).toLocaleString() : 'N/A';
            const status = b.status || 'N/A';

            // Badge color based on status
            let badgeClass = 'bg-neutral-50 text-neutral-600';
            if (status === 'confirmed') badgeClass = 'bg-success-50 text-success-600';
            else if (status === 'cancelled') badgeClass = 'bg-danger-50 text-danger-600';
            else if (status === 'attended') badgeClass = 'bg-info-50 text-info-600';
            else if (status === 'postponed') badgeClass = 'bg-warning-50 text-warning-600';

            const tutorTd = role === 'instructor' ? '' : `<td class="px-20 py-22 text-14">${tutorName}</td>`;

            return `
                <tr class="hover-bg-neutral-20 border-bottom transition-03">
                    <td class="px-20 py-22 text-14 fw-medium">${studentName}</td>
                    ${tutorTd}
                    <td class="px-20 py-22 text-14">${classTitle}</td>
                    <td class="px-20 py-22 text-14">${time}</td>
                    <td class="px-20 py-22 text-14">
                        <span class="badge ${badgeClass} px-12 py-6 rounded-pill text-capitalize">${status}</span>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Error fetching dashboard bookings:', err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-24">Error loading bookings</td></tr>';
    }
});
