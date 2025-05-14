"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * Service for handling user's video viewing history
 */
class HistoryService {
    /**
     * Adds a video to the user's viewing history
     * This should be called when a user watches a video
     */
    static async addToHistory(videoId) {
        try {
            await axios_1.default.post('/api/history', { videoId });
        }
        catch (error) {
            console.error('Failed to add video to history:', error);
        }
    }
    /**
     * Gets the user's viewing history
     */
    static async getHistory() {
        try {
            const { data } = await axios_1.default.get('/api/history');
            return data.history.videoIds || [];
        }
        catch (error) {
            console.error('Failed to fetch viewing history:', error);
            return [];
        }
    }
    /**
     * Removes a video from the user's viewing history
     */
    static async removeFromHistory(videoId) {
        try {
            await axios_1.default.delete(`/api/history?videoId=${videoId}`);
        }
        catch (error) {
            console.error('Failed to remove video from history:', error);
        }
    }
    /**
     * Clears the user's entire viewing history
     */
    static async clearHistory() {
        try {
            await axios_1.default.delete('/api/history?action=clear');
        }
        catch (error) {
            console.error('Failed to clear viewing history:', error);
        }
    }
}
exports.default = HistoryService;
