import { useState } from "react";
import { sendOtp, authenticate } from "../services/authService";
import OtpModal from "../components/OtpModal";
import { useNavigate } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import { showToast } from '../util/toastUtil';
import { createLogger } from "../util/logger";

const logger = createLogger("LoginController");

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [otpData, setOtpData] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!userId) return showToast("Enter Username", "warning");
    // if (!password) return showToast("Enter Password", "warning");

    try {
      setLoading(true);
      logger.info("Initiating login OTP flow", { userId });
      const res = await sendOtp(userId);
      // const res = await authenticate(userId, password);
      if(res.data.success){
        setOtpData(res.data.data);
        setShowOtp(true);
        logger.info("OTP sent successfully", { userId });
        showToast("OTP Sent to User", "info");
      } else {
        logger.warn("OTP request returned failure", {
          userId,
          message: res.data.message,
        });
        showToast(res.data.message, "warning");
      }
    } catch (error) {
      logger.error("OTP send failed", error, { userId });
      return showToast(error?.response?.data?.message || error.message || "Error sending OTP. Please try again.", "danger");
    } finally {
      setLoading(false);
      logger.debug("Login OTP flow completed", { userId });
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
            placeholder="Enter Username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          {/* <input
           type="password"
            className="form-control mb-3"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /> */}
          <button className="btn btn-esic mb-2" onClick={handleLogin} disabled={loading}>
            {loading ? "Sending OTP. Please wait..." : "Login"}
          </button>
          {showOtp && (
            <OtpModal
              userId={userId}
              otpData={otpData}
              onClose={() => setShowOtp(false)}
              onSuccess={() => navigate("/dashboard")}
            />
          )}
        </div>
      </div>
    );
};

export default Login;
