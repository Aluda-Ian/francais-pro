const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const preloaderHtml = `
    <!--==================== Preloader Start ====================-->
    <div class="preloader">
        <div class="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid var(--main-600, #4f46e5); border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;"></div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    </div>
    <!--==================== Preloader End ====================-->
`;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'partials' && file !== 'vendor') {
                processDirectory(fullPath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes('class="preloader"')) {
                // Find <body ... > and insert after it
                const bodyRegex = /(<body[^>]*>)/i;
                if (bodyRegex.test(content)) {
                    content = content.replace(bodyRegex, `$1\n${preloaderHtml}`);
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Added preloader to ${file}`);
                }
            }
        }
    }
}

processDirectory(srcDir);
console.log('Preloader addition complete.');
