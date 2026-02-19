import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPrescription } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if(user?.type)
        setUserType(user.type);
    else
      showToast("Invalid User Type. Contact Administrator." ,"warning")          
  }, []);

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center g-4 px-3">
        
        {/* CARD 1 */}
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
            
            <div className="d-flex justify-content-center mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f3f1b5",
                }}
              >
                <FaPrescription className="text-dark fs-2" />
              </div>
            </div>

            <h4 className="fw-bold">Prescription Generation</h4>
            <p className="text-muted mb-4" style={{fontSize: "14px"}}>
              Create and manage patient prescriptions
            </p>

            <button
              className="btn btn-primary btn-esic w-100 py-2 fw-semibold rounded-3"
              onClick={() => {
                if(userType === 'D')
                    navigate("/ip-list")
                else if(userType === 'M')
                    navigate("/dashboard")
              }}
            >
              <i className="fi fi-rr-document me-2"></i>
              Start Prescription
            </button>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 text-center">

            <div className="d-flex justify-content-center mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  border: "2px solid #5f1f02",
                }}
              >
                {/* <i className="fi fi-rr-clipboard-check text-success fs-2"></i> */}
                <IoDocumentText className="text-dark fs-2" style={{color:'#5f1f02'}}/>
              </div>
            </div>

            <h4 className="fw-bold">Draft Referral</h4>
            <p className="text-muted mb-4" style={{fontSize: "14px"}}>
              Create referral to ESI or PMJAY hospitals for emergency or routine cases
            </p>

            <button
              className="btn btn-success btn-esic w-100 py-2 fw-semibold rounded-3"
              onClick={() => navigate("/draft-referral")}
              disabled={true}
            >
              <i className="fi fi-rr-list-check me-2"></i>
              Create Draft
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
