/**
 * Student Bookings Calendar Module
 * Renders an interactive monthly/weekly calendar for student live class bookings.
 */

const API_BASE = 'http://localhost:5000/api';

// ── State ──────────────────────────────────────────────────────────
let currentView = 'monthly'; // 'monthly' | 'weekly'
let currentDate = new Date();
let selectedDate = null;
let allBookings = [];
let isLoading = false;

// ── Helpers ────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('fp_token') || localStorage.getItem('token');
}

function getMonthName(m) {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][m];
}

function getWeekdayName(d, short = false) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return short ? names[d].slice(0, 3) : names[d];
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function getBookingsForDate(date) {
  return allBookings.filter((b) => {
    if (!b.liveClass?.scheduledAt) return false;
    return isSameDay(new Date(b.liveClass.scheduledAt), date);
  });
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function minutesUntilClass(scheduledAt) {
  return (new Date(scheduledAt) - new Date()) / (1000 * 60);
}

// ── API ────────────────────────────────────────────────────────────
async function fetchBookings() {
  const token = getToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const data = await res.json();
    return data.bookings || [];
  } catch (err) {
    console.error('[BookingsCalendar] Fetch error:', err);
    return [];
  }
}

async function cancelBooking(bookingId) {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Cancelled by student' }),
    });
    return await res.json();
  } catch (err) {
    console.error('[BookingsCalendar] Cancel error:', err);
    return null;
  }
}

async function getJoinLink(bookingId) {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/join`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      return { error: data.error, minutesUntilStart: data.minutesUntilStart };
    }
    return await res.json();
  } catch (err) {
    console.error('[BookingsCalendar] Join error:', err);
    return null;
  }
}

// ── Renderers ──────────────────────────────────────────────────────

function renderLoading(container) {
  container.innerHTML = `
    <div class="bookings-calendar-wrapper">
      <div class="calendar-header">
        <div class="calendar-skeleton" style="width:200px;height:32px;border-radius:8px"></div>
        <div class="calendar-skeleton" style="width:180px;height:36px;border-radius:50px"></div>
      </div>
      <div class="calendar-skeleton calendar-skeleton--grid"></div>
    </div>
    <div style="margin-top:20px">
      <div class="calendar-skeleton" style="width:200px;height:24px;border-radius:8px;margin-bottom:16px"></div>
      <div class="calendar-skeleton calendar-skeleton--card"></div>
      <div class="calendar-skeleton calendar-skeleton--card"></div>
    </div>
  `;
}

function renderCalendarHeader() {
  const label =
    currentView === 'monthly'
      ? `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`
      : (() => {
          const ws = getWeekStart(currentDate);
          const we = new Date(ws);
          we.setDate(we.getDate() + 6);
          return `${ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${we.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        })();

  return `
    <div class="calendar-header">
      <h4 class="calendar-header__title">
        <i class="ph-fill ph-calendar-dots"></i>
        My Bookings
      </h4>
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div class="calendar-view-toggle">
          <button class="calendar-view-toggle__btn ${currentView === 'monthly' ? 'active' : ''}" data-view="monthly">
            <i class="ph ph-squares-four" style="margin-right:4px"></i> Monthly
          </button>
          <button class="calendar-view-toggle__btn ${currentView === 'weekly' ? 'active' : ''}" data-view="weekly">
            <i class="ph ph-columns" style="margin-right:4px"></i> Weekly
          </button>
        </div>
        <div class="calendar-nav">
          <button class="calendar-nav__btn" id="calNavPrev"><i class="ph-bold ph-caret-left"></i></button>
          <span class="calendar-nav__label">${label}</span>
          <button class="calendar-nav__btn" id="calNavNext"><i class="ph-bold ph-caret-right"></i></button>
          <button class="calendar-nav__btn" id="calNavToday" title="Go to Today" style="font-size:11px;width:auto;padding:0 12px;border-radius:50px;font-weight:700;color:#4f46e5">Today</button>
        </div>
      </div>
    </div>
  `;
}

