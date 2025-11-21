const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Parse arguments and environment variables
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '172.20.10.2'; // Use environment variable or default to the IP
const port = parseInt(process.env.PORT || '3003', 10);

// Initialize Next.js instance with the same hostname/port
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// HTTP Server configuration with increased header limits
const serverOptions = {
  // Increasing header size limits (measured in bytes)
  maxHeaderSize: 32 * 1024, // 32KB headers (default is often 8KB)
  keepAliveTimeout: 30000, // 30 seconds (default is usually 5 seconds)
  headerTimeout: 40000,    // 40 seconds (longer than keep alive)
};

// Handle large cookies function with improved debugging
function handleLargeCookies(req, res) {
  // Check if the request has cookies
  if (!req.headers.cookie) return;
  
  const debugCookies = process.env.DEBUG_COOKIES === 'true';
  const maxCookieSize = parseInt(process.env.COOKIE_MAX_SIZE || '2048', 10);
  
  // Get original cookie size
  const originalCookieSize = req.headers.cookie.length;
  
  if (debugCookies) {
    console.log(`[Cookie Debug] Original cookie size: ${originalCookieSize} bytes`);
  }

  // If cookie size is too large, trim it
  if (originalCookieSize > maxCookieSize) {
    console.warn(`[Cookie Warning] Large cookie detected: ${originalCookieSize} bytes`);
    
    // Parse the cookies
    const cookies = {};
    req.headers.cookie.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const name = parts.shift().trim();
      const value = parts.join('=');
      cookies[name] = value;
    });
    
    if (debugCookies) {
      console.log(`[Cookie Debug] Found ${Object.keys(cookies).length} cookies`);
    }
    
    // Keep only essential NextAuth cookies
    const essentialCookies = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url'
    ];
    
    // Create a new cookie string
    const newCookies = [];
    essentialCookies.forEach(name => {
      if (cookies[name]) {
        newCookies.push(`${name}=${cookies[name]}`);
      }
    });
    
    // Set the new cookie header
    req.headers.cookie = newCookies.join('; ');
    const newSize = req.headers.cookie.length;
    
    console.log(`[Cookie Info] Trimmed cookies from ${originalCookieSize} to ${newSize} bytes`);
    
    if (debugCookies && newCookies.length > 0) {
      console.log(`[Cookie Debug] Kept cookies: ${newCookies.join(', ')}`);
    }
  }
}

// Preload all models to avoid MissingSchemaError
console.log('Setting up server environment...');
// We'll let Next.js handle the model loading through lib/db.ts

// Main server initialization
app.prepare().then(() => {
  const server = express();
  
  // Apply cookie handling middleware first
  server.use((req, res, next) => {
    handleLargeCookies(req, res);
    next();
  });

  // Add CORS headers if enabled
  if (process.env.CORS_ENABLED === 'true') {
    server.use((req, res, next) => {
      const allowOrigin = process.env.NEXT_PUBLIC_ALLOW_ORIGIN || `http://${hostname}:${port}`;
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });
    console.log(`CORS enabled for origin: ${process.env.NEXT_PUBLIC_ALLOW_ORIGIN || `http://${hostname}:${port}`}`);
  }

  // Handle all requests with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Create HTTP server with our options
  const httpServer = createServer(serverOptions, server);
  
  // Start the server
  httpServer.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Local access: http://localhost:${port}`);
    console.log(`> Network access: http://172.20.10.2:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
    console.log(`> Max Header Size: ${serverOptions.maxHeaderSize} bytes`);
  });
}); 