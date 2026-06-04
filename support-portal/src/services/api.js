import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vaibhav_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) localStorage.removeItem("vaibhav_access_token");
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: "/auth",
  cars: "/cars",
  inventory: "/inventory",
  bookings: "/bookings",
  purchases: "/purchases",
  customers: "/customers",
  employees: "/employees",
  support: "/support",
  analytics: "/analytics",
  documents: "/documents",
  careers: "/careers",
  ai: "/ai",
  offers: "/offers",
  notifications: "/notifications",
};

export default api;
