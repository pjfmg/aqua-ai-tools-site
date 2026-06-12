import { spawn } from 'node:child_process';

function startProcess(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] exited via signal ${signal}`);
      return;
    }
    if (typeof code === 'number' && code !== 0) {
      console.log(`[${name}] exited with code ${code}`);
    }
  });

  return child;
}

const children = [
  startProcess('proxy', 'node', ['proxy/server.mjs']),
  startProcess('vite', 'npm', ['run', 'dev:vite', '--', '--host', '127.0.0.1']),
];

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }

  setTimeout(() => process.exit(0), 200);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal));
}

for (const child of children) {
  child.on('exit', (code) => {
    if (shuttingDown) return;
    shuttingDown = true;

    for (const other of children) {
      if (other !== child && !other.killed) other.kill('SIGTERM');
    }

    process.exit(typeof code === 'number' ? code : 1);
  });
}
