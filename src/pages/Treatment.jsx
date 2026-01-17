import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getDashboardData,
    getHistory,
    saveTreatment,
    uploadFile,
    downloadFile
} from "../services/authService";

const Treatment = () => {
    const { state: patient } = useLocation();
    const navigate = useNavigate();
    const [prevData, setPrevData] = useState(null);
    
    const [form,setForm]=useState({
        chiefComplaints:"",
        diagnosis:"",
        prescription:""
    });
    const [history,setHistory]=useState([]);
    const [loading,setLoading]=useState(true);
    const [savedId,setSavedId]=useState(null);
    const [file, setFile] = useState(null);
    const [submittedData, setSubmittedData] = useState(null);

    useEffect(() => {
        if(patient)
            fetchHistory();
    }, []);

    const fetchHistory = async ()=>{
        try{
        console.log(patient);
        const res = await getHistory(patient.uHID);
        if(res.data.success)
            setHistory(res.data.data);
        }
        finally{
            setLoading(false);
        }
    };

    const handleChange = e =>{
        setForm({
        ...form,
        [e.target.name]:e.target.value
        });
    };

    const handleSubmit = async ()=>{
        // Format dob to dd-mm-yyyy
        let dob = patient.dob;
        if (dob && typeof dob === 'string') {
            const parts = dob.split(' ')[0].split('-');
            if (parts.length === 3) {
                dob = `${parts[0]}-${parts[1]}-${parts[2]}`;
            }
        }
        const payload={
            uhid: patient.uHID,
            name: patient.name,
            relationship: patient.relationship,
            gender: patient.sex,
            dob: dob,
            state: patient.residingState,
            ...form
        };
        try {
            const res = await saveTreatment(payload);
            if(res.data.success){
                setSavedId(res.data.data.id);
                setSubmittedData(res.data.data);
                alert("Saved successfully");
            } else {
                alert(res.data.message || "Failed to save treatment");
            }
        } catch (error) {
            alert(error?.response?.data?.message || error.message || "An error occurred while saving treatment");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleUpload = async(treatmentId,file)=>{
        try{
            const res = await uploadFile(treatmentId,file);
            alert(res.data.message);
            fetchHistory(); // refresh table
        }catch(e){
            alert(e.response.data.message);
        }
    }

    const download = async(docId)=>{
        try {
            const response = await downloadFile(docId);
            const blob = new Blob(
                [response.data],
                { type: response.headers["content-type"] } // 👈 important
            );

            const disposition =
            response.headers["content-disposition"];

            let filename = "file.pdf";

            if (disposition && disposition.includes("filename=")) {
            filename = disposition
                .split("filename=")[1]
                .replaceAll('"', "");
            }

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            alert("Download failed");
        }
    }



    if(!patient) return <p>No patient</p>;
    if(loading) return <p>Loading...</p>;

    /* ---------- AFTER SUBMIT VIEW ---------- */
     return !savedId ?
    /* ---------- FORM VIEW ---------- */
        (
            <div className="container py-4" style={{ maxWidth: '90%' }}>
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card mb-4 shadow">
                            <div className="card-body">
                                <h4 className="card-title text-center mb-4">ESIC Health Facility</h4>
                                {/* <h5 className="mb-3"><u>IP Details</u></h5> */}
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th colSpan={2} style={{ textAlign: "center" }}>IP details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th style={{ width: '30%' }}>Name</th>
                                                <td>{patient.name}</td>
                                            </tr>
                                            <tr>
                                                <th>UHID</th>
                                                <td>{patient.uHID}</td>
                                            </tr>
                                            <tr>
                                                <th>Relation</th>
                                                <td>{patient.relationship}</td>
                                            </tr>
                                            <tr>
                                                <th>DOB</th>
                                                <td>{patient.dob}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* HISTORY TABLE */}
                        {history.length > 0 && (
                            <div className="card mb-4 shadow">
                                <div className="card-body">
                                    {/* <h5 className="card-title mb-3">Previous Treatments</h5> */}
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover text-center">
                                            <thead className="table-light">
                                                <tr>
                                                    <th colSpan={6}>Previous Treatments</th>
                                                </tr>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Complaint</th>
                                                    <th>Diagnosis</th>
                                                    <th>Prescription</th>
                                                    <th>Option</th>
                                                    <th>Files</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map((h, i) => (
                                                    <tr key={i}>
                                                        <td>{h.treatment.createdAt ? h.treatment.createdAt.split('T')[0] : ''}</td>
                                                        <td>{h.treatment.chiefComplaints}</td>
                                                        <td>{h.treatment.diagnosis}</td>
                                                        <td>{h.treatment.prescription}</td>
                                                        <td>
                                                            {h.documents && h.documents.length > 0 ? (
                                                                <span className="text-success fw-semibold">
                                                                    Uploaded
                                                                </span>
                                                            ) : (
                                                                <input
                                                                    type="file"
                                                                    className="form-control form-control-sm"
                                                                    onChange={(e) =>
                                                                        handleUpload(h.treatment.id, e.target.files[0])
                                                                    }
                                                                />
                                                            )}
                                                        </td>
                                                        <td>
                                                            {h.documents && h.documents.length > 0 ? (
                                                                h.documents.map((d, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        onClick={() => download(d.id)}
                                                                        target="_blank"
                                                                        className="btn btn-link btn-sm p-0"
                                                                        style={{ textDecoration: 'none', cursor: 'pointer' }}
                                                                    >
                                                                    <i class="fi fi-rr-download" alt="Uploaded File"></i>
                                                                    </a>
                                                                ))
                                                            ) : (
                                                                <span className="text-muted">No data</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card mb-4 shadow">
                            {/* <div className="card-header text-center">
                                New Treatment Plan
                            </div> */}
                            <div className="card-body">
                                <h5 className="card-title text-center mb-3">New Treatment Plan</h5>
                                <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                                    <div className="mb-3">
                                        {/* <label htmlFor="chiefComplaints" className="form-label">Chief Complaints</label> */}
                                        <textarea
                                            className="form-control"
                                            id="chiefComplaints"
                                            name="chiefComplaints"
                                            placeholder="Chief Complaints"
                                            rows="3"
                                            value={form.chiefComplaints}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        {/* <label htmlFor="diagnosis" className="form-label">Diagnosis</label> */}
                                        <textarea
                                            className="form-control"
                                            id="diagnosis"
                                            name="diagnosis"
                                            placeholder="Diagnosis"
                                            rows="3"
                                            value={form.diagnosis}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        {/* <label htmlFor="prescription" className="form-label">Prescription</label> */}
                                        <textarea
                                            className="form-control"
                                            id="prescription"
                                            name="prescription"
                                            placeholder="Prescription"
                                            rows="3"
                                            value={form.prescription}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                !form.chiefComplaints ||
                                                !form.diagnosis ||
                                                !form.prescription
                                            }
                                        >
                                            Submit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary ms-2"
                                            onClick={() => navigate('/dashboard')}
                                        >
                                            Back
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
        : (
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow">
                            <div className="card-body">
                                {/* <h4 className="card-title mb-3">Patient Details</h4> */}
                                <div className="table-responsive mb-4">
                                    <table className="table table-bordered table-striped mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th colSpan={2} style={{ textAlign: "center" }}>Patient Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th style={{ width: '30%' }}>Date</th>
                                                <td>{new Date().toLocaleDateString()}</td>
                                            </tr>
                                            <tr>
                                                <th>UHID</th>
                                                <td>{submittedData.patient.uhid}</td>
                                            </tr>
                                            <tr>
                                                <th style={{ width: '30%' }}>Name</th>
                                                <td>{submittedData.patient.name}</td>
                                            </tr>
                                            <tr>
                                                <th>Relation</th>
                                                <td>{submittedData.patient.relationship}</td>
                                            </tr>
                                            <tr>
                                                <th>Age/Gender</th>
                                                <td>{submittedData.patient.dob} {submittedData.patient.dob && <span>({calculateAge(submittedData.patient.dob)} yrs)/ ({submittedData.patient.gender})</span>}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* <hr /> */}
                                <div className="mb-2">
                                    <h5 className="mb-1">Chief Complaints:</h5>
                                    <p>{submittedData.chiefComplaints}</p>
                                </div>
                                <div className="mb-2">
                                    <h5 className="mb-1">Diagnosis:</h5>
                                    <p>{submittedData.diagnosis}</p>
                                </div>
                                <div className="mb-2">
                                    <h5 className="mb-1">Prescription:</h5>
                                    <p>{submittedData.prescription}</p>
                                </div>
                                {submittedData.fileName && (
                                    <div className="mb-2">
                                        <b>Uploaded File: </b> {submittedData.fileName}
                                    </div>
                                )}
                                <div className="d-flex justify-content-between align-items-center mt-4" style={{ width: '60%' }}>
                                    <div>Date: _______________</div>
                                    <div className="text-end">
                                        <div>Doctor's Signature</div>
                                        <div>__________________</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button className="btn btn-outline-primary me-2" onClick={handlePrint}>🖨 Print</button>
                                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Home</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

const styles = {
  container: {
    padding: "20px"
  }
};

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

export default Treatment;
