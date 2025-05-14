"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
exports.getConnectionStatus = getConnectionStatus;
exports.initDatabase = initDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const app_1 = __importDefault(require("../../config/app"));
/**
 * Global MongoDB connection
 */
let connectionPromise = null;
/**
 * Connect to MongoDB if not already connected
 */
async function connectDB() {
    if (mongoose_1.default.connection.readyState === 1) {
        return mongoose_1.default; // Already connected
    }
    if (!connectionPromise) {
        const uri = app_1.default.mongodb.uri;
        if (!uri) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        logger_1.databaseLogger.info('Connecting to MongoDB...');
        connectionPromise = mongoose_1.default.connect(uri, app_1.default.mongodb.options)
            .then((mongoose) => {
            logger_1.databaseLogger.info('Connected to MongoDB');
            return mongoose;
        })
            .catch((error) => {
            logger_1.databaseLogger.error('MongoDB connection error:', error);
            connectionPromise = null;
            throw error;
        });
    }
    return connectionPromise;
}
/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
    if (mongoose_1.default.connection.readyState === 0) {
        return; // Already disconnected
    }
    logger_1.databaseLogger.info('Disconnecting from MongoDB...');
    await mongoose_1.default.disconnect();
    connectionPromise = null;
    logger_1.databaseLogger.info('Disconnected from MongoDB');
}
/**
 * Get current connection status
 */
function getConnectionStatus() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose_1.default.connection.readyState] || 'unknown';
}
/**
 * Initialize database connection for the application
 */
async function initDatabase() {
    try {
        await connectDB();
        // Set up connection event listeners
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.databaseLogger.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.databaseLogger.warn('MongoDB disconnected');
        });
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await disconnectDB();
                process.exit(0);
            }
            catch (error) {
                process.exit(1);
            }
        });
    }
    catch (error) {
        logger_1.databaseLogger.error('Database initialization failed:', error);
        throw error;
    }
}
