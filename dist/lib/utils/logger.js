"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamLogger = exports.databaseLogger = exports.apiLogger = exports.schedulerLogger = exports.recordingLogger = exports.logger = void 0;
exports.createComponentLogger = createComponentLogger;
exports.logError = logError;
exports.logOperationStart = logOperationStart;
exports.logOperationEnd = logOperationEnd;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app_1 = __importDefault(require("../../config/app"));
// Ensure logs directory exists
const logsDir = app_1.default.logging.directory;
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// Common formatter for all loggers
const commonFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.printf(({ level, message, timestamp, service }) => {
    return `${timestamp} [${service}] ${level}: ${message}`;
}));
// Create base logger
exports.logger = winston_1.default.createLogger({
    level: app_1.default.logging.level || 'info',
    format: commonFormat,
    defaultMeta: { service: 'app' },
    transports: [
        // Write to console
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp, service }) => {
                return `${timestamp} [${service}] ${level}: ${message}`;
            })),
        }),
        // Write to combined log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write errors to error log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});
// Create specialized loggers for different parts of the application
exports.recordingLogger = exports.logger.child({ service: 'recording' });
exports.schedulerLogger = exports.logger.child({ service: 'scheduler' });
exports.apiLogger = exports.logger.child({ service: 'api' });
exports.databaseLogger = exports.logger.child({ service: 'database' });
exports.streamLogger = exports.logger.child({ service: 'stream' });
// Setup development logging
if (process.env.NODE_ENV !== 'production') {
    exports.logger.level = 'debug';
}
/**
 * Creates a logger for a specific component
 * @param component - The component name
 * @returns A winston logger instance
 */
function createComponentLogger(component) {
    return exports.logger.child({ service: component });
}
/**
 * Log an error with additional context
 * @param error - The error object
 * @param context - Additional context about where the error occurred
 * @param logger - Optional specific logger to use (defaults to main logger)
 */
function logError(error, context, loggerInstance = exports.logger) {
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
function logOperationStart(operation, details, loggerInstance = exports.logger) {
    loggerInstance.info(`Starting ${operation}`, { operation, details });
}
/**
 * Log the end of an operation
 * @param operation - The operation name
 * @param duration - The duration in milliseconds
 * @param result - The result of the operation
 * @param logger - Optional specific logger to use (defaults to main logger)
 */
function logOperationEnd(operation, duration, result, loggerInstance = exports.logger) {
    loggerInstance.info(`Completed ${operation} in ${duration}ms`, {
        operation,
        duration,
        result,
    });
}
exports.default = exports.logger;
