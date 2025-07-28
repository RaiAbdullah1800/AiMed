
// src/services/chatService.js
import api from './api';

export const chatService = {
  getChatsByPatient: async (patientId) => {
    try {
      const response = await api.get(
        `/admin/patients/${patientId}/chats`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