function renderMonthlyGrid() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const today = new Date();

  // Calculate previous month days to show
  const prevMonthLast = new Date(year, month, 0);
  const prevMonthDays = prevMonthLast.getDate();

  let daysHTML = '';
  const totalCells = Math.ceil((startOffset + totalDays) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    let dayNum, dayDate, isOtherMonth = false;

    if (i < startOffset) {
      // Previous month
      dayNum = prevMonthDays - startOffset + 1 + i;
      dayDate = new Date(year, month - 1, dayNum);
      isOtherMonth = true;
    } else if (i >= startOffset + totalDays) {
      // Next month
      dayNum = i - startOffset - totalDays + 1;
      dayDate = new Date(year, month + 1, dayNum);
      isOtherMonth = true;
    } else {
      dayNum = i - startOffset + 1;
      dayDate = new Date(year, month, dayNum);
    }

    const isToday = isSameDay(dayDate, today);
    const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
    const dayBookings = getBookingsForDate(dayDate);

    let classes = 'calendar-day';
    if (isOtherMonth) classes += ' other-month';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';

    let bookingDotsHTML = '';
    if (dayBookings.length > 0) {
      const displayed = dayBookings.slice(0, 3);
      bookingDotsHTML = `<div class="calendar-day__bookings">
        ${displayed.map((b) => `
          <div class="booking-dot booking-dot--${b.status}" title="${b.liveClass?.title || 'Booking'}"></div>
        `).join('')}
      </div>`;
      if (dayBookings.length > 3) {
        bookingDotsHTML += `<span class="booking-count-badge">${dayBookings.length}</span>`;
      }
    }

    daysHTML += `
      <div class="${classes}" data-date="${dayDate.toISOString()}">
        <span class="calendar-day__number">${dayNum}</span>
        ${bookingDotsHTML}
      </div>
    `;
  }

  return `
    <div class="calendar-grid">
      <div class="calendar-grid__weekdays">
        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="calendar-grid__weekday">${d}</div>`).join('')}
      </div>
      <div class="calendar-grid__days">${daysHTML}</div>
    </div>
    ${renderLegend()}
  `;
}

function renderWeeklyView() {
  const weekStart = getWeekStart(currentDate);
  const today = new Date();

  let headerHTML = '';
  let bodyHTML = '';

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const isToday = isSameDay(day, today);
    const dayBookings = getBookingsForDate(day);

    headerHTML += `
      <div class="calendar-week__day-header ${isToday ? 'today' : ''}">
        <div class="calendar-week__day-name">${getWeekdayName(day.getDay(), true)}</div>
        <div class="calendar-week__day-num">${day.getDate()}</div>
      </div>
    `;

    let cardsHTML = '';
    if (dayBookings.length > 0) {
      cardsHTML = dayBookings.map((b) => {
        const statusClass = b.status !== 'confirmed' ? `week-booking-card--${b.status}` : '';
        return `
          <div class="week-booking-card ${statusClass}" data-booking-id="${b._id || b.id}">
            <div class="week-booking-card__time">${formatTime(b.liveClass?.scheduledAt)}</div>
            <div class="week-booking-card__title">${b.liveClass?.title || 'Live Class'}</div>
            <div class="week-booking-card__meta">${b.liveClass?.durationMinutes || 60} min · ${b.liveClass?.curriculum || ''}</div>
          </div>
        `;
      }).join('');
    }

    bodyHTML += `
      <div class="calendar-week__day-col" data-date="${day.toISOString()}">
        ${cardsHTML}
      </div>
    `;
  }

  return `
    <div class="calendar-week">
      <div class="calendar-week__header">${headerHTML}</div>
      <div class="calendar-week__body">${bodyHTML}</div>
    </div>
    ${renderLegend()}
  `;
}

function renderLegend() {
  return `
    <div class="calendar-legend">
      <div class="calendar-legend__item">
        <span class="calendar-legend__dot calendar-legend__dot--confirmed"></span>
        Confirmed
      </div>
      <div class="calendar-legend__item">
        <span class="calendar-legend__dot calendar-legend__dot--attended"></span>
        Attended
      </div>
      <div class="calendar-legend__item">
        <span class="calendar-legend__dot calendar-legend__dot--cancelled"></span>
        Cancelled
      </div>
      <div class="calendar-legend__item">
        <span class="calendar-legend__dot calendar-legend__dot--no-show"></span>
        No-show
      </div>
    </div>
  `;
}

function renderDayDetailPanel(date) {
  const bookings = getBookingsForDate(date);
  if (bookings.length === 0) {
    return `
      <div class="day-detail-panel">
        <div class="day-detail-panel__header">
          <span class="day-detail-panel__date">${formatDate(date)}</span>
          <button class="day-detail-panel__close" id="closeDayPanel"><i class="ph ph-x"></i></button>
        </div>
        <div style="text-align:center;padding:20px;color:#94a3b8">
          <i class="ph ph-calendar-blank" style="font-size:32px;display:block;margin-bottom:8px"></i>
          No bookings on this day
        </div>
      </div>
    `;
  }

  const cardsHTML = bookings.map((b) => renderBookingCard(b)).join('');
  return `
    <div class="day-detail-panel">
      <div class="day-detail-panel__header">
        <span class="day-detail-panel__date">${formatDate(date)} · ${bookings.length} booking${bookings.length > 1 ? 's' : ''}</span>
        <button class="day-detail-panel__close" id="closeDayPanel"><i class="ph ph-x"></i></button>
      </div>
      ${cardsHTML}
    </div>
  `;
}

function renderBookingCard(b) {
  const classDate = new Date(b.liveClass?.scheduledAt);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mins = minutesUntilClass(b.liveClass?.scheduledAt);
  const canJoin = mins <= 15 && mins > -(b.liveClass?.durationMinutes || 60) && b.status === 'confirmed';
  const canCancel = mins > 120 && b.status === 'confirmed';
  const duration = b.liveClass?.durationMinutes || 60;

  const instructorName = b.liveClass?.instructor?.name || 'Instructor';

  return `
    <div class="booking-card booking-card--${b.status}" data-booking-id="${b._id || b.id}">
      <div class="booking-card__date-block">
        <span class="booking-card__month">${months[classDate.getMonth()]}</span>
        <span class="booking-card__day">${classDate.getDate()}</span>
        <span class="booking-card__weekday">${weekdays[classDate.getDay()]}</span>
      </div>
      <div class="booking-card__content">
        <div class="booking-card__title">${b.liveClass?.title || 'Live Class'}</div>
        <div class="booking-card__meta-row">
          <span class="booking-card__meta"><i class="ph ph-chalkboard-teacher"></i> ${instructorName}</span>
          <span class="booking-card__meta"><i class="ph ph-clock"></i> ${duration} min</span>
        </div>
        <div class="booking-card__badges">
          <span class="booking-badge booking-badge--${b.status}">
            <i class="ph ${b.status === 'confirmed' ? 'ph-check-circle' : b.status === 'cancelled' ? 'ph-x-circle' : b.status === 'attended' ? 'ph-check-fat' : 'ph-warning'}"></i>
            ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}
          </span>
          ${b.liveClass?.curriculum ? `<span class="booking-badge booking-badge--curriculum">${b.liveClass.curriculum}</span>` : ''}
          ${b.liveClass?.level ? `<span class="booking-badge booking-badge--level">${b.liveClass.level}</span>` : ''}
        </div>
      </div>
      <div class="booking-card__actions">
        <span class="booking-card__time">${formatTime(b.liveClass?.scheduledAt)}</span>
        <span class="booking-card__duration">${duration} min session</span>
        ${canJoin ? `<button class="btn-join-class" data-booking-id="${b._id || b.id}"><i class="ph-bold ph-video-camera"></i> Join Class</button>` : ''}
        ${canCancel ? `<button class="btn-cancel-booking" data-booking-id="${b._id || b.id}" data-class-title="${b.liveClass?.title || 'this class'}"><i class="ph ph-x"></i> Cancel</button>` : ''}
      </div>
    </div>
  `;
}

function renderUpcomingBookings() {
  const now = new Date();
  const upcoming = allBookings
    .filter((b) => {
      if (b.status !== 'confirmed') return false;
      if (!b.liveClass?.scheduledAt) return false;
      return new Date(b.liveClass.scheduledAt) > now;
    })
    .sort((a, b) => new Date(a.liveClass.scheduledAt) - new Date(b.liveClass.scheduledAt));

  if (upcoming.length === 0) {
    return `
      <div class="upcoming-bookings">
        <div class="upcoming-bookings__header">
          <h4 class="upcoming-bookings__title">
            <i class="ph-fill ph-clock-countdown"></i>
            Upcoming Bookings
          </h4>
        </div>
        <div class="bookings-empty">
          <div class="bookings-empty__icon"><i class="ph ph-calendar-blank"></i></div>
          <div class="bookings-empty__title">No upcoming bookings</div>
          <div class="bookings-empty__text">You haven't booked any upcoming live classes yet. Browse available classes and book one to get started!</div>
          <a href="live-classes.html" class="bookings-empty__cta">
            <i class="ph ph-video-camera"></i> Browse Live Classes
          </a>
        </div>
      </div>
    `;
  }

  return `
    <div class="upcoming-bookings">
      <div class="upcoming-bookings__header">
        <h4 class="upcoming-bookings__title">
          <i class="ph-fill ph-clock-countdown"></i>
          Upcoming Bookings
          <span class="upcoming-bookings__count">${upcoming.length}</span>
        </h4>
      </div>
      ${upcoming.map((b) => renderBookingCard(b)).join('')}
    </div>
  `;
}

function renderCancelModal(bookingId, classTitle) {
  return `
    <div class="cancel-modal-overlay" id="cancelModalOverlay">
      <div class="cancel-modal">
        <div class="cancel-modal__icon"><i class="ph-fill ph-warning-circle"></i></div>
        <div class="cancel-modal__title">Cancel Booking?</div>
        <div class="cancel-modal__text">Are you sure you want to cancel your booking for <strong>${classTitle}</strong>? This action cannot be undone.</div>
        <div class="cancel-modal__actions">
          <button class="cancel-modal__btn cancel-modal__btn--cancel" id="cancelModalDismiss">Keep Booking</button>
          <button class="cancel-modal__btn cancel-modal__btn--confirm" id="cancelModalConfirm" data-booking-id="${bookingId}">Yes, Cancel</button>
        </div>
      </div>
    </div>
  `;
}

// ── Main Render ────────────────────────────────────────────────────
function render(container) {
  const calendarView = currentView === 'monthly' ? renderMonthlyGrid() : renderWeeklyView();
  const dayPanel = selectedDate ? renderDayDetailPanel(selectedDate) : '';
  const upcoming = renderUpcomingBookings();

  container.innerHTML = `
    <div class="bookings-calendar-wrapper">
      ${renderCalendarHeader()}
      ${calendarView}
      ${dayPanel}
    </div>
    ${upcoming}
  `;

  attachEventListeners(container);
}

// ── Event Listeners ────────────────────────────────────────────────
function attachEventListeners(container) {
  // View toggle
  container.querySelectorAll('.calendar-view-toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      selectedDate = null;
      render(container);
    });
  });

  // Navigation
  const prevBtn = container.querySelector('#calNavPrev');
  const nextBtn = container.querySelector('#calNavNext');
  const todayBtn = container.querySelector('#calNavToday');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentView === 'monthly') {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      } else {
        currentDate.setDate(currentDate.getDate() - 7);
      }
      selectedDate = null;
      render(container);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentView === 'monthly') {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 7);
      }
      selectedDate = null;
      render(container);
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      currentDate = new Date();
      selectedDate = null;
      render(container);
    });
  }

  // Day click (monthly)
  container.querySelectorAll('.calendar-day').forEach((day) => {
    day.addEventListener('click', () => {
      selectedDate = new Date(day.dataset.date);
      render(container);
    });
  });

  // Day click (weekly)
  container.querySelectorAll('.calendar-week__day-col').forEach((col) => {
    col.addEventListener('click', () => {
      selectedDate = new Date(col.dataset.date);
      render(container);
    });
  });

  // Close day panel
  const closeBtn = container.querySelector('#closeDayPanel');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      selectedDate = null;
      render(container);
    });
  }

  // Join class buttons
  container.querySelectorAll('.btn-join-class').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const bookingId = btn.dataset.bookingId;
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner" style="animation:spin 1s linear infinite"></i> Joining...';

      const result = await getJoinLink(bookingId);
      if (result?.meetLink) {
        window.open(result.meetLink, '_blank');
      } else if (result?.error) {
        alert(result.error);
      } else {
        alert('Unable to join class. Please try again.');
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="ph-bold ph-video-camera"></i> Join Class';
    });
  });

  // Cancel booking buttons
  container.querySelectorAll('.btn-cancel-booking').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookingId = btn.dataset.bookingId;
      const classTitle = btn.dataset.classTitle;
      document.body.insertAdjacentHTML('beforeend', renderCancelModal(bookingId, classTitle));
      attachCancelModalListeners(container);
    });
  });
}

function attachCancelModalListeners(calendarContainer) {
  const overlay = document.querySelector('#cancelModalOverlay');
  const dismissBtn = document.querySelector('#cancelModalDismiss');
  const confirmBtn = document.querySelector('#cancelModalConfirm');

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => overlay?.remove());
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const bookingId = confirmBtn.dataset.bookingId;
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Cancelling...';

      const result = await cancelBooking(bookingId);
      overlay?.remove();

      if (result?.message) {
        // Refresh bookings
        allBookings = await fetchBookings();
        selectedDate = null;
        render(calendarContainer);
      } else if (result?.error) {
        alert(result.error);
      } else {
        alert('Failed to cancel booking. Please try again.');
      }
    });
  }
}

// ── Dashboard Widget Renderer ──────────────────────────────────────
export function renderDashboardWidget(container) {
  const token = getToken();
  if (!token) return;

  fetch(`${API_BASE}/bookings/my?upcoming=true`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      const bookings = (data.bookings || []).slice(0, 3);

      if (bookings.length === 0) {
        container.innerHTML = `
          <div class="bookings-widget">
            <div class="bookings-widget__header">
              <span class="bookings-widget__title"><i class="ph-fill ph-calendar-dots"></i> Upcoming Classes</span>
              <a href="student-dashboard-live-classes.html" class="bookings-widget__link">View All <i class="ph ph-arrow-right"></i></a>
            </div>
            <div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px">
              <i class="ph ph-calendar-blank" style="font-size:24px;display:block;margin-bottom:6px"></i>
              No upcoming bookings
            </div>
          </div>
        `;
        return;
      }

      const itemsHTML = bookings
        .map((b) => {
          const d = new Date(b.liveClass?.scheduledAt);
          return `
            <div class="bookings-widget-item">
              <span class="bookings-widget-item__dot bookings-widget-item__dot--confirmed"></span>
              <div class="bookings-widget-item__info">
                <div class="bookings-widget-item__title">${b.liveClass?.title || 'Live Class'}</div>
                <div class="bookings-widget-item__time">${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${formatTime(b.liveClass?.scheduledAt)}</div>
              </div>
            </div>
          `;
        })
        .join('');

      container.innerHTML = `
        <div class="bookings-widget">
          <div class="bookings-widget__header">
            <span class="bookings-widget__title"><i class="ph-fill ph-calendar-dots"></i> Upcoming Classes</span>
            <a href="student-dashboard-live-classes.html" class="bookings-widget__link">View All <i class="ph ph-arrow-right"></i></a>
          </div>
          ${itemsHTML}
        </div>
      `;
    })
    .catch((err) => {
      console.error('[BookingsWidget] Error:', err);
    });
}

// ── Init ───────────────────────────────────────────────────────────
export async function initDashboardWidget() {
  const container = document.getElementById('studentBookingsWidgetRoot');
  if (!container) return;

  const token = getToken();
  if (!token) return;

  try {
    // Check user role first to ensure they are a student
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) return;
    const meData = await meRes.json();
    if (meData.user?.role !== 'student') return;

    // Show the column wrapper
    const colWrapper = document.getElementById('studentBookingsWidgetCol');
    if (colWrapper) {
      colWrapper.style.display = 'block';
    }

    renderDashboardWidget(container);
  } catch (err) {
    console.error('[BookingsCalendar] Dashboard widget init error:', err);
  }
}

export async function initBookingsCalendar() {
  // Only run on student-dashboard-live-classes page
  const pagePath = window.location.pathname;
  if (!pagePath.includes('student-dashboard-live-classes') && !pagePath.includes('dashboard-live-classes')) return;

  const container = document.getElementById('bookingsCalendarRoot');
  if (!container) return;

  renderLoading(container);

  allBookings = await fetchBookings();
  render(container);
}

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initBookingsCalendar();
  initDashboardWidget();
});
