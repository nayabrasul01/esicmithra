import { useState } from "react";
import { sendOtp } from "../services/authService";
import OtpModal from "../components/OtpModal";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!userId) return alert("Enter User ID");

    try {
      setLoading(true);
      const res = await sendOtp(userId);
      if(res.data.success){
        setShowOtp(true);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      return alert("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    return (
      <div
        style={{
          minHeight: "70vh",
          minWidth: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div className="card p-4" style={{ width: "350px" }}>
          <h2 className="mb-3 text-center">Login</h2>
          <input
            className="form-control mb-3"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button className="btn btn-primary w-100 mb-2" onClick={handleLogin} disabled={loading}>
            {loading ? "Sending OTP. Please wait..." : "Login"}
          </button>
          {showOtp && (
            <OtpModal
              userId={userId}
              onClose={() => setShowOtp(false)}
              onSuccess={() => navigate("/dashboard")}
            />
          )}
        </div>
      </div>
    );
};

export default Login;
