import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchByIpNumber } from "../services/authService";
import { calculateAge } from "../util/utilities";
import { showToast } from "../util/toastUtil";
import { useAlert } from "./../components/alert/AlertContext";

import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";

import SickCertificateForm from "../components/certification/SickCertificateForm";
import MaternityCertificateForm from "../components/certification/MaternityCertificateForm";

export default function CreateMedicalCertification() {
  const location = useLocation();
  const { alert, confirm } = useAlert();
  const [certificateCategory, setCertificateCategory] = useState( location?.state?.cert?.certificateType || "MATERNITY");
  const [patient, setPatient] = useState(null);
  const [ipNumber, setIpNumber] = useState("");
  const [searching, setSearching] = useState(false);

  const certificateData = location?.state?.cert;

  useEffect(() => {
    if (certificateData?.patient?.ipNumber) {
      const ip = certificateData.patient?.ipNumber;
      handleSearch(ip);
    }
  }, [certificateData]);

  const handleSearch = async (searchIp) => {
    // if (e?.preventDefault) e.preventDefault();
    const actualIp = searchIp || ipNumber;
    setSearching(true);
    try {
      // mocking data Headers, since the staging API is not working as expected. Will remove this once the API is fixed.
      // const res = await axios.get(`http://localhost:3000/LiveListData`);

      const res = await searchByIpNumber(actualIp);
      if (res.data.success) {
        if (
          res.data.data.InsuredPersonFamilyDetails == null ||
          res.data.data.personalDetails == null
        ) {
          await alert("No records found for the given IP.", "warning");
          return;
        }
        const selfMember = {
          name: res.data.data.personalDetails[0].name,
          relationship: "Self",
          relatedToName: res.data.data.personalDetails[0].name,
          dob: res.data.data.personalDetails[0].dateOfBirth,
          sex: res.data.data.personalDetails[0].sex,
          residingState:
            res.data.data.AddressDetails[0].address1 +
            ", " +
            res.data.data.AddressDetails[0].address2,
          marstatus: res.data.data.personalDetails[0].maritalStatus,
          uHID: res.data.data.uHID,
          ipNumber: actualIp,
          employerCode:
            res.data.data.presentEmployerDetailsCollection[0].employerCode,
        };
        setPatient(selfMember);
        // showToast("Patient records fetched.", "success");
      }
      setSearching(false);
    } catch (err) {
      // showToast(err?.response?.data?.message, "danger");
      await alert(
        err?.response?.data?.message ||
          "An error occurred while fetching patient records. Please try again.",
        "danger",
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container py-3 text-esic">
      {/* /* Header */}
      <div className="card border-0 text-esic mb-2">
        <div
          className="card-body border"
          style={{ backgroundColor: "#FBFAC2" }}
        >
          <div className="d-flex">
            <div>
              <h4 className="fw-bold mb-1">Certification Generation</h4>

              <div className="text-muted" style={{ fontSize: "14px" }}>
                Generate Sick / Maternity Certificates
              </div>
            </div>

            {/* Radio Switch */}
            <div className="d-flex align-items-center gap-4 mx-4">
              {/* Sick Certification */}
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="certificateCategory"
                  id="sickCertification"
                  value="SICK"
                  checked={certificateCategory === "SICK"}
                  onChange={(e) => setCertificateCategory(e.target.value)}
                  style={{ accentColor: "#742902" }}
                  disabled={certificateData}
                />

                <label
                  className="form-check-label fw-semibold"
                  htmlFor="sickCertification"
                >
                  Sick Certification
                </label>
              </div>

              {/* Maternity Certification */}
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="certificateCategory"
                  id="maternityCertification"
                  value="MATERNITY"
                  checked={certificateCategory === "MATERNITY"}
                  onChange={(e) => setCertificateCategory(e.target.value)}
                  disabled={certificateData}
                />

                <label
                  className="form-check-label fw-semibold"
                  htmlFor="maternityCertification"
                >
                  Maternity Certification
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body text-esic">
          {/* <h5>Certificate Generation</h5> */}
          <div className="d-flex gap-2">
            <div className="form-label my-auto" style={{ fontSize: "18px" }}>
              Insurance No.
            </div>
            <input
              className="form-control"
              style={{ width: "300px" }}
              placeholder="Enter 10-digit Insurance No"
              value={ipNumber || certificateData?.patient?.ipNumber || ""}
              onChange={(e) => setIpNumber(e.target.value)}
              maxLength={10}
              inputMode="numeric"
              disabled={certificateData}
            />
            <button
              className="btn btn-esic"
              disabled={ipNumber.length !== 10}
              // onClick={handleSearch}
              onClick={(e) => {
                setSearching(true);
                setTimeout(() => {
                  handleSearch(ipNumber);
                }, 1000); // for testing purpose, to show the loading spinner. Remove the setTimeout in production.
              }}
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      {!searching && patient && (
        <div className="card mb-3">
          <div className="card-header text-esic">Patient Information</div>
          <div className="card-body text-esic">
            <div className="row">
              <div className="col-md-2">
                <b>Insurance No.: </b>
                {patient.ipNumber}
              </div>
              <div className="col-md-2">
                <b>UHID: </b>
                {patient.uHID}
              </div>
              <div className="col-md-2">
                <b>Name: </b>
                {patient.name}
              </div>
              <div className="col-md-2">
                <b>DOB: </b>
                {patient.dob.split(" ")[0]}
              </div>
              <div className="col-md-2">
                <b>Age/Gender: </b>
                {calculateAge(patient.dob)} Years/{patient.sex}
              </div>
              <div className="col-md-2">
                <b>Relationship: </b>
                {patient.relationship}
              </div>
            </div>
          </div>
        </div>
      )}

      {searching && <LoadingSpinner message="Fetching patient details..." />}

      {/* Main Form */}
      {!searching &&
        (certificateData ? patient : patient || certificateData) &&
        (certificateCategory === "MATERNITY" ? (
            <MaternityCertificateForm
            patient={patient}
            certificateData={certificateData}
            mode={!!certificateData}
          />
        ) : (
          <SickCertificateForm
            patient={patient}
            certificateData={certificateData}
            mode={!!certificateData}
          />
        ))}
    </div>
  );
}
