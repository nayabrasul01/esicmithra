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


export const fetchPatients = async () => {
  return await API.get("/patients");
};

export const fetchLabTests = async (q) => {
  const res = await API.get(`/treatment/lab-tests/search?q=${encodeURIComponent(q)}`);
  return res.data;
};

export const fetchEdlDrugs = async (q) => {
  const res = await API.get(`/treatment/edl-drugs/search?q=${encodeURIComponent(q)}`);
  return res.data;
};

export const savePrescription = async (payload) => {
  return await API.post("/treatment/saveDocPrescription", payload);
}

export const getTreatmentDetails = async (patientId) => {
  const res = await API.get(`/treatment/${patientId}`);
  return res.data;
}