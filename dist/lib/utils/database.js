"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webcamrips';
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}
let isConnected = false;
async function dbConnect() {
    if (isConnected) {
        logger_1.logger.debug('Using existing database connection');
        return mongoose_1.default;
    }
    try {
        const db = await mongoose_1.default.connect(MONGODB_URI);
        isConnected = true;
        logger_1.logger.info('Connected to MongoDB');
        return db;
    }
    catch (error) {
        logger_1.logger.error('MongoDB connection error:', error);
        throw error;
    }
}
exports.default = dbConnect;
