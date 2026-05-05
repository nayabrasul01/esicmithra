import { useState } from "react";

export default function CertificateHistoryModal({
  show,
  patient,
  patientHistory = [],
  onClose,
}) {
  const [expandedId, setExpandedId] = useState(null);

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Ongoing Certificate History</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body text-esic">
              {patientHistory.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No ongoing certificates found
                </div>
              ) : (
                patientHistory.map((cert) => {
                  const isExpanded = expandedId === cert.certificateNumber;

                  return (
                    <div
                      key={cert.id}
                      className="border rounded mb-3 shadow-sm"
                    >
                      {/* Header Row */}
                      <div
                        className="p-3 d-flex justify-content-between align-items-center"
                        style={{
                          cursor: "pointer",
                          background: "#f8f9fa",
                        }}
                        onClick={() =>
                          setExpandedId(
                            isExpanded ? null : cert.certificateNumber,
                          )
                        }
                      >
                        <div>
                          <div className="fw-semibold">
                            <span className="text-esic">Certificate No. </span>
                            {cert.certificateNumber || "-NA-"}
                          </div>

                          <div className="small">
                            Certificate Type: {cert.certificateType} | Spell
                            Type: {cert.spellType}
                          </div>
                        </div>

                        <div className="text-end">
                          <div
                            className={`badge ${
                              cert.status === "IN_PROGRESS"
                                ? "bg-warning text-dark"
                                : "bg-success"
                            }`}
                          >
                            {cert.status}
                          </div>

                          <div className="small mt-1">
                            First Certificate Date:{" "}
                            {new Date(
                              cert.certificateDetails?.firstCertificateDate,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="p-3 bg-white border-top">
                          {/* Patient Info */}
                          <div className="row mb-2">
                            <div className="col-md-4">
                              <strong>Patient:</strong>{" "}
                              {patient?.name || "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>UHID:</strong> {patient?.uHID || "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>IP No:</strong>{" "}
                              {patient?.ipNumber || "-NA-"}
                            </div>
                          </div>
                          {/* Certificate Details */}
                          <div className="row mb-2">
                            <div className="col-md-4">
                              <strong>Diagnosis:</strong>{" "}
                              {cert.certificateDetails?.diseaseDiagnosis ||
                                "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>Place of Exam:</strong>{" "}
                              {cert.certificateDetails?.placeOfExamination ||
                                "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>Visit Date:</strong>{" "}
                              {cert.certificateDetails?.visitDate || "-NA-"}
                            </div>
                          </div>

                          {/* Leave Details */}
                          <div className="row mb-2">
                            <div className="col-md-3">
                              <strong>Leave From:</strong>{" "}
                              {cert.leaveDetails?.leaveFrom || "-NA-"}
                            </div>
                            <div className="col-md-3">
                              <strong>Leave To:</strong>{" "}
                              {cert.leaveDetails?.leaveTo || "-NA-"}
                            </div>
                            <div className="col-md-3">
                              <strong>Follow-up:</strong>{" "}
                              {cert.leaveDetails?.followUpDate || "-NA-"}
                            </div>
                            <div className="col-md-3">
                              <strong>Fit Date:</strong>{" "}
                              {cert.leaveDetails?.fitDate || "-NA-"}
                            </div>
                          </div>

                          {/* Remarks */}
                          <div className="mt-2">
                            <strong>Remarks:</strong>{" "}
                            {cert.leaveDetails?.remarks?.remarks || "-NA-"}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
