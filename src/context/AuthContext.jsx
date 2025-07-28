import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { authService } from "../services/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      validateTokenOnStartup()
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const validateTokenOnStartup = async () => {
    try {
      const response = await authService.validateToken();
      if (response.valid) {
        setToken(localStorage.getItem("token"));
        setUser({
          email: response.email,
          role: response.role,
          name: response.name,
          id: response.user_id,
        });
      } else {
        clearAllData();
      }
    } catch (error) {
      clearAllData();
    }
  };

  const clearAllData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setToken(null);
    setUser(null);
  };

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const userId = localStorage.getItem("user_id");

    if (storedToken && email) {
      setToken(storedToken);
      setUser({ email, role, name, id: userId });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      // Response contains: access_token, token_type, email, role, name, user_id
      const { access_token, email, role, name, user_id } = response;
      localStorage.setItem("token", access_token);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      localStorage.setItem("user_id", user_id);
      setToken(access_token);
      setUser({ email, role, name, id: user_id });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearAllData();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
