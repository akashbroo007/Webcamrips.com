/**
 * Script to start the server with IP address configuration
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting server with IP address configuration...');

// Use the server.js file directly which has been configured with the IP address
const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '3003',
    HOST: '172.20.10.2'
  }
});

console.log(`Server starting at http://172.20.10.2:3003`);

// Handle process exit
serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGTERM');
}); 