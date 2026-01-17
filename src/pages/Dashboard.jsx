import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { getDashboardData } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const userId = JSON.parse(localStorage.getItem("userId"));
  const [selected, setSelected] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getDashboardData(userId);
      if (res.data.success) {
        setList(res.data.data.InsuredPersonFamilyDetails || []);
        
        const newMember = {
          name: res.data.data.personalDetails[0].name,
          relationship: "self",
          dob: res.data.data.personalDetails[0].dateOfBirth,
          sex: res.data.data.personalDetails[0].sex,
          residingState: res.data.data.AddressDetails[0].address1,
          uHID:res.data.data.uHID
        };
        setList(prevList => [...prevList, newMember]);
      }
      setLoading(false);
    } catch (err) {
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
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

  return loading ? (
    <LoadingSpinner message="Loading user data..." />
  ) : (
    <div className="container mt-2">

      <div className="position-relative mb-3">
        <h3>Dashboard</h3>
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

      <div className="table-responsive shadow">
        <table className="table table-hover align-middle table-striped">
          <thead className="table-light">
            <tr>
              <th colSpan="6" style={{ textAlign: "center" }}>
                <h3 style={{ margin: 0 }}>Family Members</h3>
              </th>
            </tr>
            <tr>
              <th>Select</th>
              <th>Name</th>
              <th>Relationship</th>
              <th>DOB</th>
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
                <td>{m.dob}</td>
                <td>{m.sex}</td>
                <td>{m.residingState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="btn btn-primary mt-3"
        disabled={!selected}
        onClick={goNext}
      >
        Next
      </button>
    </div>
  );
};

// const styles = {
//   container: {
//     padding: "20px"
//   }
// };

export default Dashboard;
