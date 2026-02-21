import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:8080/api",
  baseURL: "http://10.10.13.233:9092/api",
  // baseURL: "/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("session");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default API;