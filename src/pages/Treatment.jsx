import { useLocation , useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { showToast } from '../util/toastUtil';
import { MdErrorOutline } from "react-icons/md";
import CreateUHIDModal from "../components/CreateUHIDModal";
import ReferralModal from "../components/ReferralModal"
import { createLogger } from "../util/logger";

import {
    getDashboardData,
    getHistory,
    saveTreatment,
    uploadFile,
    downloadFile,
    generatePrescription
} from "../services/authService";

const logger = createLogger("TreatmentController");

const Treatment = () => {
    const { state: patient } = useLocation();
    const [prevData, setPrevData] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const [form,setForm]=useState({
        chiefComplaints:"",
        diagnosis:"",
        prescription:""
    });
    const [history,setHistory]=useState([]);
    const [loading,setLoading]=useState(false);
    const [savedId,setSavedId]=useState(null);
    const [file, setFile] = useState(null);
    const [submittedData, setSubmittedData] = useState(null);

    const [showUHIDModal, setShowUHIDModal] = useState(false);
    const [showReferralModal, setShowReferralModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if(patient){
            logger.debug("Loading treatment history", {
                uhid: patient.uHID,
                savedId,
            });
            fetchHistory();
        } else {
            logger.warn("Treatment screen opened without patient context");
        }
    }, [savedId]);

    const fetchHistory = async ()=>{
        try{
            if(!patient.uHID){
                logger.warn("Cannot load history without UHID");
                return;
            }
            const res = await getHistory(patient.uHID);

            if(res.data.success){
                setHistory(res.data.data);
                logger.info("Loaded patient history", {
                    uhid: patient.uHID,
                    records: res.data.data?.length ?? 0,
                });
            } else {
                logger.warn("History response unsuccessful", {
                    uhid: patient.uHID,
                });
            }
        }catch(error){
            logger.error("Failed to load history", error, {
                uhid: patient?.uHID,
            });
            showToast(error, "danger")
        }finally{
            setLoading(false);
        }
    }

    const handleChange = e =>{
        setForm({
        ...form,
        [e.target.name]:e.target.value
        });
    };

    const handleSubmit = async ()=>{

        if(!patient.uHID){
            logger.warn("Attempted to submit treatment without UHID", {
                name: patient?.name,
            });
            showToast("No UHID found for the dependent. please create uHID first and then try again.", "warning");
            return;
        }
        
        if(!confirm(`Are you sure you want to create treatment plan for \n${patient.name} - ${patient.uHID} ?`)){
            logger.info("Treatment submission cancelled by user", {
                uhid: patient?.uHID,
            });
            return;
        }
        
        // Format dob to dd-mm-yyyy
        let dob = patient.dob;
        if (dob && typeof dob === 'string') {
            const parts = dob.split(' ')[0].split('-');
            if (parts.length === 3) {
                dob = `${parts[0]}-${parts[1]}-${parts[2]}`;
            }
        }
        const payload={
            ipNumber: patient.ipNumber,
            uhid: patient.uHID,
            name: patient.name,
            relationship: patient.relationship,
            gender: patient.sex,
            age: calculateAge(patient.dob),
            dob: dob,
            state: patient.residingState,
            locationID: user.locationId
            // doctorUserId: userId,
            // ...form
            // clinicalData: {...form}
        };
        try {
            setLoading(true);
            logger.info("Saving treatment", {
                uhid: payload.uhid,
                ipNumber: payload.ipNumber,
            });
            const res = await saveTreatment(payload);
            if(res.data.success){
                payload.treatmentId = res.data.data.id;
                logger.info("Treatment saved", {
                    treatmentId: payload.treatmentId,
                    uhid: payload.uhid,
                });
                const response = await generatePrescription(payload);
                logger.info("Prescription generated", {
                    treatmentId: payload.treatmentId,
                });

                const blob = new Blob([response.data], {
                    type: "application/pdf"
                });
                createFileLink(blob, "prescription.pdf");
                
                setSavedId(res.data.data.id);
                setSubmittedData(res.data.data);
                showToast(`Created treatment entry and generated prescription for ${payload.uhid}`, "success");
                // navigate("/dashboard")
            } else {
                logger.warn("Treatment save API returned failure", {
                    uhid: payload.uhid,
                    message: res.data.message,
                });
                showToast(`Failed to save treatment.\n Reason: ${res.data.message}`, "danger");
            }
        } catch (error) {
            logger.error("Treatment flow failed", error, {
                uhid: payload.uhid,
            });
            showToast("Failed to save treatment. Reason: " + error?.response?.data?.message || error.message || "An error occurred while saving treatment", "danger")
        }finally{
            setLoading(false);
        }
    };

    const handleReferral = () => {

        if(!patient.uHID){
            showToast("No UHID found for the dependent. please create uHID first and then try again.", "warning");
            return;
        }

        setShowReferralModal(true);
    }

    const handlePrint = () => {
        window.print();
    };

    const handleUpload = async(treatmentId,file)=>{
        try{
            logger.info("Uploading treatment attachment from treatment view", {
                treatmentId,
                fileName: file?.name,
            });
            const res = await uploadFile(treatmentId,file);
            showToast(res.data.message, "success");
            fetchHistory(); // refresh table
        }catch(e){
            logger.error("Treatment attachment upload failed", e, {
                treatmentId,
            });
            showToast(e.response.data.message, "danger")
        }
    }

    const download = async(docId, fileType)=>{
        try {
            logger.info("Downloading attachment", { docId, fileType });
            const response = await downloadFile(docId, fileType);
            const blob = new Blob(
                [response.data],
                { type: response.headers["content-type"] } // 👈 important
            );

            const disposition = response.headers["content-disposition"];
            // Default filename
            let filename = "downloaded_file.pdf";
            if (disposition && disposition.includes("filename=")) {
                filename = disposition.split("filename=")[1].replaceAll('"', "").trim();
            }
            createFileLink(blob, filename);
            showToast("File downloaded successfully", "success");
        } catch (error) {
            logger.error("Download failed", error, { docId, fileType });
            showToast(error?.response?.data?.message || error.message || "Download failed", "danger");
        }
    }

    const createFileLink = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        logger.debug("Creating file link", { filename });

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);
    }

    if(!patient) return <p>No patient</p>;
    // if(loading) return <p>Loading...</p>;

    /* ---------- AFTER SUBMIT VIEW ---------- */
     return (
        <div className="container py-4 font-esic" style={{ maxWidth: '90%' }}>
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
                                            <td>{patient.uHID ? patient.uHID : (
                                                <span>
                                                    <MdErrorOutline /> No UHID found for the dependent.
                                                    &nbsp;&nbsp; <button className="btn btn-sm btn-esic" onClick={() => setShowUHIDModal(true)}> Create UHID</button>
                                                </span>
                                            )}</td>
                                        </tr>
                                        <tr>
                                            <th>Relation</th>
                                            <td>{patient.relationship}</td>
                                        </tr>
                                        <tr>
                                            <th>Age/Gender</th>
                                            <td> {patient.dob && <span>{calculateAge(patient.dob)} yrs/ {patient.sex}</span>}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        
                        <div className="d-flex gap-3 justify-content-center mb-3">
                            <button
                                type="submit"
                                className="btn btn-esic"
                                // disabled={
                                //     !form.chiefComplaints ||
                                //     !form.diagnosis ||
                                //     !form.prescription
                                // }
                                onClick={handleSubmit}
                            >
                               {loading ? <div className="spinner-border spinner-border-sm" role="status"></div> : ""} Submit
                               {/* <div className="spinner-border spinner-border-sm" role="status"></div> Submit */}
                            </button>
                            <button
                                type="submit"
                                className="btn btn-esic"
                                onClick={handleReferral}
                            >
                                Create Referral
                            </button>
                            <button
                                type="button"
                                className="btn btn-esic"
                                onClick={() => navigate('/dashboard')}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                    <CreateUHIDModal
                        show={showUHIDModal}
                        onClose={() => 
                            setShowUHIDModal(false)}
                        patient={patient}
                    />

                     <ReferralModal
                        show={showReferralModal}
                        user={user}
                        patient={patient}
                        referral={null}
                        onClose={()=>setShowReferralModal(false)}
                    />                     
                    {/* HISTORY TABLE */}
                    
                    <div className="card mb-4 shadow">
                        <div className="card-body">
                            {/* <h5 className="card-title mb-3">Previous Treatments</h5> */}
                        { history.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover text-center">
                                    <thead className="table-light">
                                        <tr>
                                            <th colSpan={6}>View/Upload Prescription</th>
                                        </tr>
                                        <tr>
                                            <th>Transaction No.</th>
                                            <th>Date</th>
                                            {/* <th>Complaint</th>
                                            <th>Diagnosis</th>
                                            <th>Prescription</th> */}
                                            <th>Option</th>
                                            <th>Files</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((h, i) => (
                                            <tr key={i}>
                                                <td>
                                                    {h.documents && h.documents.length > 0 && h.documents[0].id ? (
                                                        <a
                                                            href="#"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                download(h.documents[0].id, 'prescription');
                                                            }}
                                                            style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
                                                        >
                                                            {h.treatment.id}
                                                        </a>
                                                    ) : (
                                                        h.treatment.id
                                                    )}
                                                </td>
                                                <td>{h.treatment.createdAt ? h.treatment.createdAt.split('T')[0] : ''}</td>
                                                {/* <td>{h.treatment.chiefComplaints}</td>
                                                <td>{h.treatment.diagnosis}</td>
                                                <td>{h.treatment.prescription}</td> */}
                                                <td>
                                                    {h.documents && h.documents.length > 0 && h.documents[0].filePath ? (
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
                                                    {h.documents && h.documents.length > 0 && h.documents[0].filePath ? (
                                                        h.documents.map((d, idx) => (
                                                            <a
                                                                key={idx}
                                                                onClick={() => download(d.id, 'other')}
                                                                target="_blank"
                                                                className="btn btn-link btn-sm p-0"
                                                                style={{ textDecoration: 'none', cursor: 'pointer' }}
                                                            >
                                                            <FaDownload />
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
                            </div>)
                            : "No previous history found for the selected IP." }
                        </div>
                    </div>
            
                    {/* Treatment Table */}
                </div>
            </div>
        </div>
     )};

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
