import axios from "axios";
import API from "./commonRestService";
import { createLogger } from "../util/logger";

const logger = createLogger("ReferralService");

export const createReferralRequest = async (payload) => {
  try {
    const res = await API.post("/referrals", payload);
    logger.info("Referral request created successfully", {
      referralId: res?.data?.referralId,
      responseMessage: res?.data?.responseMessage,
    });
    return res.data;
  } catch (error) {
    logger.error("Creating referral request failed", error, {
      patientId: payload?.patientId,
    });
    throw error;
  }
};

export const fetchPhotoUrl = async (payload) => {
  try {
    const res = await API.post("/referrals/photo", payload);
    logger.info("Fetched photo URL", {
      beneficiaryId: payload?.beneficiaryId,
      responseMessage: res?.data?.responseMessage,
    });
    return res.data;
  } catch (error) {
    logger.error("Fetching photo URL failed", error, {
      beneficiaryId: payload?.beneficiaryId,
    });
    throw error;
  }
};

export const fetchSnomed = async (term) => {
  try {
    const res = await API.get(`/referrals/snomed?term=${term}`)
    return res.data;
  } catch (error) {
     logger.error("Fetching SNOMED terms failed", error );
    throw error;
  }
}

export const fetchICDCode = async (conceptId) => {
  try {
    const res = await API.get(`/referrals/icdcodes?conceptId=${conceptId}`)
    return res.data;
  } catch (error) {
     logger.error("Fetching ICD codes failed", error );
    throw error;
  }
}

export const fetchReferrals = async (locationId) => {
  try {
    const res = await API.get(`/referrals/location?locationId=${locationId}`);
    return res.data;
  } catch (error) {
    logger.error("Fetching referrals failed", error);
    throw error;
  }
};

export const fetchReferral = async (referralId) => {
  try {
    const res = await API.get(`/referrals/${referralId}`);
    return res.data;
  } catch (error) {
    logger.error("Fetching referrals failed", error);
    throw error;
  }
};

export const updateStatus = async (referralId, status, userId) => {
  try {
    const res = await API.put(`/referrals/status`, {
      referralId: referralId,
      status: status,
      remarks: 'Referral request status updated',
      updatedBy: userId
    })
    return res.data;
  } catch (error) {
    logger.error("Status approval failed", error);
    throw error;
  }
}

export const downloadFile = (id, fileType) =>
  API.get(`/referrals/download?id=${id}&fileType=${fileType}`,
    {
      responseType: "blob"   // 🔥 IMPORTANT
    }
  ).then((response) => {
    logger.info("File download ready", { id });
    return response;
  }).catch((error) => {
    logger.error("File download failed", error, { id });
    throw error;
  });

export const uploadFile = (referralId, id, file) => {
  const form = new FormData();
  form.append("file", file);

  return API.post(
    `/referrals/upload/${referralId}/${id}`,
    form,
    { headers:{ "Content-Type":"multipart/form-data"} }
  ).then((response) => {
    logger.info("File upload completed", {
      referralId,
      status: response?.status,
    });
    return response;
  }).catch((error) => {
    logger.error("File upload failed", error, { referralId });
    throw error;
  });
};