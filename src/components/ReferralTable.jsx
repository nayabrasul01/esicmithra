import { useEffect, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { MdCancel } from "react-icons/md";
import { FaDownload, FaUpload } from "react-icons/fa6";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { RiErrorWarningFill } from "react-icons/ri";
import LoadingSpinner from "../components/LoadingSpinner";

import { fetchReferrals, downloadFile, uploadFile, updateStatus } from "../services/referralService";
import { searchByIpNumber } from "../services/authService";
import { showToast } from "../util/toastUtil";
import { createFileLink } from "../util/utilities";

import { createLogger } from "../util/logger";

const logger = createLogger("ReferralTable");

const ReferralTable = ({ user, refreshTrigger, onEdit }) => {

  const isDoctor = user?.type === "D";

  const [loader, setLoader] = useState(false);

  const [patientsDetailsList, setPatientsDetailsList] = useState([]);

  const [referrals, setReferrals] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {

    const getReferralRequest = async () => {
      try {
        const res = await fetchReferrals(user?.locationId);
        
        setReferrals(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error("Failed to fetch referrals:", error);
        showToast(`Failed to fetch referrals: ${error.message}. Please try again later.`, "danger")
      }
    };
    getReferralRequest();
  }, [user?.locationId, refreshTrigger]);

  const filterReferrals = (search) => {
    const result = referrals.filter(r =>
      r.referralId.toLowerCase().includes(search.toLowerCase()) ||
      r.beneficiaryName.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setPage(1);
  };

  const downloadReferralForm = async (id, fileType) => {

    try {
        logger.info("Downloading attachment", { id });
        const response = await downloadFile(id, fileType);
        const blob = new Blob(
            [response.data],
            { type: response.headers["content-type"] } // 👈 important
        );

        const disposition = response.headers["content-disposition"];
        // Default filename
        let filename = "referral_form.pdf";
        if (disposition && disposition.includes("filename=")) {
            filename = disposition.split("filename=")[1].replaceAll('"', "").trim();
        }
        createFileLink(blob, filename);
        showToast("File downloaded successfully", "success");
    } catch (error) {
        logger.error("Download failed", error, { id });
        showToast(error?.response?.data?.message || error.message || "Download failed", "danger");
    }
  }

  const handleUpload = async(referralId, id, file, inputRef)=>{
      try{
          const res = await uploadFile(referralId, id, file);
          const updatedReferrals = await fetchReferrals(user?.locationId);
          setReferrals(updatedReferrals.data);
          setFiltered(updatedReferrals.data);
          showToast(res.data.message, "success");
          if(inputRef?.current) inputRef.current.value = "";
      }catch(e){
          logger.error("Referral attachment upload failed", e, {
              referralId,
          });
          showToast(e.response.data.message, "danger")
      }
  }

  const getStatusBadge = (status) => {

    switch (status) {

      case "CREATED":
        return <span className="badge bg-warning text-dark">Created</span>;

      case "APPROVED":
        return <span className="badge bg-success">Approved</span>;

      case "REJECTED":
        return <span className="badge bg-danger">Rejected</span>;

      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const handleApprove = async (row) => {
    if (!row?.referralId) {
      showToast("Missing referral details. Please try again.", "danger");
      return;
    }

    if(!confirm(`Are you sure you want to approve the referral request for ${row.referralId}`))
      return;

    try {
      setLoader(true);
      const res = await updateStatus(row.referralId, "APPROVED", user.userId);
      showToast(
        // res?.message || 
        `Referral ${row.referralId} approved successfully`,
        "success"
      );
      const updated = await fetchReferrals(user?.locationId);
      setReferrals(updated.data);
      setFiltered(updated.data);
    } catch (error) {
      logger.error("Referral approval failed", error, { referralId: row?.referralId });
      showToast(
        error?.response?.data?.message || error.message || "Failed to approve referral",
        "danger"
      );
    } finally {
      setLoader(false);
    }
  };

  const handleDecline = async (row) => {
    if (!row?.referralId) {
      showToast("Missing referral details. Please try again.", "danger");
      return;
    }

    if (!confirm(`Are you sure you want to reject the referral request for ${row.referralId}?`)) {
      return;
    }

    try {
      setLoader(true);
      await updateStatus(row.referralId, "REJECTED", user.userId);
      showToast(`Referral ${row.referralId} rejected successfully`, "success");
      const updated = await fetchReferrals(user?.locationId);
      setReferrals(updated.data);
      setFiltered(updated.data);
    } catch (error) {
      logger.error("Referral decline failed", error, { referralId: row?.referralId });
      showToast(
        error?.response?.data?.message || error.message || "Failed to decline referral",
        "danger"
      );
    } finally {
      setLoader(false);
    }
  };

  const getPatientLiveListData = async (ipNumber) => {
    setPatientsDetailsList([]);

    try {
      const res = await searchByIpNumber(ipNumber);

      if (res.data.success) {
        const familyMembers = res.data.data.InsuredPersonFamilyDetails || [];
        const selfMember = {
          name: res?.data?.data?.personalDetails?.[0]?.name,
          relationship: "Self",
          dob: res?.data?.data?.personalDetails?.[0]?.dateOfBirth,
          sex: res?.data?.data?.personalDetails?.[0]?.sex,
          residingState: res?.data?.data?.AddressDetails?.[0]?.address1,
          marstatus: res?.data?.data?.personalDetails?.[0]?.maritalStatus,
          uHID: res?.data?.data?.uHID
        };
        const list = selfMember.uHID ? [selfMember, ...familyMembers] : familyMembers;
        setPatientsDetailsList(list);
        return list;
      }
    } catch (err) {
      showToast(`Dashboard search failed ${err}, IpNo. : ${ipNumber}`, "danger");
    }

    return [];
  }

  const handleEdit = async (row) => {
    try {
      setLoader(true);
      const patientList = await getPatientLiveListData(row.ipNumber);
      const patient = patientList.find(p => p.uHID === row.beneficiaryId);
      patient.ipNumber = row.ipNumber;
      onEdit(row, patient);
    } catch (error) {
      showToast("Failed to load patient details", "danger");
    }finally{
      setLoader(false);
    }
  };

  const indexOfLast = page * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentRecords = filtered.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  return (

    <div className="card text-esic">

      <div className="card-header d-flex justify-content-between align-items-center">

        <h5 className="mb-0">Patient Referral Requests</h5>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search referral..."
          value={search}
          onChange={(e)=>{
            setSearch(e.target.value)
            filterReferrals(e.target.value)
          }}
        />

      </div>

      <div className="card-body p-0">

        <table className="table table-bordered table-hover mb-0 text-esic">

          { loader ? 
            <LoadingSpinner message="Processing..." />
            :
            <>
              <thead className="table-light text-center">

                <tr>
                  <th>S No.</th>
                  <th>Referral ID</th>
                  <th>UHID</th>
                  <th>Patient Name</th>
                  <th>Created Date</th>
                  <th width="150">Approved Referral Form</th>
                  <th>Status</th>

                  {isDoctor && <th style={{width:"220px"}}>Actions</th>}

                </tr>

              </thead>

              <tbody className="text-center">

                {currentRecords.length === 0 && (

                  <tr>
                    <td colSpan="6" className="text-center">
                      No referrals found
                    </td>
                  </tr>

                )}

                {currentRecords.map((r, index) => (

                  <tr key={index}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>
                      {/* {r.referralId} */}
                      {r.referralStatus === "PARTIAL_APPROVED" ? (
                            <a
                              href="#"
                              onClick={e => {
                                  e.preventDefault();
                                  downloadReferralForm(r.id, "DRAFT_FILE");
                              }}
                              style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
                            >
                              {r.referralId}
                            </a>
                        ) : (r.referralId)
                      }
                    </td>
                    <td>{r.beneficiaryId}</td>
                    <td>{r.beneficiaryName}</td>
                    <td>{r.createdAt.split("T")[0]}</td>
                    <td>
                      {r.documentId && r.approvedFilePath ? (
                        <a
                            href="#"
                            onClick={e => {
                                e.preventDefault();
                                downloadReferralForm(r.id, "APPROVED_FILE");
                            }}
                            style={{ cursor: 'pointer', color: '#147447'}}
                          >
                            <FaDownload title="Download" /> Download
                          </a>
                          ) : (
                            <label style={{cursor : 'pointer', color: '#bb2d3c'}}>
                            <FaUpload title="Upload" /> Upload
                            <input
                              disabled={r.referralStatus === 'REJECTED'}
                              type="file"
                              style={{display : "none"}}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                  // if(r.referralStatus === 'REJECTED'){
                                  //   showToast("Request already rejected, cannot upload.", "warning");
                                  //   return;
                                  // }
                                  handleUpload(r.referralId, r.id, e.target.files[0], {current: e.target})
                                }
                              }
                            />
                            </label>
                          )}
                          
                        </td>
                        <td>{getStatusBadge(r.referralStatus)}</td>

                        {isDoctor && !(r.referralStatus === 'APPROVED' || r.referralStatus === 'REJECTED') && (

                          <td>

                            <FaUserEdit 
                              onClick={()=>handleEdit(r)}
                              style={{cursor: 'pointer', color: '#ffc106', marginRight: '12px', fontSize: '18px'}}
                              title="Edit"
                            />

                            <TiTick 
                              onClick={()=>handleApprove(r)}
                              style={{cursor: 'pointer', color: '#28a745', marginRight: '12px', fontSize: '18px'}}
                              title="Approve"
                            />

                            <MdCancel 
                              onClick={()=>handleDecline(r)}
                              style={{cursor: 'pointer', color: '#dc3545', fontSize: '18px'}}
                              title="Reject"
                            />

                          </td>

                        )}
                        {isDoctor && (r.referralStatus === 'APPROVED' || r.referralStatus === 'REJECTED') && (
                          <td className="my-auto"><RiErrorWarningFill color="#9c231c" /> No action required.</td>
                        )}

                        </tr>

                      ))}

                      </tbody>
                    </>
                    }

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
                onClick={()=>setPage(page-1)}
              >
                <IoIosArrowDropleftCircle />
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (

              <li
                key={i}
                className={`page-item ${page === i+1 ? "active" : ""}`}
              >

                <button
                  className="btn btn-sm btn-esic mx-1 px-2"
                  onClick={()=>setPage(i+1)}
                  disabled={page === i+1}
                >
                  {i+1}
                </button>

              </li>

            ))}

            <li className={`page-item ${page === totalPages && "disabled"}`}>

              <button
                className="btn btn-sm btn-esic"
                disabled={page === totalPages}
                onClick={()=>setPage(page+1)}
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

export default ReferralTable;
