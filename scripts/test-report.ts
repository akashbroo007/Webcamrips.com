import fs from 'fs';
import path from 'path';
import { logger } from '../lib/utils/logger';

interface TestReport {
  testName: string;
  timestamp: string;
  success: boolean;
  screenshotPath?: string;
  streamUrl?: string;
  error?: string;
}

/**
 * Generate a test report from the test results
 */
async function generateTestReport() {
  logger.info('Generating test report...');
  
  // Define the test results
  const testResults: TestReport[] = [];
  
  // Get screenshots from test directory
  const screenshotsDir = path.join(process.cwd(), 'recordings', 'test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    logger.error(`Screenshots directory not found: ${screenshotsDir}`);
    return;
  }
  
  const files = fs.readdirSync(screenshotsDir);
  
  // Sort files by date (newest first)
  const sortedFiles = files.sort((a, b) => {
    const statA = fs.statSync(path.join(screenshotsDir, a));
    const statB = fs.statSync(path.join(screenshotsDir, b));
    return statB.mtimeMs - statA.mtimeMs;
  });
  
  // Extract test info from filenames
  for (const file of sortedFiles) {
    if (file.endsWith('.png')) {
      const timestamp = new Date(fs.statSync(path.join(screenshotsDir, file)).mtime).toISOString();
      
      let testName = 'Unknown Test';
      let success = true;
      
      if (file.includes('test-screenshot')) {
        testName = 'Basic Playwright Test';
      } else if (file.includes('adult-site-homepage')) {
        testName = 'Adult Site Homepage Test';
      } else if (file.includes('performer-page')) {
        testName = 'Adult Performer Test';
      } else if (file.includes('error-screenshot')) {
        testName = 'Failed Test';
        success = false;
      }
      
      testResults.push({
        testName,
        timestamp,
        success,
        screenshotPath: `/recordings/test-screenshots/${file}`
      });
    }
  }
  
  // Generate HTML report
  const reportPath = path.join(process.cwd(), 'reports', 'test-report.html');
  
  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Create HTML content
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebcamRips Test Report</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }
      h1 {
        color: #333;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
      }
      .test-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      .test-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow: hidden;
        width: 300px;
        margin-bottom: 20px;
      }
      .test-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-bottom: 1px solid #eee;
      }
      .test-details {
        padding: 15px;
      }
      .test-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .test-timestamp {
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }
      .test-status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
      }
      .success {
        background-color: #d4edda;
        color: #155724;
      }
      .failure {
        background-color: #f8d7da;
        color: #721c24;
      }
    </style>
  </head>
  <body>
    <h1>WebcamRips Test Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <div class="test-container">
      ${testResults.map(test => `
        <div class="test-card">
          <img class="test-image" src="${test.screenshotPath}" alt="${test.testName}">
          <div class="test-details">
            <div class="test-name">${test.testName}</div>
            <div class="test-timestamp">${new Date(test.timestamp).toLocaleString()}</div>
            <div class="test-status ${test.success ? 'success' : 'failure'}">
              ${test.success ? 'Success' : 'Failure'}
            </div>
            ${test.streamUrl ? `<div class="test-url">Stream URL: ${test.streamUrl}</div>` : ''}
            ${test.error ? `<div class="test-error">Error: ${test.error}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </body>
  </html>
  `;
  
  // Write HTML report
  fs.writeFileSync(reportPath, html);
  
  logger.info(`Test report generated: ${reportPath}`);
  console.log(`Test report generated: ${reportPath}`);
}

generateTestReport().catch(error => {
  logger.error(`Error generating test report: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}); 