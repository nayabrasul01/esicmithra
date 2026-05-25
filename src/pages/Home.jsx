import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPrescription } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { PiCertificateBold } from "react-icons/pi";


export default function DashboardHome() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState([]);
  const [user, setUser] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user);
    if(user?.type)
        setUserType(user.type);
    else
      showToast("Invalid User Type. Contact Administrator." ,"warning")          
  }, []);

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center g-4 px-3">
        
        {/* CARD 1 */}
        <div className="col-4">
          <div className="card shadow-sm border-0 rounded-4 p-4 text-center text-esic">
            
            <div className="d-flex justify-content-center mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  border: "2px solid #742903",
                  backgroundColor: "#f3f1b5"
                }}
              >
                <FaPrescription className="fs-2" color="#742903"/>
              </div>
            </div>

            <h4 className="fw-bold">Prescription Generation</h4>
            <p className="text-muted mb-4" style={{fontSize: "14px"}}>
              Create and manage patient prescriptions
            </p>

            <button
              className="btn btn-esic w-100 py-2 fw-semibold rounded-3"
              onClick={() => {
                if(userType === 'D')
                    navigate("/ip-list");
                else if(userType === 'M')
                    navigate("/dashboard");
              }}
            >
              <i className="fi fi-rr-document me-2"></i>
              Create/Modify Prescription
            </button>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="col-4">
          <div className="card shadow-sm border-0 rounded-4 p-4 text-center text-esic">

            <div className="d-flex justify-content-center mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  border: "2px solid #742903",
                  backgroundColor: "#f3f1b5"
                }}
              >
                {/* <i className="fi fi-rr-clipboard-check text-success fs-2"></i> */}
                <IoDocumentText className="fs-2" color="#742903"/>
              </div>
            </div>

            <h4 className="fw-bold">Draft Referral</h4>
            <p className="text-muted mb-4" style={{fontSize: "14px"}}>
              Manage referral requests to ESI or PMJAY hospitals 
              {/* for emergency or routine cases */}
            </p>

            <button
              className="btn btn-esic w-100 py-2 fw-semibold rounded-3"
              onClick={() => navigate("/referral", { state: user })}
              // disabled={true}
            >
              <i className="fi fi-rr-list-check me-2"></i>
              Create/Modify Referral
            </button>
          </div>
        </div>

        <div className="col-4">
          <div className="card shadow-sm border-0 rounded-4 p-4 text-center text-esic">

            <div className="d-flex justify-content-center mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  border: "2px solid #742903",
                  backgroundColor: "#f3f1b5"
                }}
              >
                {/* <i className="fi fi-rr-clipboard-check text-success fs-2"></i> */}
                {/* <IoDocumentText className="text-dark fs-2" style={{color:'#9E231D'}}/> */}
                <PiCertificateBold className="fs-2" color="#742903" />

              </div>
            </div>

            <h4 className="fw-bold">Draft Certification</h4>
            <p className="text-muted mb-4" style={{fontSize: "14px"}}>
              Create sickness or maternity benefit certificates for patients
            </p>

            <button
              className="btn btn-esic w-100 py-2 fw-semibold rounded-3"
              onClick={() => navigate("/medical-certificate", { state: user })}
              // disabled={true}
            >
              <i className="fi fi-rr-list-check me-2"></i>
              Create/Modify Certificate
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
