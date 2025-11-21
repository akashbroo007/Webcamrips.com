/**
 * Script to generate a page that clears cookies
 */
const fs = require('fs');
const path = require('path');

// Create a simple HTML page that clears cookies
const clearCookiesHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Clear Cookies</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background: #3367d6;
    }
    .success {
      color: green;
      font-weight: bold;
    }
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <h1>Cookie Cleaner</h1>
  <p>This page will help clear cookies that might be causing issues with the application.</p>
  
  <button id="clearBtn">Clear All Cookies</button>
  <p id="result" class="hidden"></p>
  
  <div id="cookieList">
    <h3>Current Cookies:</h3>
    <pre id="cookies"></pre>
  </div>
  
  <script>
    // Display current cookies
    function showCookies() {
      const cookieList = document.cookie.split(';').map(c => c.trim());
      document.getElementById('cookies').textContent = 
        cookieList.length > 0 ? cookieList.join('\\n') : 'No cookies found';
    }
    
    // Clear all cookies
    document.getElementById('clearBtn').addEventListener('click', function() {
      const cookies = document.cookie.split(';');
      
      // For each cookie, set an expiration date in the past
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Different paths that might have cookies
        const paths = ['/', '/api', '/admin', '/account'];
        
        // Clear for each path
        paths.forEach(path => {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=' + path;
        });
      }
      
      // Show result
      const result = document.getElementById('result');
      result.textContent = 'All cookies cleared! You can now return to the application.';
      result.classList.remove('hidden');
      result.classList.add('success');
      
      // Update cookie list
      showCookies();
    });
    
    // Initial cookie display
    showCookies();
  </script>
</body>
</html>
`;

// Path to public directory
const publicDir = path.join(__dirname, '../public');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the clear cookies page
const clearCookiesPath = path.join(publicDir, 'clear-cookies.html');
fs.writeFileSync(clearCookiesPath, clearCookiesHtml);

console.log(`Clear cookies page created at: ${clearCookiesPath}`);
console.log('Access it at: http://172.20.10.2:3003/clear-cookies.html'); 