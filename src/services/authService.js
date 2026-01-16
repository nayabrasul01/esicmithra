export const sendOtp = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        otp: "123456"   // dummy OTP
      });
    }, 1000);
  });
};

export const verifyOtp = (otp) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (otp === "123456") {
        resolve({
          success: true,
          token: "dummy-jwt-token"
        });
      } else {
        resolve({
          success: false,
          message: "Invalid OTP"
        });
      }
    }, 1000);
  });
};

export const createSession = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        sessionId: "SESSION_" + Date.now(),
        expiresIn: 1800
      });
    }, 500);
  });
};

export const fetchUserData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        appointmentDate: "13-12-2021 00:00:00",
        dateOfregistration: "27-03-2010 00:00:00",
        empRegPK: null,
        employeeIPNo: "1111111111,8790169068",
        InsuredPersonFamilyDetails: [
          {
            relationship: "Dependant father",
            name: "test",
            dob: "06-06-1950 00:00:00",
            sex: "F",
            residingState: "Delhi"
          },
          {
            relationship: "Minor dependant son",
            name: "Test2",
            dob: "02-02-2021 00:00:00",
            sex: "M",
            residingState: "Uttar Pradesh"
          }
        ]
      });
    }, 1000);
  });
};

export const fetchPreviousPrescription = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hasData: true,
        prescription: "Paracetamol twice daily",
        document: "old_prescription.pdf"
      });
    }, 800);
  });
};

export const submitPrescription = (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Sent to backend:", payload);
      resolve({ success: true });
    }, 1000);
  });
};

