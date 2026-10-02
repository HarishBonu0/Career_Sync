import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const services = [
  { name: 'api', cwd: 'apps/api', command: 'npm', args: ['start'] },
  { name: 'web', cwd: 'apps/web', command: 'npm', args: ['run', 'dev'] },
];

const children = new Set();
let shuttingDown = false;

function startService(service) {
  const command = process.platform === 'win32' && service.command === 'npm' ? 'cmd.exe' : npmCommand;
  const args = process.platform === 'win32' && service.command === 'npm'
    ? ['/d', '/s', '/c', [npmCommand, ...service.args].join(' ')]
    : service.args;
  const child = spawn(command, args, {
    cwd: path.join(root, service.cwd),
    env: { ...process.env, BYPASS_DB: process.env.BYPASS_DB || 'true' },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  children.add(child);
  child.stdout.on('data', (data) => process.stdout.write(`[${service.name}] ${data}`));
  child.stderr.on('data', (data) => process.stderr.write(`[${service.name}] ${data}`));
  child.on('exit', (code, signal) => {
    children.delete(child);
    if (!shuttingDown && code !== 0) {
      console.error(`[${service.name}] exited with code ${code ?? signal}`);
    }
  });
}

function stopAll() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\nStopping Career Sync services...');
  for (const child of children) {
    child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(0), 1000).unref();
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

console.log('Starting Career Sync: API 5000, Web 3000');
services.forEach(startService);
