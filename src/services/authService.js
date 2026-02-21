import API from "./commonRestService";

export const sendOtp = async (userId) => {
  return API.post("/auth/send-otp?userId=" + userId);
};

export const verifyOtp = async (userId, otp) => {
  return API.post("/auth/verify-otp?userId=" + userId + "&otp=" + otp);
};

// This is for username/password login, which is currently not in use but may be implemented in the future
export const authenticate = async (userId, password) => {
  return API.post("/auth/authenticate?username=" + userId + "&password=" + password);
};

export const validateOtp = (payload) => {
  return API.post("/auth/validate-otp", payload);
};

export const getDashboardData = (userId) => {
  return API.get(`/dashboard/${userId}`);
};

export const searchByIpNumber = (ipNumber) => {
  return API.get(`/dashboard/search/${ipNumber}`);
};

export const getHistory = (uhid) =>
  API.get(`/treatment/history/${uhid}`);

export const saveTreatment = (payload) =>
  API.post("/treatment", payload);

export const uploadFile = (treatmentId, file) => {
  const form = new FormData();
  form.append("file", file);

  return API.post(
    `/treatment/upload/${treatmentId}`,
    form,
    { headers:{ "Content-Type":"multipart/form-data"} }
  );
};

export const downloadFile = (docId, fileType) =>
  API.get(`/treatment/download/?docId=${docId}&fileType=${fileType}`,
    {
        responseType: "blob"   // 🔥 IMPORTANT
      }
  );

export const downloadPrescription = (payload) => 
  API.post(
    `/treatment/generate-pdf`,
      payload,
    { responseType: "blob" }
);

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


