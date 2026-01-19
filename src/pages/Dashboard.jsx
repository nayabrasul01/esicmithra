import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { searchByIpNumber } from "../services/authService";


const Dashboard = () => {
  
  const [userData, setUserData] = useState(null);
  const userId = JSON.parse(localStorage.getItem("userId"));
  const [selected, setSelected] = useState(null);

  const [list, setList] = useState([]);
  
  const [ipNumber, setIpNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showResult, setShowResult] = useState(false);

  const navigate = useNavigate();

  
const handleSearch = async () => {
  if (ipNumber.length !== 10) {
    setErrorMsg("IP Number must be exactly 10 digits");
    return;
  }
  
  setSearching(true);
  setErrorMsg("");
  setList([]);
  setSelected(null);
  setShowResult(false);

  try {
    const res = await searchByIpNumber(ipNumber);

    if (res.data.success) {
      setList(res.data.data.InsuredPersonFamilyDetails || []);
      const selfMember = {
          name: res.data.data.personalDetails[0].name,
          relationship: "self",
          dob: res.data.data.personalDetails[0].dateOfBirth,
          sex: res.data.data.personalDetails[0].sex,
          residingState: res.data.data.AddressDetails[0].address1,
          uHID:res.data.data.uHID
        };
        setList(prevList => [selfMember,...prevList]);
    } else {
      setErrorMsg("No records found");
    }
  } catch (err) {
    if (err.response?.status === 503) {
      setErrorMsg("IP service is temporarily down. Please try later.");
    } else {
      setErrorMsg("Unable to fetch IP details");
    }
  } finally {

    setSearching(false);

  }
};


  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const goNext = () => {
    navigate("/treatment", { state: selected });
  };

return (
    <div className="container mt-2">

      <div className="position-relative mb-3">
        <h3>Insured Person(IP) Details</h3>
        <button
          className="btn btn-danger position-absolute"
          style={{ top: 0, right: 0 }}
          onClick={logout}
          aria-label="Logout"
        >
          {/* Logout SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6 2a2 2 0 0 0-2 2v2a.5.5 0 0 0 1 0V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2a.5.5 0 0 0-1 0v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6z"/>
            <path d="M.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H9.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2z"/>
          </svg>
        </button>
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
  onChange={(e) =>
    setIpNumber(e.target.value.replace(/\D/g, ""))
  }
/>

  </div>

  <div className="col-md-2 col-sm-12 mb-2">
    <button
  className="btn btn-esic w-100"
  onClick={handleSearch}
  disabled={searching || ipNumber.length !== 10}
>
  {searching ? "Searching..." : "Search"}
</button>
  </div>
</div>
{}
{errorMsg && (
  <div className="alert alert-warning mt-2">
    {errorMsg}
  </div>
)}
{/*Loading Spinner */}
{searching && (
  <LoadingSpinner message="Fetching IP details..." />
)}
{/*Table (only after data is loaded) */}
{showResult && !searching && list.length > 0 && (
      <div className="table-responsive shadow">
        <table className="table table-hover align-middle table-striped">
          <thead className="table-light">
            <tr>
              <th colSpan="6" style={{ textAlign: "center" }}>
                <h3 style={{ margin: 0 }}>IP Details</h3>
              </th>
            </tr>
            <tr>
              <th>Select</th>
              <th>Name</th>
              <th>Relationship</th>
              <th>Age</th>
              <th>Gender</th>
              <th>State</th>
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
                <td>{m.relationship}</td>
                <td>{calculateAge(m.dob)}</td>
                <td>{m.sex}</td>
                <td>{m.residingState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
)} 
{/* Next Button */}
      {showResult && (
        <button
          className="btn btn-esic mt-3"
          disabled={!selected}
          onClick={goNext}
        >
          Next
        </button>
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
