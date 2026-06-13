document.addEventListener('DOMContentLoaded', async () => {
    const calendarEl = document.getElementById('fp-calendar');
    if (!calendarEl) return;

    const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
    const userJson = localStorage.getItem('fp_user');
    
    if (!token || !userJson) return;

    const user = JSON.parse(userJson);
    const isInstructor = user.role === 'instructor';
    const API_BASE = 'http://localhost:5000/api';

    let events = [];

    try {
        if (isInstructor) {
            // Fetch instructor's live classes
            const res = await fetch(`${API_BASE}/live-classes/my-classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.liveClasses) {
                events = data.liveClasses.map(cls => ({
                    id: cls._id,
                    title: cls.title,
                    start: cls.scheduledAt,
                    end: new Date(new Date(cls.scheduledAt).getTime() + (cls.durationMinutes * 60000)).toISOString(),
                    backgroundColor: cls.status === 'scheduled' ? '#002395' : (cls.status === 'cancelled' ? '#ED2939' : '#00b894'),
                    borderColor: 'transparent',
                    extendedProps: {
                        description: cls.description,
                        curriculum: cls.curriculum,
                        level: cls.level,
                        meetLink: cls.googleMeetLink,
                        status: cls.status,
                        spots: Math.max(0, cls.maxStudents - (cls.enrolledStudents?.length || 0))
                    }
                }));
            }
        } else {
            // Fetch student's bookings
            const res = await fetch(`${API_BASE}/bookings/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.bookings) {
                events = data.bookings.map(booking => {
                    const cls = booking.liveClass;
                    if (!cls) return null;
                    return {
                        id: cls._id,
                        title: cls.title,
                        start: cls.scheduledAt,
                        end: new Date(new Date(cls.scheduledAt).getTime() + (cls.durationMinutes * 60000)).toISOString(),
                        backgroundColor: booking.status === 'confirmed' ? '#00b894' : '#ED2939',
                        borderColor: 'transparent',
                        extendedProps: {
                            curriculum: cls.curriculum,
                            level: cls.level,
                            meetLink: cls.googleMeetLink,
                            status: booking.status,
                            instructor: cls.instructor?.name || 'Tutor'
                        }
                    };
                }).filter(Boolean);
            }
        }

        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events,
            eventClick: function(info) {
                // We could open a modal here, but for now just showing basic info
                const props = info.event.extendedProps;
                let msg = `Class: ${info.event.title}\n`;
                msg += `Time: ${info.event.start.toLocaleString()}\n`;
                msg += `Status: ${props.status.toUpperCase()}\n`;
                
                if (props.meetLink && props.status !== 'cancelled') {
                    if (confirm(`${msg}\nDo you want to join the Google Meet now?`)) {
                        window.open(props.meetLink, '_blank');
                    }
                } else {
                    alert(msg);
                }
            }
        });

        calendar.render();

    } catch (error) {
        console.error('Failed to load calendar events:', error);
        calendarEl.innerHTML = '<div class="text-danger p-24">Failed to load calendar events.</div>';
    }
});
