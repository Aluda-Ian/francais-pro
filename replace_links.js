const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.html');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/instructor-dashboard\.html/g, 'dashboard.html')
        .replace(/student-dashbord\.html/g, 'dashboard.html')
        .replace(/admin-dashbord\.html/g, 'dashboard.html');
        
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files.`);
