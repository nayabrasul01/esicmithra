import { useState } from "react";
import { verifyOtp, createSession } from "../services/authService";

const OtpModal = ({ onClose, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
  setLoading(true);

  const res = await verifyOtp(otp);

  if (res.success) {
    const session = await createSession();

    sessionStorage.setItem("session", JSON.stringify(session));
    localStorage.setItem("token", res.token);

    onSuccess();
  } else {
    setError(res.message);
  }

  setLoading(false);
};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Enter OTP</h3>

        <input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={handleVerify}>
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    minWidth: "300px"
  }
};

export default OtpModal;
