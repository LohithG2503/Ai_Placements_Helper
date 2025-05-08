import axios from 'axios'

// API endpoint for YouTube searches
const API_URL = 'http://localhost:5000/api/job/youtube-search';

/**
 * Search for YouTube videos using the backend API
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Object>} YouTube search results
 */
export const searchVideos = async (query, maxResults = 10) => {
  try {
    if (!query) {
      throw new Error('Search query is required');
    }

    const response = await axios.get(API_URL, {
      params: {
        query,
        maxResults
      }
    });

    // Check if response is successful and contains data
    if (response.status !== 200 || !response.data) {
      throw new Error('Failed to fetch videos from API');
    }

    // Return the complete response data
    return response.data;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

/**
 * Fetches YouTube videos with pagination support
 * @param {string} query - The search query
 * @param {string} pageToken - Token for pagination
 * @returns {Promise<Object>} - Paginated search results
 */
export const fetchYouTubeVideos = async (query, pageToken = '') => {
  try {
    if (!query) {
      throw new Error('Search query is required');
    }

    const response = await axios.get(API_URL, {
      params: {
        query,
        maxResults: 6,
        pageToken
      }
    });

    // Check if response is successful and contains data
    if (response.status !== 200 || !response.data) {
      throw new Error('Failed to fetch videos from API');
    }

    // Return the complete response data
    return response.data;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
}; 