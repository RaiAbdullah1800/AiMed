/**
 * Service for handling speech-to-text functionality using WebSocket
 */

export const speechToTextService = {
  /**
   * Get the WebSocket URL for speech-to-text
   * @returns {string} WebSocket URL
   * @throws {Error} If REACT_APP_API_BASE_URL is not defined
   */
  getWebSocketUrl: () => {
    // Using Vite environment variables
    // These variables must be prefixed with VITE_ and accessed via import.meta.env
    const baseUrl = import.meta.env.VITE_WS_BASE_URL || 
                   (import.meta.env.VITE_API_BASE_URL || "http://192.168.10.17:8000");
    
    // Ensure we're using ws:// or wss:// protocol
    const wsBaseUrl = baseUrl.startsWith('http') ? baseUrl.replace(/^http/, 'ws') : 
                     baseUrl.startsWith('https') ? baseUrl.replace(/^https/, 'wss') : baseUrl;
    
    return `${wsBaseUrl}/audio/ws/transcribe`;
  },

  /**
   * Create a new WebSocket connection for speech-to-text
   * @param {Function} onMessage - Callback for handling incoming messages
   * @returns {WebSocket} WebSocket instance
   */
  createWebSocket: (onMessage) => {
    const ws = new WebSocket(speechToTextService.getWebSocketUrl());

    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
};
