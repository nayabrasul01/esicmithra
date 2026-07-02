import { useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";
import { downloadFile } from "../../services/medicalCertificateService";
import { showToast } from "../../util/toastUtil";
import { createFileLink } from "../../util/utilities";

import { createLogger } from "../../util/logger";

const logger = createLogger("MedicalCertificate");

export default function CertificateTableHistoryModal({
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
        id,
      });
      showToast(
        error?.response?.data?.message ||
          error.message ||
          "Medical certificate not found, download failed",
        "danger",
      );
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header text-esic">
              <h5 className="modal-title">Certificate History</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body text-esic">
              {patientHistory.map((cert) => {
                const isExpanded = expandedId === cert.certificateNumber;

                return (
                  <div key={cert.id} className="border rounded mb-3 shadow-sm">
                    <div className="p-3 bg-white border-top">
                      {/* Patient Info */}
                      <div className="row mb-2">
                        <div className="col-md-4">
                          <strong>Certificate No.:</strong>{" "}
                          {cert.certificateNumber || "-NA-"}
                        </div>
                        <div className="col-md-4">
                          <strong>Certificate Type:</strong>{" "}
                          {cert.certificateType || "-NA-"}
                        </div>
                        <div className="col-md-4">
                          <strong>Certificate Status:</strong>{" "}
                          {cert.status || "-NA-"}
                        </div>
                      </div>

                      <div className="row mb-2">
                        <div className="col-md-4">
                          <strong>Patient:</strong> {patient?.name || "-NA-"}
                        </div>
                        <div className="col-md-4">
                          <strong>UHID:</strong> {patient?.uhid || "-NA-"}
                        </div>
                        <div className="col-md-4">
                          <strong>IP No:</strong> {patient?.ipNumber || "-NA-"}
                        </div>
                      </div>

                      {cert.certificateType != "MATERNITY" ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          {/* Maternity Details */}
                          <div className="row mb-2">
                            <div className="col-md-4">
                              <strong>Duration of Pregnancy:</strong>{" "}
                              {cert.certificateDetails?.durationOfPregnancy ||
                                "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>Remarks:</strong>{" "}
                              {cert.certificateDetails?.remarks || "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>Absentation from Date:</strong>{" "}
                              {cert.certificateDetails?.abstentionFromDate ||
                                "-NA-"}
                            </div>
                          </div>

                          <div className="row mb-2">
                            <div className="col-md-4">
                              <strong>Confinement Date:</strong>{" "}
                              {cert.certificateDetails?.confinementDate ||
                                "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>Outcome of Pregnancy:</strong>{" "}
                              {cert.certificateDetails?.outcomeOfPregnancy ||
                                "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>Place of Confinement:</strong>{" "}
                              {cert.certificateDetails?.placeOfConfinement ||
                                "-NA-"}
                            </div>
                          </div>

                          <div className="row mb-2">
                            <div className="col-md-4">
                              <strong>Mother Alive:</strong>{" "}
                              {cert.certificateDetails?.motherAlive || "-NA-"}
                            </div>
                            <div className="col-md-4">
                              <strong>Child Alive:</strong>{" "}
                              {cert.certificateDetails?.childAlive || "-NA-"}
                            </div>
                          </div>
                        </>
                      )}

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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
