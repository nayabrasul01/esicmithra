import API from "./commonRestService";
import { createLogger } from "../util/logger";

const logger = createLogger("TreatmentService");

export const fetchPatients = async () => {
  logger.info("Fetching registered patients");
  try {
    const response = await API.get("/patients");
    logger.info("Fetched patients list", {
      total: response?.data?.data?.length ?? 0,
    });
    return response;
  } catch (error) {
    logger.error("Fetching patients failed", error);
    throw error;
  }
};

export const fetchLabTests = async (q = "") => {
  logger.debug("Searching lab tests", { query: q });
  try {
    const res = await API.get(`/treatment/lab-tests/search?q=${encodeURIComponent(q)}`);
    logger.info("Lab tests search completed", {
      query: q,
      matches: res?.data?.length ?? 0,
    });
    return res.data;
  } catch (error) {
    logger.error("Lab tests search failed", error, { query: q });
    throw error;
  }
};

export const fetchEdlDrugs = async (q = "") => {
  logger.debug("Searching EDL drugs", { query: q });
  try {
    const res = await API.get(`/treatment/edl-drugs/search?q=${encodeURIComponent(q)}`);
    logger.info("EDL drug search completed", {
      query: q,
      matches: res?.data?.length ?? 0,
    });
    return res.data;
  } catch (error) {
    logger.error("EDL drug search failed", error, { query: q });
    throw error;
  }
};

export const savePrescription = async (payload) => {
  logger.info("Saving prescription", {
    patientId: payload?.patientId,
    uhid: payload?.uhid,
  });
  try {
    const response = await API.post("/treatment/saveDocPrescription", payload);
    logger.info("Prescription save completed", {
      patientId: payload?.patientId,
      status: response?.status,
    });
    return response;
  } catch (error) {
    logger.error("Prescription save failed", error, {
      patientId: payload?.patientId,
      uhid: payload?.uhid,
    });
    throw error;
  }
};

export const getTreatmentDetails = async (patientId) => {
  logger.info("Fetching treatment details", { patientId });
  try {
    const res = await API.get(`/treatment/${patientId}`);
    logger.info("Treatment details received", {
      patientId,
      hasData: Boolean(res?.data),
    });
    return res.data;
  } catch (error) {
    logger.error("Failed to fetch treatment details", error, { patientId });
    throw error;
  }
};

export const getStatesData = async () => {
  logger.debug("Loading states master data");
  try {
    const res = await API.get("/location/states");
    logger.info("Loaded states data", {
      count: res?.data?.length ?? 0,
    });
    return res.data;
  } catch (error) {
    logger.error("Fetching states failed", error);
    throw error;
  }
};

export const getDistrictsData = async (stateCode) => {
  logger.debug("Loading districts", { stateCode });
  try {
    const res = await API.get(`/location/districts/${stateCode}`);
    logger.info("Loaded districts", {
      stateCode,
      count: res?.data?.length ?? 0,
    });
    return res.data;
  } catch (error) {
    logger.error("Fetching districts failed", error, { stateCode });
    throw error;
  }
};

export const getSubDistrictsData = async (districtCode) => {
  logger.debug("Loading sub districts", { districtCode });
  try {
    const res = await API.get(`/location/sub-districts/${districtCode}`);
    logger.info("Loaded sub districts", {
      districtCode,
      count: res?.data?.length ?? 0,
    });
    return res.data;
  } catch (error) {
    logger.error("Fetching sub districts failed", error, { districtCode });
    throw error;
  }
};

export const createUHID = async (payload) => {
  logger.info("Creating UHID", {
    ipNumber: payload?.insuranceNo,
    relationship: payload?.relationship,
  });
  try {
    const res = await API.post("/patients/createUHID", payload);
    logger.info("UHID creation completed", {
      ipNumber: payload?.insuranceNo,
      responseMessage: res?.data?.responseMessage,
    });
    return res.data;
  } catch (error) {
    logger.error("UHID creation failed", error, {
      ipNumber: payload?.insuranceNo,
    });
    throw error;
  }
};
