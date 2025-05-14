"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/utils/db");
const schedulerService_1 = __importDefault(require("../lib/services/schedulerService"));
const logger_1 = require("../lib/utils/logger");
const readline_1 = __importDefault(require("readline"));
/**
 * Main function to start the recording services
 */
async function startRecordingServices() {
    try {
        logger_1.logger.info('Initializing WebcamRips Recording Service');
        // Initialize database connection
        await (0, db_1.initDatabase)();
        logger_1.logger.info('Database connection established');
        // Start scheduler service
        await schedulerService_1.default.start();
        logger_1.logger.info('Scheduler service started');
        // Setup command interface
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        // Display menu
        displayHelp();
        // Handle commands
        rl.on('line', async (input) => {
            const command = input.trim().toLowerCase();
            switch (command) {
                case 'help':
                case 'h':
                    displayHelp();
                    break;
                case 'status':
                case 's':
                    await displayStatus();
                    break;
                case 'check':
                case 'c':
                    await schedulerService_1.default.checkStreams();
                    logger_1.logger.info('Manual stream check completed');
                    break;
                case 'uploads':
                case 'u':
                    await schedulerService_1.default.checkPendingUploads();
                    logger_1.logger.info('Manual upload check completed');
                    break;
                case 'quit':
                case 'exit':
                case 'q':
                    await stopServices();
                    rl.close();
                    process.exit(0);
                    break;
                default:
                    logger_1.logger.info('Unknown command. Type "help" for available commands.');
                    break;
            }
            // Display prompt
            process.stdout.write('> ');
        });
        // Add signal handlers
        setupSignalHandlers();
        // Display prompt
        process.stdout.write('> ');
    }
    catch (error) {
        logger_1.logger.error('Failed to start recording services:', error);
        process.exit(1);
    }
}
/**
 * Display help information
 */
function displayHelp() {
    console.log('\nWebcamRips Recording Service - Commands:');
    console.log('  help, h     - Display this help message');
    console.log('  status, s   - Display system status');
    console.log('  check, c    - Check for active streams now');
    console.log('  uploads, u  - Process pending uploads now');
    console.log('  quit, q     - Stop services and exit');
    console.log('');
}
/**
 * Display system status
 */
async function displayStatus() {
    const isActive = await schedulerService_1.default.isRunning();
    const activeRecordings = schedulerService_1.default.getActiveRecordings();
    console.log('\nSystem Status:');
    console.log(`  Scheduler running: ${isActive ? 'Yes' : 'No'}`);
    console.log(`  Active recordings: ${activeRecordings.length}`);
    if (activeRecordings.length > 0) {
        console.log('  Recording IDs:');
        activeRecordings.forEach((id, index) => {
            console.log(`    ${index + 1}. ${id}`);
        });
    }
    console.log('');
}
/**
 * Setup signal handlers
 */
function setupSignalHandlers() {
    // Handle Ctrl+C
    process.on('SIGINT', async () => {
        logger_1.logger.info('Received SIGINT signal, shutting down...');
        await stopServices();
        process.exit(0);
    });
    // Handle termination
    process.on('SIGTERM', async () => {
        logger_1.logger.info('Received SIGTERM signal, shutting down...');
        await stopServices();
        process.exit(0);
    });
}
/**
 * Stop all services
 */
async function stopServices() {
    logger_1.logger.info('Stopping all services...');
    try {
        await schedulerService_1.default.stop();
        logger_1.logger.info('All services stopped');
    }
    catch (error) {
        logger_1.logger.error('Error stopping services:', error);
    }
}
// Start the service
startRecordingServices();
