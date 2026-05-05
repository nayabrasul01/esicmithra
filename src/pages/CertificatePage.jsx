import { useState, useEffect } from "react";
import { CERTIFICATE_RULES } from "../util/certificateRules";
import CertificateForm from "../components/CertificateForm";

import { searchByIpNumber } from "../services/authService";
import { calculateAge } from "../util/utilities";
import { showToast } from "../util/toastUtil";

import LoadingSpinner from "../components/LoadingSpinner";

import axios from "axios";

export default function CertificatePage() {
  const [patient, setPatient] = useState(null);
  const [ipNumber, setIpNumber] = useState("");
  const [searching, setSearching] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();

    setSearching(true);
    try {
      // const res = await searchByIpNumber(ipNumber);
      // mocking data Headers, since the staging API is not working as expected. Will remove this once the API is fixed.
      const res = await axios.get(`http://localhost:3000/LiveListData`);
      if (res.data.success) {
        if (
          res.data.data.InsuredPersonFamilyDetails == null ||
          res.data.data.personalDetails == null
        ) {
          showToast("No records found for the given IP.", "warning");
          return;
        }
        const selfMember = {
          name: res.data.data.personalDetails[0].name,
          relationship: "Self",
          dob: res.data.data.personalDetails[0].dateOfBirth,
          sex: res.data.data.personalDetails[0].sex,
          residingState: res.data.data.AddressDetails[0].address1 + ", " + res.data.data.AddressDetails[0].address2,
          marstatus: res.data.data.personalDetails[0].maritalStatus,
          uHID: res.data.data.uHID,
          ipNumber: ipNumber,
        };
        setPatient(selfMember);
        // showToast("Patient records fetched.", "success");
      }
      setSearching(false);
    } catch (err) {
      console.log(err);
      // alert(err?.response?.data?.message);
      showToast(err?.response?.data?.message, "danger");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container py-3 text-esic">
      {/* /* Header */}
      <div className="card shadow-sm mb-3">
        <div
          className="card-header h5 text-center"
          style={{ backgroundColor: "#FBFAC2", color: "#742902" }}
        >
          Medical Certificate Generation
        </div>
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
              value={ipNumber}
              onChange={(e) => setIpNumber(e.target.value)}
              maxLength={10}
              inputMode="numeric"
            />
            <button
              className="btn btn-esic"
              disabled={ipNumber.length !== 10}
              // onClick={handleSearch}
              onClick={(e) => {
                setSearching(true);
                setTimeout(() => {
                  handleSearch(e);
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
        <div className="card mb-3 shadow-sm">
          <div className="card-header text-esic">Patient Information</div>
          <div className="card-body text-esic">
            <div className="row">
              <div className="col-md-2">Insurance No.: <b>{patient.ipNumber}</b></div>
              <div className="col-md-2">UHID: <b>{patient.uHID}</b></div>
              <div className="col-md-2">Name: <b>{patient.name}</b></div>
              <div className="col-md-2">DOB: <b>{patient.dob.split(" ")[0]}</b></div>
              <div className="col-md-2">
                Age/Gender: <b>{calculateAge(patient.dob)} Years/{patient.sex}</b>
              </div>
              <div className="col-md-2">
                Relationship: <b>{patient.relationship}</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {searching && <LoadingSpinner message="Fetching patient details..." />}

      {/* Main Form */}
      {!searching && patient && <CertificateForm patient={patient} />}
    </div>
  );
}
