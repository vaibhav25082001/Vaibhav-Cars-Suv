import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("vaibhav_user") || "null"));
  const [loading, setLoading] = useState(false);

  async function login(email, password, type = "customer") {
    setLoading(true);
    try {
      const url = type === "employee" ? "/auth/employee/login" : "/auth/customer/login";
      const { data } = await api.post(url, { email, password });
      localStorage.setItem("vaibhav_access_token", data.accessToken);
      localStorage.setItem("vaibhav_refresh_token", data.refreshToken);
      localStorage.setItem("vaibhav_user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    const { data } = await api.post("/auth/customer/register", payload);
    localStorage.setItem("vaibhav_access_token", data.accessToken);
    localStorage.setItem("vaibhav_refresh_token", data.refreshToken);
    localStorage.setItem("vaibhav_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("vaibhav_access_token");
    localStorage.removeItem("vaibhav_refresh_token");
    localStorage.removeItem("vaibhav_user");
    setUser(null);
  }

  useEffect(() => {
    if (!localStorage.getItem("vaibhav_access_token")) return;
    api.get("/auth/me").then(({ data }) => {
      setUser(data.user);
      localStorage.setItem("vaibhav_user", JSON.stringify(data.user));
    }).catch(() => logout());
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, isAuthenticated: Boolean(user) }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuthContext must be used inside AuthProvider");
  return value;
}
