import axios from 'axios';

/**
 * Service for handling user's video viewing history
 */
class HistoryService {
  /**
   * Adds a video to the user's viewing history
   * This should be called when a user watches a video
   */
  static async addToHistory(videoId: string): Promise<void> {
    try {
      await axios.post('/api/history', { videoId });
    } catch (error) {
      console.error('Failed to add video to history:', error);
    }
  }

  /**
   * Gets the user's viewing history
   */
  static async getHistory(): Promise<any[]> {
    try {
      const { data } = await axios.get('/api/history');
      return data.history.videoIds || [];
    } catch (error) {
      console.error('Failed to fetch viewing history:', error);
      return [];
    }
  }

  /**
   * Removes a video from the user's viewing history
   */
  static async removeFromHistory(videoId: string): Promise<void> {
    try {
      await axios.delete(`/api/history?videoId=${videoId}`);
    } catch (error) {
      console.error('Failed to remove video from history:', error);
    }
  }

  /**
   * Clears the user's entire viewing history
   */
  static async clearHistory(): Promise<void> {
    try {
      await axios.delete('/api/history?action=clear');
    } catch (error) {
      console.error('Failed to clear viewing history:', error);
    }
  }
}

export default HistoryService; 