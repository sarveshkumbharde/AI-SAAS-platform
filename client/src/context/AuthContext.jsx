import { createContext, useContext, useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load token on refresh
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setUser(jwtDecode(storedToken));
    }
  }, []);

  const login = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
    setUser(jwtDecode(jwt));
  };

  const refreshUser = async () => {
  const { data } = await api.get("/api/user/me");
  setUser((prev) => ({
    ...prev,
    plan: data.plan,
    expires_at: data.expires_at,
  }));
};


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

   const isAuthenticated = !!token;

  const isPremium =
    user &&
    user.plan === "premium" &&
    user.expires_at &&
    new Date(user.expires_at) > new Date();

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isPremium,
        login,
        refreshUser,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
