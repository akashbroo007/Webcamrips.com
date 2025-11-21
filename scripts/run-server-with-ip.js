/**
 * Script to start the server with IP address configuration and enhanced cookie handling
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// First, generate the cookie clearing page
require('./clear-cookies');

console.log('Starting server with IP address configuration...');
console.log('Cookie handling has been enhanced to manage large cookies');

// Server startup options
const serverOptions = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: '3003',
  HOST: '172.20.10.2',
  // Set cookie size limits
  COOKIE_MAX_SIZE: '2048',
  // Force secure cookies off for local development
  NEXTAUTH_URL: 'http://172.20.10.2:3003',
  // Enable cookie handling logs
  DEBUG_COOKIES: 'true',
  // CORS settings
  NEXT_PUBLIC_ALLOW_ORIGIN: 'http://172.20.10.2:3003',
  CORS_ENABLED: 'true',
  // Security settings for local development
  SECURE_COOKIES: 'false',
  JWT_SECRET: process.env.JWT_SECRET || 'local-development-jwt-secret'
};

// Use the server.js file directly which has been configured with the IP address
const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ...serverOptions
  }
});

console.log('\n==============================================');
console.log(`Server starting at http://172.20.10.2:3003`);
console.log(`To clear cookies: http://172.20.10.2:3003/clear-cookies.html`);
console.log('==============================================\n');

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