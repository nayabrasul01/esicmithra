import { useState, useEffect } from "react";
import { showToast } from "../util/toastUtil";
import { fetchPhotoUrl, createReferralRequest, fetchReferral, updateStatus, fetchReferrals } from "../services/referralService";
import SnomedSearch from "../components/SnomedSearch";
import PatientPhotoUpload from "../components/PatientPhotoUpload";

import { FaHospitalUser } from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAlert } from "./../components/alert/AlertContext";


import { calculateAge } from "../util/utilities";

const ReferralModal = ({ show, onClose, user, referral, patient }) => {
  const { alert, confirm } = useAlert();
  const isDoctor = user?.type === "D";
  const [loader, setLoader] = useState(false);

  const [formData, setFormData] = useState({
    referralId: null,
    status: "",
    beneficiary: {
      beneficiaryId: "",
      beneficiaryIpNumber: "",
      beneficiaryName: "",
      registeredMobileNumber: "",
      patientPhotoId: "",
      attendantName: "",
      attendantRelation: "",
      locationId: user?.location?.id || ""
    },
    referralDetails:{
      referralNature: "",
      referralType: "",
      referralReason: "",
      referralCircumstances: [],
      referredHospitalName: "",
      referringDoctorName: "",
      createdBy: user?.userId || "",
      diagnoses: [{
        snomedDiagnosis: "",
        icdCode: "",
        remark: ""
      }],
      clinicalRemarks: ""
    }
  });

  // const primaryDiagnosis =
  //   formData.referralDetails.diagnoses?.[0] || {
  //     snomedDiagnosis: "",
  //     icdCode: "",
  //     remark: "",
  //     clinicalRemarks: "",
  //   };

  const cloneFormData = (data) =>
    typeof structuredClone === "function"
      ? structuredClone(data)
      : JSON.parse(JSON.stringify(data));

  useEffect(() => {
    const initializeData = async () => {
      setLoader(true);
      try {
        // 1️⃣ If editing referral
        if (referral) {
          const res = await fetchReferral(referral.referralId);
          if (res?.success) {
            setFormData(res.data);
          }
          setLoader(false);
          return;
        }

        // 2️⃣ If creating new referral
        if (patient) {

          // set patient basic data
          setFormData((prev) => ({
            ...prev,
            beneficiary: {
              ...prev.beneficiary,
              beneficiaryId: patient?.uHID || "",
              beneficiaryName: patient?.name || "",
              beneficiaryIpNumber: patient?.ipNumber || ""
            },
          }));

          // 3️⃣ Fetch photo from external API
          const payload = {
            ipNumber: patient?.ipNumber,
            familyid: patient?.ipListId || "0",
            reltype: patient?.relationship
          };

          const res = await fetchPhotoUrl(payload);

          if (res.success && res.data.MessageCode === '1001') {

            setFormData((prev) => ({
              ...prev,
              beneficiary: {
                ...prev.beneficiary,
                patientPhotoId: res.data.Photopath, // ✅ use correct field
              },
            }));

          }
        }
      } catch (error) {
        // showToast(error, "danger");
        await alert(error, "danger");
      } finally {
        setLoader(false);
      }
    };

    initializeData();

  }, [referral, patient]);

  const handleChange = (path, value) => {
    const keys = Array.isArray(path) ? path : [path];
    setFormData((prev) => {
      const updated = cloneFormData(prev);
      let cursor = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (cursor[key] === undefined) {
          const nextKey = keys[i + 1];
          cursor[key] = typeof nextKey === "number" ? [] : {};
        }
        cursor = cursor[key];
      }
      cursor[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSubmit = async (status) => {
    const updatedFormData = addPatientData(formData);
    setFormData(updatedFormData);

    // Validate form data before submission
    if (!validateForm(updatedFormData)) return;
    console.log(updatedFormData);
    
    try {
      const response = await createReferralRequest(updatedFormData);
      if (response.success) {
        // showToast(
        //   `Referral request created successfully. Referral ID: ${response.data}`,
        //   "success"
        // );
        await alert(`Referral request created successfully. Referral ID: ${response.data}`, "success");
        onClose();
      } else {
        // showToast(response.message || "Failed to create referral", "danger");
        await alert(response.message || "Failed to create referral", "danger");
      }
    } catch (error) {
      // showToast(error.message || "Error creating referral", "danger");
      await alert(error.message || "Error creating referral", "danger");
    }
  };

  const validateForm = (data = formData) => {
      const errors = [];

      // Beneficiary validations 
      if (!formData?.beneficiary?.patientPhotoId) errors.push("Beneficiary Photo is required");
      if (!formData?.beneficiary?.beneficiaryId) errors.push("Beneficiary ID is required");
      if (!formData?.beneficiary?.beneficiaryName) errors.push("Beneficiary Name is required");
      if (!formData?.beneficiary?.registeredMobileNumber) errors.push("Registered Mobile is required");
      if (!formData?.beneficiary?.attendantName) errors.push("Attendant Name is required");
      if (!formData?.beneficiary?.attendantRelation) errors.push("Attendant Relation is required");

      // Referral Details validations
      if (!formData.referralDetails.referralNature) errors.push("Referral Nature is required");
      if (!formData.referralDetails.referralType) errors.push("Referral Type is required");
      if (!formData.referralDetails.referralReason) errors.push("Referral Reason is required");
      if (!formData.referralDetails.referralCircumstances.length) errors.push("Referral Circumstances is required");
      if (!formData.referralDetails.referredHospitalName) errors.push("Referred Hospital is required");
      if (!formData.referralDetails.referringDoctorName) errors.push("Referring Doctor is required");

      // Diagnosis validations
      if (!formData.referralDetails.diagnoses?.[0].snomedDiagnosis) errors.push("SNOMED Diagnosis is required");
      if (!formData.referralDetails.diagnoses?.[0].icdCode) errors.push("ICD Code is required");
      if (!formData.referralDetails.diagnoses?.[0].remark) errors.push("Diagnosis Remark is required");
      if (!formData.referralDetails.clinicalRemarks) errors.push("Clinical Remarks is required");

      if (errors.length > 0) {
        errors.forEach((error) => showToast(error, "danger"));
        // showToast(errors.join("\n \n"), "danger");
        return false;
      }
      return true;
    };

  // this method is to add patient related data to formData before submission. 
  // This is to add patient entry in mithra for very first time when there is no existing treatment history.
  const addPatientData = (currentData) => {
    if (!patient) return currentData || formData;

    // Format dob to dd-mm-yyyy
    let dob = patient.dob;
    if (dob && typeof dob === 'string') {
        const parts = dob.split(' ')[0].split('-');
        if (parts.length === 3) {
            dob = `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
    }

    const newData = {
      ...(currentData || formData),
      patientDetails: {
        ipNumber: patient.ipNumber,
        uhid: patient.uHID,
        name: patient.name,
        relationship: patient.relationship,
        gender: patient.sex,
        age: calculateAge(patient.dob),
        dob: dob,
        state: patient.residingState,
        locationId: user?.location?.id
      }
    };

    return newData;
  };
  
  const handlePartialApprove = async () => {

    const updatedFormData = addPatientData(formData);
    setFormData(updatedFormData);

    // Validate form data before submission
    if (!validateForm(updatedFormData)) return;

    updatedFormData.status = "PARTIAL_APPROVED";
    updatedFormData.beneficiary.beneficiaryIpNumber = patient?.ipNumber;

    console.log(updatedFormData);
    

    if(!(await confirm(`Are you sure you want to partially approve this referral ${formData.referralId} ?`))) return;
    
    
    try {
      setLoader(true);
      const res = await createReferralRequest(updatedFormData);
      // const res = await updateStatus(formData.referralId, 'PARTIAL_APPROVED', user.userId)
      // await handleSubmit("PARTIAL_APPROVED");
      if(res.success)
        // showToast(`Referral request with Referral ID: ${formData.referralId} partially approved`, "success");
        await alert(`Referral request with Referral ID: ${formData.referralId} partially approved`, "success");
      onClose();
    } catch (error) {
      // showToast(`Error when upadting status : ${error}.`, "danger");
      await alert(`Error when upadting status : ${error}.`, "danger");
    }finally{
      setLoader(false);
    }
  };

  const handleReject = async () => {
    if (!formData?.referralId) {
      // showToast("Referral details are missing. Please reopen the request.", "danger");
      await alert("Referral details are missing. Please reopen the request.", "danger");
      return;
    }

    if (!(await confirm(`Are you sure you want to reject referral ${formData.referralId}?`))) {
      return;
    }

    try {
      setLoader(true);
      const res = await updateStatus(formData.referralId, "REJECTED", user.userId);
      if (res?.success) {
        // showToast(`Referral request ${formData.referralId} rejected`, "success");
        await alert(`Referral request ${formData.referralId} rejected`, "success");
      } else {
        // showToast("Referral rejection completed", "success");
        await alert("Referral rejection completed", "success");
      }
      onClose();
    } catch (error) {
      // showToast(error?.response?.data?.message || error.message || "Failed to reject referral", "danger");
      await alert(error?.response?.data?.message || error.message || "Failed to reject referral", "danger");
    } finally {
      setLoader(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show d-block esic-font">

      <div className="modal-dialog modal-xl modal-dialog-scrollable">

        <div className="modal-content text-esic">

          <div className="modal-header text-center d-block position-relative" style={{"backgroundColor": "#FBFAC2"}}>

            <h5 className="modal-title pb-0 d-flex align-items-center justify-content-center gap-2" style={{"color": "#742902"}}>
              <FaHospitalUser size={24} /> {referral ? "Edit Referral Request" : "Create Referral Request"}
            </h5>


          </div>

          <div className="modal-body">
            {!loader ? (
              /* Modal main body */
              <div className="row g-3">
              {/* PATIENT PHOTO */}

              <div className="col-md-12">

                <p style={{"color": "red", "fontSize": "0.875rem", "marginBottom": "0", "marginTop": "0.5rem", "textAlign": "right"}}>
                  <span style={{"color": "red"}}>*</span> Please fill all mandatory fields before submitting the referral.
                </p>

                <PatientPhotoUpload
                  photo={formData?.beneficiary?.patientPhotoId}
                  onPhotoChange={(base64) =>
                    setFormData((prev) => ({
                      ...prev,
                      beneficiary: {
                        ...prev.beneficiary,
                        patientPhotoId: base64
                      }
                    }))
                  }
                />
              </div>

                {/* BENEFICIARY ID */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Beneficiary ID</label>
                  <input
                    className="form-control"
                    value={formData.beneficiary.beneficiaryId}
                    disabled
                  />
                </div>

                {/* BENEFICIARY NAME */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Beneficiary Name</label>
                  <input
                    className="form-control"
                    value={formData.beneficiary.beneficiaryName}
                    disabled
                  />
                </div>

                {/* MOBILE */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Registered Mobile</label>
                  <input
                    className="form-control"
                    value={formData.beneficiary.registeredMobileNumber}
                    onChange={(e)=>handleChange(["beneficiary","registeredMobileNumber"],e.target.value)}
                  />
                </div>

                {/* ATTENDANT NAME */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Attendant Name</label>
                  <input
                    className="form-control"
                    value={formData.beneficiary.attendantName}
                    onChange={(e)=>handleChange(["beneficiary","attendantName"],e.target.value)}
                  />
                </div>

                {/* ATTENDANT RELATION */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Attendant Relation</label>
                  <select
                    className="form-control"
                    value={formData.beneficiary.attendantRelation}
                    onChange={(e) => handleChange(["beneficiary","attendantRelation"], e.target.value)}
                  >
                    <option value="">Select Relation</option>
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="SPOUSE">Spouse</option>
                    <option value="CHILD">Child</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="RELATIVE">Relative</option>
                    <option value="FRIEND">Friend</option>
                    <option value="GUARDIAN">Guardian</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* REFERRAL NATURE */}
                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Referral Nature</label>
                  <div className="mt-2 d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="referralNatureRoutine"
                        name="referralNature"
                        value="ROUTINE"
                        checked={formData.referralDetails.referralNature === "ROUTINE"}
                        onChange={(e) => handleChange(["referralDetails","referralNature"], e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="referralNatureRoutine">
                        Routine
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="referralNatureEmergency"
                        name="referralNature"
                        value="EMERGENCY"
                        checked={formData.referralDetails.referralNature === "EMERGENCY"}
                        onChange={(e) => handleChange(["referralDetails","referralNature"], e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="referralNatureEmergency">
                        Emergency
                      </label>
                    </div>
                  </div>
                </div>

                {/* REFERRAL TYPE */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Referral Type</label>
                  <div className="mt-2 d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="referralTypeIpd"
                        name="referralType"
                        value="IPD"
                        checked={formData.referralDetails.referralType === "IPD"}
                        onChange={(e) => handleChange(["referralDetails","referralType"], e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="referralTypeIpd">
                        IPD
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="referralTypeOpd"
                        name="referralType"
                        value="OPD"
                        checked={formData.referralDetails.referralType === "OPD"}
                        onChange={(e) => handleChange(["referralDetails","referralType"], e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="referralTypeOpd">
                        OPD
                      </label>
                    </div>
                  </div>
                </div>

                {/* REFERRAL CIRCUMSTANCES */}
                <div className="col-md-12">
                  <label><span style={{"color": "red"}}>*</span> Referral Circumstances</label>
                  <div className="mt-2 d-flex gap-2 flex-wrap">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="circumstancesLackBed"
                        name="referralCircumstances"
                        value="LACK_OF_BED"
                        checked={formData.referralDetails.referralCircumstances.includes("LACK_OF_BED")}
                        onChange={(e) => handleChange(["referralDetails","referralCircumstances"], [e.target.value])}
                      />
                      <label className="form-check-label" htmlFor="circumstancesLackBed">
                        Lack of Bed
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="circumstancesLongWaitingList"
                        name="referralCircumstances"
                        value="LONG_WAITING_LIST"
                        checked={formData.referralDetails.referralCircumstances.includes("LONG_WAITING_LIST")}
                        onChange={(e) => handleChange(["referralDetails","referralCircumstances"], [e.target.value])}
                      />
                      <label className="form-check-label" htmlFor="circumstancesLongWaitingList">
                        Long Waiting List
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="circumstancesLackEquipment"
                        name="referralCircumstances"
                        value="LACK_OF_EQUIPMENT"
                        checked={formData.referralDetails.referralCircumstances.includes("LACK_OF_EQUIPMENT")}
                        onChange={(e) => handleChange(["referralDetails","referralCircumstances"], [e.target.value])}
                      />
                      <label className="form-check-label" htmlFor="circumstancesLackEquipment">
                        Lack of Equipment
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="circumstancesLackExperts"
                        name="referralCircumstances"
                        value="LACK_OF_EXPERTS"
                        checked={formData.referralDetails.referralCircumstances.includes("LACK_OF_EXPERTS")}
                        onChange={(e) => handleChange(["referralDetails","referralCircumstances"], [e.target.value])}
                      />
                      <label className="form-check-label" htmlFor="circumstancesLackExperts">
                        Lack of Experts
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="circumstancesLackFacility"
                        name="referralCircumstances"
                        value="LACK_OF_FACILITY"
                        checked={formData.referralDetails.referralCircumstances.includes("LACK_OF_FACILITY")}
                        onChange={(e) => handleChange(["referralDetails","referralCircumstances"], [e.target.value])}
                      />
                      <label className="form-check-label" htmlFor="circumstancesLackFacility">
                        Lack of Facility
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="circumstancesOthers"
                        name="referralCircumstances"
                        value="OTHERS"
                        checked={formData.referralDetails.referralCircumstances.includes("OTHERS")}
                        onChange={(e) => handleChange(["referralDetails","referralCircumstances"], [e.target.value])}
                      />
                      <label className="form-check-label" htmlFor="circumstancesOthers">
                        Others
                      </label>
                    </div>
                  </div>
                </div>

                {/* REFERRAL REASON */}

                <div className="col-md-12">

                  <label><span style={{"color": "red"}}>*</span> Referral Reason</label>

                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.referralDetails.referralReason}
                    onChange={(e)=>handleChange(["referralDetails","referralReason"],e.target.value)}
                  />

                </div>

                {/* REFERRED HOSPITAL */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Referred Hospital</label>

                  <input
                    className="form-control"
                    value={formData.referralDetails.referredHospitalName}
                    onChange={(e)=>handleChange(["referralDetails","referredHospitalName"],e.target.value)}
                  />
                </div>

                {/* REFERRING DOCTOR */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> Referring Doctor</label>

                  <input
                    className="form-control"
                    value={formData.referralDetails.referringDoctorName}
                    onChange={(e)=>handleChange(["referralDetails","referringDoctorName"],e.target.value)}
                  />
                </div>

                {/* SNOMED DIAGNOSIS */}

                {/* <div className="col-md-6">
                  <label>SNOMED CT Diagnosis - Search</label>

                  <input
                    className="form-control"
                    value={formData.referralDetails.diagnoses?.[0].snomedDiagnosis}
                    onChange={(e)=>handleChange(["referralDetails","diagnoses",0,"snomedDiagnosis"],e.target.value)}
                  />
                </div> */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> SNOMED CT Search</label>

                  <SnomedSearch
                    onSelect={(data) => {
                      setFormData((prev) => ({
                        ...prev,
                        referralDetails: {
                          ...prev.referralDetails,
                          diagnoses: [
                            {
                              ...prev.referralDetails.diagnoses[0],
                              snomedDiagnosis: data.snomedDiagnosis,
                              icdCode: data.icdCode
                            }
                          ]
                        }
                      }));

                    }}
                  />

                </div>

                {/* ICD CODE */}

                <div className="col-md-6">
                  <label><span style={{"color": "red"}}>*</span> ICD Code</label>

                  <input
                    className="form-control"
                    value={formData.referralDetails.diagnoses[0]?.icdCode || ""}
                    disabled={true}
                  />
                </div>

                {/* DIAGNOSIS REMARK */}

                <div className="col-md-12">
                  <label>Diagnosis Remark</label>

                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.referralDetails.diagnoses?.[0].remark}
                    onChange={(e)=>handleChange(["referralDetails","diagnoses",0,"remark"],e.target.value)}
                  />
                </div>

                {/* CLINICAL REMARKS */}

                <div className="col-md-12">
                  <label><span style={{"color": "red"}}>*</span> Clinical Remarks</label>

                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.referralDetails.clinicalRemarks}
                    onChange={(e)=>handleChange(["referralDetails","clinicalRemarks"],e.target.value)}
                  />
                </div>

              </div>
            ) 
            : <LoadingSpinner message="Fetching Referral details..." /> }
            
            

          </div>

          <div className="modal-footer">

            {!isDoctor && (

              <button
                className="btn btn-esic"
                onClick={handleSubmit}
              >
                Submit Referral
              </button>

            )}

            {isDoctor && (

              <>
                <button
                  className="btn btn-esic"
                  onClick={handlePartialApprove}
                >
                Partial Approve
                </button>

                <button
                  className="btn btn-danger"
                  onClick={handleReject}
                >
                  Reject
                </button>
              </>
            )}

            <button
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>

          </div>

        </div>

      </div>

      </div>
    </>
  );

};

export default ReferralModal;
