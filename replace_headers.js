const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const targetFiles = [
    'student-dashbord.html',
    'instructor-dashboard.html',
    'admin-dashbord.html'
];

const headerRegex = /<!-- ==================== Header Start Here ==================== -->[\s\S]*?<!-- ==================== Header End Here ==================== -->/;
const footerRegex = /<!-- ==================== Footer Start Here ==================== -->[\s\S]*?<!-- ==================== Footer End Here ==================== -->/;

targetFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace header
        if (headerRegex.test(content)) {
            content = content.replace(headerRegex, '<!-- Header Injected via JS -->\n        <div id="app-header"></div>');
        }

        // Replace footer
        if (footerRegex.test(content)) {
            content = content.replace(footerRegex, '<!-- Footer Injected via JS -->\n        <div id="app-footer"></div>');
        }

        // Inject layout.js if not already present
        if (!content.includes('layout.js')) {
            content = content.replace(/<\/body>/, '    <script src="./js/layout.js"></script>\n    </body>');
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
