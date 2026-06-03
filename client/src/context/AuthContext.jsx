import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await API.get("/users/me");
      const freshUser = res.data.data;
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Fetch fresh user data in background
      refreshUser();
    }

    setLoading(false);
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const { token, user: loggedInUser } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  };

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", {
      name,
      email,
      password,
    });
    const { token, user: registeredUser } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(registeredUser));
    setUser(registeredUser);

    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
