import { useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";
import { downloadFile } from "../../services/medicalCertificateService";
import { showToast } from "../../util/toastUtil";
import { createFileLink } from "../../util/utilities";

import { createLogger } from "../../util/logger";

const logger = createLogger("MedicalCertificate");

export default function SickCertificateHistoryModal({
  show,
  patient,
  patientHistory = [],
  onClose,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const download = async (id) => {
    try {
      const response = await downloadFile(id);
      const blob = new Blob(
        [response],
        {
          // type: response.headers["content-type"]
          type: "application/pdf",
        }, // 👈 important
      );
      createFileLink(blob, "medical_certificate.pdf");
      showToast("File downloaded successfully", "success");
    } catch (error) {
      logger.error("Medical certificate download failed", error, {
        id
      });
      showToast(
        error?.response?.data?.message ||
          error.message ||
          "Medical certificate not found, download failed",
        "danger",
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-NA-";
    
    return dateString.split("-").reverse().join("-");
  }

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header text-esic">
              <h5 className="modal-title">Ongoing Spell History</h5>
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
                          <div className="fw-normal">
                            <span className="text-esic">Certificate No. </span>
                            <b>{cert.certificateNumber || "-NA-"}</b>
                          </div>

                          <div className="small">
                            Certificate Type: <b>{cert.certificateType}</b> | Spell
                            Type: <b>{cert.spellType}</b>
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
                            {formatDate(cert.certificateDetails?.firstCertificateDate)}
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
                              {formatDate(cert.certificateDetails?.visitDate)}
                            </div>
                          </div>

                          {/* Leave Details */}
                          <div className="row mb-2">
                            <div className="col-md-3">
                              <strong>Leave From:</strong>{" "}
                              {formatDate(cert.leaveDetails?.leaveFrom)}
                            </div>
                            <div className="col-md-3">
                              <strong>Leave To:</strong>{" "}
                              {formatDate(cert.leaveDetails?.leaveTo)}
                            </div>
                            <div className="col-md-3">
                              <strong>Follow-up:</strong>{" "}
                              {formatDate(cert.leaveDetails?.followUpDate)}
                            </div>
                            <div className="col-md-3">
                              <strong>Fit Date:</strong>{" "}
                              {formatDate(cert.leaveDetails?.fitDate)}
                            </div>
                          </div>

                          {/* Remarks */}
                          <div className="mt-2">
                            <strong>Remarks:</strong>{" "}
                            {cert.leaveDetails?.remarks?.remarks || "-NA-"}
                          </div>

                          {cert.status === "APPROVED" && (
                            <div className="mt-2">
                              <a
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-esic btn-outline-primary"
                                onClick={(e) => {
                                  e.preventDefault();
                                  download(cert.id);
                                }}
                              >
                                <FaDownload size={12} />
                                &nbsp; <strong>Download</strong>
                              </a>
                            </div>
                          )}
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
