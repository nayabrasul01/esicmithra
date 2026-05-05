import { useEffect, useState } from "react";
import { showToast } from '../util/toastUtil';
import { getStatesData, getDistrictsData, getSubDistrictsData, createUHID } from "../services/treatmentService";

export default function CreateUHIDModal({ show, onClose, patient }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubDistricts, setLoadingSubDistricts] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: patient?.dob || "",
    age: "",
    insuranceNo: patient?.ipNumber || "",
    insurenceSeq: patient?.ipListId || "0",
    relationship: "",
    ageUOM: "Years",
    gender: patient?.sex == "F" ? "Female" : patient?.sex == "M" ? "Male" : patient?.sex == "O" ? "Other" : patient?.sex == "U" ? "Unknown" : patient?.sex == "A" ? "Ambiguous" : patient?.sex == "N" ? "Not Applicable" : patient?.sex == "T" ? "TG" : "",
    marstatus: patient?.marstatus === "Married" ? "Married" : patient?.marstatus === "Unmarried" ? "Single" : "",
    titleName: "",
    address1: "",
    address2: "",
    stateCode: "",
    districtCode: "",
    subDistrictCode: "",
    zipCode: ""
  });

    useEffect(() => {
      if (!show) return;

      calculateAge(patient?.dob);
      // console.log(formData);
    
      const loadStates = async () => {
          setLoadingStates(true);
          const res = await getStatesData();
          setStates(res);
          setLoadingStates(false);
      };

      loadStates();
    }, [show]);

    if (!show) return null;

    const handleStateChange = async (stateCode) => {
        setFormData({ ...formData, stateCode, districtCode: "", subDistrictCode: "" });

        setLoadingDistricts(true);

        const res = await getDistrictsData(stateCode);

        setDistricts(res);
        setLoadingDistricts(false);
    };

    const handleDistrictChange = async (districtCode) => {
        setFormData({ ...formData, districtCode, subDistrictCode: "" });

        setLoadingSubDistricts(true);

        const res = await getSubDistrictsData(districtCode);
        setSubDistricts(res);
        setLoadingSubDistricts(false);
    };

    const calculateAge = (dob) => {

        const [dd, mm, yyyy] = formData.dob.split(" ")[0].split("-");
        // patient.dob = `${yyyy}-${mm}-${dd}`;
        dob = `${yyyy}-${mm}-${dd}`;
      
        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        }

        setFormData({
        ...formData,
        dob,
        age
        });
    };

    const handleClose = () => {
      // Reset all values
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        dob: patient?.dob || "",
        age: "",
        insuranceNo: patient?.ipNumber || "",
        insurenceSeq: patient?.ipListId || "0",
        relationship: "",
        ageUOM: "Years",
        gender: patient?.sex || "",
        marstatus: patient?.marstatus === "Married" ? "Married" : patient?.marstatus === "Unmarried" ? "Single" : "",
        titleName: "",
        address1: "",
        address2: "",
        stateCode: "",
        districtCode: "",
        subDistrictCode: "",
        zipCode: ""
      });
      setStates([]);
      setDistricts([]);
      setSubDistricts([]);
      setLoading(false);
      onClose();
    };

    const handleSubmit = async () => {
      // Validation
      const fieldLabels = {
        firstName: "First Name",
        // middleName: "Middle Name",
        lastName: "Last Name",
        dob: "Date of Birth",
        gender: "Gender",
        relationship: "Relationship",
        titleName: "Title",
        marstatus: "Marital Status",
        stateCode: "State",
        districtCode: "District",
        subDistrictCode: "SubDistrict",
        address1: "Address 1",
        address2: "Address 2",
        zipCode: "Pincode"
      };

      const requiredFields = Object.keys(fieldLabels);
      const emptyFields = requiredFields.filter(field => !formData[field]);
      if (emptyFields.length > 0) {
        const missingLabels = emptyFields.map(field => fieldLabels[field]);
        showToast(`Please fill in all required fields:\n${missingLabels.join(', \n')}`, "warning");
        return;
      }

      if (!/^\d{6}$/.test(formData.zipCode)) {
        // alert("Pincode must be exactly 6 digits");
        showToast("Pincode must be exactly 6 digits", "warning");
        return;
      }

      if(!confirm(`Please check all fields before submitting, once submitted details cannot be changed. \n Do you want to conitnue?`))
        return;

      try {
        setLoading(true);
        const res = await createUHID(formData);
        if(res.success){
          showToast("UHID Created: " + res.data.responseMessage, "success");
          patient.uHID = res.data.responseMessage;
        }

        onClose();
      } catch (err) {
        console.log(err);
        showToast("UHID creation failed : " + err?.response?.data?.message, "danger");
      }finally{
        setLoading(false);
      }
    };

      return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">

            <div className="modal-header">
              <h5>Create UHID</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">

              <div className="container-fluid">

              {/* Row 1 */}

              <div className="row mb-3">
                <label className="col-md-2 col-form-label">First Name<span style={{color: "red"}}>*</span></label>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    onChange={(e)=>setFormData({...formData,firstName:e.target.value})}
                  />
                </div>

                <label className="col-md-2 col-form-label">DOB<span style={{color: "red"}}>*</span></label>
                <div className="col-md-4">
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dob}
                    onChange={(e)=>calculateAge(e.target.value)}
                    disabled={true}
                  />
                </div>
              </div>


              {/* Row 2 */}

              <div className="row mb-3">
              <label className="col-md-2 col-form-label">Middle Name</label>
              <div className="col-md-4">
              <input
              className="form-control"
              onChange={(e)=>setFormData({...formData,middleName:e.target.value})}
              />
              </div>

              <label className="col-md-2 col-form-label">Age</label>
              <div className="col-md-4">
              <input
              className="form-control"
              value={formData.age + " " + formData.ageUOM}
              readOnly
              disabled
              />
              </div>
              </div>


              {/* Row 3 */}

              <div className="row mb-3">
              <label className="col-md-2 col-form-label">Last Name<span style={{color: "red"}}>*</span></label>
              <div className="col-md-4">
              <input
              className="form-control"
              onChange={(e)=>setFormData({...formData,lastName:e.target.value})}
              />
              </div>

              <label className="col-md-2 col-form-label">Title<span style={{color: "red"}}>*</span></label>
              <div className="col-md-4">
              <select
              className="form-select"
              value={formData.titleName}
              onChange={(e)=>setFormData({...formData,titleName:e.target.value})}
              >
              <option value="">Select</option>
              {/* <option value="Father">Father</option>
              <option value="Madam">Madam</option> */}
              <option value="Baby">Baby</option>
              <option value="Master">Master</option>
              <option value="Miss.">Miss.</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              {/* <option value="Sister.">Sister.</option> */}
              <option value="Mrs.">Mrs.</option>
              <option value="M/s.">M/s.</option>
              <option value="Dr.">Dr.</option>
              {/* <option value="Sh">Sh</option>
              <option value="Smt">Smt</option>
              <option value="Sk.">Sk.</option>
              <option value="Smr">Smr</option>
              <option value="Mx.">Mx.</option> */}
              </select>
              </div>
              </div>


              {/* Row 4 */}

              <div className="row mb-3">
              <label className="col-md-2 col-form-label">Relationship<span style={{color: "red"}}>*</span></label>
              <div className="col-md-4">
              <select
              className="form-select"
              value={formData.relationship}
              onChange={(e)=>setFormData({...formData,relationship:e.target.value})}
              >
              <option value="">Select</option>
              <option value="Self">Self</option>
              <option value="Spouse">Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              </select>
              </div>

              <label className="col-md-2 col-form-label">Gender<span style={{color: "red"}}>*</span></label>
              <div className="col-md-4">
              <select
              className="form-select"
              value={formData.gender}
              // disabled={formData.gender}
              onChange={(e)=>setFormData({...formData,gender:e.target.value})}
              >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
              <option value="Unknown">Unknown</option>
              <option value="Ambiguous">Ambiguous</option>
              <option value="Not Applicable">Not Applicable</option>
              <option value="TG">TG</option>
              </select>
              </div>
              </div>


              {/* Row 5 */}

              <div className="row mb-3">
                <label className="col-md-2 col-form-label">Insurance No</label>
                <div className="col-md-4">
                  <input
                  className="form-control"
                  disabled
                  value={formData.insuranceNo == patient?.employeeIpNo ? patient.employeeIpNo : formData.insuranceNo}
                  readOnly
                  />
                </div>

                {/* <label className="col-md-2 col-form-label">Insurance Seq</label>
                <div className="col-md-4">
                  <input
                  className="form-control"
                  disabled
                  value={formData.insurenceSeq == patient?.ipListId ? patient.ipListId : formData.insurenceSeq}
                  readOnly
                  />
                </div> */}

                  <label className="col-md-2 col-form-label">Marital Status<span style={{color: "red"}}>*</span></label>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={formData.marstatus}
                      disabled={formData.marstatus}
                      onChange={(e)=>setFormData({...formData,marstatus:e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="Married">Married</option>
                      <option value="Single">Unmarried</option>
                      {/* <option value="Other">Other</option> */}
                    </select>
                  </div>
              </div>


              {/* Row 6 */}

              <div className="row mb-3">
              <label className="col-md-2 col-form-label">State<span style={{color: "red"}}>*</span></label>
              <div className="col-md-4">

              {loadingStates ? (
              <div className="spinner-border spinner-border-sm"></div>
              ) : (
              <select
              className="form-select"
              onChange={(e)=>handleStateChange(e.target.value)}
              >
              <option value="">Select State</option>

              {states && states.map((s)=>(
              <option key={s.code} value={s.code}>
              {s.name}
              </option>
              ))}

              </select>
              )}

              </div>


              <label className="col-md-2 col-form-label">District<span style={{color: "red"}}>*</span></label>
              <div className="col-md-4">

              {loadingDistricts ? (
              <div className="spinner-border spinner-border-sm"></div>
              ) : (
              <select
              className="form-select"
              onChange={(e)=>handleDistrictChange(e.target.value)}
              >
              <option>Select District</option>

              {districts.map((d)=>(
              <option key={d.code} value={d.code}>
              {d.name}
              </option>
              ))}

              </select>
              )}

              </div>
              </div>


              {/* Row 7 */}

                <div className="row mb-3">

                  <label className="col-md-2 col-form-label">SubDistrict<span style={{color: "red"}}>*</span></label>
                  <div className="col-md-4">

                    {loadingSubDistricts ? (
                    <div className="spinner-border spinner-border-sm"></div>
                    ) : (
                      <select
                      className="form-select"
                      onChange={(e)=>setFormData({...formData,subDistrictCode:e.target.value})}
                      >
                        <option>Select SubDistrict</option>

                        {subDistricts.map((s)=>(
                        <option key={s.code} value={s.code}>
                        {s.name}
                        </option>
                        ))}
                      </select>
                    )}

                  </div>

                  <label className="col-md-2 col-form-label">Address 1<span style={{color: "red"}}>*</span></label>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      onChange={(e) =>
                        setFormData({ ...formData, address1: e.target.value })
                      }
                    />
                  </div>

                </div>

                {/* Row 8 */}
                <div className="row mb-3">

                  <label className="col-md-2 col-form-label">Address 2<span style={{color: "red"}}>*</span></label>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      onChange={(e) =>
                        setFormData({ ...formData, address2: e.target.value })
                      }
                    />
                  </div>

                  <label className="col-md-2 col-form-label">Pincode <span style={{color: "red"}}>*</span></label>
                  <div className="col-md-4">
                    <input
                      type="number"
                      minLength={6}
                      maxLength={6}
                      className="form-control"
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                    />
                  </div>

                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={handleClose}>
                Cancel
              </button>

              <button className="btn btn-sm btn-esic" onClick={handleSubmit} disabled={loading}>
                {loading && (
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                )}
                &nbsp;Create UHID
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
}