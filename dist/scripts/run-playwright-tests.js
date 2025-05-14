"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const logger_1 = require("../lib/utils/logger");
/**
 * Run all Playwright tests and generate a report
 */
async function runAllPlaywrightTests() {
    logger_1.logger.info('Running all Playwright tests...');
    const tests = [
        'scripts/test-playwright.ts',
        'scripts/test-adult-playwright.ts',
        'scripts/test-adult-performer.ts'
    ];
    const results = [];
    for (const test of tests) {
        try {
            logger_1.logger.info(`Running test: ${test}`);
            console.log(`\n=== Running test: ${test} ===\n`);
            const output = (0, child_process_1.execSync)(`npx ts-node -P tsconfig.scripts.json ${test}`, {
                encoding: 'utf-8',
                stdio: 'inherit' // Show output in console
            });
            results.push({
                test,
                success: true,
                output
            });
            logger_1.logger.info(`Test ${test} completed successfully`);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            logger_1.logger.error(`Test ${test} failed: ${errorMsg}`);
            results.push({
                test,
                success: false,
                output: errorMsg
            });
        }
    }
    // Generate summary
    console.log('\n=== Test Results Summary ===\n');
    let passCount = 0;
    let failCount = 0;
    for (const result of results) {
        if (result.success) {
            passCount++;
            console.log(`✅ ${result.test}: PASSED`);
        }
        else {
            failCount++;
            console.log(`❌ ${result.test}: FAILED`);
        }
    }
    console.log(`\nTests passed: ${passCount}/${results.length} (${Math.round(passCount / results.length * 100)}%)`);
    // Generate HTML report
    logger_1.logger.info('Generating test report...');
    try {
        (0, child_process_1.execSync)('npx ts-node -P tsconfig.scripts.json scripts/test-report.ts', {
            encoding: 'utf-8',
            stdio: 'inherit' // Show output in console
        });
    }
    catch (error) {
        logger_1.logger.error(`Failed to generate test report: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Exit with appropriate code
    if (failCount > 0) {
        process.exit(1);
    }
    else {
        process.exit(0);
    }
}
runAllPlaywrightTests().catch(error => {
    logger_1.logger.error(`Error running tests: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
