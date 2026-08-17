import axios from "axios";

export const TOKEN_KEY = "@connectionjs:token";

export const api = axios.create({
  baseURL: "http://localhost:3100/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
