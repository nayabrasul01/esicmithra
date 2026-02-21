import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "../util/toastUtil";
import { fetchLabTests, fetchEdlDrugs, savePrescription, getTreatmentDetails } from "../services/treatmentService";
import { uploadFile, getHistory } from "../services/authService";
import { MdCancel } from "react-icons/md";
import { FaHistory } from "react-icons/fa";
import PatientHistoryModal from "../components/PatientHistoryModal"


const PrescriptionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const patient = location?.state?.patient;
  const user = JSON.parse(localStorage.getItem("user"));

  const [clinical, setClinical] = useState({
    symptoms: "",
    bp: "",
    pulseRate: "",
    examFindings: "",
    diagnosis: "",
    remarks:""
  });

  const [labTests, setLabTests] = useState([]);
  const [edlDrugs, setEdlDrugs] = useState([]);

  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);

  const [file, setFile] = useState(null);

  const [saving, setSaving] = React.useState(false);
  const [savedData, setSavedData] = React.useState(null);

  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [historyData, setHistoryData] = React.useState([]);
  const [expandedId, setExpandedId] = React.useState(null);
  const [historyLoading, setHistoryLoading] = React.useState(false);


  const canSubmit =
    (!!patient &&
    (clinical.symptoms || "").trim().length > 0 &&
    (clinical.examFindings || "").trim().length > 0 &&
    (clinical.bp || "").trim().length > 0 &&
    (clinical.pulseRate || "").trim().length > 0 &&
    (clinical.diagnosis || "").trim().length > 0) || (file !== null && clinical.remarks.trim().length > 0);

  const fileInputRef = React.useRef(null);

  const handleRemove = () => {
    setFile(null);

    // Clear file input value also
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [labRes, drugRes] = await Promise.all([
        fetchLabTests(),
        fetchEdlDrugs(),
      ]);

      if (labRes?.success) setLabTests(labRes.data || []);
      if (drugRes?.success) setEdlDrugs(drugRes.data || []);
    } catch (err) {
      console.error("Error loading master data", err);
    }
  };

  // If user directly hits URL without selecting patient
  if (!patient) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Patient details not found. Please go back and select a patient.
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/patients")}>
          Go Back
        </button>
      </div>
    );
  }

  const handleClinicalChange = (e) => {
    const { name, value } = e.target;

    setClinical((prev) => ({ ...prev, [name]: value }));
    setCanSubmit(canSubmit);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(file){
        setSaving(true);
        const response = await getTreatmentDetails(patient.id);
        if(response.success)
          await handleUpload(response.data.id, file);
        else{
          setSaving(false);
          showToast("Prescription not saved as there is no treatment record created earlier. Please create prescription and try again.", "warning");
        }
      } 
    }catch (error) {
      setSaving(false);
      showToast("Error uploading file: " + error.message, "error");
    }finally{
      navigate("/ip-list");
    }
    // Payload ready for backend
    const payload = {
      patientId: patient.id,
      uhid: patient.uhid,
      name: patient.name,
      relationship: patient.relationship,
      gender: patient.gender,
      dob: patient.dob,
      state: patient.state,
      ipNumber: patient.ipNumber,
      doctorUserId: user.userId,

      clinicalData:{
        symptoms: clinical.symptoms,
        bloodPressure: clinical.bp,
        pulse: clinical.pulseRate,
        examinationFindings: clinical.examFindings,
        diagnosis: clinical.diagnosis,
        remarks: clinical.remarks
      },

      labTests: selectedLabTests,
      edlDrugs: selectedDrugs,
    };

    try {
      const response = await savePrescription(payload);
      if(response.data.success){
        setSaving(false);
        showToast("Prescription saved successfully!", "success");
        navigate("/ip-list");
      }
    } catch (error) {
      setSaving(false);
      showToast("Error saving prescription." + error, "error");
    }
  };

  const handleUpload = async(treatmentId,file)=>{
      try{
          const res = await uploadFile(treatmentId,file);
          showToast(res.data.message, "success");
      }catch(e){
          showToast(e.response.data.message, "danger")
      }
  }

  const fetchPatientHistory = async () => {
    if (!patient?.uhid) return;

    try {
      setHistoryLoading(true);
      const response = await getHistory(patient.uhid);
      if (response.data.success) {
        setHistoryData(response.data.data);
        setShowHistoryModal(true);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      showToast("Error fetching history:" + error, "danger")
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <>
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div className="container py-4" style={{ maxWidth: "1000px" }}>
        {/* Patient Information */}
        <div
          className="card shadow-sm mb-4"
          style={{ borderRadius: "10px", border: "1px solid #e6eef5" }}
        >
          <div className="card-body">
            <h5 className="fw-bold mb-3">Patient Information</h5>

            <div className="row g-3" style={{ fontSize: "14px" }}>
              <div className="col-md-3">
                <div className="text-muted">UHID</div>
                <div className="fw-semibold">{patient.uhid || "-"}</div>
              </div>

              <div className="col-md-3">
                <div className="text-muted">Name</div>
                <div className="fw-semibold">{patient.name}</div>
              </div>

              <div className="col-md-2">
                <div className="text-muted">Gender</div>
                <div className="fw-semibold">{patient.gender || "-"}</div>
              </div>

              <div className="col-md-2">
                <div className="text-muted">DOB</div>
                <div className="fw-semibold">{patient.dob || "-"}</div>
              </div>

              <div className="col-md-2">
                <div className="text-muted">Patient History</div>
                <div className="fw-semibold">
                  <button
                    className="btn btn-sm btn-esic"
                    onClick={fetchPatientHistory}
                  >
                    <FaHistory />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form>
          {/* Clinical Details */}
          <div
            className="card shadow-sm mb-4"
            style={{ borderRadius: "10px", border: "1px solid #e6eef5" }}
          >
            <div className="card-body">
              <h5 className="fw-bold mb-3">Clinical Details</h5>

              <div className="mb-3">
                <label className="form-label fw-semibold"><span style={{color: "red"}}>* </span>Symptoms</label>
                <textarea
                  className="form-control"
                  rows={3}
                  name="symptoms"
                  value={clinical.symptoms}
                  onChange={handleClinicalChange}
                  disabled={file}
                  placeholder="Enter patient symptoms..."
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                   <span style={{color: "red"}}>* </span>Blood Pressure (BP)
                  </label>
                  <input
                    className="form-control"
                    name="bp"
                    value={clinical.bp}
                    onChange={handleClinicalChange}
                    disabled={file}
                    placeholder="e.g., 120/80"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold"><span style={{color: "red"}}>* </span>Pulse Rate</label>
                  <input
                    className="form-control"
                    name="pulseRate"
                    value={clinical.pulseRate}
                    onChange={handleClinicalChange}
                    disabled={file}
                    placeholder="e.g., 72"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <span style={{color: "red"}}>* </span>Examination Findings
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  name="examFindings"
                  value={clinical.examFindings}
                  onChange={handleClinicalChange}
                  disabled={file}
                  placeholder="Enter examination findings..."
                />
              </div>

              <div>
                <label className="form-label fw-semibold"><span style={{color: "red"}}>* </span>Diagnosis</label>
                <textarea
                  className="form-control"
                  rows={3}
                  name="diagnosis"
                  value={clinical.diagnosis}
                  onChange={handleClinicalChange}
                  disabled={file}
                  placeholder="Enter diagnosis..."
                />
              </div>
            </div>
          </div>

          {/* Lab Tests - Search Multi Select */}
          <MultiSelectSearch
            label="Lab Tests"
            placeholder="Search lab test..."
            options={labTests}
            selectedValues={selectedLabTests}
            onAdd={(test) => {
              if (!selectedLabTests.some((x) => x.id === test.id)) {
                setSelectedLabTests((prev) => [...prev, test]);
              }
            }}
            onRemove={(id) => {
              setSelectedLabTests((prev) => prev.filter((x) => x.id !== id));
            }}
            enable={!file}
          />

          {/* EDL Drugs - Search Multi Select */}
          <MultiSelectSearch
            label="EDL Drugs"
            placeholder="Search drug..."
            options={edlDrugs}
            selectedValues={selectedDrugs}
            onAdd={(drug) => {
              if (!selectedDrugs.some((x) => x.id === drug.id)) {
                setSelectedDrugs((prev) => [...prev, drug]);
              }
            }}
            onRemove={(id) => {
              setSelectedDrugs((prev) => prev.filter((x) => x.id !== id));
            }}
            enable={!file}
          />

          {/* Upload Prescription */}
          <div className="card-body">
            <h5 className="fw-bold mb-3">Upload Prescription</h5>

            <input
              ref={fileInputRef}
              type="file"
              className="form-control"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {/* Selected file badge */}
            { file && (
              <div
                className="border rounded mt-3 p-3"
                style={{ minHeight: "70px", background: "#fff" }}
              >
                <div className="d-flex flex-wrap gap-2">
                    <span
                      className="badge rounded-pill bg-light text-dark border d-flex align-items-center gap-2"
                      style={{
                        padding: "10px 12px",
                        fontSize: "13px",
                      }}
                    >
                      {file.name}

                      <button
                        type="button"
                        className="btn btn-sm p-0 border-0 bg-transparent"
                        style={{ fontSize: "14px", lineHeight: 1 }}
                        title="Remove file"
                        onClick={handleRemove}
                      >
                        <MdCancel />
                      </button>
                    </span>
                  </div>
              </div>
            )}
          </div>

          <div className="mt-3">
            <label className="form-label fw-semibold">
            <span style={{color: "red"}}>* </span>  
              Remarks
            </label>
            <textarea
              className="form-control"
              rows={2}
              name="remarks"
              value={clinical.remarks}
              onChange={handleClinicalChange}
              disabled={!file}
              placeholder="Note: Remarks is mandatory when uploading prescription file."
              style={{ fontSize: "14px" }}
            />
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 mb-4 mt-4">
            <button type="button" 
              disabled={!canSubmit || saving}
              className="btn btn-primary btn-esic px-4"
              onClick={handleSubmit}
              >
                {saving ? "Saving..." : "Save Prescription"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => navigate("/ip-list")}
              >
                Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

   <PatientHistoryModal
      show={showHistoryModal}
      onClose={() => setShowHistoryModal(false)}
      patient={patient}
      historyData={historyData}
      loading={historyLoading}
    />
    </>
  );
};

const MultiSelectSearch = ({
  label,
  placeholder,
  options,
  selectedValues,
  onAdd,
  onRemove,
  enable,
}) => {
  const [query, setQuery] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return options
      .filter((opt) => opt.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query, options]);

  const isSelected = (id) => selectedValues.some((x) => x.id === id);

  const handleSelect = (item) => {
    onAdd(item);
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="mb-4">
      {/* <h5 className="fw-bold mb-3"><span style={{color: "red"}}>* </span>{label}</h5> */}
      <label className="form-label fw-semibold">
        <span style={{color: "red"}}>* </span>  
          {label}
      </label>

      {/* Search input */}
      <div className="position-relative">
        <input
          className="form-control"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 150);
          }}
          disabled={!enable}
        />

        {/* Dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div
            className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
            style={{ zIndex: 50, maxHeight: "220px", overflowY: "auto" }}
          >
            {filtered.map((item) => {
              const alreadySelected = isSelected(item.id);

              return (
                <div
                  key={item.id}
                  className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
                  style={{
                    cursor: alreadySelected ? "not-allowed" : "pointer",
                  }}
                  onMouseDown={() => {
                    if (!alreadySelected) handleSelect(item);
                  }}
                >
                  <div style={{ fontSize: "14px" }}>{item.name}</div>

                  {alreadySelected ? (
                    <span className="text-muted" style={{ fontSize: "13px" }}>
                      Added
                    </span>
                  ) : (
                    <span className="text-primary" style={{ fontSize: "13px" }}>
                      Add
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected items box */}
      {selectedValues.length > 0 && (
        <div
          className="border rounded mt-3 p-3"
          style={{
            minHeight: "90px",
            background: "#fff",
          }}
        >
          <div className="d-flex flex-wrap gap-2">
            {selectedValues.map((item) => (
              <span
                key={item.id}
                className="badge rounded-pill bg-light text-dark border"
                style={{
                  padding: "8px 10px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                title="Click to remove"
                onClick={() => onRemove(item.id)}
              >
                {item.name} ✕
              </span>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};


export default PrescriptionForm;
