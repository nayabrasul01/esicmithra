import API from "./commonRestService";
import { createLogger } from "../util/logger";

const logger = createLogger("AuthService");

export const sendOtp = async (userId) => {
  logger.info("Sending OTP to user", { userId });
  try {
    const response = await API.post("/auth/send-otp?userId=" + userId);
    logger.info("OTP request succeeded", {
      userId,
      status: response?.status,
    });
    return response;
  } catch (error) {
    logger.error("OTP request failed", error, { userId });
    throw error;
  }
};

export const verifyOtp = async (userId, otp) => {
  logger.info("Verifying OTP", { userId, otpLength: otp?.length });
  try {
    const response = await API.post("/auth/verify-otp?userId=" + userId + "&otp=" + otp);
    logger.info("OTP verification response received", {
      userId,
      status: response?.status,
    });
    return response;
  } catch (error) {
    logger.error("OTP verification failed", error, { userId });
    throw error;
  }
};

// This is for username/password login, which is currently not in use but may be implemented in the future
export const authenticate = async (userId, password) => {
  logger.warn("Username/password authentication invoked", { userId });
  try {
    const response = await API.post("/auth/authenticate?username=" + userId + "&password=" + password);
    logger.info("Username/password authentication completed", {
      userId,
      status: response?.status,
    });
    return response;
  } catch (error) {
    logger.error("Username/password authentication failed", error, { userId });
    throw error;
  }
};

export const validateOtp = (payload) => {
  logger.info("Validating OTP via payload", {
    userId: payload?.Username,
    sessionId: payload?.sessionId,
    hasOtp: Boolean(payload?.OTP || payload?.otp),
  });
  return API.post("/auth/validate-otp", payload);
};

export const getDashboardData = (userId) => {
  logger.debug("Fetching dashboard data", { userId });
  return API.get(`/dashboard/${userId}`);
};

export const searchByIpNumber = (ipNumber) => {
  logger.info("Searching IP details", { ipNumber });
  return API.get(`/dashboard/search/${ipNumber}`);
};

export const getHistory = (uhid) =>
  API.get(`/treatment/history/${uhid}`).then((response) => {
    logger.info("Fetched history", {
      uhid,
      records: response?.data?.data?.length || 0,
    });
    return response;
  }).catch((error) => {
    logger.error("Failed to fetch history", error, { uhid });
    throw error;
  });

export const saveTreatment = (payload) =>
  API.post("/treatment", payload)
    .then((response) => {
      logger.info("Treatment saved", {
        uhid: payload?.uhid,
        ipNumber: payload?.ipNumber,
        status: response?.status,
      });
      return response;
    })
    .catch((error) => {
      logger.error("Failed to save treatment", error, {
        uhid: payload?.uhid,
        ipNumber: payload?.ipNumber,
      });
      throw error;
    });

export const uploadFile = (treatmentId, file) => {
  const form = new FormData();
  form.append("file", file);

  logger.info("Uploading file", {
    treatmentId,
    fileName: file?.name,
    fileSize: file?.size,
  });

  return API.post(
    `/treatment/upload/${treatmentId}`,
    form,
    { headers:{ "Content-Type":"multipart/form-data"} }
  ).then((response) => {
    logger.info("File upload completed", {
      treatmentId,
      status: response?.status,
    });
    return response;
  }).catch((error) => {
    logger.error("File upload failed", error, { treatmentId });
    throw error;
  });
};

export const downloadFile = (docId, fileType) =>
  API.get(`/treatment/download/?docId=${docId}&fileType=${fileType}`,
    {
        responseType: "blob"   // 🔥 IMPORTANT
      }
  ).then((response) => {
    logger.info("File download ready", { docId, fileType });
    return response;
  }).catch((error) => {
    logger.error("File download failed", error, { docId, fileType });
    throw error;
  });

export const generatePrescription = (payload) => 
  API.post(
    `/treatment/generate-pdf`,
      payload,
    { responseType: "blob" }
).then((response) => {
  logger.info("Prescription generation completed", {
    uhid: payload?.uhid,
    ipNumber: payload?.ipNumber,
  });
  return response;
}).catch((error) => {
  logger.error("Prescription generation failed", error, {
    uhid: payload?.uhid,
    ipNumber: payload?.ipNumber,
  });
  throw error;
});

  // export const sendOtp = (userId) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         success: true,
//         otp: "123456"   // dummy OTP
//       });
//     }, 1000);
//   });
// };

