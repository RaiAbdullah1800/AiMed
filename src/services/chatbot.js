import api from "./api";

export const chatbotService = {
  sendMessage: async (message, chatId = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const requestBody = chatId ? { message, chat_id: chatId } : { message };

      const response = await api.post("/chat/message", requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);

      // Handle 401 Unauthorized error
      if (error.response && error.response.status === 401) {
        // Clear all localStorage data
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("name");

        // Redirect to login page
        window.location.href = "/login";
        return;
      }

      throw error;
    }
  },
};
