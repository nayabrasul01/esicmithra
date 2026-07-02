import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserEdit } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { MdCancel } from "react-icons/md";
import { FaDownload, FaUpload } from "react-icons/fa6";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { RiErrorWarningFill } from "react-icons/ri";
import { IoCreateOutline } from "react-icons/io5";

import { createFileLink } from "../../util/utilities";
import { useAlert } from "../alert/AlertContext";

import {
  fetchCertificatesByLocation,
  downloadFile,
} from "../../services/medicalCertificateService";

import LoadingSpinner from "../../components/LoadingSpinner";
import { showToast } from "../../util/toastUtil";

const CertificatesTable = ({ user, onViewHistory }) => {
  const isDoctor = user?.type === "D";
  const navigate = useNavigate();
  const { alert } = useAlert();
  const [loader, setLoader] = useState(false);

  const [patientsDetailsList, setPatientsDetailsList] = useState([]);

  const [certificates, setCertificates] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const getCertificates = async () => {
      try {
        const res = await fetchCertificatesByLocation(user?.location?.id);
        if (res.success) {
          setCertificates(res.data);
          setFiltered(res.data);
        }
      } catch (error) {
        showToast(
          `Failed to fetch certificates: ${error.message}. Please try again later.`,
          "danger",
        );
      }
    };

    // Prevent double fetching in StrictMode (dev) or duplicate renders
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    getCertificates();
  }, []);

  const fetchedRef = useRef(false);

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
      //   showToast("File downloaded successfully", "success");
      await alert("File downloaded successfully.", "success");
    } catch (error) {
      await alert("Medical certificate not found, download failed", "danger");
    }
  };

  const filterCertificates = (search) => {
    const result = certificates.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.certificateType.toLowerCase().includes(search.toLowerCase()) ||
        c.patient.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(result);
    setPage(1);
  };

  const showHistoryModal = (cert) => {
    onViewHistory(cert, cert.patient);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      APPROVED: { label: "Approved", bg: "#198754", color: "#fff" },
      REJECTED: { label: "Rejected", bg: "#dc3545", color: "#fff" },
      IN_PROGRESS: { label: "In Progress", bg: "#ffc107", color: "#212529" },
    };

    const { label, bg, color } = statusConfig[status] || {
      label: status,
      bg: "#6c757d",
      color: "#fff",
    };

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.25rem 0.50rem",
          borderRadius: "999px",
          backgroundColor: bg,
          color,
          fontSize: "0.75rem",
          fontWeight: 500,
          textTransform: "capitalize",
        }}
      >
        {label}
      </span>
    );
  };

  const handleEdit = (cert) => {
    console.log(cert);
    
    navigate("/create-certificate", { state: { cert } });
  };

  const indexOfLast = page * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentRecords = filtered.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  return (
    <div className="card text-esic">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0">Medical Certificate Requests</h5>
          <button
            className="btn btn-sm btn-esic d-flex align-items-center gap-2"
            onClick={() => navigate("/create-certificate", { state: user })}
            // disabled={true}
          >
            <IoCreateOutline size={20} />
            <span>Create Request</span>
          </button>
        </div>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search certificate..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            filterCertificates(e.target.value);
          }}
        />
      </div>

      <div className="card-body p-0">
        <table className="table table-bordered table-hover mb-0 text-esic">
          {loader ? (
            <LoadingSpinner message="Processing..." />
          ) : (
            <>
              <thead className="table-light text-center">
                <tr>
                  <th>S No.</th>
                  <th>Certificate Number</th>
                  <th>Certificate Type</th>
                  <th>UHID</th>
                  <th>Patient Name</th>
                  {/* <th>Created Date</th> */}
                  {/* <th width="150">Approved Certificate Form</th> */}
                  <th>Status</th>

                  {isDoctor && <th style={{ width: "220px" }}>Actions</th>}
                </tr>
              </thead>

              <tbody className="text-center">
                {currentRecords.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No certificates found
                    </td>
                  </tr>
                )}

                {currentRecords.map((c, index) => (
                  <tr key={index}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>
                      <a
                        // href="#"
                        // onClick={(e) => {
                        //   e.preventDefault();
                        //   download(c.id);
                        // }}
                        onClick={() => showHistoryModal(c)}
                        style={{
                          cursor: "pointer",
                          color: "#0d6efd",
                          textDecoration: "underline",
                        }}
                      >
                        {c.certificateNumber}
                      </a>
                    </td>
                    <td>{c.certificateType}</td>
                    <td>{c.patient.uhid}</td>
                    <td>{c.patient.name}</td>
                    {/* <td>{c.certificateDetails?.firstCertificateDate}</td> */}
                    <td>{getStatusBadge(c.status)}</td>

                    {isDoctor &&
                      !(
                        c.status === "APPROVED" ||
                        c.status === "REJECTED"
                      ) && (
                        <td>
                          {/* {r.referralStatus != "PARTIAL_APPROVED" && ( */}
                            <FaUserEdit
                              onClick={() => handleEdit(c)}
                              style={{
                                cursor: "pointer",
                                color: "#ffc106",
                                marginRight: "12px",
                                fontSize: "18px",
                              }}
                              title="Edit"
                            />
                          {/* )} */}

                          {/* <TiTick
                            onClick={() => handleEdit(c)}
                            style={{
                              cursor: "pointer",
                              color: "#28a745",
                              marginRight: "12px",
                              fontSize: "18px",
                            }}
                            title="Approve"
                          />

                          <MdCancel
                            onClick={() => handleEdit(c)}
                            style={{
                              cursor: "pointer",
                              color: "#dc3545",
                              fontSize: "18px",
                            }}
                            title="Reject"
                          /> */}
                        </td>
                      )}
                    {isDoctor &&
                      (c.status === "APPROVED" ||
                        c.status === "REJECTED") && (
                        <td className="my-auto">
                          <RiErrorWarningFill color="#9c231c" /> No action
                          required.
                        </td>
                      )}
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>

      {/* Pagination */}

      <div className="card-footer">
        <nav>
          <ul className="pagination justify-content-center mb-0">
            <li className={`page-item ${page === 1 && "disabled"}`}>
              <button
                className="btn btn-sm btn-esic"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <IoIosArrowDropleftCircle />
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${page === i + 1 ? "active" : ""}`}
              >
                <button
                  className="btn btn-sm btn-esic mx-1 px-2"
                  onClick={() => setPage(i + 1)}
                  disabled={page === i + 1}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${page === totalPages && "disabled"}`}>
              <button
                className="btn btn-sm btn-esic"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <IoIosArrowDroprightCircle />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default CertificatesTable;
