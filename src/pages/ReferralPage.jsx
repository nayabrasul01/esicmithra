import { useState, useEffect } from "react";
import { useLocation , useNavigate} from "react-router-dom";

import ReferralModal from "../components/ReferralModal"
import ReferralTable from "../components/ReferralTable"

const ReferralPage = () => {
  const { state: user } = useLocation();
  const [showModal, setShowModal] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null);

  const isDoctor = user.type === "D"
  const isMithra = user.type === "M"

  // return (
  //   <div className="container mt-3">

  //     {/* {isMithra && (
  //       <button
  //         className="btn btn-primary mb-3"
  //         onClick={() => {
  //           setSelectedReferral(null)
  //           setShowModal(true)
  //         }}
  //       >
  //         Create Referral
  //       </button>
  //     )} */}

  //     <ReferralTable
  //       user={user}
  //       onEdit={(row, patient)=>{
  //         setSelectedReferral(row)
  //         setSelectedPatient(patient)
  //         setShowModal(true)
  //       }}
  //     />

  //     {showModal && (
  //       <ReferralModal
  //           show={showModal}
  //           user={user}
  //           patient={selectedPatient}
  //           referral={selectedReferral}
  //           onClose={()=>setShowModal(false)}
        
  //       />
  //     )}

  //   </div>
  // )

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="container mt-3">
      <ReferralTable
        user={user}
        refreshTrigger={refreshTrigger}
        onEdit={(row, patient)=>{
          setSelectedReferral(row)
          setSelectedPatient(patient)
          setShowModal(true)
        }}
      />

      {showModal && (
        <ReferralModal
            show={showModal}
            user={user}
            patient={selectedPatient}
            referral={selectedReferral}
            onClose={()=>{
              setShowModal(false)
              setRefreshTrigger(prev => prev + 1)
            }}
        />
      )}
    </div>
  )
}

export default ReferralPage;