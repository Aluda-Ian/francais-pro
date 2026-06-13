document.addEventListener('DOMContentLoaded', async () => {
    const isCourseDetailsPage = document.querySelector('.course-details');
    if (!isCourseDetailsPage) return;

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId) {
        console.error('No course ID provided in URL');
        return;
    }

    const API_BASE = 'http://localhost:5000/api';

    try {
        const res = await fetch(`${API_BASE}/courses/${courseId}`);
        if (!res.ok) throw new Error('Failed to fetch course details');
        
        const data = await res.json();
        const course = data.course;

        // Populate basic course info
        const titleEl = document.querySelector('.course-details__title');
        if (titleEl) titleEl.textContent = course.title;
        
        const descEl = document.querySelector('.course-details__desc');
        if (descEl) descEl.textContent = course.description || course.shortDescription;

        const priceEl = document.querySelector('.course-details__sidebar h2');
        if (priceEl) {
            priceEl.textContent = course.isFree ? 'Free' : `$${course.price}`;
        }

        const levelEl = document.querySelector('.course-details__meta .level');
        if (levelEl) levelEl.textContent = course.level;

        const enrolledEl = document.querySelector('.course-details__meta .enrolled');
        if (enrolledEl) enrolledEl.textContent = `${course.enrolledCount || 0} Students Enrolled`;

        // Populate Instructor Info
        const instructorNameEls = document.querySelectorAll('.instructor-name');
        instructorNameEls.forEach(el => el.textContent = course.instructor?.name || 'Instructor');

        // Populate Curriculum (Modules)
        const curriculumContainer = document.querySelector('#accordionExample');
        if (curriculumContainer && course.modules) {
            curriculumContainer.innerHTML = '';
            course.modules.forEach((mod, index) => {
                const accordionItem = `
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${index}">
                                ${mod.title}
                            </button>
                        </h2>
                        <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#accordionExample">
                            <div class="accordion-body">
                                <ul class="lesson-list">
                                    ${mod.lessons.map(lesson => `
                                        <li class="flex items-center justify-between gap-8 mb-12">
                                            <div class="flex items-center gap-8">
                                                <i class="ph-bold ph-play-circle text-main-600"></i>
                                                <span class="text-neutral-700">${lesson.title}</span>
                                            </div>
                                            <span class="text-neutral-500">${lesson.duration || '0:00'}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
                curriculumContainer.insertAdjacentHTML('beforeend', accordionItem);
            });
        }

    } catch (error) {
        console.error('Error fetching course details:', error);
    }
});
