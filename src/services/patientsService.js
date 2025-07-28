import api from './api';

export const patientsService = {
  getAll: async () => {
    try {
      const response = await api.get('/admin/patients');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};