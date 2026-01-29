import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting CareerOS Reverse Proxy Server...\n');

// API Backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API] ${req.method} ${req.url} → http://localhost:5000${req.url}`);
  }
}));

// Course Generator
app.use('/course-generator', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/course-generator': '/'
  },
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Course Gen] ${req.method} ${req.url} → http://localhost:3002`);
  }
}));

// Roadmap
app.use('/roadmap', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true, // Enable WebSocket support for Vite HMR
  pathRewrite: (path, req) => {
    // Remove /roadmap prefix but keep everything else
    const newPath = path.replace(/^\/roadmap/, '');
    console.log(`[Roadmap Rewrite] ${path} → ${newPath}`);
    return newPath || '/';
  },
  logLevel: 'silent',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Roadmap] ${req.method} ${req.url} → http://localhost:5173${proxyReq.path}`);
  }
}));

// Evaluator/Test Generation
app.use('/evaluator', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  ws: true, // Enable WebSocket support
  pathRewrite: (path, req) => {
    // Remove /evaluator prefix but keep everything else
    const newPath = path.replace(/^\/evaluator/, '');
    console.log(`[Evaluator Rewrite] ${path} → ${newPath}`);
    return newPath || '/';
  },
  logLevel: 'silent',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Evaluator] ${req.method} ${req.url} → http://localhost:3001${proxyReq.path}`);
  }
}));

// Auth page - redirect to landing page auth
app.get('/auth', (req, res) => {
  res.redirect('/auth.html');
});

// Landing Page (Root and all other paths)
app.use('/', createProxyMiddleware({
  target: 'http://localhost:4173',
  changeOrigin: true,
  ws: true, // Enable WebSocket support for Vite HMR
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Landing] ${req.method} ${req.url} → http://localhost:4173`);
  }
}));

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    CareerOS Reverse Proxy                      ║
╠════════════════════════════════════════════════════════════════╣
║  🌐 Main Application: http://localhost:${PORT}                    ║
║                                                                ║
║  📍 Routes:                                                    ║
║     /                  → Landing Page (4173)                   ║
║     /auth              → Authentication (4173/auth.html)       ║
║     /course-generator  → Course Generation (3002)              ║
║     /roadmap           → Career Roadmaps (5173)                ║
║     /evaluator         → Skill Evaluator (3001)                ║
║     /api/*             → Backend API (5000)                    ║
║                                                                ║
║  ⚠️  Make sure all backend services are running first!         ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
