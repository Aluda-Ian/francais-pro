const fs = require('fs');
const path = require('path');

const files = ['src/dashbord-message.html', 'src/instructor-dashboard-message.html'];

for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Clear contacts list
    content = content.replace(/<div class="mt-24">[\s\S]*?<div class="flex-grow-1 ps-24">/, '<div class="mt-24" id="chat-contacts-list"></div></div><div class="flex-grow-1 ps-24" id="chat-main-window">');

    // 2. Clear messages container
    content = content.replace(/<div>\s*<div class="mt-24">\s*<div class="align-items-start flex w-100 gap-12">[\s\S]*?<button type="button" class="text-16 hover-text-main-600 transition-03 text-neutral-500">\s*<i class="ph ph-circle"><\/i>\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="flex-grow-1">/, '<div id="chat-messages-container" class="mt-24 overflow-y-auto" style="max-height: 500px; padding-right: 15px;"></div><div class="flex-grow-1">');

    // 3. Add IDs to form
    content = content.replace(/<form action="#" class="relative flex-grow-1">/g, '<form id="chat-form" action="#" class="relative flex-grow-1">');
    content = content.replace(/<input type="text" placeholder="Say Something..."/g, '<input type="text" id="chat-input" placeholder="Say Something..."');

    // 4. Update Header for chat user name
    content = content.replace(/<h6 class="text-16 mb-0 font-medium text-neutral-500">\s*Eleanor Pena\s*<\/h6>/, '<h6 class="text-16 mb-0 font-medium text-neutral-500" id="chat-current-user-name">Select a contact</h6>');

    fs.writeFileSync(fullPath, content);
    console.log('Fixed', file);
}
