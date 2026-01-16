import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPreviousPrescription,
  submitPrescription
} from "../services/authService";

const Treatment = () => {
    const { state: patient } = useLocation();
    const navigate = useNavigate();
    const [prevData, setPrevData] = useState(null);
    const [complaints, setComplaints] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [prescription, setPrescription] = useState("");
    const [file, setFile] = useState(null);
    const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    checkPrevious();
  }, []);

  const checkPrevious = async () => {
    const res = await fetchPreviousPrescription();
    if (res.hasData) setPrevData(res);
  };

    const submit = async () => {
        const payload = {
        patient,
        prescription: prescription,
        complaints: complaints,
        diagnosis: diagnosis,
        file
    };

    const res = await submitPrescription(payload);
        if (res.success) {
            alert("Submitted successfully");
            setSubmittedData(payload);
        }
    };

    const handlePrint = () => {
        window.print();
    };


    /* ---------- AFTER SUBMIT VIEW ---------- */
    if (submittedData) {
        return (
        <div>
            <h2>Treatment Submitted Successfully</h2>

            <h4>Patient Details</h4>
            <p><b>Name:</b> {submittedData.patient.name}</p>
            <p><b>Relation:</b> {submittedData.patient.relationship}</p>
            <p><b>DOB:</b> {submittedData.patient.dob}</p>

            <h4>Cheif Complaints</h4>
            <p>{submittedData.complaints}</p>

            <h4>Diagnosis</h4>
            <p>{submittedData.diagnosis}</p>

            <h4>Prescription</h4>
            <p>{submittedData.prescription}</p>

            {submittedData.fileName && (
            <p><b>Uploaded File:</b> {submittedData.fileName}</p>
            )}

            <button onClick={handlePrint}>🖨 Print</button> 
            <button style={{marginLeft: 10}} onClick={() => navigate('/dashboard')}>Home</button>
        </div>
        );
    }

    /* ---------- FORM VIEW ---------- */
    return (
        <div style={styles.container}>
        <h2>ESIC Health facility</h2>

        <h4><u>Patient Details</u></h4>
        <p><b>Name:</b> {patient.name}</p>
        <p><b>Relation:</b> {patient.relationship}</p>
        <p><b>DOB:</b> {patient.dob}</p>

        { prevData && (
        <>
            <h4>Previous Treatment Records</h4>

            <table border="1" cellPadding="8" style={{ marginBottom: "20px" }}>
            <thead>
                <tr>
                <th>Prescription</th>
                <th>Document</th>
                <th>Upload New Document</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                <td>{prevData.prescription}</td>

                <td>
                    {prevData.document ? (
                    <a href="#" onClick={() => alert("Download API call")}>
                        {prevData.document}
                    </a>
                    ) : (
                    "No document"
                    )}
                </td>

                <td>
                    <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    />
                </td>
                </tr>
            </tbody>
            </table>
            <button
                onClick={() => window.history.back()}
                style={{ marginTop: "5px" }}
            >
            Back
            </button>

        </>
        )}

        { prevData && (
            <div>
                <h4>New Treatment Plan</h4>
                <textarea
                    placeholder="Chief Complaints"
                    rows="6"
                    cols="60"
                    value={complaints}
                    onChange={(e) => setComplaints(e.target.value)}
                />
                 <br /><br />

                <textarea
                    placeholder="Diagnosis"
                    rows="6"
                    cols="60"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                />
                 <br /><br />

                <textarea
                    placeholder="Prescription"
                    rows="6"
                    cols="60"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                />
                <br />
                <button
                    disabled={!complaints || !diagnosis || !prescription}
                    onClick={submit}
                    style={{ marginTop: "10px" }}
                >
                    Submit
                </button>
                
            </div>
        )}
        
        </div>
    );
};

const styles = {
  container: {
    padding: "20px"
  }
};

export default Treatment;
