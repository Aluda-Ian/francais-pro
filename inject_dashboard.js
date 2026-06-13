const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const targetFiles = [
    'student-dashbord.html',
    'instructor-dashboard.html',
    'admin-dashbord.html'
];

targetFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        if (!content.includes('backend-dashboard.js')) {
            content = content.replace(/<\/body>/, '    <script src="./js/backend-dashboard.js"></script>\n    </body>');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Added backend-dashboard.js to ${file}`);
        } else {
            console.log(`backend-dashboard.js already present in ${file}`);
        }
    }
});
