import { useState, useMemo } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";
import { downloadFile } from "../services/authService";
import { showToast } from "../util/toastUtil";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";


const RECORDS_PER_PAGE = 5;

export default function PatientHistoryModal({
  show,
  onClose,
  patient,
  historyData = [],
  loading = false,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Filtering logic
  const filteredData = useMemo(() => {
    // Slice the first item in historyData as the first item is the current treatment being added, not part of history
    return historyData.slice(1).filter((item) => {
      const t = item.treatment;
      const createdDate = new Date(t.createdAt);

      // Date filtering
      if (fromDate && createdDate < new Date(fromDate)) return false;
      if (toDate && createdDate > new Date(toDate + "T23:59:59")) return false;

      // Search filtering
      if (searchText) {
        const search = searchText.toLowerCase();
        const combinedText = `
          ${t.chiefComplaints || ""}
          ${t.diagnosis || ""}
          ${t.symptoms || ""}
          ${t.prescription || ""}
          ${t.doctorUserId || ""}
        `.toLowerCase();

        if (!combinedText.includes(search)) return false;
      }

      return true;
    });
  }, [historyData, searchText, fromDate, toDate]);

  const totalPages = Math.ceil(filteredData.length / RECORDS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredData.slice(start, start + RECORDS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Reset to page 1 when filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchText, fromDate, toDate]);

  if (!show) return null;

  const download = async(docId, fileType)=>{
    try {
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
        showToast(error?.response?.data?.message || error.message || "Download failed", "danger");
    }
}

const createFileLink = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
}

  return (
    <>
      <div className="modal fade show d-block font-esic" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content shadow-lg border-0">

            {/* Header */}
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-bold text-esic">
                Patient History – {patient?.uhid}
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body bg-white">

              {/* 🔍 Filters Section */}
              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <div className="row g-3 align-items-end">

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Search
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FaSearch />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search diagnosis, complaints, doctor..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        From Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        To Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>

                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          setSearchText("");
                          setFromDate("");
                          setToDate("");
                        }}
                      >
                        Clear
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Records */}
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : filteredData.length === 0 ? (
                <div className="text-muted text-center py-4">
                 <MdErrorOutline /> No matching records found
                </div>
              ) : (
                paginatedData.map((item) => {
                  const t = item.treatment;
                  const isExpanded = expandedId === t.id;

                  return (
                    <div
                      key={t.id}
                      className="card mb-3 border-0 shadow-sm"
                    >
                      <div
                        className="card-header bg-light d-flex justify-content-between"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : t.id)
                        }
                      >
                        <strong>
                          {new Date(t.createdAt).toLocaleString()}
                        </strong>
                        <span>{isExpanded ? "▲" : "▼"}</span>
                      </div>

                      {isExpanded && (
                        <div className="card-body">

                          <div className="row mb-2">
                            <div className="col-md-4">
                              <span className="text-muted">Symptoms</span>
                              <div className="fw-semibold">
                                {t.symptoms || "-"}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <span className="text-muted">Examination Findings</span>
                              <div className="fw-semibold">
                                {t.examinationFindings || "-"}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <span className="text-muted">Diagnosis</span>
                              <div className="fw-semibold">
                                {t.diagnosis || "-"}
                              </div>
                            </div>
                          </div>

                          <div className="row mb-2">
                            <div className="col-md-4">
                              <span className="text-muted">BP</span>
                              <div>{t.bloodPressure || "-"}</div>
                            </div>
                            <div className="col-md-4">
                              <span className="text-muted">Pulse</span>
                              <div>{t.pulse || "-"}</div>
                            </div>
                            <div className="col-md-4">
                              <span className="text-muted">Doctor</span>
                              <div>{t.doctorUserId || "-"}</div>
                            </div>
                          </div>

                          {/* Documents */}
                          
                            <div className="mt-3">
                              <strong>Documents</strong>
                                {(item.documents.length > 0 && item.documents.prescriptionFilePath) ? (
                                    <ul className="list-group mt-2">
                                        {item.documents.map((doc) => (
                                        <li
                                            key={doc.id}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            {doc.fileName}
                                            <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={e => {
                                                                e.preventDefault();
                                                                download(doc.id, 'prescription');
                                                            }}
                                            >
                                            <FaDownload size={12} /> Download
                                            </a>
                                        </li>
                                        ))}
                                    </ul>)
                                : <span>&nbsp; &nbsp; <MdErrorOutline /> No prescriptions found.</span>    
                                }
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3 gap-2">
                  <button
                    className="btn btn-sm btn-esic"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <IoIosArrowDropleftCircle />
                  </button>

                  <span className="align-self-center">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="btn btn-sm btn-esic"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <IoIosArrowDroprightCircle />
                  </button>
                  <div className="mt-2">Total Records: <b>{historyData.length}</b></div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
}
