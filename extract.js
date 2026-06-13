const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'src', 'index.html');
const partialsDir = path.join(__dirname, 'src', 'partials');

const lines = fs.readFileSync(indexHtmlPath, 'utf8').split('\n');

// Extract Header (Lines 533 to 966, 0-indexed: 532 to 965 -> slice(532, 966))
const headerContent = lines.slice(532, 966).join('\n');

// Extract Footer (Lines 4463 to 4655, 0-indexed: 4462 to 4654 -> slice(4462, 4655))
const footerContent = lines.slice(4462, 4655).join('\n');

if (!fs.existsSync(partialsDir)) {
  fs.mkdirSync(partialsDir, { recursive: true });
}

fs.writeFileSync(path.join(partialsDir, 'header.html'), headerContent, 'utf8');
fs.writeFileSync(path.join(partialsDir, 'footer.html'), footerContent, 'utf8');

console.log('Extraction complete. Header length:', headerContent.length, 'Footer length:', footerContent.length);
