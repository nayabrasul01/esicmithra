import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPatients } from "./../services/treatmentService";
import { showToast } from "../util/toastUtil";

export default function PatientsList() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);

      const response = await fetchPatients();
      if (response.data.success) {
        setPatients(response.data.data || []);
      } else {
        alert(response.message || "Failed to fetch patients");
      }
    } catch (err) {
        console.error("Patients fetch failed:", err);
        showToast("Something went wrong while fetching patients", "danger")
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter((p) => {
      return (
        (p.uhid || "").toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.employeeIpNo || "").toLowerCase().includes(q)
      );
    });
  }, [patients, search]);

  const handleCreatePrescription = (patient) => {
    navigate("/prescription-form", { state: { patient } });
  };

  return (
    <div className="container mt-4" style={{ fontSize: "14px" }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Registered Patients</h4>

          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Search by name, UHID, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status"></div>
              <div className="mt-2">Loading patients...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>UHID</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Relationship</th>
                    <th>State</th>
                    <th>Employee IP</th>
                    <th style={{ width: "180px" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No patients found
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => (
                      <tr key={p.id}>
                        <td>{p.uhid}</td>
                        <td>{p.name}</td>
                        <td>{p.gender}</td>
                        <td>{p.relationship}</td>
                        <td>{p.state}</td>
                        <td>{p.employeeIpNo}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm btn-esic"
                            onClick={() => handleCreatePrescription(p)}
                          >
                            Create Prescription
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="text-center">
            <button
                className="btn btn-primary btn-sm btn-esic"
                onClick={() => navigate("/home")}
                >
                Back
                </button>
           </div>
        </div>
      </div>
    </div>
  );
}
