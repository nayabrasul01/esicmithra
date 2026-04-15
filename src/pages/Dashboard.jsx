import { useEffect, useState, useRef } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { searchByIpNumber } from "../services/authService";
import { validateCaptcha } from "../services/dashboardService"
import { showToast } from '../util/toastUtil';
import { createLogger } from "../util/logger";

import ReCAPTCHA from 'react-google-recaptcha'


const logger = createLogger("DashboardController");


const Dashboard = () => {
  
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_SITE_KEY;

  const [userData, setUserData] = useState(null);
  const userId = localStorage.getItem("userId");
  const [selected, setSelected] = useState(null);

  const [list, setList] = useState([]);
  
  const [ipNumber, setIpNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notRobotConfirmed, setNotRobotConfirmed] = useState(true); // should change to false after testing
  // const [showResult, setShowResult] = useState(false);

  const navigate = useNavigate();

  
const handleSearch = async () => {
  if (!notRobotConfirmed) {
    setErrorMsg("Please confirm you are not a robot before searching");
    logger.warn("IP search blocked because human check was not confirmed", {
      ipNumber,
    });
    return;
  }
  if (ipNumber.length !== 10) {
    setErrorMsg("IP Number must be exactly 10 digits");
    logger.warn("IP search blocked due to invalid length", { ipNumber });
    return;
  }
  setSearching(true);
  setErrorMsg("");
  setList([]);
  setSelected(null);
  logger.info("Searching IP details", { ipNumber });

  try {
    const res = await searchByIpNumber(ipNumber);

    if (res.data.success) {
      if(res.data.data.InsuredPersonFamilyDetails == null 
        || res.data.data.personalDetails == null){
          showToast("No records found for the given IP.", "warning");
          logger.warn("Dashboard search returned empty personal details", {
            ipNumber,
          });
          return;
        }
      setList(res.data.data.InsuredPersonFamilyDetails || []);

      const selfMember = {
        name: res.data.data.personalDetails[0].name,
        relationship: "Self",
        dob: res.data.data.personalDetails[0].dateOfBirth,
        sex: res.data.data.personalDetails[0].sex,
        residingState: res.data.data.AddressDetails[0].address1,
        marstatus: res.data.data.personalDetails[0].maritalStatus,
        uHID:res.data.data.uHID
      };
        setList(prevList => [selfMember,...prevList]);
        logger.info("Dashboard search returned records", {
          ipNumber,
          totalMembers: (res.data.data.InsuredPersonFamilyDetails || []).length + 1,
        });
        showToast("Records fetched.", "success")
      } else {
        logger.warn("Dashboard search response indicated failure", {
          ipNumber,
          message: res.data.message,
        });
      }
      setSearching(false);
    } catch (err) {
      alert("Failed to load dashboard. " + err);
      showToast("Failed to load dashboard. " + err, "danger");
      logger.error("Dashboard search failed", err, { ipNumber });
      // navigate("/");
    } finally {
      setSearching(false);
      logger.debug("Dashboard search completed", { ipNumber });
    }
  }

  const goNext = () => {
    selected.ipNumber = ipNumber;
    logger.info("Navigating to treatment", {
      ipNumber,
      uhid: selected?.uHID,
      relationship: selected?.relationship,
    });
    navigate("/treatment", { state: selected });
  };

  const validateReCaptcha = async (value) => {
    try {
      const res = await validateCaptcha(value);
      if(res.success) {
        setNotRobotConfirmed(true);
      }
    } catch (error) {
      setNotRobotConfirmed(false);
    }
  }

return (
  <div className="container font-esic">

    {!searching && list.length === 0 && (
      <div className="alert alert-warning">
        Enter a 10-digit IP number and click Search to see member details.
      </div>
    )}

    <div className="position-relative mb-3">
      <h3>Insured Person (IP) Details</h3>
    </div>

    <div className="row mb-3 align-items-end">
      <div className="col-md-4 col-sm-12 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Enter 10-digit IP Number"
          value={ipNumber}
          maxLength={10}
          inputMode="numeric"
          onChange={(e) => setIpNumber(e.target.value.replace(/\D/g, ""))}
        />
      </div>
 
      <div className="col-md-3 col-sm-12 my-auto">
        <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={validateReCaptcha} />      
      </div>

      <div className="d-flex col-md-5 col-sm-12 mb-2 gap-2">
        <button
          className="btn btn-esic w-100"
          onClick={handleSearch}
          disabled={searching || ipNumber.length !== 10 || !notRobotConfirmed}
          // disabled={false}
        >
          {searching ? "Searching..." : "Search"}
        </button>

        <button
          className="btn btn-secondary w-100"
          onClick={() => navigate("/home")}
        >
          Back
        </button>
      </div>
    </div>

    {errorMsg && (
      <div className="alert alert-warning mt-2">{errorMsg}</div>
    )}

    {searching && <LoadingSpinner message="Fetching IP details..." />}

    {!searching && list.length > 0 && (
      <>
        <div className="mb-2 text-muted">
          Select a row (or radio) and click Next.
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-striped border align-middle">
            <thead className="table-light">
              <tr>
                <th colSpan="8" className="text-center">
                  <h4 className="m-0">IP Details</h4>
                </th>
              </tr>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>UHID</th>
                <th>Relationship</th>
                <th>Age</th>
                <th>Gender</th>
                <th>State</th>
                {/* <th>Marital Status</th> */}
              </tr>
            </thead>
            <tbody>
                  {list.map((m, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="radio"
                          name="patient"
                          onChange={() => setSelected(m)}
                        />
                      </td>
                      <td>{m.name}</td>
                      <td>{m.uHID}</td>
                      <td>{m.relationship}</td>
                      <td>{calculateAge(m.dob)}</td>
                      <td>{m.sex}</td>
                      <td>{m.residingState}</td>
                    </tr>
                  ))}
                </tbody>
          </table>
        </div>

        <button
          className="btn btn-esic mt-1 mb-5"
          disabled={!selected}
          onClick={goNext}
        >
          Next
        </button>
      </>
    )}
  </div>
);
};

// const styles = {
//   container: {
//     padding: "20px"
//   }
// };
function calculateAge(dob) {
    if (!dob) return '';
    // Accepts formats like 'YYYY-MM-DD', 'DD-MM-YYYY', or with time
    let dateStr = dob.split(' ')[0];
    let parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    let year, month, day;
    if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = +parts[0]; month = +parts[1]; day = +parts[2];
    } else {
        // DD-MM-YYYY
        day = +parts[0]; month = +parts[1]; year = +parts[2];
    }
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default Dashboard;
