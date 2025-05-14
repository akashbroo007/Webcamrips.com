import winston from 'winston';
import path from 'path';
import fs from 'fs';
import appConfig from '../../config/app';

// Ensure logs directory exists
const logsDir = appConfig.logging.directory;
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Common formatter for all loggers
const commonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, service }) => {
    return `${timestamp} [${service}] ${level}: ${message}`;
  })
);

// Create base logger
export const logger = winston.createLogger({
  level: appConfig.logging.level || 'info',
  format: commonFormat,
  defaultMeta: { service: 'app' },
  transports: [
    // Write to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, service }) => {
          return `${timestamp} [${service}] ${level}: ${message}`;
        })
      ),
    }),
    // Write to combined log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write errors to error log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create specialized loggers for different parts of the application
export const recordingLogger = logger.child({ service: 'recording' });
export const schedulerLogger = logger.child({ service: 'scheduler' });
export const apiLogger = logger.child({ service: 'api' });
export const databaseLogger = logger.child({ service: 'database' });
export const streamLogger = logger.child({ service: 'stream' });

// Setup development logging
if (process.env.NODE_ENV !== 'production') {
  logger.level = 'debug';
}

/**
 * Creates a logger for a specific component
 * @param component - The component name
 * @returns A winston logger instance
 */
export function createComponentLogger(component: string): winston.Logger {
  return logger.child({ service: component });
}

/**
 * Log an error with additional context
 * @param error - The error object
 * @param context - Additional context about where the error occurred
 * @param logger - Optional specific logger to use (defaults to main logger)
 */
export function logError(
  error: Error,
  context: string,
  loggerInstance: winston.Logger = logger
): void {
  loggerInstance.error(`${context}: ${error.message}`, {
    error,
    stack: error.stack,
    context,
  });
}

/**
 * Log the start of an operation
 * @param operation - The operation name
 * @param details - Optional details about the operation
 * @param logger - Optional specific logger to use (defaults to main logger)
 */
export function logOperationStart(
  operation: string,
  details?: any,
  loggerInstance: winston.Logger = logger
): void {
  loggerInstance.info(`Starting ${operation}`, { operation, details });
}

/**
 * Log the end of an operation
 * @param operation - The operation name
 * @param duration - The duration in milliseconds
 * @param result - The result of the operation
 * @param logger - Optional specific logger to use (defaults to main logger)
 */
export function logOperationEnd(
  operation: string,
  duration: number,
  result: any,
  loggerInstance: winston.Logger = logger
): void {
  loggerInstance.info(`Completed ${operation} in ${duration}ms`, {
    operation,
    duration,
    result,
  });
}

export default logger; 