#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', 'Ai_Mentor', 'frontend', 'roadmap', 'dist');
const PORT = Number(process.env.ROADMAP_PORT || 5173);
const HOST = process.env.ROADMAP_HOST || '0.0.0.0';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safePathFromUrl(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, `http://${HOST}:${PORT}`).pathname);
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const resolvedPath = path.normalize(path.join(rootDir, requestedPath));

  if (!resolvedPath.startsWith(rootDir)) {
    return null;
  }

  return { pathname, filePath: resolvedPath };
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const safePath = safePathFromUrl(req.url || '/');

  if (!safePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath.filePath, (statErr, stats) => {
    if (!statErr && stats.isFile()) {
      sendFile(res, safePath.filePath);
      return;
    }

    if (path.extname(safePath.pathname)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    sendFile(res, path.join(rootDir, 'index.html'));
  });
});

server.listen(PORT, HOST, () => {
  console.log(`AI Mentor roadmap bundle running at http://${HOST}:${PORT}`);
  console.log(`Serving: ${rootDir}`);
});