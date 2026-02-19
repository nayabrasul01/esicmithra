import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  // baseURL: "http://10.10.13.233:9092/api",
  // baseURL: "/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("session");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const sendOtp = async (userId) => {
  return API.post("/auth/send-otp?userId=" + userId);
};

export const authenticate = async (userId, password) => {
  return API.post("/auth/authenticate?username=" + userId + "&password=" + password);
};

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

// export const verifyOtp = (otp) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (otp === "123456") {
//         resolve({
//           success: true,
//           token: "dummy-jwt-token"
//         });
//       } else {
//         resolve({
//           success: false,
//           message: "Invalid OTP"
//         });
//       }
//     }, 1000);
//   });
// };

export const verifyOtp = async (userId, otp) => {
  return API.post("/auth/verify-otp?userId=" + userId + "&otp=" + otp);
};

export const validateOtp = (payload) => {
  return API.post("/auth/validate-otp", payload);
};

  
// export const createSession = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         sessionId: "SESSION_" + Date.now(),
//         expiresIn: 1800
//       });
//     }, 500);
//   });
// };

export const getDashboardData = (userId) => {
  return API.get(`/dashboard/${userId}`);
};


export const searchByIpNumber = (ipNumber) => {
  return API.get(`/dashboard/search/${ipNumber}`);
};


// export const fetchUserData = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         appointmentDate: "13-12-2021 00:00:00",
//         dateOfregistration: "27-03-2010 00:00:00",
//         empRegPK: null,
//         employeeIPNo: "1111111111,8790169068",
//         InsuredPersonFamilyDetails: [
//           {
//             relationship: "Dependant father",
//             name: "test",
//             dob: "06-06-1950 00:00:00",
//             sex: "F",
//             residingState: "Delhi"
//           },
//           {
//             relationship: "Minor dependant son",
//             name: "Test2",
//             dob: "02-02-2021 00:00:00",
//             sex: "M",
//             residingState: "Uttar Pradesh"
//           }
//         ]
//       });
//     }, 1000);
//   });
// };

// export const fetchPreviousPrescription = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         hasData: true,
//         prescription: "Paracetamol twice daily",
//         document: "old_prescription.pdf"
//       });
//     }, 800);
//   });
// };

// export const submitPrescription = (payload) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       console.log("Sent to backend:", payload);
//       resolve({ success: true });
//     }, 1000);
//   });
// };

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

