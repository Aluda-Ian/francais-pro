const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const dir = 'src';
const files = fs.readdirSync(dir);

const calendarHtml = `
    <div class="bg-white rounded-16 p-24 box-shadow-sm">
        <div class="align-items-center justify-content-between mb-24 flex flex-wrap gap-8">
            <h4 class="mb-0">Live Classes Calendar</h4>
        </div>
        <div id="fp-calendar"></div>
    </div>
    
    <!-- FullCalendar CDN -->
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>
    <script src="./js/modules/live-calendar.js"></script>
`;

files.forEach(file => {
    if (file.includes('dashboard') && file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content);

        // 1. Inject sidebar link
        // Find the 'ul.dashboard-sidebar__list'
        // First check if the Calendar link is already there
        if (!$('a[href*="-dashboard-calendar.html"]').length) {
            const sidebar = $('ul.dashboard-sidebar__list');
            if (sidebar.length) {
                const rolePrefix = file.startsWith('instructor') ? 'instructor' : (file.startsWith('student') ? 'student' : null);
                
                if (rolePrefix) {
                    const calendarLinkHtml = `
                        <li class="dashboard-sidebar__item">
                            <a href="${rolePrefix}-dashboard-calendar.html" class="dashboard-sidebar__link">
                                <i class="ph ph-calendar"></i>
                                Live Classes Calendar
                            </a>
                        </li>
                    `;
                    // Append it just before the Settings or Logout link, or just after Courses
                    const coursesItem = sidebar.find('a[href*="my-courses.html"], a[href*="enrolled-courses.html"]').parent();
                    if (coursesItem.length) {
                        coursesItem.after(calendarLinkHtml);
                    } else {
                        sidebar.prepend(calendarLinkHtml);
                    }
                }
            }
        }

        // 2. If it's the calendar page itself, replace the body content and update title
        if (file === 'instructor-dashboard-calendar.html' || file === 'student-dashboard-calendar.html') {
            $('h6.text-white').text('Live Classes Calendar');
            $('.dashbord-body').html(calendarHtml);
            
            // Set active page
            $('.dashboard-sidebar__item').removeClass('activePage active');
            $(`a[href="${file}"]`).parent().addClass('activePage');
            
            // Also need to make sure the specific page has the script
            if (!$('script[src*="fullcalendar"]').length) {
                $('body').append('<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>');
                $('body').append('<script src="./js/modules/live-calendar.js"></script>');
            }
        }

        fs.writeFileSync(filePath, $.html(), 'utf8');
    }
});

console.log('Successfully injected Calendar links and created Calendar Pages!');
