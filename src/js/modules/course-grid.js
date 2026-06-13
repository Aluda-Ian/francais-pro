document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('courses-grid');
    if (!gridContainer) return; // Only run on pages with a courses-grid

    const API_BASE = 'http://localhost:5000/api';

    try {
        const res = await fetch(`${API_BASE}/courses`);
        if (!res.ok) throw new Error('Failed to fetch courses');
        
        const data = await res.json();
        const courses = data.courses;

        gridContainer.innerHTML = ''; // clear any loading text or dummy content

        if (courses.length === 0) {
            gridContainer.innerHTML = '<div class="col-12"><p class="text-neutral-500 text-center py-40">No courses available at the moment.</p></div>';
            return;
        }

        courses.forEach(course => {
            // Generate stars HTML
            let starsHtml = '';
            const rating = course.averageRating || 5;
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) {
                    starsHtml += '<i class="ph-fill ph-star text-warning-600"></i>';
                } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                    starsHtml += '<i class="ph-fill ph-star-half text-warning-600"></i>';
                } else {
                    starsHtml += '<i class="ph ph-star text-warning-600"></i>';
                }
            }

            const instructorName = course.instructor?.name || 'Francais Pro Instructor';
            const instructorAvatar = course.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random&color=fff`;
            
            const thumbnail = course.thumbnail || './images/thumbs/course-img1.png';
            const priceHtml = course.isFree 
                ? `<span class="fw-bold text-24 text-main-600">Free</span>`
                : `<span class="fw-bold text-24 text-main-600">$${course.price}</span>`;

            const cardHtml = `
                <div class="col-lg-4 col-sm-6" data-aos="fade-up" data-aos-duration="200">
                    <div class="course-item bg-white rounded-16 border border-neutral-30 transition-2 hover-shadow-sm p-16">
                        <div class="course-item__thumb rounded-12 relative overflow-hidden">
                            <a href="course-details.html?id=${course._id}" class="w-100 h-100">
                                <img src="${thumbnail}" alt="Course Image" class="w-100 h-100 object-fit-cover">
                            </a>
                            <button type="button" class="course-item__wishlist !flex h-44 w-44 items-center justify-center bg-white rounded-circle absolute top-16 right-16 text-2xl text-neutral-500 hover-text-main-600">
                                <i class="ph ph-heart"></i>
                            </button>
                            ${course.level ? `<span class="course-item__badge bg-main-600 text-white fw-medium text-14 rounded-8 px-12 py-4 absolute top-16 left-16">${course.level}</span>` : ''}
                        </div>
                        <div class="course-item__content mt-24">
                            <div class="mb-16 flex items-center justify-between gap-8">
                                <span class="fw-medium text-14 text-neutral-500">${course.curriculum || 'General'}</span>
                                <div class="flex items-center gap-4">
                                    <span class="fw-semibold text-neutral-700">${rating.toFixed(1)}</span>
                                    <div class="flex items-center gap-4">
                                        ${starsHtml}
                                    </div>
                                    <span class="text-neutral-500 text-14">(${course.enrolledCount || 0})</span>
                                </div>
                            </div>
                            <h4 class="course-item__title mb-16 text-lg">
                                <a href="course-details.html?id=${course._id}" class="hover-text-main-600 text-line-2">${course.title}</a>
                            </h4>
                            <div class="mb-24 flex items-center gap-8">
                                <img src="${instructorAvatar}" alt="Instructor" class="h-32 w-32 rounded-circle object-fit-cover">
                                <span class="fw-medium text-14 text-neutral-500">By <a href="#" class="hover-text-main-600 text-neutral-700">${instructorName}</a></span>
                            </div>
                            <div class="flex items-center justify-between gap-8 pt-24 border-top border-neutral-30">
                                <div class="flex items-center gap-8">
                                    ${priceHtml}
                                </div>
                                <a href="course-details.html?id=${course._id}" class="btn btn-outline-main rounded-pill !inline-flex items-center gap-8 py-12 px-24">
                                    View Details
                                    <i class="ph-bold ph-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            gridContainer.insertAdjacentHTML('beforeend', cardHtml);
        });

    } catch (error) {
        console.error('Error fetching courses:', error);
        gridContainer.innerHTML = '<div class="col-12"><p class="text-danger text-center py-40">Failed to load courses. Please try again later.</p></div>';
    }
});
