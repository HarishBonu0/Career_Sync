const http = require('http');
const fs = require('fs');
const path = require('path');

// Parse command line arguments for --port and --host
const args = process.argv.slice(2);
let PORT = process.env.PORT || 3001;
let HOST = '0.0.0.0';

args.forEach((arg, i) => {
  if (arg === '--port' && args[i + 1]) {
    PORT = parseInt(args[i + 1], 10) || PORT;
  }
  if (arg === '--host' && args[i + 1]) {
    HOST = args[i + 1];
  }
});

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Normalize URL
  let pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  
  // Try to serve the requested file from root first
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (!statErr && stats.isFile()) {
      // File found, serve it
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        
        const ext = path.extname(filePath);
        const contentTypes = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
          '.ttf': 'font/ttf',
          '.eot': 'application/vnd.ms-fontobject'
        };
        
        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    } else {
      // File not found, serve index.html for SPA routing (except for explicit file requests)
      const hasExtension = path.extname(pathname) !== '';
      
      if (hasExtension) {
        // Explicit file request that doesn't exist
        res.writeHead(404);
        res.end('404 - File not found');
        return;
      }
      
      // SPA routing: serve index.html for all routes without extensions
      const indexPath = path.join(__dirname, 'index.html');
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🌐 Frontend server running at http://${HOST}:${PORT}`);
  console.log(`📝 Skill Evaluator is ready!`);
  console.log(`\nBackend API: http://localhost:5000`);
  console.log(`Frontend: http://localhost:${PORT}`);
});
