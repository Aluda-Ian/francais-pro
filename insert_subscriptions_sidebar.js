const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

const subscriptionLi = `                                <li class="mb-8" data-allowed-roles="student,admin">
                                    <a href="dashbord-subscriptions.html" class="align-items-center text-14 hover-bg-main-600 hover-text-white rounded-12 item-hover flex flex-wrap gap-8 px-24 py-10 font-medium text-neutral-500">
                                        <span class="text-16 text-main-600 item-hover__text transition-03">
                                            <i class="ph ph-cardholder"></i>
                                        </span>
                                        Subscriptions
                                    </a>
                                </li>`;

files.forEach(file => {
    const filePath = path.join(srcDir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if it doesn't have a dashboard sidebar or already has subscriptions link
    if (!html.includes('dashboard-sidebar') && !html.includes('<!-- ========Dashdord Sidebar start======== -->')) {
        return;
    }
    
    if (html.includes('dashbord-subscriptions.html')) {
        console.log(`Already exists in: ${file}`);
        return;
    }

    // Find the Courses item to insert after it
    const coursesRegex = /(<li[^>]*>\s*<a\b[^>]*href="dashbord-courses\.html"[^>]*>[\s\S]*?<\/a>\s*<\/li>)/i;
    let match = html.match(coursesRegex);

    if (match) {
        html = html.replace(match[0], `${match[0]}\n${subscriptionLi}`);
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`Updated: ${file}`);
    } else {
        // Fallback: try inserting after settings link
        const settingsRegex = /(<li[^>]*>\s*<a\b[^>]*href="dashbord-settings\.html"[^>]*>[\s\S]*?<\/a>\s*<\/li>)/i;
        match = html.match(settingsRegex);
        if (match) {
            html = html.replace(match[0], `${subscriptionLi}\n${match[0]}`);
            fs.writeFileSync(filePath, html, 'utf8');
            console.log(`Updated (via Settings): ${file}`);
        } else {
            console.log(`Could not insert in: ${file}`);
        }
    }
});
console.log('Sidebar injection completed.');
