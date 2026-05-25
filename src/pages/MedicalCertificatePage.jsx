import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CertificateTable from "../components/certification/CertificatesTable";
import CertificateTableHistoryModal from "../components/certification/CertificateTableHistoryModal";

const MedicalCertificatePage = () => {
  const { state: user } = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [cert, setCert] = useState([]);
  const [patient, setPatient] = useState(null);

  return (
    <div className="container mt-3">
      <CertificateTable
        user={user}
        onViewHistory={(cert, patient) => {
          setCert([cert]);
          setPatient(patient);
          setShowModal(true);
        }}
      />

      <CertificateTableHistoryModal
        show={showModal}
        patient={patient}
        patientHistory={cert}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default MedicalCertificatePage;
