import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // ✅ nouveau

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role"); // ✅ récupérer le rôle aussi
    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);
  }, []);

  const logout = () => {
    setToken(null);
    setRole(null); // ✅ réinitialiser le rôle
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, role, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
