// main css
import "../styles/app.css";

// select js
import "../vendor/js/layout.min.js";

// phospor icons js
import "../vendor/js/phosphor-icon.js";

import "./modules/chart.js";
import "./modules/counter.js";
import "./modules/data-table.js";
import "./modules/editor.js";
import "./modules/mque.js";
import "./modules/popup.js";
import "./modules/range-slider.js";
import "./modules/select.js";
import "./modules/sliders.js";
import "./modules/tilt.js";
import "./modules/wow-animation.js";
import "./modules/aos-animation.js";

import "./modules/extra.js";

// modules js
import "./modules/custom.js";
import "./modules/navigation.js";
import "./modules/auth.js";
import "./modules/blogs.js";
import "./modules/tutors.js";
import "./modules/course-grid.js";
import "./modules/dashboard-subpages.js";
import "./modules/create-course.js";
import "./backend-dashboard.js";

// bootstrap js
import * as bootstrap from "bootstrap";

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
  new bootstrap.Tooltip(el);
});
import './modules/live-classes-dashboard.js'; 
import './modules/student-bookings-calendar.js';
import './modules/settings-profile.js';
import './modules/subscriptions-dashboard.js';
import './modules/course-enroll.js';
import { initChat } from './modules/chat.js';

document.addEventListener('DOMContentLoaded', () => {
    initChat();
}); 
