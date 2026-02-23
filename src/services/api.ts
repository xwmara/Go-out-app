import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api", // legare backend
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor pentru token de autentificare
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});