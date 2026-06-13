const fs = require('fs');
const cheerio = require('cheerio');

const file = 'src/instructor-dashboard-create-course.html';
const content = fs.readFileSync(file, 'utf8');
const $ = cheerio.load(content);

// Change the title inside the heading to "Add New Course"
$('h6.text-white').text('Add New Course');

// Replace the dashbord-body content
const newBody = `
    <div class="bg-white rounded-16 p-24 box-shadow-sm">
        <h4 class="mb-24">Add New Course</h4>
        <form id="create-course-form" action="javascript:void(0);">
            <div class="row gy-4">
                <div class="col-sm-12">
                    <label for="title" class="form-label text-neutral-500 mb-8">Course Title</label>
                    <input type="text" class="form-control rounded-8 bg-neutral-20 border-neutral-40 h-48" id="title" placeholder="E.g. Advanced Mathematics" required>
                </div>
                <div class="col-sm-6">
                    <label for="price" class="form-label text-neutral-500 mb-8">Price ($)</label>
                    <input type="number" class="form-control rounded-8 bg-neutral-20 border-neutral-40 h-48" id="price" placeholder="0 for Free" required>
                </div>
                <div class="col-sm-6">
                    <label for="duration" class="form-label text-neutral-500 mb-8">Duration (Weeks)</label>
                    <input type="number" class="form-control rounded-8 bg-neutral-20 border-neutral-40 h-48" id="duration" placeholder="E.g. 4" required>
                </div>
                <div class="col-sm-12">
                    <label for="description" class="form-label text-neutral-500 mb-8">Course Description</label>
                    <textarea class="form-control rounded-8 bg-neutral-20 border-neutral-40 h-100" id="description" placeholder="Describe the course..." required></textarea>
                </div>
                <div class="col-sm-12">
                    <label for="curriculum" class="form-label text-neutral-500 mb-8">Curriculum (Category)</label>
                    <input type="text" class="form-control rounded-8 bg-neutral-20 border-neutral-40 h-48" id="curriculum" placeholder="E.g. Engineering, Language, etc." required>
                </div>
                <div class="col-sm-12 mt-32">
                    <button type="submit" id="create-course-btn" class="btn btn-main rounded-pill py-12 px-32 w-100 flex justify-center items-center gap-8">
                        <i class="ph ph-plus"></i> Create Course
                    </button>
                    <p id="create-status" class="mt-16 text-center" style="display: none;"></p>
                </div>
            </div>
        </form>
    </div>
`;

$('.dashbord-body').html(newBody);

// Make sure the nav menu item for "My Courses" is active, remove active from "Account Settings"
$('.nav-menu__item, .nav-submenu__item, .dashboard-sidebar ul li').removeClass('activePage active');
// Add to My Courses
$('a[href="instructor-dashboard-my-courses.html"]').parent('li').addClass('activePage');

fs.writeFileSync(file, $.html(), 'utf8');
console.log('Successfully injected Create Course form into HTML');
