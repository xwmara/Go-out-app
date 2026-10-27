import axios from "axios";

export const api = axios.create({
  baseURL: "https://localhost:7021/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("goout_user");
    }

    return Promise.reject(error);
  },
);
