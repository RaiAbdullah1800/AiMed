import api from './api';

export const textToSpeechService = {
  convertText: async (text) => {
    try {
      const response = await api.post(
        '/audio/text-to-speech',
        { text },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
