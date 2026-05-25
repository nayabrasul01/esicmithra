import { useState, useMemo, useEffect } from "react";
import { CERTIFICATE_RULES } from "../../util/certificateRules";
import {
  calculateLeaveTo,
  calculateFollowUpDate,
  calculateLeaveFrom,
  addDays,
} from "../../util/dateUtils";
import { createFileLink } from "../../util/utilities";
import { showToast } from "../../util/toastUtil";
import SnomedSearch from "../SnomedSearch";

import LoadingSpinner from "../LoadingSpinner";
import SickCertificateHistoryModal from "./SickCertificateHistoryModal";
import { useAlert } from "./../alert/AlertContext";

import { TbCertificate } from "react-icons/tb";

import {
  fetchPreviousCertificateHistory,
  createMedicalCertificate,
  closePreviousInProgressCertificate,
  generateCertificate,
} from "../../services/medicalCertificateService";

export default function SickCertificateForm({ patient }) {
  const [previousCert, setPreviousCert] = useState([]);
  const { alert, confirm } = useAlert();

  const user = JSON.parse(localStorage.getItem("user"));

  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    certificateType: "",
    spellType: "",
    leaveFrom: "",
    leaveTo: "",
    followUpDate: "",
    fitDate: "",
    remarks: "",
    additionalRemarks: "",
    hospitalization: "",
    doa: "",
    dod: "",
    hospitalName: "",
    issueDate: "",
    hasAttendedMobileDispensary: "",
    firstCertificateDate: new Date().toISOString().split("T")[0],
    visitDate: "",
    spellRemarks: "",
    placeOfExamination: "",
    diseaseDiagnosis: "",
    diseaseRemarks: "",

    leavesRequired: "",
    issueESICMed11: false,
  });

  const rules = useMemo(() => {
    return CERTIFICATE_RULES[formData.certificateType] || {};
  }, [formData.certificateType]);

  // To fetch previous certificates whenever patient or certificate type changes.
  // This is required for auto-filling certain fields in case of intermediate certificates.
  useEffect(() => {
    fetchPrevious();
  }, [patient, formData.certificateType]);

  // To reset certificate & spell type when patient changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      certificateType: "",
      spellType: "",
    }));
  }, [patient]);

  const fetchPrevious = async () => {
    if (!patient) return;
    try {
      const res = await fetchPreviousCertificateHistory(patient.ipNumber);
      if (res.success && res.data.length != 0) {
        setPreviousCert(res.data);

        // Auto-set leaveFrom = next day of previous Leave To
        const date = calculateLeaveFrom(res.data[0].leaveDetails.leaveTo);
        setFormData((prev) => ({
          ...prev,
          leaveFrom: date,
        }));
      } else {
        // showToast("No Previous history for IP.");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch previous certificate history.", "danger");
    }
  };

  const handleSpellType = async (value) => {
    if (!rules.allowedSpellTypes?.includes(value)) {
      await alert(
        "Selected certificate type does not allow the chosen spell type. Please select a valid combination.",
        "warning",
      );
      setFormData({ ...formData, spellType: "" });
      return;
    }

    if (
      (formData.certificateType === "INTERMEDIATE" ||
        formData.certificateType === "SPECIAL_INTERMEDIATE" ||
        formData.certificateType === "FINAL") &&
      previousCert.length <= 0
    ) {
      await alert(
        "Selected certificate type does not have previous certificates in curent spell. Please try with FIRST or FIRST & FINAL certificate.",
        "warning",
      );
      setFormData({ ...formData, spellType: "" });
      return;
    }

    if (
      (formData.certificateType === "FIRST" ||
        formData.certificateType === "FIRST_FINAL") &&
      previousCert[0]?.status === "IN_PROGRESS"
    ) {
      const confirmed = await confirm(
        `Before Issuing another new First/First and Final Certificate, Please Close Previous spell/Opened Certificate, 
        \nDo You want to Generate a new certificate? 
        \n \n Caution: Clicking 'Ok' will force close the previously opened certificate`,
        "warning",
      );
      if (!confirmed) {
        setFormData({ ...formData, spellType: "" });
        return;
      } else {
        if (
          await confirm(
            "Are you sure you want to close all existing certificates in current spell?",
          )
        )
          updateExistingCertificates(patient.ipNumber);
        else {
          setFormData({ ...formData, spellType: "" });
          return;
        }
      }
    }
    // this is to ensure that the first certificate date remains the same for all certificates in the same spell if we have previous certificates.
    if (previousCert.length > 0) {
      const firstCertificateDate =
        previousCert[0]?.certificateDetails?.firstCertificateDate;
      setFormData({
        ...formData,
        spellType: value,
        firstCertificateDate: firstCertificateDate,
      });
      return;
    }

    setFormData({ ...formData, spellType: value });
  };

  const updateExistingCertificates = async (ipNumber) => {
    setLoading(true);
    try {
      const res = await closePreviousInProgressCertificate(ipNumber);
      if (res.success) {
        await alert(
          "Closed all previous certificates successfully.",
          "success",
        );
        setPreviousCert([]); // Clear previous cert to avoid confusion.
        setFormData({
          certificateType: "",
          spellType: "",
          leaveFrom: "",
          leaveTo: "",
          followUpDate: "",
          fitDate: "",
          remarks: "",
          additionalRemarks: "",
          hospitalization: "",
          doa: "",
          dod: "",
          hospitalName: "",
          issueDate: "",
          hasAttendedMobileDispensary: "",
          firstCertificateDate: new Date().toISOString().split("T")[0],
          visitDate: "",
          spellRemarks: "",
          placeOfExamination: "",
          diseaseDiagnosis: "",
          diseaseRemarks: "",

          leavesRequired: "",
          issueESICMed11: false,
        });
      }
    } catch (error) {
      await alert(
        "Failed to close previous certificate. Please try again.",
        "danger",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid())
      return await alert(
        "Please fill all the required fields before submitting.",
        "warning",
      );
    setLoading(true);
    const payload = buildPayload();
    try {
      if (
        !(await confirm("Are you sure you want to generate the certificate?"))
      )
        return;

      const res = await createMedicalCertificate(payload);
      if (res.success) {
        await alert("Certificate created & generated successfully.", "success");

        payload.certificateNumber = res.data.certificateNumber;
        payload.id = res.data.id;
        const response = await generateCertificate(payload);
        const blob = new Blob([response], {
          type: "application/pdf",
        });
        createFileLink(blob, "medical_certificate.pdf");
        setFormData({
          certificateType: "",
          spellType: "",
          leaveFrom: "",
          leaveTo: "",
          followUpDate: "",
          fitDate: "",
          remarks: "",
          additionalRemarks: "",
          hospitalization: "",
          doa: "",
          dod: "",
          hospitalName: "",
          issueDate: "",
          hasAttendedMobileDispensary: "",
          firstCertificateDate: new Date().toISOString().split("T")[0],
          visitDate: "",
          spellRemarks: "",
          placeOfExamination: "",
          diseaseDiagnosis: "",
          diseaseRemarks: "",

          leavesRequired: "",
          issueESICMed11: false,
        });
        await alert(
          `Sick certificate ${res.data.certificateNumber} created & generated successfully.`,
          "success",
        );
        // setPreviousCert(res.data); // to ensure history modal shows the newly created certificate when opened immediately after creation
      } else {
        await alert(
          "Failed to create certificate. Please try again.",
          "danger",
        );
      }
    } catch (err) {
      await alert(err?.response?.data?.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = () => {
    return {
      certificateType: formData.certificateType,
      spellType: formData.spellType,
      status: "IN_PROGRESS",
      patient: {
        ipNumber: patient?.ipNumber,
        employerCode: patient?.employerCode,
        uhid: patient?.uHID,
        name: patient?.name,
        gender: patient?.sex,
        relationship: patient?.relationship,
        dob: patient?.dob,
        locationId: user?.location?.id,
        state: patient?.residingState,
      },

      certificateDetails: {
        hospitalizationType: formData.hospitalization,
        doa: formData.doa,
        dod: formData.dod,
        hospitalName: formData.hospitalName,
        issueDate: formData.issueDate,
        hasAttendedMobileDispensary: formData.hasAttendedMobileDispensary,
        firstCertificateDate: formData.firstCertificateDate,
        visitDate: formData.visitDate,
        spellRemarks: formData.spellRemarks,
        placeOfExamination: formData.placeOfExamination,
        diseaseDiagnosis: formData.diseaseDiagnosis,
        diseaseRemarks: formData.diseaseRemarks,
      },

      leaveDetails: {
        eligibleLeaves: rules.eligibleLeaves,
        leavesRequired: formData.leavesRequired,
        leaveFrom: formData.leaveFrom,
        leaveTo: formData.leaveTo,
        followUpDate: formData.followUpDate,
        fitDate: formData.fitDate,
        issueESICMed11: formData.issueESICMed11,
        remarks: {
          remarks: formData.remarks,
          additionalRemarks: formData.additionalRemarks,
        },
      },
    };
  };

  const isFormValid = () => {
    if (!formData.certificateType || !formData.spellType) return false;
    if (!formData.leaveFrom || !formData.leaveTo || !formData.leavesRequired)
      return false;

    // if (rules.show.followUpDate && !formData.followUpDate) return false;
    if (rules.show.fitDate && !formData.fitDate) return false;

    return true;
  };

  const handleLeavesRequiredChange = async (value) => {
    let leaves = parseInt(value || 0);

    // ❗ Restrict to eligible leaves
    if (leaves > rules.eligibleLeaves) {
      alert(`Maximum allowed is ${rules.eligibleLeaves} days`);
      await alert(`Maximum allowed is ${rules.eligibleLeaves} days`, "warning");
      leaves = rules.eligibleLeaves;
    }

    const leaveFrom =
      formData.leaveFrom || new Date().toISOString().split("T")[0];

    const leaveTo = calculateLeaveTo(leaveFrom, leaves);
    const followUpDate = calculateFollowUpDate(leaveTo, 1); // can change the number of days after which follow-up is required based on rules. for now it is one day.
    const fitDate = calculateLeaveFrom(leaveTo, 1); // can change the number of days after which fit date is based on rules. for now it is one day after leave to date.

    if (rules.show?.followUpDate) {
      setFormData({
        ...formData,
        leavesRequired: leaves,
        leaveFrom,
        leaveTo,
        followUpDate,
      });
    } else if (rules.show?.fitDate) {
      setFormData({
        ...formData,
        leavesRequired: leaves,
        leaveFrom,
        leaveTo,
        fitDate,
      });
    }
  };

  const handleLeaveFromChange = (leaveFrom) => {
    const days = formData.leavesRequired || rules.eligibleLeaves;

    const leaveTo = calculateLeaveTo(leaveFrom, days);

    setFormData({
      ...formData,
      leaveFrom,
      leaveTo,
    });
  };

  return (
    <div className="card">
      {!loading && (
        <div className="card-body text-esic mb-2">
          {/* modal to show previous certificates */}
          <SickCertificateHistoryModal
            show={showHistory}
            patient={patient}
            patientHistory={previousCert}
            onClose={() => setShowHistory(false)}
          />

          {/* Certificate Meta */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Certificate Type</label>
              <select
                className="form-select"
                value={formData.certificateType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    certificateType: e.target.value,
                    spellType: "",
                  })
                }
              >
                <option value="">Select</option>
                <option value="FIRST">Medical Certificate - First</option>
                <option value="FIRST_FINAL">
                  Medical Certificate - First & Final
                </option>
                <option value="INTERMEDIATE">
                  Medical Certificate - Intermediate
                </option>
                <option value="SPECIAL_INTERMEDIATE">
                  Medical Certificate - Special Intermediate
                </option>
                <option value="FINAL">Medical Certificate - Final</option>
              </select>
            </div>

            <div className="col-md-4">
              <label>Spell Type</label>
              <select
                className="form-select"
                value={formData.spellType}
                onChange={(e) => handleSpellType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="FRESH">Fresh/New Spell</option>
                <option value="ONGOING">Old/Ongoing Spell</option>
              </select>
            </div>

            <div className="col-md-4 my-auto">
              <button
                className="btn btn-sm btn-esic"
                onClick={async () => {
                  if (previousCert.length === 0) {
                    await alert(
                      "No previous certificates found in the current spell for this patient.",
                      "warning",
                    );
                    return;
                  }
                  setShowHistory(true);
                }}
              >
                <TbCertificate size={20} className="mb-1" /> View Previous
                Certificate
              </button>
            </div>
          </div>

          {/* Certificate Details */}

          {rules.show?.hospitalization && formData.spellType && (
            <div className="p-1 mb-3">
              <h6
                className="bg-light p-2 rounded"
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "2px solid #9D231E",
                }}
              >
                Certificate Details
              </h6>
              {/* Diagnosis details */}
              <div className="row g-3 mt-2">
                <div className="col-md-6">
                  <label>
                    Was Previous Certificate issued manually (or) Was it a case
                    of Hospitalization
                  </label>
                  <div className="d-flex gap-3 mb-2">
                    <input
                      type="radio"
                      name="hospitalization"
                      disabled={formData.spellType === "ONGOING"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          hospitalization: "MANUAL",
                        })
                      }
                    />{" "}
                    Manual
                    <input
                      type="radio"
                      name="hospitalization"
                      disabled={formData.spellType === "ONGOING"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          hospitalization: "HOSPITAL",
                        })
                      }
                    />{" "}
                    Hospitalization
                    <input
                      type="radio"
                      name="hospitalization"
                      disabled={formData.spellType === "ONGOING"}
                      onChange={() =>
                        setFormData({ ...formData, hospitalization: "NA" })
                      }
                    />{" "}
                    No
                  </div>

                  {formData.hospitalization === "HOSPITAL" && (
                    <div className="row g-3 mb-2">
                      <div className="col-md-4">
                        <label className="form-label">Date of Admission</label>
                        <input
                          placeholder="DOA"
                          className="form-control"
                          type="date"
                          onChange={(e) =>
                            setFormData({ ...formData, doa: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Date of Discharge</label>
                        <input
                          placeholder="DOD"
                          className="form-control"
                          type="date"
                          onChange={(e) =>
                            setFormData({ ...formData, dod: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Hospital Name</label>
                        <input
                          placeholder="Hospital Name"
                          className="form-control"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hospitalName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {formData.hospitalization === "MANUAL" && (
                    <div className="row mb-2">
                      <div className="col-md-6">
                        <label className="form-label">Issue Date</label>
                        <input
                          type="date"
                          className="form-control"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              issueDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Has Attended Mobile Dispensary */}
                <div className="col-md-6">
                  <label className="form-label ">
                    Has Attended Mobile Dispensary
                  </label>
                  <div>
                    <label className="me-3">
                      <input
                        type="radio"
                        name="mobileDisp"
                        value={true}
                        checked={formData.hasAttendedMobileDispensary === true}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            hasAttendedMobileDispensary: true,
                          })
                        }
                      />{" "}
                      Yes
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="mobileDisp"
                        value={false}
                        checked={formData.hasAttendedMobileDispensary === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            hasAttendedMobileDispensary: false,
                          })
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </div>

                {/* First Certificate Date */}
                <div className="col-md-6">
                  <label className="form-label ">
                    <span style={{ color: "red" }}>* </span>Create Date Of First
                    Certificate Of Spell
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.firstCertificateDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstCertificateDate: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>

                {/* Visit Date */}
                <div className="col-md-6">
                  <label className="form-label ">
                    Visit Date / Date Of Examination
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.visitDate}
                    onChange={(e) =>
                      setFormData({ ...formData, visitDate: e.target.value })
                    }
                  />
                </div>

                {/* Spell Remarks */}
                <div className="col-md-6">
                  <label className="form-label ">Spell Remarks</label>
                  <input
                    className="form-control"
                    value={formData.spellRemarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spellRemarks: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Place of Examination */}
                <div className="col-md-6">
                  <label className="form-label ">Place Of Examination</label>
                  <input
                    className="form-control"
                    value={formData.placeOfExamination}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        placeOfExamination: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Disease Diagnosis */}
                <div className="col-md-6">
                  <label className="form-label ">Disease(s) / Diagnosis</label>
                  {/* <textarea
                      className="form-control"
                      rows={2}
                      value={formData.diseaseDiagnosis}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diseaseDiagnosis: e.target.value,
                        })
                      }
                    /> */}

                  <SnomedSearch
                    onSelect={(data) => {
                      setFormData({
                        ...formData,
                        diseaseDiagnosis: data.snomedDiagnosis,
                      });
                    }}
                  />
                </div>

                {/* Disease Remarks */}
                <div className="col-md-6">
                  <label className="form-label ">Disease Remarks</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.diseaseRemarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        diseaseRemarks: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Leave Recommendation */}
              <h6
                className="mt-2 bg-light p-2 rounded mb-3"
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "2px solid #9D231E",
                }}
              >
                Leave Recommendations
              </h6>

              <div className="row g-3 mb-2">
                <div className="col-md-3">
                  <label className="form-label ">Eligible Leaves</label>
                  <input
                    className="form-control"
                    value={rules.eligibleLeaves || ""}
                    disabled
                  />
                </div>

                <div className="col-md-3">
                  <span style={{ color: "red" }}>* </span>
                  <label className="form-label ">Leaves Required</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.leavesRequired}
                    onChange={(e) => handleLeavesRequiredChange(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <span style={{ color: "red" }}>* </span>
                  <label className="form-label ">Leave From</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.leaveFrom}
                    onChange={(e) => handleLeaveFromChange(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <span style={{ color: "red" }}>* </span>
                  <label>Leave To</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.leaveTo}
                    onChange={(e) =>
                      setFormData({ ...formData, leaveTo: e.target.value })
                    }
                    disabled={true}
                    // min={formData.leaveFrom}
                  />
                </div>

                {rules.show?.fitDate && (
                  <div className="col-md-3">
                    <span style={{ color: "red" }}>* </span>
                    <label>Fit To Work</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fitDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fitDate: e.target.value,
                        })
                      }
                      // min={formData.leaveTo}
                    />
                  </div>
                )}

                <div className="col-md-6 mt-2">
                  <label className="form-label ">
                    Issue ESIC-Med.11(Information Of Sickness) Certificate
                  </label>
                  <div>
                    <label className="me-3">
                      <input
                        type="radio"
                        name="issueESICMed11"
                        value={true}
                        checked={formData.issueESICMed11 === true}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            issueESICMed11: true,
                          })
                        }
                      />{" "}
                      Yes
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="issueESICMed11"
                        value={false}
                        checked={formData.issueESICMed11 === false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            issueESICMed11: false,
                          })
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </div>

                {rules.show?.followUpDate && (
                  <div className="col-md-3">
                    <label>Follow Up Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.followUpDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          followUpDate: e.target.value,
                        })
                      }
                      disabled={true}
                    />
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label>Remarks</label>
                <select
                  className="form-select"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                >
                  <option value="Select">Select</option>
                  <option value="Deliberately avoiding operation and prolonging incapacity from">
                    Deliberately avoiding operation and prolonging incapacity
                    from
                  </option>
                  <option value="Failed to attend dispensary on">
                    Failed to attend dispensary on
                  </option>
                  <option value="Failed to attend dispensary on And condition aggravated">
                    Failed to attend dispensary on And condition aggravated
                  </option>
                  <option value="Has attended Mobile dispensary">
                    Has attended Mobile dispensary
                  </option>
                  <option value="Has been refered to Hospital for admission">
                    Has been refered to Hospital for admission
                  </option>
                  <option value="IP has been found to be sick from previous day">
                    IP has been found to be sick from previous day
                  </option>
                  <option value="Last attended dispensary on">
                    Last attended dispensary on
                  </option>
                  <option value="NA - Needed abstention">
                    NA - Needed abstention
                  </option>
                  <option value="No Remarks">No Remarks</option>
                  <option value="PNR - Progress Not Retarded/Deteriorated">
                    PNR - Progress Not Retarded/Deteriorated
                  </option>
                  <option value="PR - Progress Retarded/Deteriorated">
                    PR - Progress Retarded/Deteriorated
                  </option>
                </select>
              </div>

              <div>
                <label>Additional Remarks</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.additionalRemarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalRemarks: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <div>
            <p>Note :</p>
            <ul>
              <li>
                BI-1 is to be issued by IMO/IMP on receipt of Accident Report
                received from the Employer alleging Employment Injury, and
                generally at the time of issuance of the First Certificate.
              </li>
              <li>
                If First Certificate was issued manually, please capture issue
                date with other details at the “Other Remarks, if any and
                Inference”
              </li>
              <li>
                Severity of the Injury is defined as under:
                <ul>
                  <li>
                    Simple injury:- Any injury which is not grievous is simple
                    injury.
                  </li>
                  <li>
                    Grievous injuries (Sec.320 IPC):-
                    <ul>
                      <li>
                        Emasculation- i.e. loss of power of erection of penis.
                      </li>
                      <li>Permanent privation of sight of either eye.</li>
                      <li>Permanent privation of hearing of either ear.</li>
                      <li>Privation of any part, organ, or joint.</li>
                      <li>
                        Destruction or permanent impairing of the powers of any
                        part, organ, or joint.
                      </li>
                      <li>Permanent disfiguration of face or head.</li>
                      <li>Fracture or dislocation of bone or tooth.</li>
                      <li>
                        Any hurt which endangers life or which causes the
                        sufferer to be in the state of bodily pain for more than
                        20 days, so that he cannot peruse his daily routine
                        work.
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                Type/nature of the Injury can be defined as: - Abrasion
                (Scrape), Amputation, Blast Injury, Chemical Burn, Contusion
                (Bruise), Dislocation, Electric Shock, Explosive Injury, Foreign
                Body, Fracture, Freezing, Gunshot Injury, Heat Stress/Stroke,
                Incised Injury, Inflammation, Laceration, Lightening, Loss of
                Consciousness, No Physical Injury, Puncture, Radiation Injury,
                Road Traffic Accident, Soft Tissue Injury, Sprain, Stab Injury,
                Strain, Thermal Burn, All Other Injuries not otherwise
                Classified, Dermatitis/Skin Irritation, Exposure (Chemical,
                Radiation, Asbestos, etc), Hearing Impairment, Repetitive Strain
                Injury, Respiratory Irritation or Impairment, Vision Impairment,
                All Other Occupational Illnesses not otherwise Classified, etc.
              </li>
              <li>DOA & hospital name are auto populated & are editable</li>
            </ul>
          </div>
          {/* Actions */}
          <div className="mt-3 text-end">
            <button
              className="btn btn-esic"
              disabled={!isFormValid()}
              onClick={handleSubmit}
            >
              Create & Generate Certificate
            </button>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}
    </div>
  );
}
