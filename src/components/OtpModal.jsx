import { useState, useRef } from "react";
import { verifyOtp } from "../services/authService";
import { useNavigate } from "react-router-dom";

const OtpModal = ({ userId, onClose }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;

    const newOtp = pasted.split("");
    setOtp(newOtp);

    inputsRef.current[5].focus();
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      return setError("Please enter 6-digit OTP");
    }

    try {
      setLoading(true);
      const res = await verifyOtp(userId, finalOtp);

      if (res.data.success) {
        localStorage.setItem("session", res.data.data);
        localStorage.setItem("userId", userId);
        navigate("/dashboard");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show fade" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Enter 6-digit OTP Code</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body text-center">
            <div className="d-flex justify-content-center gap-2 mb-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  className="form-control text-center"
                  style={{ width: "45px", fontSize: "18px" }}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={loading}
                />
              ))}
            </div>

            {error && <div className="alert alert-danger py-1">{error}</div>}
          </div>

          <div className="modal-footer">
            <button className="btn btn-esic" onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button className="btn btn-esic-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
