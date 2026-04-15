import axios from "axios";
import { createLogger } from "../util/logger";

const logger = createLogger("APIClient");

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("session");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  logger.debug("Outgoing request", {
    method: (config.method || "get").toUpperCase(),
    url: config.url,
    hasAuth: Boolean(token),
  });
  return config;
});

API.interceptors.response.use(
  (response) => {
    logger.debug("Response received", {
      url: response.config?.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    logger.error("API error", error, {
      url: error?.config?.url,
      status: error?.response?.status,
    });
    return Promise.reject(error);
  }
);

export default API;
