# Playwright Testing Framework for WebcamRips

## Overview

This document describes the Playwright testing framework implemented for the WebcamRips application to test browser automation and adult website interactions. Playwright is used to automate browser interactions, handle age verification, and extract stream URLs.

## Key Files

1. **scripts/lib/playwrightHandler.ts** - Core browser automation class
   - Handles browser initialization, navigation, age verification
   - Extracts stream URLs and checks performer status
   - Takes screenshots for visual verification

2. **Test Scripts**
   - `scripts/test-playwright.ts` - Basic Google navigation test
   - `scripts/test-adult-playwright.ts` - Adult site homepage test
   - `scripts/test-adult-performer.ts` - Test of specific performer pages
   - `scripts/run-playwright-tests.ts` - Runs all Playwright tests
   - `scripts/test-report.ts` - Generates HTML reports with screenshots

## Setup and Usage

### Running Tests

Run all Playwright tests and generate a report:

```bash
npm run test:playwright
```

Or run individual tests:

```bash
npx ts-node -P tsconfig.scripts.json scripts/test-playwright.ts
npx ts-node -P tsconfig.scripts.json scripts/test-adult-playwright.ts
npx ts-node -P tsconfig.scripts.json scripts/test-adult-performer.ts
```

### Test Report

After running tests, view the HTML report at:

```
/reports/test-report.html
```

## Key Features

### Browser Automation
- Cross-browser support (Firefox with Chromium fallback)
- Headless or headed mode for debugging
- Configurable timeouts and screenshots
- User-agent management

### Adult Site Handling
- Age verification dialog detection and handling
- Cookie consent management
- Performer online status detection
- Stream URL extraction from network traffic

### Error Handling
- Graceful handling of connection issues
- Screenshot capture on errors
- Detailed logging for troubleshooting

## Implementation Details

### PlaywrightHandler Class

The `PlaywrightHandler` class is the core of the testing framework, providing methods to:

- Initialize browsers with specific options
- Navigate to stream URLs and handle verification gates
- Extract HLS stream URLs from network requests
- Check performer status based on page indicators
- Take screenshots for visual verification
- Save and load cookies for session management

### Test Report Generator

The test report generator creates an HTML report with:

- Visual display of test screenshots
- Test status (pass/fail)
- Timestamps for each test
- Extracted stream URLs (when available)

## Future Improvements

- Add support for authenticated streams
- Improve stream URL extraction reliability
- Add more targeted tests for specific adult platforms
- Implement cookie persistence between test runs
- Add performance metrics to test reports

## Integration with Recording Pipeline

The Playwright tests complement the existing recording pipeline by:

1. Verifying site accessibility before attempting recordings
2. Validating stream extraction methods
3. Providing visual confirmation of performer status
4. Testing age verification handling

This ensures that the recording system can reliably access and process adult streaming content. 