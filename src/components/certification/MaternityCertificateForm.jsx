import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { MATERNITY_CERTIFICATION_OPTIONS } from "../../util/certificateRules";
import { createFileLink } from "../../util/utilities";
import {
  createMedicalMaternityCertificate,
  generateCertificate,
  updateMaternityCertificate
} from "../../services/medicalCertificateService";
import { useAlert } from "./../alert/AlertContext";

const INITIAL_FORM_DATA = {
  durationOfPregnancy: "",
  certificateType: "MATERNITY",
  certificateSubType: "",

  expectedDateOfConfinement: "",
  placeOfExamination: "",
  abstentionFromDate: "",

  miscarriageDate: "",
  placeOfMiscarriage: "",

  confinementDate: "",
  outcomeOfPregnancy: "",
  placeOfConfinement: "",

  motherAlive: false,
  childAlive: false,

  remarks: "",
};

export default function MaternityCertificateForm({ patient, certificateData, mode}) {
  const [loading, setLoading] = useState(false);
  const { alert, confirm } = useAlert();
  const [editMode, setEditMode] = useState(mode || false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // this used for auto-filling the form with previous certificate data when editing an existing certificate.
  useEffect(() => {
    if (certificateData) {
      setFormData(buildFormData(certificateData));
      console.log(buildFormData(certificateData));
      
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [certificateData]);

  /**
   * ----------------------------------------------------------------
   * DYNAMIC ENABLE / DISABLE RULES
   * ----------------------------------------------------------------
   */

  const { duration, enablePregnancyCertificate, enableMiscarriageCertificate, enableConfinementCertificate, certificateOptions } = useMemo(() => {
    const dur = Number(formData?.durationOfPregnancy || 0);
    return {
      duration: dur,
      enablePregnancyCertificate: dur >= 1,
      enableMiscarriageCertificate: dur >= 1,
      enableConfinementCertificate: dur >= 27,
      certificateOptions: MATERNITY_CERTIFICATION_OPTIONS
    };
  }, [formData]);

  /**
   * ----------------------------------------------------------------
   * HANDLE FIELD CHANGES
   * ----------------------------------------------------------------
   */

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * ----------------------------------------------------------------
   * BUILD REQUEST PAYLOAD
   * ----------------------------------------------------------------
   */

  const isFormValid = () => {
    if (
      !formData.certificateSubType ||
      !formData.durationOfPregnancy ||
      !formData.remarks
    )
      return false;
    if (formData.certificateSubType === "EXPECTED_CONFINEMENT")
      if (
        !formData.expectedDateOfConfinement ||
        !formData.placeOfExamination ||
        !formData.abstentionFromDate
      )
        return false;

    if (formData.certificateSubType === "CONFINEMENT")
      if (
        !formData.confinementDate ||
        !formData.outcomeOfPregnancy ||
        !formData.placeOfConfinement ||
        !formData.abstentionFromDate ||
        !formData.motherAlive ||
        !formData.childAlive
      )
        return false;

    if (formData.certificateSubType === "MISCARRIAGE")
      if (
        !formData.miscarriageDate ||
        !formData.placeOfMiscarriage ||
        !formData.abstentionFromDate
      )
        return false;

    return true;
  };

  const buildPayload = () => {
    const payload = {
      id: certificateData?.id || null,
      certificateType: formData.certificateType || (editMode ? certificateData?.certificateType : ""),
      certificateSubType: formData.certificateSubType || (editMode ? certificateData?.spellType : ""),
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
        durationOfPregnancy: formData.durationOfPregnancy,
        remarks: formData.remarks,
      },
    };
    /**
     * ------------------------------------------------------------
     * EXPECTED CONFINEMENT
     * ------------------------------------------------------------
     */
    if (formData.certificateSubType === "EXPECTED_CONFINEMENT") {
      payload.certificateDetails.expectedDateOfConfinement =
        formData.expectedDateOfConfinement;

      payload.certificateDetails.placeOfExamination =
        formData.placeOfExamination;

      payload.certificateDetails.abstentionFromDate =
        formData.abstentionFromDate;
    }

    /**
     * ------------------------------------------------------------
     * MISCARRIAGE / MTP
     * ------------------------------------------------------------
     */
    if (formData.certificateSubType === "MISCARRIAGE") {
      payload.certificateDetails.miscarriageDate = formData.miscarriageDate;

      payload.certificateDetails.placeOfMiscarriage =
        formData.placeOfMiscarriage;

      payload.certificateDetails.abstentionFromDate =
        formData.abstentionFromDate;
    }

    /**
     * ------------------------------------------------------------
     * CONFINEMENT
     * ------------------------------------------------------------
     */
    if (formData.certificateSubType === "CONFINEMENT") {
      payload.certificateDetails.confinementDate = formData.confinementDate;

      payload.certificateDetails.outcomeOfPregnancy =
        formData.outcomeOfPregnancy;

      payload.certificateDetails.placeOfConfinement =
        formData.placeOfConfinement;

      payload.certificateDetails.abstentionFromDate =
        formData.abstentionFromDate;

      payload.certificateDetails.motherAlive = formData.motherAlive;

      payload.certificateDetails.childAlive = formData.childAlive;
    }

    return payload;
  };

  const buildFormData = (data) => {
    if (!data) return INITIAL_FORM_DATA;

    return {
      certificateType: data.certificateType || "",
      certificateSubType: data.certificateSubType || "",

      durationOfPregnancy: data.certificateDetails?.durationOfPregnancy || 0,

      remarks: data.certificateDetails?.remarks || "",

      // Expected Confinement
      expectedDateOfConfinement:
        data.certificateDetails?.expectedDateOfConfinement || "",

      placeOfExamination: data.certificateDetails?.placeOfExamination || "",

      abstentionFromDate: data.certificateDetails?.abstentionFromDate || "",

      // Miscarriage
      miscarriageDate: data.certificateDetails?.miscarriageDate || "",

      placeOfMiscarriage: data.certificateDetails?.placeOfMiscarriage || "",

      // Confinement
      confinementDate: data.certificateDetails?.confinementDate || "",

      outcomeOfPregnancy: data.certificateDetails?.outcomeOfPregnancy || "",

      placeOfConfinement: data.certificateDetails?.placeOfConfinement || "",

      motherAlive: data.certificateDetails?.motherAlive || false,

      childAlive: data.certificateDetails?.childAlive || false,
    };
  };

  /**
   * ----------------------------------------------------------------
   * SUBMIT FORM
   * ----------------------------------------------------------------
   */

  const handleSubmit = async () => {
    if (!isFormValid())
      return await alert(
        "Please fill all the required fields before submitting.",
        "warning",
      );
    setLoading(true);
    const payload = buildPayload();
    // console.log("REQUEST PAYLOAD => ", payload);

    try {
      if (
        !(await confirm("Are you sure you want to create draft certificate?"))
      )
        return;

      const res = await createMedicalMaternityCertificate(payload);
      if (res.success) {
        payload.certificateNumber = res.data.certificateNumber;
        payload.id = res.data.id;
        // const response = await generateCertificate(payload);
        // const blob = new Blob([response], {
        //   type: "application/pdf",
        // });
        // createFileLink(blob, "medical_maternity_certificate.pdf");
        setFormData(INITIAL_FORM_DATA);
        await alert(
          `Draft maternity certificate ${res.data.certificateNumber} created successfully. 
          Note: Pending for doctor's approval. You can view the certificate in the history modal.`,
          "success",
        );
        navigate("/medical-certificate", { state: user });
      } else {
        await alert(
          "IP Data saved but failed to generate certificate. Please try again.",
          "danger",
        );
      }
    } catch (err) {
      await alert(err?.response?.data?.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (status) => {
    setLoading(true);
    const payload = buildPayload();
    payload.status = status; // set status to the provided value
    // console.log("REQUEST PAYLOAD => ", payload);

    try {
      if (
        !(await confirm(`Are you sure you want to ${status === "APPROVED" ? "approve" : "reject"} the certificate?`))
      )
        return;

      const res = await updateMaternityCertificate(payload);
      if (res.success) {
        payload.certificateNumber = res.data.certificateNumber;
        payload.id = res.data.id;
        if(status === "APPROVED") {
          const response = await generateCertificate(payload);
          const blob = new Blob([response], {
            type: "application/pdf",
          });
          createFileLink(blob, "medical_maternity_certificate.pdf");
        }
        setFormData(INITIAL_FORM_DATA);
        await alert(
          `Maternity certificate ${res.data.certificateNumber} ${status === "APPROVED" ? "approved" : "rejected"} successfully.`,
          "success",
        );
        navigate("/medical-certificate", { state: user });
      } else {

        await alert(
          "IP Data saved but failed to generate certificate. Please try again.",
          "danger",
        );
      }
    } catch (err) {
      await alert(err?.response?.data?.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  /**
   * ----------------------------------------------------------------
   * UI
   * ----------------------------------------------------------------
   */

  return (
    <div className="card shadow-sm text-esic">
      <div className="card-body">
        {/* --------------------------------------------------- */}
        {/* DURATION OF PREGNANCY */}
        {/* --------------------------------------------------- */}

        <div className="row mb-4">
          <div className="mr-1 mb-2">
            <h6
              className="bg-light p-2 rounded"
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #9D231E",
              }}
            >
              Certificate Details
            </h6>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              <span style={{ color: "red" }}>*</span> Duration Of Pregnancy
              (Weeks)
            </label>

            <input
              type="number"
              min="0"
              className="form-control"
              value={formData.durationOfPregnancy}
              onChange={(e) =>
                handleChange("durationOfPregnancy", e.target.value)
              }
            />
          </div>
        </div>

        {/* --------------------------------------------------- */}
        {/* RADIO BUTTONS */}
        {/* --------------------------------------------------- */}

        <div className="mb-4">
          <label className="form-label fw-semibold d-block mb-3">
            <span style={{ color: "red" }}>*</span> Select Certificate Type
          </label>

          <div className="d-flex flex-wrap gap-4">
            {certificateOptions.map((option) => (
              <div className="form-check" key={option.value}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="certificateSubType"
                  value={option.value}
                  checked={formData.certificateSubType === option.value}
                  onChange={(e) =>
                    handleChange("certificateSubType", e.target.value)
                  }
                  disabled={
                    option.value === "CONFINEMENT"
                      ? !enableConfinementCertificate
                      : option.value === "MISCARRIAGE"
                        ? !enableMiscarriageCertificate
                        : option.value === "PREGNANCY"
                          ? !enablePregnancyCertificate
                          : false
                  }
                />

                <label className="form-check-label">{option.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================== */}
        {/* EXPECTED CONFINEMENT */}
        {/* =================================================== */}

        {formData.certificateSubType === "EXPECTED_CONFINEMENT" && (
          <div className="border rounded p-3 mb-4">
            <h6 className="fw-bold mb-3">Expected Confinement Details</h6>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Expected Date Of
                  Confinement
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={formData.expectedDateOfConfinement}
                  onChange={(e) =>
                    handleChange("expectedDateOfConfinement", e.target.value)
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Place Of Examination
                </label>

                <input
                  className="form-control"
                  value={formData.placeOfExamination}
                  onChange={(e) =>
                    handleChange("placeOfExamination", e.target.value)
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Abstention From
                  Employment Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={formData.abstentionFromDate}
                  onChange={(e) =>
                    handleChange("abstentionFromDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* PREGNANCY CERTIFICATE */}
        {/* =================================================== */}

        {formData.certificateSubType === "PREGNANCY" && (
          <div className="border rounded p-3 mb-4">
            <h6 className="fw-bold mb-3">Pregnancy Certificate Details</h6>

            <div className="alert alert-warning mb-0">
              Only remarks are required for this certificate type.
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* MISCARRIAGE / MTP */}
        {/* =================================================== */}

        {formData.certificateSubType === "MISCARRIAGE" && (
          <div className="border rounded p-3 mb-4">
            <h6 className="fw-bold mb-3">Miscarriage / MTP Details</h6>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Date Of Miscarriage
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={formData.miscarriageDate}
                  onChange={(e) =>
                    handleChange("miscarriageDate", e.target.value)
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Place Of Miscarriage
                </label>

                <input
                  className="form-control"
                  value={formData.placeOfMiscarriage}
                  onChange={(e) =>
                    handleChange("placeOfMiscarriage", e.target.value)
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Abstention From
                  Employment Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={formData.abstentionFromDate}
                  onChange={(e) =>
                    handleChange("abstentionFromDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* CONFINEMENT */}
        {/* =================================================== */}

        {formData.certificateSubType === "CONFINEMENT" && (
          <div className="border rounded p-3 mb-4">
            <h6 className="fw-bold mb-3">Confinement Details</h6>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Date Of Confinement
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.confinementDate}
                  onChange={(e) =>
                    handleChange("confinementDate", e.target.value)
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Outcome Of Pregnancy
                </label>

                <select
                  className="form-select"
                  value={formData.outcomeOfPregnancy}
                  onChange={(e) =>
                    handleChange("outcomeOfPregnancy", e.target.value)
                  }
                >
                  <option value="">Select</option>

                  <option value="LIVE_BIRTH">Live Birth</option>

                  <option value="STILL_BIRTH">Still Birth</option>

                  <option value="MTP">MTP</option>

                  <option value="INTRA_UTERINE_DEATH">
                    Intra Uterine Death
                  </option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Place Of Confinement
                </label>

                <input
                  className="form-control"
                  value={formData.placeOfConfinement}
                  onChange={(e) =>
                    handleChange("placeOfConfinement", e.target.value)
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  <span style={{ color: "red" }}>*</span> Abstention From
                  Employment Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={formData.abstentionFromDate}
                  onChange={(e) =>
                    handleChange("abstentionFromDate", e.target.value)
                  }
                />
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check me-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.motherAlive}
                    onChange={(e) =>
                      handleChange("motherAlive", e.target.checked)
                    }
                  />

                  <label className="form-check-label">Mother Alive</label>
                </div>

                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.childAlive}
                    onChange={(e) =>
                      handleChange("childAlive", e.target.checked)
                    }
                  />

                  <label className="form-check-label">Child Alive</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------- */}
        {/* REMARKS */}
        {/* --------------------------------------------------- */}

        <div className="mb-4">
          <label className="form-label fw-semibold">
            <span style={{ color: "red" }}>*</span> Remarks
          </label>

          <textarea
            rows={4}
            className="form-control"
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
          />
        </div>

        <p>
          <strong>Note:</strong> MTP is governed by the Rules, Regulations and
          Conditions defined by the Medical Termination of Pregnancy (MTP) Act,
          1972 of India and subsequent amendments from time to time, including
          MTP performed beyond 12 and 20 weeks of pregnancy. While choosing
          options, user’s informed discretion needed.
        </p>

        {/* --------------------------------------------------- */}
        {/* ACTION BUTTONS */}
        {/* --------------------------------------------------- */}

        <div className="d-flex justify-content-end gap-2">
          {/* <button className="btn btn-secondary" type="button">
            Clear
          </button> */}

          {!editMode ? (
            <span className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-esic mt-3"
                onClick={() => handleSubmit()}
                disabled={loading}
              >
                {loading ? "loading..." : "Create Draft Certificate"}
              </button>

              <button
                className="btn btn-esic mt-3"
                onClick={() =>
                  navigate("/medical-certificate", { state: user })
                }
                disabled={loading}
              >
                {loading ? "loading..." : "Back to Certificate List"}
              </button>
            </span>
          ) : (
            <span className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-esic mt-3"
                onClick={() => handleEdit("APPROVED")}
                disabled={loading}
              >
                {loading ? "loading..." : "Approve and Generate Certificate"}
              </button>

              <button
                className="btn btn-esic mt-3"
                onClick={() => handleEdit("REJECTED")}
                disabled={loading}
              >
                {loading ? "loading..." : "Reject Certificate"}
              </button>

              <button
                className="btn btn-esic mt-3"
                onClick={() =>
                  navigate("/medical-certificate", { state: user })
                }
                disabled={loading}
              >
                {loading ? "loading..." : "Back to Certificate List"}
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
