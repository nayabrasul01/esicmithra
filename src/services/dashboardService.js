import axios from "axios";
import API from "./commonRestService";
import { createLogger } from "../util/logger";

const logger = createLogger("DashboardService");

export const validateCaptcha = async (token) => {
  try {
    const res = await API.post(`/dashboard/verify`, { captchaValue: token });
    return res.data;
  } catch (error) {
    logger.error("Captcha validation failed", error, { token });
    throw error;
  }
}