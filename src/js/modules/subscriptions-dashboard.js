document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    if (!page.includes('dashbord-subscriptions.html')) return;

    const API_BASE = 'http://localhost:5000/api';
    const token = localStorage.getItem('fp_token') || localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'sign-in.html';
        return;
    }

    // DOM Elements
    const studentView = document.getElementById('student-subscription-view');
    const adminView = document.getElementById('admin-subscription-view');
    const fallbackView = document.getElementById('fallback-view');

    const activeSubContainer = document.getElementById('active-subscription-details');
    const studentPlansList = document.getElementById('student-plans-list');
    const adminPlansTbody = document.getElementById('admin-plans-tbody');
    const createPlanForm = document.getElementById('create-plan-form');

    // Fetch Init Data
    init();

    async function init() {
        try {
            // 1. Fetch current profile
            const profileRes = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!profileRes.ok) {
                localStorage.removeItem('fp_token');
                window.location.href = 'sign-in.html';
                return;
            }

            const profileData = await profileRes.json();
            const user = profileData.user;
            const role = user.role;

            // 2. Fetch all plans
            const plansRes = await fetch(`${API_BASE}/subscriptions/plans`);
            const plansData = await plansRes.json();
            const plans = plansData.plans || [];

            if (role === 'student') {
                studentView.classList.remove('d-none');
                renderStudentDashboard(user, plans);
            } else if (role === 'admin') {
                adminView.classList.remove('d-none');
                renderAdminDashboard(plans);
                setupAdminForm();
            } else {
                fallbackView.classList.remove('d-none');
            }

        } catch (err) {
            console.error('Initialization failed:', err);
            alert('Could not load subscription details. Please check connection.');
        }
    }

    // ==========================================
    // Student Dashboard Logic
    // ==========================================
    function renderStudentDashboard(user, plans) {
        // Render Active Plan Details
        if (!user.subscription) {
            activeSubContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning border border-warning-subtle rounded-12 p-24 bg-warning-50 text-warning-800 flex align-items-center gap-16">
                        <i class="ph-bold ph-warning-circle text-24"></i>
                        <div>
                            <h6 class="text-16 fw-semibold text-warning-800 mb-4">No Active Subscription</h6>
                            <p class="text-14 mb-0 text-warning-700">Please choose a plan below to activate your courses and live booking limits.</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const plan = user.subscription;
            const isExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date();
            
            const coursesCount = user.coursesEnrolledCount || 0;
            const coursesLimitText = plan.courseLimit === -1 ? 'Unlimited' : plan.courseLimit;
            const coursesPercent = plan.courseLimit === -1 ? 0 : Math.min(100, (coursesCount / plan.courseLimit) * 100);

            const classesCount = user.liveClassesBookedCount || 0;
            const classesLimitText = plan.liveClassLimit === -1 ? 'Unlimited' : plan.liveClassLimit;
            const classesPercent = plan.liveClassLimit === -1 ? 0 : Math.min(100, (classesCount / plan.liveClassLimit) * 100);

            activeSubContainer.innerHTML = `
                <div class="col-lg-6">
                    <div class="p-20 border border-neutral-30 rounded-12 h-100 flex flex-column justify-between bg-neutral-25">
                        <div>
                            <span class="badge ${isExpired ? 'bg-danger text-white' : 'bg-success text-white'} rounded-pill px-12 py-6 mb-12 fw-semibold">
                                ${isExpired ? 'Expired' : 'Active Plan'}
                            </span>
                            <h5 class="text-20 fw-bold text-neutral-700 mb-8">${plan.name}</h5>
                            <p class="text-14 text-neutral-400 mb-16">Price: $${plan.price} / cycle</p>
                            
                            <div class="flex flex-column gap-12 text-sm text-neutral-500">
                                <div class="flex align-items-center gap-8">
                                    <i class="ph-bold ph-calendar-blank text-main-600"></i>
                                    <span>Expires on: <strong>${new Date(user.subscriptionExpiresAt).toLocaleDateString()}</strong></span>
                                </div>
                                <div class="flex align-items-center gap-8">
                                    <i class="ph-bold ph-hourglass-high text-main-600"></i>
                                    <span>Cycle Duration: <strong>${plan.durationDays} days</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6">
                    <div class="p-20 border border-neutral-30 rounded-12 bg-neutral-25">
                        <h6 class="text-14 fw-semibold text-neutral-500 mb-20">Cycle Limit Breakdown</h6>
                        
                        <!-- Course Limit -->
                        <div class="mb-20">
                            <div class="flex justify-between text-sm mb-8">
                                <span class="fw-medium text-neutral-500">Course Enrollments Used</span>
                                <span class="fw-bold text-neutral-700">${coursesCount} / ${coursesLimitText}</span>
                            </div>
                            <div class="progress rounded-pill bg-neutral-30" style="height: 10px;">
                                <div class="progress-bar bg-main-600 rounded-pill" role="progressbar" style="width: ${plan.courseLimit === -1 ? 100 : coursesPercent}%;"></div>
                            </div>
                        </div>

                        <!-- Live Class Limit -->
                        <div>
                            <div class="flex justify-between text-sm mb-8">
                                <span class="fw-medium text-neutral-500">Live Class Bookings Used</span>
                                <span class="fw-bold text-neutral-700">${classesCount} / ${classesLimitText}</span>
                            </div>
                            <div class="progress rounded-pill bg-neutral-30" style="height: 10px;">
                                <div class="progress-bar bg-main-two-600 rounded-pill" role="progressbar" style="width: ${plan.liveClassLimit === -1 ? 100 : classesPercent}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Render Plans List to Choose From
        if (plans.length === 0) {
            studentPlansList.innerHTML = `<div class="col-12 py-24 text-center text-neutral-400">No subscription plans available right now.</div>`;
            return;
        }

        studentPlansList.innerHTML = plans.map(plan => {
            const isActive = user.subscription && user.subscription._id === plan._id;
            const courseLimitText = plan.courseLimit === -1 ? 'Unlimited' : `${plan.courseLimit}`;
            const liveLimitText = plan.liveClassLimit === -1 ? 'Unlimited' : `${plan.liveClassLimit}`;
            
            return `
                <div class="col-md-4">
                    <div class="card p-24 border ${isActive ? 'border-2 border-main-600 shadow-md' : 'border-neutral-30'} rounded-16 h-100 flex flex-column justify-between transition-03 hover-shadow-sm bg-white">
                        <div>
                            <div class="flex justify-between align-items-center mb-16">
                                <h6 class="text-18 fw-bold text-neutral-700 mb-0">${plan.name}</h6>
                                ${isActive ? '<span class="badge bg-main-600 text-white rounded-pill px-8 py-4 text-10">Active</span>' : ''}
                            </div>
                            
                            <h3 class="text-28 fw-extrabold text-neutral-800 mb-8">$${plan.price}</h3>
                            <p class="text-12 text-neutral-400 mb-24">Every ${plan.durationDays} Days</p>
                            
                            <ul class="flex flex-column gap-12 mb-32 p-0 text-sm list-unstyled text-neutral-500">
                                <li class="flex align-items-center gap-8">
                                    <i class="ph ph-check text-success text-16"></i>
                                    <span><strong>${courseLimitText}</strong> Course Enrolls</span>
                                </li>
                                <li class="flex align-items-center gap-8">
                                    <i class="ph ph-check text-success text-16"></i>
                                    <span><strong>${liveLimitText}</strong> Live Classes</span>
                                </li>
                                <li class="flex align-items-center gap-8">
                                    <i class="ph ph-check text-success text-16"></i>
                                    <span>Full Profile Settings Access</span>
                                </li>
                            </ul>
                        </div>
                        
                        <button class="btn ${isActive ? 'btn-outline-main disabled' : 'btn-main'} w-100 rounded-pill py-10 text-white subscribe-btn" data-plan-id="${plan._id}" ${isActive ? 'disabled' : ''}>
                            ${isActive ? 'Current Plan' : 'Subscribe / Upgrade'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Setup Subscription Button Click Listeners
        document.querySelectorAll('.subscribe-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const planId = e.currentTarget.getAttribute('data-plan-id');
                if (!planId) return;

                if (!confirm('Are you sure you want to subscribe to this plan? This will update your cycle and renew your active limits.')) return;

                try {
                    const res = await fetch(`${API_BASE}/subscriptions/subscribe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ planId })
                    });

                    const data = await res.json();
                    if (!res.ok) {
                        alert(data.error || 'Subscription failed');
                    } else {
                        alert(data.message || 'Subscription updated!');
                        location.reload();
                    }
                } catch (err) {
                    console.error('Subscription error:', err);
                    alert('An error occurred during subscription.');
                }
            });
        });
    }

    // ==========================================
    // Admin Dashboard Logic
    // ==========================================
    function renderAdminDashboard(plans) {
        if (plans.length === 0) {
            adminPlansTbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-24 text-neutral-400">No subscription plans defined. Add your first plan!</td>
                </tr>
            `;
            return;
        }

        adminPlansTbody.innerHTML = plans.map(plan => {
            const courseLimitText = plan.courseLimit === -1 ? 'Unlimited' : plan.courseLimit;
            const liveLimitText = plan.liveClassLimit === -1 ? 'Unlimited' : plan.liveClassLimit;
            
            return `
                <tr class="border-bottom border-neutral-30 hover-bg-neutral-20 transition-03">
                    <td class="px-20 py-16 text-14 fw-semibold text-neutral-600">${plan.name}</td>
                    <td class="px-20 py-16 text-14 text-neutral-500">$${plan.price}</td>
                    <td class="px-20 py-16 text-14 text-neutral-500">${courseLimitText}</td>
                    <td class="px-20 py-16 text-14 text-neutral-500">${liveLimitText}</td>
                    <td class="px-20 py-16 text-14 text-neutral-500">${plan.durationDays} Days</td>
                    <td class="px-20 py-16">
                        <button class="btn btn-outline-danger btn-sm rounded-pill py-4 px-12 delete-plan-btn" data-plan-id="${plan._id}">
                            <i class="ph ph-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Setup Delete plan listeners
        document.querySelectorAll('.delete-plan-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const planId = e.currentTarget.getAttribute('data-plan-id');
                if (!planId) return;

                if (!confirm('Are you sure you want to delete this subscription plan? Existing subscribed users will retain their plan details until their expiration.')) return;

                try {
                    const res = await fetch(`${API_BASE}/subscriptions/plans/${planId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await res.json();
                    if (!res.ok) {
                        alert(data.error || 'Failed to delete plan');
                    } else {
                        alert(data.message || 'Plan deleted.');
                        location.reload();
                    }
                } catch (err) {
                    console.error('Delete error:', err);
                    alert('An error occurred while deleting the plan.');
                }
            });
        });
    }

    function setupAdminForm() {
        createPlanForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('plan-name').value.trim();
            const price = parseFloat(document.getElementById('plan-price').value);
            const courseLimit = parseInt(document.getElementById('plan-course-limit').value);
            const liveClassLimit = parseInt(document.getElementById('plan-live-limit').value);
            const durationDays = parseInt(document.getElementById('plan-duration').value);

            try {
                const res = await fetch(`${API_BASE}/subscriptions/plans`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name, price, courseLimit, liveClassLimit, durationDays })
                });

                const data = await res.json();
                if (!res.ok) {
                    alert(data.error || 'Failed to create plan');
                } else {
                    alert(data.message || 'Plan created successfully!');
                    createPlanForm.reset();
                    location.reload();
                }
            } catch (err) {
                console.error('Create plan error:', err);
                alert('An error occurred while creating the plan.');
            }
        });
    }
});
