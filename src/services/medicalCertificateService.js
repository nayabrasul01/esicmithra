import axios from "axios";
import API from "./commonRestService";
import { createLogger } from "../util/logger";

const logger = createLogger("MedicalCertificateService");

export const createMedicalCertificate = async (payload) => {
  try {
    const res = await API.post("/medical-certificates/sick/create", payload);
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

export const updateSickCertificate = async (payload) => {
  try {
    const res = await API.put("/medical-certificates/sick/update", payload);
    logger.info("Medical certificate updated successfully", {
      referralId: res?.data,
      responseMessage: res?.data?.message,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateMaternityCertificate = async (payload) => {
  try {
    const res = await API.put("/medical-certificates/maternity/update", payload);
    logger.info("Maternity certificate updated successfully", {
      referralId: res?.data,
      responseMessage: res?.data?.message,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createMedicalMaternityCertificate = async (payload) => {
  try {
    const res = await API.post("/medical-certificates/maternity/create", payload);
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
    const res = await API.get(
      `/medical-certificates/previous-history/ipNumber/${ipNumber}`,
    );
    return res.data;
  } catch (error) {
    logger.error("Error fetching previous certificate history", error);
    throw error;
  }
};

export const closePreviousInProgressCertificate = async (ipNumber) => {
  try {
    const res = await API.put(`/medical-certificates/close-all/${ipNumber}`);
    return res.data;
  } catch (error) {
    logger.error("Error closing previous in-progress certificate", error, {
      ipNumber,
    });
    throw error;
  }
};

export const generateCertificate = async (payload) => {
  try {
    const res = await API.post("/medical-certificates/generate", payload, {
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    logger.error("Error generating certificate", error, {
      certificateId: payload?.id,
      certificateNumber: payload?.certificateNumber,
    });
    return { success: false, error };
  }
};

export const downloadFile = async (id) => {
  try {
    const res = await API.get(`/medical-certificates/download?id=${id}`, {
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    logger.error("Error generating certificate", error, {
      certificateId: id
    });
    throw error;
  }
};

export const fetchCertificatesByLocation = async (locationId) => {
  try {
    const res = await API.get(`/medical-certificates/previous-history/location/${locationId}`);
    return res.data;
  } catch (error) {
    logger.error("Error fetching certificates by location", error, {
      locationId,
    });
    throw error;
  }
};

