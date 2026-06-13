const fs = require('fs');
const path = require('path');

const signinPath = path.join(__dirname, 'src', 'sign-in.html');
if (fs.existsSync(signinPath)) {
    let content = fs.readFileSync(signinPath, 'utf8');
    if (!content.includes('auth-login.js')) {
        content = content.replace(/<\/body>/, '    <script src="./js/auth-login.js"></script>\n    </body>');
        fs.writeFileSync(signinPath, content, 'utf8');
        console.log('Added auth-login.js to sign-in.html');
    } else {
        console.log('auth-login.js already present in sign-in.html');
    }
}
