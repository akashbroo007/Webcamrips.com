import { initDatabase } from '../lib/utils/db';
import schedulerService from '../lib/services/schedulerService';
import { logger } from '../lib/utils/logger';
import readline from 'readline';

/**
 * Main function to start the recording services
 */
async function startRecordingServices() {
  try {
    logger.info('Initializing WebcamRips Recording Service');
    
    // Initialize database connection
    await initDatabase();
    logger.info('Database connection established');
    
    // Start scheduler service
    await schedulerService.start();
    logger.info('Scheduler service started');
    
    // Setup command interface
    const rl = readline.createInterface({
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
          await schedulerService.checkStreams();
          logger.info('Manual stream check completed');
          break;
        
        case 'uploads':
        case 'u':
          await schedulerService.checkPendingUploads();
          logger.info('Manual upload check completed');
          break;
        
        case 'quit':
        case 'exit':
        case 'q':
          await stopServices();
          rl.close();
          process.exit(0);
          break;
        
        default:
          logger.info('Unknown command. Type "help" for available commands.');
          break;
      }
      
      // Display prompt
      process.stdout.write('> ');
    });
    
    // Add signal handlers
    setupSignalHandlers();
    
    // Display prompt
    process.stdout.write('> ');
  } catch (error) {
    logger.error('Failed to start recording services:', error);
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
  const isActive = await schedulerService.isRunning();
  const activeRecordings = schedulerService.getActiveRecordings();
  
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
    logger.info('Received SIGINT signal, shutting down...');
    await stopServices();
    process.exit(0);
  });
  
  // Handle termination
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM signal, shutting down...');
    await stopServices();
    process.exit(0);
  });
}

/**
 * Stop all services
 */
async function stopServices() {
  logger.info('Stopping all services...');
  
  try {
    await schedulerService.stop();
    logger.info('All services stopped');
  } catch (error) {
    logger.error('Error stopping services:', error);
  }
}

// Start the service
startRecordingServices(); 