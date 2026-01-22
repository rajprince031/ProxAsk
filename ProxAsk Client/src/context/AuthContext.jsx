import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Restore auth on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      setIsAuthenticated(true);
      setUser({ username });
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.authToken);
    localStorage.setItem("username", data.username);
    console.log("I a auth context", data)
    setIsAuthenticated(true);
    setUser({ username: data.username });
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
