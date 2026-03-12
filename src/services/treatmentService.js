import API from "./commonRestService";

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

export const getStatesData = async () => {
  const res = await API.get("/location/states");
  return res.data;
}

export const getDistrictsData = async (stateCode) => {
  const res = await API.get(`/location/districts/${stateCode}`);
  return res.data;
}

export const getSubDistrictsData = async (districtCode) => {
  const res = await API.get(`/location/sub-districts/${districtCode}`);
  return res.data;
}

export const createUHID = async (payload) => {
  const res = await API.post("/patients/createUHID", payload);
  return res.data;
}