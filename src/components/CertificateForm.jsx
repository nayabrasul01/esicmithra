import { useState, useMemo, useEffect } from "react";
import { CERTIFICATE_RULES } from "../util/certificateRules";
import { calculateLeaveTo, calculateFollowUpDate } from "../util/dateUtils";

import LoadingSpinner from "../components/LoadingSpinner";

import {
  fetchPreviousCertificateHistory,
  createMedicalCertificate,
} from "../services/medicalCertificateService";

export default function CertificateForm({ patient }) {
  const [previousCert, setPreviousCert] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

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
    const fetchPrevious = async () => {
      if (!patient) return;
      try {
        const res = await fetchPreviousCertificateHistory(patient.ipNumber);
        if (res.success) {
          setPreviousCert(res.data);

          // Auto-set leaveFrom = next day of previous Leave To
          if (res.data?.leaveDetails?.leaveTo) {
            const nextDay = new Date(res.data.leaveDetails.leaveTo);
            nextDay.setDate(nextDay.getDate() + 1);

            setFormData((prev) => ({
              ...prev,
              leaveFrom: nextDay.toISOString().split("T")[0],
            }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
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

  const handleSpellType = (value) => {
    if (!rules.allowedSpellTypes?.includes(value)) {
      alert("Invalid spell type for selected certificate");
      setFormData({ ...formData, spellType: "" });
      return;
    }

    if (previousCert?.status === "IN_PROGRESS") {
      const choice = confirm(
        "Before Issuing another new First/First and Final Certificate, Please Close Previous spell/Opened Certificate, \nDo You want to Generate a new certificate? \nCaution: Clicking `Ok` will force close the previously opened certificate",
      );
      if (!choice) {
        setFormData({ ...formData, spellType: "" });
        return;
      }
    }

    setFormData({ ...formData, spellType: value });
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    try {
      // await axios.post("/api/certificates/create", payload);
      // await createMedicalCertificate(payload);
      alert("Certificate created successfully");
    } catch (err) {
      alert("Failed to create certificate");
    }
  };

  const buildPayload = () => {
    return {
      certificateType: formData.certificateType,
      spellType: formData.spellType,
      status: "IN_PROGRESS",
      patient: {
        ipNumber: patient?.ipNumber,
        uhid: patient?.uHID,
        name: patient?.name,
        gender: patient?.sex,
        relationship: patient?.relationship,
        dob: patient?.dob,
        locationId: user.locationId,
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
    if (!formData.leaveFrom || !formData.leaveTo) return false;

    if (rules.show.followUpDate && !formData.followUpDate) return false;
    if (rules.show.fitDate && !formData.fitDate) return false;

    return true;
  };

  const handleLeavesRequiredChange = (value) => {
    let leaves = parseInt(value || 0);

    // ❗ Restrict to eligible leaves
    if (leaves > rules.eligibleLeaves) {
      alert(`Maximum allowed is ${rules.eligibleLeaves} days`);
      leaves = rules.eligibleLeaves;
    }

    const leaveFrom =
      formData.leaveFrom || new Date().toISOString().split("T")[0];

    const leaveTo = calculateLeaveTo(leaveFrom, leaves);
    const followUpDate = calculateFollowUpDate(leaveTo, 1); // can change the number of days after which follow-up is required based on rules. for now it is one day.

    setFormData({
      ...formData,
      leavesRequired: leaves,
      leaveFrom,
      leaveTo,
      followUpDate,
    });
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
    <div className="card shadow-sm">
      <div className="card-body">
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
        </div>

        {/* Certificate Details */}
        <div className="border p-3 mb-3 rounded">
          <h6>Certificate Details</h6>

          {rules.show?.hospitalization && formData.spellType && (
            <>
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
                      onChange={() =>
                        setFormData({ ...formData, hospitalization: "MANUAL" })
                      }
                    />{" "}
                    Manual
                    <input
                      type="radio"
                      name="hospitalization"
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
                      onChange={() =>
                        setFormData({ ...formData, hospitalization: "NA" })
                      }
                    />{" "}
                    No
                  </div>

                  {formData.hospitalization === "HOSPITAL" && (
                    <div className="row mb-2 my-auto">
                      Date of Admission:
                      <div className="col-md-3">
                        <input
                          placeholder="DOA"
                          className="form-control"
                          type="date"
                          onChange={(e) =>
                            setFormData({ ...formData, doa: e.target.value })
                          }
                        />
                      </div>
                      Date of Discharge:
                      <div className="col-md-3">
                        <input
                          placeholder="DOD"
                          className="form-control"
                          type="date"
                          onChange={(e) =>
                            setFormData({ ...formData, dod: e.target.value })
                          }
                        />
                      </div>
                      Hospital Name:
                      <div className="col-md-3">
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
                      Issue Date:
                      <input
                        type="date"
                        className="form-control mb-2"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            issueDate: e.target.value,
                          })
                        }
                      />
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
                    Create Date Of First Certificate Of Spell
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
                      setFormData({ ...formData, spellRemarks: e.target.value })
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
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.diseaseDiagnosis}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        diseaseDiagnosis: e.target.value,
                      })
                    }
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
              <div className="border p-3 mt-2 rounded">
                <h6>Leave Recommendation</h6>

                <div className="row mb-2">
                  <div className="col-md-3">
                    <label className="form-label ">Eligible Leaves</label>
                    <input
                      className="form-control"
                      value={rules.eligibleLeaves || ""}
                      disabled
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label ">Leaves Required</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.leavesRequired}
                      onChange={(e) =>
                        handleLeavesRequiredChange(e.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label ">Leave From</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.leaveFrom}
                      onChange={(e) => handleLeaveFromChange(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
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
                      <label>Fit To Work</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.fitDate}
                        onChange={(e) =>
                          setFormData({ ...formData, fitDate: e.target.value })
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
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 text-end">
          <button
            className="btn btn-esic"
            disabled={!isFormValid()}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
