import { useState } from "react";
import { sendOtp } from "../services/authService";
import OtpModal from "../components/OtpModal";
import { useNavigate } from "react-router-dom";
import { MdLogin } from "react-icons/md";

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
          <div className="text-center mb-3">
  <span
    style={{
      background: "#FBFAC2",
      borderRadius: "50%",
      padding: "12px",
      display: "inline-flex",
    }}
  >
    <MdLogin size={32} color="#742902" />
  </span>
</div>



          
          <input
            className="form-control mb-3"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button className="btn btn-esic mb-2" onClick={handleLogin} disabled={loading}>
            {loading ? "Sending OTP. Please wait..." : "Send OTP"}
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
