const fs = require('fs');
const glob = require('glob');

const files = glob.sync('k:/Brands/fp/fp system/src/**/*.html');

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    // 1. Replace Title
    content = content.replace(/<title>[\s\S]*?EduAll[\s\S]*?<\/title>/g, '<title>Français Pro | Learning Management System</title>');

    // 2. Replace Meta Description
    content = content.replace(/content="LMS, Tutors, Education & Online Course Tailwind CSS Template"/g, 'content="Français Pro Learning Management System"');

    // 3. Replace text EduAll inside tags (e.g. copyright, emails)
    content = content.replace(/>\s*EduAll\s*</g, '>Français Pro<');
    content = content.replace(/eduAll@gmail\.com/gi, 'contact@francaispro.com');

    // 4. Any lingering raw EduAll texts (be careful not to break URLs or classes, though usually it's just text)
    // Only replacing when it's capitalized like EduAll in text context.
    content = content.replace(/EduAll/g, 'Français Pro');

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Updated branding in ${f}`);
    }
});
console.log("Branding update complete.");
