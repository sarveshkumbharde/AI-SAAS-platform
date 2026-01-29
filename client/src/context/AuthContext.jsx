// import { createContext, useContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);

//   // Load token on refresh
//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (storedToken) {
//       setToken(storedToken);
//       setUser(jwtDecode(storedToken));
//     }
//   }, []);

//   const login = (jwt) => {
//     localStorage.setItem("token", jwt);
//     setToken(jwt);
//     setUser(jwtDecode(jwt));
//   };

//   const refreshUser = async () => {
//     const { data } = await api.get("/api/user/me");
//     setUser((prev) => ({
//       ...prev,
//       plan: data.plan,
//       expires_at: data.expires_at,
//     }));
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setToken(null);
//     setUser(null);
//   };

//   const isAuthenticated = !!token;

//   const isPremium =
//     user &&
//     user.plan === "premium" &&
//     user.expires_at &&
//     new Date(user.expires_at) > new Date();

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         user,
//         isPremium,
//         login,
//         refreshUser,
//         logout,
//         isAuthenticated: !!token,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axios";
import { Navigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/user/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await api.post("/api/user/logout"); // clears cookie
    setUser(null);
  };

  const isPremium =
    user &&
    user.plan === "premium" &&
    user.expires_at &&
    new Date(user.expires_at) > new Date();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isPremium,
        refreshUser: fetchUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
