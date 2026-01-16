import { useEffect, useState } from "react";
import { fetchUserData } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const session = JSON.parse(sessionStorage.getItem("session"));
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await fetchUserData();
    sessionStorage.setItem("userData", JSON.stringify(data));
    setUserData(data);
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const goNext = () => {
    navigate("/treatment", { state: selected });
  };

  if (!userData) return <p>Loading user data...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <p><b>Appointment Date:</b> {userData.appointmentDate}</p>
      <p><b>Registration Date:</b> {userData.dateOfregistration}</p>
      <p><b>Employee IP:</b> {userData.employeeIPNo}</p>

      <h3>Family Members</h3>

      <table border="1" cellPadding="8">
        <thead>
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
          {userData.InsuredPersonFamilyDetails.map((m, i) => (
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
      
      <button
        disabled={!selected}
        onClick={goNext}
        style={{ marginTop: "20px" }}
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
