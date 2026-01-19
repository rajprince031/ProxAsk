import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  /* Load auth state on refresh */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      setIsAuthenticated(true);
      setUser({ username });
    }
  }, []);

  /* Login */
  const login = (authData) => {
    localStorage.setItem("token", authData.token);
    localStorage.setItem("username", authData.username);

    setIsAuthenticated(true);
    setUser({ username: authData.username });
  };

  /* Logout */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* Custom hook */
export const useAuth = () => useContext(AuthContext);
