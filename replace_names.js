const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.html');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace "Welcome Henry," with "Welcome <span class="user-display-name">Guest</span>,"
    let newContent = content.replace(/Welcome Henry,/g, 'Welcome <span class="user-display-name">Guest</span>,');
    
    // Replace standalone "Courtney Henry" with "<span class="user-display-name">Courtney Henry</span>"
    // Wait, earlier the user said "remove any dumy content". I'll just change Courtney Henry to <span class="user-display-name">Guest</span>
    newContent = newContent.replace(/Courtney Henry/g, '<span class="user-display-name">Guest</span>');
    
    // Replace placeholder="Henry" with placeholder="Name"
    newContent = newContent.replace(/placeholder="Henry"/g, 'placeholder="Name"');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedFiles++;
    }
});

console.log(`Updated dummy names in ${changedFiles} files.`);
