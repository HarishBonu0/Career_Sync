import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║            CareerOS - Automated Deployment Script             ║
╠════════════════════════════════════════════════════════════════╣
║  Starting all backend and frontend services...                ║
╚════════════════════════════════════════════════════════════════╝
`);

const services = [
  {
    name: 'Backend API',
    cwd: path.join(__dirname, 'backend', 'main-app', 'backend'),
    command: 'npm',
    args: ['start'],
    port: 5000,
    color: '\x1b[36m', // Cyan
  },
  {
    name: 'Landing Page',
    cwd: path.join(__dirname, 'frontend', 'landing-page'),
    command: 'npm',
    args: ['run', 'dev'],
    port: 4173,
    color: '\x1b[32m', // Green
  },
  {
    name: 'Course Generator',
    cwd: path.join(__dirname, 'frontend', 'course-generation'),
    command: 'npm',
    args: ['run', 'dev'],
    port: 3002,
    color: '\x1b[33m', // Yellow
  },
  {
    name: 'Roadmap',
    cwd: path.join(__dirname, 'frontend', 'roadmap'),
    command: 'npm',
    args: ['run', 'dev'],
    port: 5173,
    color: '\x1b[35m', // Magenta
  },
  {
    name: 'Evaluator',
    cwd: path.join(__dirname, 'frontend', 'test-generation'),
    command: 'npm',
    args: ['run', 'dev'],
    port: 3001,
    color: '\x1b[34m', // Blue
  },
  {
    name: 'Reverse Proxy',
    cwd: __dirname,
    command: 'node',
    args: ['proxy-server.js'],
    port: 8080,
    color: '\x1b[31m', // Red
    delay: 3000, // Start after other services
  },
];

const processes = [];

function startService(service, index) {
  return new Promise((resolve) => {
    const delay = service.delay || index * 1000; // Stagger starts
    
    setTimeout(() => {
      console.log(`${service.color}[${service.name}]${'\x1b[0m'} Starting on port ${service.port}...`);
      
      const proc = spawn(service.command, service.args, {
        cwd: service.cwd,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`${service.color}[${service.name}]${'\x1b[0m'} ${line}`);
          }
        });
      });

      proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`${service.color}[${service.name}]${'\x1b[0m'} ${line}`);
          }
        });
      });

      proc.on('error', (error) => {
        console.error(`${service.color}[${service.name}]${'\x1b[0m'} Error:`, error.message);
      });

      proc.on('exit', (code) => {
        if (code !== 0) {
          console.error(`${service.color}[${service.name}]${'\x1b[0m'} Exited with code ${code}`);
        }
      });

      processes.push({ name: service.name, process: proc });
      resolve();
    }, delay);
  });
}

async function startAll() {
  for (let i = 0; i < services.length; i++) {
    await startService(services[i], i);
  }

  // Wait a bit for services to start
  setTimeout(() => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   All Services Started!                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🌐 Production-like Access (Reverse Proxy):                   ║
║     http://localhost:8080                                      ║
║                                                                ║
║  📍 Direct Access (Development):                              ║
║     Backend API:        http://localhost:5000/api             ║
║     Landing Page:       http://localhost:4173                 ║
║     Course Generator:   http://localhost:3002                 ║
║     Roadmap:            http://localhost:5173                 ║
║     Evaluator:          http://localhost:3001                 ║
║                                                                ║
║  Press Ctrl+C to stop all services                            ║
╚════════════════════════════════════════════════════════════════╝
    `);
  }, 5000);
}

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\nStopping all services...');
  processes.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`);
    process.kill();
  });
  process.exit(0);
});

process.on('SIGTERM', () => {
  processes.forEach(({ process }) => process.kill());
  process.exit(0);
});

// Start all services
startAll().catch(error => {
  console.error('Failed to start services:', error);
  process.exit(1);
});
