const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3002;

// Initialize Next.js instance
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Parse command line arguments for custom port
const args = process.argv.slice(2);
const customPort = args.find(arg => arg.startsWith('--port='));
const serverPort = customPort ? parseInt(customPort.split('=')[1], 10) : port;

// HTTP Server configuration with increased header limits
const serverOptions = {
  // Increasing header size limits (measured in bytes)
  maxHeaderSize: 32 * 1024, // 32KB headers (default is often 8KB)
  keepAliveTimeout: 30000, // 30 seconds (default is usually 5 seconds)
  headerTimeout: 40000,    // 40 seconds (longer than keep alive)
};

// Preload all models to avoid MissingSchemaError
console.log('Setting up server environment...');
// We'll let Next.js handle the model loading through lib/db.ts

app.prepare().then(() => {
  // Create HTTP server with our custom options
  const server = createServer(serverOptions, async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
      // Set timeout for long-running requests
      req.setTimeout(120000); // 2 minutes timeout
      
      // Add common response headers to all requests
      res.setHeader('Connection', 'keep-alive');
      
      // Check headers size - if too large, reject immediately
      // This helps prevent 431 errors
      const headersSize = JSON.stringify(req.headers).length;
      if (headersSize > 24 * 1024) { // 24KB limit for headers
        console.error(`Request headers too large: ${headersSize} bytes`);
        res.statusCode = 431;
        res.end('Request Header Fields Too Large');
        return;
      }
      
      // Process cookies to reduce size (optional but can help)
      if (req.headers.cookie && req.headers.cookie.length > 4096) {
        console.warn(`Large cookies detected: ${req.headers.cookie.length} bytes`);
        // Consider trimming non-essential cookies here if needed
      }
      
      // Handle the request with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(serverPort, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${serverPort}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
    console.log(`> Max Header Size: ${serverOptions.maxHeaderSize} bytes`);
  });
}); 