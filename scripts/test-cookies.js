/**
 * Script to test cookie handling
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('Testing cookie handling...');

// Create a large cookie for testing
const createLargeCookie = (size) => {
  let cookie = '';
  for (let i = 0; i < size; i++) {
    cookie += 'x';
  }
  return cookie;
};

// Test options
const options = {
  host: '172.20.10.2',
  port: 3003,
  path: '/',
  method: 'GET',
  headers: {
    'Cookie': [
      `test-large-cookie=${createLargeCookie(3000)}`,
      'next-auth.session-token=test-session-token',
      'next-auth.csrf-token=test-csrf-token',
      'next-auth.callback-url=http://172.20.10.2:3003'
    ].join('; ')
  }
};

// Make the request
const req = http.request(options, (res) => {
  console.log(`\nResponse Status: ${res.statusCode}`);
  console.log('Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nTest completed.');
    console.log('Cookie handling should have logged info about trimming cookies.');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Send the request
req.end();

console.log('Request sent with large cookie. Check server logs for cookie handling information.');
console.log('Cookie size sent:', options.headers.Cookie.length, 'bytes'); 