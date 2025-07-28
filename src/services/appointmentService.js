import api from './api';

export const appointmentService = {
  getAvailableDoctors: async () => {
    try {
      const response = await api.get('/appointments/available-doctors');
      // Response is now a simple array of doctor names
      return response; 
    } catch (error) {
      throw error;
    }
  },

  getUserAppointments: async (userId) => {
    try {
      const response = await api.get(`/appointments/appointment/${userId}`);
      console.log(response)
      return response;
    } catch (error) {
      throw error;
    }
  },

  scheduleAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments/schedule', appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
