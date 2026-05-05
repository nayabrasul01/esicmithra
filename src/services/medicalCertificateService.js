import axios from "axios";
import API from "./commonRestService";
import { createLogger } from "../util/logger";

const logger = createLogger("MedicalCertificateService");

export const createMedicalCertificate = async (payload) => {
  try {
    const res = await API.post("/certificates/create", payload);
    logger.info("Medical certificate created successfully", {
      referralId: res?.data,
      responseMessage: res?.data?.message,
    });
    return res.data;
  } catch (error) {
    // logger.error("Creating medical certificate failed", error, {
    //   ipNumber: payload?.patient?.ipNumber,
    // });
    throw error;
  }
};

export const fetchPreviousCertificateHistory = async (ipNumber) => {
  try {
    const res = await API.get(`/certificates/previous-history/${ipNumber}`);
    return res.data;
  } catch (error) {
    logger.error("Error fetching previous certificate history", error);
    throw error;
  }
};

export const closePreviousInProgressCertificate = async (ipNumber) => {
  try {
    const res = await API.put(`/certificates/close-all/${ipNumber}`);
    return res.data;
  } catch (error) {
    logger.error("Error closing previous in-progress certificate", error, {
      ipNumber,
    });
    throw error;
  }
}
