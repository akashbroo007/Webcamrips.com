# WebcamRips Test Scripts

This directory contains various scripts for testing the WebcamRips application.

## Playwright Tests

These scripts test the browser automation functionality using Playwright.

### Run All Playwright Tests

Run all Playwright tests and generate a report in one command:

```bash
npx ts-node -P tsconfig.scripts.json scripts/run-playwright-tests.ts
```

This will:
1. Run all Playwright tests in sequence
2. Display a summary of results 
3. Generate an HTML report with screenshots

### Individual Tests

If you prefer to run tests individually:

#### Basic Browser Test

Test basic browser functionality with Google:

```bash
npx ts-node -P tsconfig.scripts.json scripts/test-playwright.ts
```

#### Adult Site Tests

Test adult site homepage navigation and age verification:

```bash
npx ts-node -P tsconfig.scripts.json scripts/test-adult-playwright.ts
```

Test specific performer page including online status detection:

```bash
npx ts-node -P tsconfig.scripts.json scripts/test-adult-performer.ts
```

### Test Report Generation

Generate an HTML report of test results with screenshots:

```bash
npx ts-node -P tsconfig.scripts.json scripts/test-report.ts
```

This will create a visual HTML report in the `reports` directory showing all test runs with screenshots.

## Recording Tests

### Direct Recording Tests

Test direct recording of streams using different methods:

```bash
npx ts-node -P tsconfig.scripts.json scripts/direct-record.ts --url=URL --method=METHOD --duration=SECONDS --output=NAME
```

Where:
- `URL`: URL of the stream to record
- `METHOD`: One of: `yt-dlp`, `streamlink`, or `ffmpeg`
- `DURATION`: Recording duration in seconds
- `OUTPUT`: Base name for the output file

Example:
```bash
npx ts-node -P tsconfig.scripts.json scripts/direct-record.ts --url=https://www.youtube.com/watch?v=jfKfPfyJRdk --method=yt-dlp --duration=5 --output=lofi-test
```

### Full Pipeline Tests

Test the full recording pipeline including scheduling and detection:

```bash
npx ts-node -P tsconfig.scripts.json scripts/test-full-pipeline.ts
```

## Integration Tests

Run integration tests:

```bash
npm run test-integration
```

## Component Tests

Run individual component tests:

```bash
npm run test:component
```

## Running All Tests

To run all tests:

```bash
npm run test:all
```

## Notes

- When testing with adult sites, some URLs may be blocked or require additional authorization.
- For best results with adult streams, use the `--headless=false` option to see what's happening. 