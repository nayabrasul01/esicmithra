import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ReferralForm = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doctor: "",
    facilityType: "",
    referralType: "",
    department: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Referral Form Data:", formData);

    // later: call backend API here
    alert("Referral submitted");
    navigate("/home");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 15px",
      }}
    >
      <div
        className="card shadow-sm"
        style={{
          width: "100%",
          maxWidth: "750px",
          borderRadius: "10px",
          border: "1px solid #e6eef5",
        }}
      >
        <div className="card-body p-4">
          <h4 className="fw-bold mb-1 text-center">Create Referral Document</h4>
          {/* <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
            Draft referral for patient to another facility
          </p> */}

          <form onSubmit={handleSubmit}>
            {/* Doctor */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Select Referring Doctor
              </label>
              <select
                className="form-select"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
              >
                <option value="">Choose Doctor</option>
                <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
                <option value="Dr. Anjali Sharma">Dr. Anjali Sharma</option>
                <option value="Dr. Praveen Reddy">Dr. Praveen Reddy</option>
              </select>
            </div>

            {/* Facility Type */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Facility Type</label>

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="facilityType"
                  id="esiHospital"
                  checked={formData.facilityType === "ESI Hospital"}
                  onChange={() =>
                    handleRadioChange("facilityType", "ESI Hospital")
                  }
                />
                <label className="form-check-label" htmlFor="esiHospital">
                  ESI Hospital
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="facilityType"
                  id="pmjayHospital"
                  checked={formData.facilityType === "PMJAY Hospital"}
                  onChange={() =>
                    handleRadioChange("facilityType", "PMJAY Hospital")
                  }
                />
                <label className="form-check-label" htmlFor="pmjayHospital">
                  PMJAY Hospital
                </label>
              </div>
            </div>

            {/* Type of Referral */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Type of Referral</label>

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="referralType"
                  id="emergency"
                  checked={formData.referralType === "Emergency"}
                  onChange={() =>
                    handleRadioChange("referralType", "Emergency")
                  }
                />
                <label className="form-check-label" htmlFor="emergency">
                  Emergency
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="referralType"
                  id="routine"
                  checked={formData.referralType === "Routine"}
                  onChange={() => handleRadioChange("referralType", "Routine")}
                />
                <label className="form-check-label" htmlFor="routine">
                  Routine
                </label>
              </div>
            </div>

            {/* Department */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Select Department
              </label>
              <select
                className="form-select"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Choose Department</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="ENT">ENT</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
                className="btn btn-primary"
              style={{
                background: "#0d6efd",
                color: "#fff",
                borderRadius: "8px",
              }}
            >
              Submit Referral for Verification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReferralForm;
