const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to auth.ts file
const authFilePath = path.join(__dirname, '../lib/auth.ts');

// Read the auth.ts file
let authFileContent = fs.readFileSync(authFilePath, 'utf8');

// Enable debug mode in auth.ts
authFileContent = authFileContent.replace(
  /debug: false/g,
  'debug: true'
);

// Write the modified content back to the file
fs.writeFileSync(authFilePath, authFileContent, 'utf8');
console.log('✅ NextAuth debug mode enabled');

// Run the dev server
console.log('Starting development server...');
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    HOSTNAME: '172.20.10.2'
  }
});

// Handle process exit
devProcess.on('exit', (code) => {
  // Restore the original auth.ts file
  authFileContent = authFileContent.replace(
    /debug: true/g,
    'debug: false'
  );
  fs.writeFileSync(authFilePath, authFileContent, 'utf8');
  console.log('✅ NextAuth debug mode disabled');
  
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  devProcess.kill('SIGTERM');
}); 