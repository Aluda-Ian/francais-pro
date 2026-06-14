// Français Pro — Tutors & Booking Marketplace Logic

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:5000/api';
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    // Date/Time Formatter Helper
    const formatDateTime = (dateStr) => {
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('en-US', optionsDate),
            time: date.toLocaleTimeString('en-US', optionsTime)
        };
    };

    // Helper: Avatar Generator
    const getAvatarHtml = (tutor) => {
        if (tutor.avatarUrl && !tutor.avatarUrl.includes('ui-avatars.com')) {
            return `<img src="${tutor.avatarUrl}" alt="${tutor.name}" class="scale-hover-item__img rounded-12 cover-img transition-2 w-full h-full object-cover">`;
        }
        // Return a beautiful gradient placeholder with initials
        const initials = tutor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return `
            <div class="w-full h-full rounded-12 transition-2 flex items-center justify-center bg-gradient-to-tr from-[#002395] via-[#2748c8] to-[#ED2939]" style="min-height: 220px;">
                <span class="text-white text-4xl font-extrabold tracking-wider">${initials}</span>
            </div>
        `;
    };

    // ==========================================================
    // 1. TUTOR LISTING & SEARCH (find-tutors.html)
    // ==========================================================
    if (page === 'find-tutors.html') {
        const tutorsContainer = document.getElementById('tutors-container');
        const searchInput = document.getElementById('search-input');
        const selectCurriculum = document.getElementById('selectCurriculum');
        const selectGender = document.getElementById('selectGender');
        const locationInput = document.getElementById('location-input');
        const resetFiltersBtn = document.getElementById('reset-filters-btn');
        const resultsCount = document.getElementById('results-count');

        const fetchTutors = async () => {
            try {
                // Build Query Parameters
                const params = new URLSearchParams();
                if (searchInput && searchInput.value.trim()) params.append('search', searchInput.value.trim());
                if (selectCurriculum && selectCurriculum.value) params.append('curriculum', selectCurriculum.value);
                if (selectGender && selectGender.value) params.append('gender', selectGender.value);
                if (locationInput && locationInput.value.trim()) params.append('country', locationInput.value.trim());

                const res = await fetch(`${API_BASE}/tutors?${params.toString()}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed to fetch tutors');

                if (resultsCount) {
                    resultsCount.textContent = `Showing ${data.tutors.length} Tutor${data.tutors.length === 1 ? '' : 's'}`;
                }

                if (!data.tutors || data.tutors.length === 0) {
                    tutorsContainer.innerHTML = `
                        <div class="col-12 text-center py-40">
                            <h5 class="text-neutral-500">No tutors match your criteria.</h5>
                            <p class="text-neutral-400">Try adjusting your filters or search keywords.</p>
                        </div>
                    `;
                    return;
                }

                tutorsContainer.innerHTML = data.tutors.map(tutor => {
                    const specializationBadges = (tutor.specializations || [])
                        .slice(0, 3)
                        .map(spec => `<span class="bg-main-25 text-main-600 rounded px-12 py-4 font-semibold text-xs border border-neutral-30">${spec}</span>`)
                        .join(' ');

                    return `
                        <div class="col-sm-6">
                            <div class="scale-hover-item rounded-16 box-shadow-md h-100 bg-white p-12 border border-neutral-30 flex flex-col justify-between">
                                <div>
                                    <div class="course-item__thumb rounded-12 bg-main-25 relative overflow-hidden" style="min-height: 220px;">
                                        <a href="tutor-details.html?id=${tutor.id}" class="h-100 w-100 block">
                                            ${getAvatarHtml(tutor)}
                                        </a>
                                    </div>
                                    <div class="relative px-16 pt-24 pb-16">
                                        <h4 class="mb-8">
                                            <a href="tutor-details.html?id=${tutor.id}" class="link text-line-2 hover-text-main-600">${tutor.name}</a>
                                        </h4>
                                        <p class="text-sm text-neutral-500 mb-16 text-line-2">${tutor.bio || 'Experienced French Language Tutor specializing in IB, IGCSE & CBSE curriculum.'}</p>
                                        <div class="flex flex-wrap gap-8 mb-16">
                                            ${specializationBadges || '<span class="text-xs text-neutral-400">French Language Expert</span>'}
                                        </div>
                                        <div class="flex items-center justify-between gap-8 text-neutral-500 text-sm">
                                            <span class="flex items-center gap-4">
                                                <i class="ph ph-map-pin text-main-600 text-lg"></i>
                                                ${tutor.country || 'France'}
                                            </span>
                                            <span class="flex items-center gap-4">
                                                <i class="ph ph-translate text-main-600 text-lg"></i>
                                                ${tutor.languages ? tutor.languages.join(', ') : 'French, English'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="px-16 pb-24 pt-12 border-t border-dashed border-neutral-30 mt-auto flex items-center justify-between">
                                    <span class="text-neutral-500 text-sm">Trial Session available</span>
                                    <a href="tutor-details.html?id=${tutor.id}" class="btn btn-main rounded-pill !inline-flex items-center gap-8 py-12 px-24 text-white text-sm">
                                        View Profile & Book
                                        <i class="ph ph-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

            } catch (err) {
                console.error(err);
                tutorsContainer.innerHTML = `<div class="col-12 text-center py-40 text-danger-600">Failed to load tutors directory. Please reload.</div>`;
            }
        };

        // Attach listeners
        if (searchInput) searchInput.addEventListener('keyup', fetchTutors);
        if (selectCurriculum) selectCurriculum.addEventListener('change', fetchTutors);
        if (selectGender) selectGender.addEventListener('change', fetchTutors);
        if (locationInput) locationInput.addEventListener('keyup', fetchTutors);
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (selectCurriculum) selectCurriculum.value = '';
                if (selectGender) selectGender.value = '';
                if (locationInput) locationInput.value = '';
                fetchTutors();
            });
        }

        // Initial Fetch
        fetchTutors();
    }

    // ==========================================================
    // 2. TUTOR DETAILS & SLOT BOOKINGS (tutor-details.html)
    // ==========================================================
    if (page === 'tutor-details.html') {
        const tutorProfileCol = document.getElementById('tutor-profile-col');
        const tutorTabsContent = document.getElementById('tutor-tabs-content');
        const tutorBioText = document.getElementById('tutor-bio-text');
        
        const params = new URLSearchParams(window.location.search);
        const tutorId = params.get('id');

        const loadTutorDetails = async () => {
            if (!tutorId) {
                document.getElementById('tutor-details-section').innerHTML = `<div class="container py-120 text-center text-danger-600">No tutor specified.</div>`;
                return;
            }

            try {
                // 1. Fetch tutor info
                const tutorRes = await fetch(`${API_BASE}/tutors/${tutorId}`);
                const tutorData = await tutorRes.json();
                if (!tutorRes.ok) throw new Error(tutorData.error || 'Failed to fetch tutor details');

                const tutor = tutorData.tutor;
                document.getElementById('tutor-name-breadcrumb').textContent = tutor.name;

                // Render Left Profile Card
                tutorProfileCol.innerHTML = `
                    <div class="border-neutral-30 rounded-12 border bg-white p-8">
                        <div class="border-neutral-30 rounded-12 bg-main-25 border p-32">
                            <div class="rounded-circle aspect-ratio-1 mx-auto max-h-150 max-w-150 border border-neutral-50 p-16 overflow-hidden" style="width: 150px; height: 150px;">
                                <div class="relative w-full h-full">
                                    ${tutor.avatarUrl && !tutor.avatarUrl.includes('ui-avatars.com') ? 
                                        `<img src="${tutor.avatarUrl}" alt="${tutor.name}" class="rounded-circle aspect-ratio-1 cover-img w-full h-full object-cover">` : 
                                        `<div class="w-full h-full rounded-circle bg-gradient-to-tr from-[#002395] to-[#ED2939] flex items-center justify-center text-white font-bold text-2xl">${tutor.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>`
                                    }
                                </div>
                            </div>
                            <h4 class="mt-40 mb-16 text-center">${tutor.name}</h4>
                            <div class="my-20 flex flex-wrap items-center justify-center gap-10">
                                <span class="text-md text-neutral-500">
                                    Role: <span class="text-main-600 font-medium capitalize">${tutor.role}</span>
                                </span>
                                <span class="bg-main-600 rounded-circle h-4 w-4"></span>
                                <div class="flex items-center gap-4">
                                    <span class="text-warning-600 flex text-lg font-medium"><i class="ph-fill ph-star"></i></span>
                                    <span class="text-md text-neutral-700">4.9 <span class="text-neutral-100">(Active)</span></span>
                                </div>
                            </div>
                            <span class="border-neutral-30 my-20 block border border-dashed"></span>
                            <div class="flex-column flex gap-16 text-neutral-700 text-sm">
                                <div class="flex items-center gap-16">
                                    <span class="text-main-600 text-2xl"><i class="ph-bold ph-map-pin"></i></span>
                                    <span>${tutor.country || 'France'}</span>
                                </div>
                                <div class="flex items-center gap-16">
                                    <span class="text-main-600 text-2xl"><i class="ph-bold ph-translate"></i></span>
                                    <span>${tutor.languages ? tutor.languages.join(', ') : 'French, English'}</span>
                                </div>
                                <div class="flex items-center gap-16">
                                    <span class="text-main-600 text-2xl"><i class="ph-bold ph-envelope-simple"></i></span>
                                    <span>${tutor.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Render Tab Contents (Tuition info, qualifications, bio)
                const specsHtml = (tutor.specializations || []).map(spec => `<span class="badge-ib curriculum-badge mr-8 inline-block mb-8">${spec}</span>`).join('');
                const qualsHtml = (tutor.qualifications || []).map(qual => `
                    <li class="flex items-start gap-12 py-8 border-b border-neutral-10">
                        <i class="ph-bold ph-circle-wavy-check text-main-600 text-xl mt-4"></i>
                        <span class="font-medium text-neutral-700">${qual}</span>
                    </li>
                `).join('');

                document.getElementById('pills-tutionInfo').innerHTML = `
                    <div class="border-neutral-30 rounded-12 mt-24 border bg-white p-8">
                        <div class="border-neutral-30 rounded-12 bg-main-25 border p-32">
                            <h4 class="mb-16">Specializations & Curriculum</h4>
                            <span class="border-neutral-30 my-24 block border border-dashed"></span>
                            <div class="mb-24">${specsHtml || '<span class="text-neutral-400">General French</span>'}</div>
                            <h4 class="mb-16 mt-32">Biography</h4>
                            <p class="text-neutral-600 leading-relaxed">${tutor.bio || 'Professional French native tutor dedicated to preparing students for IB examinations, IGCSE French as a Second Language, and various boards including CBSE and national examinations.'}</p>
                        </div>
                    </div>
                `;

                document.getElementById('pills-qualification').innerHTML = `
                    <div class="border-neutral-30 rounded-12 mt-24 border bg-white p-8">
                        <div class="border-neutral-30 rounded-12 bg-main-25 border p-32">
                            <h4 class="mb-16">Academic & Professional Credentials</h4>
                            <span class="border-neutral-30 my-24 block border border-dashed"></span>
                            <ul class="flex flex-col gap-12">${qualsHtml || '<li class="text-neutral-500">Certified Native French Instructor</li>'}</ul>
                        </div>
                    </div>
                `;

                // 2. Fetch available scheduled booking slots (classes) for this tutor
                const slotsRes = await fetch(`${API_BASE}/tutors/${tutorId}/slots`);
                const slotsData = await slotsRes.json();

                const slotsContainer = document.getElementById('pills-slots');
                if (!slotsRes.ok || !slotsData.slots || slotsData.slots.length === 0) {
                    slotsContainer.innerHTML = `
                        <div class="border-neutral-30 rounded-12 mt-24 border bg-white p-8">
                            <div class="border-neutral-30 rounded-12 bg-main-25 border p-32 text-center">
                                <h5 class="text-neutral-500 mb-8">No session slots scheduled.</h5>
                                <p class="text-neutral-400">Please check back later or contact support to request a custom slot.</p>
                            </div>
                        </div>
                    `;
                } else {
                    const slots = slotsData.slots;
                    
                    // Style Injection for Calendar Grid
                    const styleTag = document.createElement('style');
                    styleTag.innerHTML = `
                        .calendar-widget-wrapper {
                            margin-top: 24px;
                        }
                        .grid-cols-7 {
                            display: grid;
                            grid-template-columns: repeat(7, 1fr);
                        }
                        .calendar-grid-labels {
                            font-size: 11px;
                            font-weight: 700;
                            color: #a1a1aa;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            padding-bottom: 8px;
                        }
                        .calendar-grid {
                            border-top: 1px solid #e4e4e7;
                            padding-top: 12px;
                        }
                        .calendar-day-cell {
                            background-color: #f8f9ff;
                            border: 1px solid #e4e4e7;
                            border-radius: 12px;
                            min-height: 80px;
                            padding: 8px;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            cursor: pointer;
                            position: relative;
                            transition: all 0.2s ease;
                        }
                        .calendar-day-cell:hover {
                            border-color: #1754bf;
                            transform: translateY(-1px);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
                        }
                        .calendar-day-cell.selected {
                            background-color: #1754bf !important;
                            border-color: #1754bf !important;
                            color: white !important;
                        }
                        .calendar-day-cell.selected .day-num {
                            color: white !important;
                        }
                        .calendar-day-cell.selected .slot-count {
                            background-color: rgba(255,255,255,0.2) !important;
                            color: white !important;
                        }
                        .calendar-day-cell.other-month {
                            opacity: 0.4;
                            background-color: #f4f4f5;
                        }
                        .day-num {
                            font-weight: 700;
                            font-size: 14px;
                            color: #27272a;
                        }
                        .slot-indicator {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-top: 4px;
                        }
                        .slot-count {
                            background-color: rgba(23, 84, 191, 0.1);
                            color: #1754bf;
                            font-size: 10px;
                            font-weight: 800;
                            padding: 2px 6px;
                            border-radius: 50px;
                            text-transform: uppercase;
                            letter-spacing: 0.2px;
                        }
                        .view-toggle-btn {
                            border: none !important;
                            background: transparent;
                            color: #71717a;
                        }
                        .view-toggle-btn.active {
                            background-color: #1754bf !important;
                            color: white !important;
                        }
                        .calendar-widget-wrapper .nav-btn {
                            width: 32px;
                            height: 32px;
                            border-radius: 50% !important;
                            padding: 0;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                        }
                    `;
                    document.head.appendChild(styleTag);

                    // Render Calendar Shell
                    slotsContainer.innerHTML = `
                        <div class="calendar-widget-wrapper">
                            <div class="border-neutral-30 rounded-12 border bg-white p-8">
                                <div class="border-neutral-30 rounded-12 bg-main-25 border p-20 sm:p-32">
                                    <div class="calendar-widget">
                                        <!-- Header controls -->
                                        <div class="calendar-widget__header flex flex-column sm:flex-row justify-between align-items-center gap-16 mb-24 pb-16 border-bottom border-neutral-20">
                                            <div class="flex align-items-center gap-16">
                                                <button class="nav-btn btn btn-outline-main btn-sm rounded-circle flex items-center justify-center" id="prev-btn" style="width:32px; height:32px;">
                                                    <i class="ph-bold ph-caret-left"></i>
                                                </button>
                                                <h5 class="mb-0 fw-bold text-neutral-700 text-18" id="calendar-title" style="min-width: 140px; text-align: center;"></h5>
                                                <button class="nav-btn btn btn-outline-main btn-sm rounded-circle flex items-center justify-center" id="next-btn" style="width:32px; height:32px;">
                                                    <i class="ph-bold ph-caret-right"></i>
                                                </button>
                                            </div>
                                            <div class="flex align-items-center gap-8 bg-neutral-20 p-4 rounded-pill border">
                                                <button class="view-toggle-btn btn btn-sm rounded-pill px-16 py-6 font-medium text-13 active" data-view="month" id="toggle-month-btn">Month</button>
                                                <button class="view-toggle-btn btn btn-sm rounded-pill px-16 py-6 font-medium text-13" data-view="week" id="toggle-week-btn">Week</button>
                                            </div>
                                        </div>

                                        <!-- Weekday labels -->
                                        <div class="calendar-grid-labels grid-cols-7 text-center text-xs font-semibold text-neutral-400 mb-8">
                                            <div>Sun</div>
                                            <div>Mon</div>
                                            <div>Tue</div>
                                            <div>Wed</div>
                                            <div>Thu</div>
                                            <div>Fri</div>
                                            <div>Sat</div>
                                        </div>

                                        <!-- Days Grid -->
                                        <div class="calendar-grid grid-cols-7 gap-8" id="calendar-days-grid"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Available Slots List for selected day -->
                            <div class="border-neutral-30 rounded-12 mt-24 border bg-white p-8">
                                <div class="border-neutral-30 rounded-12 bg-main-25 border p-20 sm:p-32">
                                    <div class="align-items-center justify-content-between mb-24 flex flex-wrap gap-8">
                                        <h4 class="mb-0 text-18 fw-bold text-neutral-700">Available Slots on <span id="selected-day-label" class="text-main-600"></span></h4>
                                    </div>
                                    <div class="flex flex-col gap-16" id="selected-day-slots-list"></div>
                                </div>
                            </div>
                        </div>
                    `;

                    // State Variables
                    let currentView = 'month'; // 'month' or 'week'
                    let focusedDate = new Date();
                    
                    // Auto-focus the earliest slot date if available
                    if (slots.length > 0) {
                        const dates = slots.map(s => new Date(s.scheduledAt));
                        focusedDate = new Date(Math.min(...dates));
                    }
                    let selectedDateStr = focusedDate.toDateString();

                    // Render Calendar Content & Slots Function
                    const renderCalendar = () => {
                        const daysGrid = document.getElementById('calendar-days-grid');
                        const calendarTitle = document.getElementById('calendar-title');
                        const selectedDayLabel = document.getElementById('selected-day-label');
                        const slotsListContainer = document.getElementById('selected-day-slots-list');

                        // Clean grid first
                        daysGrid.innerHTML = '';

                        const year = focusedDate.getFullYear();
                        const month = focusedDate.getMonth();
                        const cells = [];

                        if (currentView === 'month') {
                            // Update Month/Year title
                            const monthName = focusedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                            calendarTitle.textContent = monthName;

                            const firstDay = new Date(year, month, 1);
                            const lastDay = new Date(year, month + 1, 0);
                            const startDayIndex = firstDay.getDay();
                            const numDays = lastDay.getDate();

                            // Previous month trailing days
                            const prevMonthLastDay = new Date(year, month, 0).getDate();
                            for (let i = startDayIndex - 1; i >= 0; i--) {
                                cells.push({
                                    date: new Date(year, month - 1, prevMonthLastDay - i),
                                    isCurrentMonth: false
                                });
                            }

                            // Current month days
                            for (let d = 1; d <= numDays; d++) {
                                cells.push({
                                    date: new Date(year, month, d),
                                    isCurrentMonth: true
                                });
                            }

                            // Next month leading days (fill 42 cells)
                            const trailingCount = 42 - cells.length;
                            for (let d = 1; d <= trailingCount; d++) {
                                cells.push({
                                    date: new Date(year, month + 1, d),
                                    isCurrentMonth: false
                                });
                            }
                        } else {
                            // Week view - get start of week (Sunday)
                            const startOfWeek = new Date(focusedDate);
                            startOfWeek.setDate(focusedDate.getDate() - focusedDate.getDay());

                            // Update active week range title
                            const startStr = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const endOfWeek = new Date(startOfWeek);
                            endOfWeek.setDate(startOfWeek.getDate() + 6);
                            const endStr = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            calendarTitle.textContent = `${startStr} - ${endStr}`;

                            for (let i = 0; i < 7; i++) {
                                const d = new Date(startOfWeek);
                                d.setDate(startOfWeek.getDate() + i);
                                cells.push({
                                    date: d,
                                    isCurrentMonth: true
                                });
                            }
                        }

                        // Render day cells in grid
                        cells.forEach(cell => {
                            const dateStr = cell.date.toDateString();
                            const isSelected = dateStr === selectedDateStr;
                            
                            // Find slots on this day
                            const daySlots = slots.filter(s => new Date(s.scheduledAt).toDateString() === dateStr);
                            const hasSlots = daySlots.length > 0;

                            const cellEl = document.createElement('div');
                            cellEl.className = `calendar-day-cell ${isSelected ? 'selected' : ''} ${!cell.isCurrentMonth ? 'other-month' : ''}`;
                            
                            let indicatorHtml = '';
                            if (hasSlots) {
                                indicatorHtml = `
                                    <div class="slot-indicator">
                                        <span class="slot-count">${daySlots.length} slot${daySlots.length > 1 ? 's' : ''}</span>
                                    </div>
                                `;
                            }

                            cellEl.innerHTML = `
                                <span class="day-num">${cell.date.getDate()}</span>
                                ${indicatorHtml}
                            `;

                            cellEl.addEventListener('click', () => {
                                selectedDateStr = dateStr;
                                // If user clicked day from another month, focus month
                                if (!cell.isCurrentMonth) {
                                    focusedDate = new Date(cell.date);
                                }
                                renderCalendar();
                            });

                            daysGrid.appendChild(cellEl);
                        });

                        // Render selected day slots
                        const selectedDateObj = new Date(selectedDateStr);
                        selectedDayLabel.textContent = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                        const currentDaySlots = slots.filter(s => new Date(s.scheduledAt).toDateString() === selectedDateStr);

                        if (currentDaySlots.length === 0) {
                            slotsListContainer.innerHTML = `
                                <div class="text-center py-40 text-neutral-400">
                                    <i class="ph ph-calendar-blank text-32 mb-8 block text-neutral-300"></i>
                                    <span>No slots scheduled on this date. Select another day with a slot indicator above.</span>
                                </div>
                            `;
                        } else {
                            slotsListContainer.innerHTML = currentDaySlots.map(slot => {
                                const { time } = formatDateTime(slot.scheduledAt);
                                return `
                                    <div class="bg-white border border-neutral-30 rounded-12 p-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-16 live-class-card">
                                        <div>
                                            <span class="badge-ib curriculum-badge mb-8 inline-block">${slot.curriculum} (${slot.level})</span>
                                            <h5 class="mb-8">${slot.title}</h5>
                                            <div class="flex flex-wrap items-center gap-16 text-neutral-500 text-sm">
                                                <span class="flex items-center gap-4"><i class="ph ph-clock"></i> ${time} (${slot.durationMinutes} min)</span>
                                                <span class="flex items-center gap-4"><i class="ph ph-users"></i> ${slot.spotsRemaining} spots left</span>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-16 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-12 md:pt-0">
                                            <span class="text-main-600 font-extrabold text-2xl">$${slot.price}</span>
                                            <button class="book-session-btn btn btn-main py-12 px-24 text-white rounded-pill" data-id="${slot._id}" data-title="${slot.title}">
                                                Book Slot
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('');

                            // Bind session booking listeners
                            bindBookingListeners();
                        }
                    };

                    // Function to bind click listeners on dynamically created slot book buttons
                    const bindBookingListeners = () => {
                        document.querySelectorAll('.book-session-btn').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
                                if (!token) {
                                    alert('Please sign in to book a session slot with this tutor.');
                                    window.location.href = `sign-in.html?redirect=tutor-details.html?id=${tutorId}`;
                                    return;
                                }

                                const slotId = e.currentTarget.dataset.id;
                                const slotTitle = e.currentTarget.dataset.title;

                                if (!confirm(`Are you sure you want to book: "${slotTitle}"?`)) return;

                                e.currentTarget.disabled = true;
                                e.currentTarget.textContent = 'Booking...';

                                try {
                                    const bookRes = await fetch(`${API_BASE}/bookings`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ liveClassId: slotId })
                                    });

                                    const bookData = await bookRes.json();
                                    if (!bookRes.ok) throw new Error(bookData.error || 'Booking failed.');

                                    alert(bookData.message || '🎉 Booking confirmed successfully! Google Calendar invite sent.');
                                    window.location.href = 'dashboard.html';
                                } catch (err) {
                                    alert(err.message);
                                    e.currentTarget.disabled = false;
                                    e.currentTarget.textContent = 'Book Slot';
                                }
                            });
                        });
                    };

                    // Setup Calendar Navigation Listeners
                    document.getElementById('prev-btn').addEventListener('click', () => {
                        if (currentView === 'month') {
                            focusedDate.setMonth(focusedDate.getMonth() - 1);
                        } else {
                            focusedDate.setDate(focusedDate.getDate() - 7);
                        }
                        renderCalendar();
                    });

                    document.getElementById('next-btn').addEventListener('click', () => {
                        if (currentView === 'month') {
                            focusedDate.setMonth(focusedDate.getMonth() + 1);
                        } else {
                            focusedDate.setDate(focusedDate.getDate() + 7);
                        }
                        renderCalendar();
                    });

                    // Setup View Toggle Listeners
                    document.getElementById('toggle-month-btn').addEventListener('click', () => {
                        currentView = 'month';
                        document.getElementById('toggle-month-btn').classList.add('active');
                        document.getElementById('toggle-week-btn').classList.remove('active');
                        renderCalendar();
                    });

                    document.getElementById('toggle-week-btn').addEventListener('click', () => {
                        currentView = 'week';
                        document.getElementById('toggle-week-btn').classList.add('active');
                        document.getElementById('toggle-month-btn').classList.remove('active');
                        renderCalendar();
                    });

                    // Initial Render
                    renderCalendar();
                }

            } catch (err) {
                console.error(err);
                document.getElementById('tutor-details-section').innerHTML = `<div class="container py-120 text-center text-danger-600">${err.message}</div>`;
            }
        };

        loadTutorDetails();
    }
});
