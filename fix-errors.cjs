const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'apps', 'api', 'routes');

function fixErrorMessages(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace `error: error.message` -> `error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message`
  content = content.replace(/error:\s*error\.message/g, "error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message");
  content = content.replace(/error:\s*e\.message/g, "error: process.env.NODE_ENV === 'production' ? 'Internal server error' : e.message");
  
  // Specific one for auth.js line 159: error?.message
  content = content.replace(/detail:\s*error\?\.message\s*\|\|\s*''/g, "detail: process.env.NODE_ENV === 'production' ? '' : (error?.message || '')");
  
  fs.writeFileSync(filePath, content, 'utf8');
}

fs.readdirSync(directoryPath).forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.ts')) {
    fixErrorMessages(path.join(directoryPath, file));
  }
});
console.log('Fixed error handlers in routes.');
