import { useState } from "react";
import { verifyOtp } from "../services/authService";
import { useNavigate } from "react-router-dom";

const OtpModal = ({ userId, onClose, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!otp) 
      return alert("Please enter valid OTP");

    try{
      setLoading(true);
      const res = await verifyOtp(userId, otp);

      if (res.data.success) {
        sessionStorage.setItem("session", JSON.stringify(res.data.data));
        localStorage.setItem("session", JSON.stringify(res.data.data));
        localStorage.setItem("userId", JSON.stringify(userId));
        navigate("/dashboard");
      } else {
        setError(res.data.message);
        alert(res.data.message);
      }
    }catch(err) {
        // Handle 400/500 responses here
        if (err.response) {
          alert(err.response.data.message);
          setError(err.response.data.message)
        } else {
          alert("Server not reachable");
    }
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show fade" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Enter OTP</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            {error && <div className="alert alert-danger py-1 my-2">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          </div>
        </div>
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
