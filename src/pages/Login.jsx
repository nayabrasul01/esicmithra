import { useState } from "react";
import { sendOtp, authenticate } from "../services/authService";
import OtpModal from "../components/OtpModal";
import { useNavigate } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import { showToast } from "../util/toastUtil";
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
      if (res.data.success) {
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
      return showToast(
        error?.response?.data?.message ||
          error.message ||
          "Error sending OTP. Please try again.",
        "danger",
      );
    } finally {
      setLoading(false);
      logger.debug("Login OTP flow completed", { userId });
    }
  };

  // return (
  //   <div
  //     style={{
  //       minHeight: "70vh",
  //       width: "100%",
  //       display: "flex",
  //       justifyContent: "center",
  //       alignItems: "center",
  //     }}
  //   >
  //     <div className="card p-4" style={{ width: "350px" }}>
  //       <div className="text-center mb-3">
  //         <span
  //             style={{
  //               background: "#FBFAC2",
  //               borderRadius: "50%",
  //               padding: "12px",
  //               display: "inline-flex",
  //             }}
  //           >
  //           <MdLogin size={32} color="#742902" />
  //         </span>
  //       </div>
  //       <input
  //         className="form-control mb-3"
  //         placeholder="Enter Username"
  //         value={userId}
  //         onChange={(e) => setUserId(e.target.value)}
  //       />
  //       {/* <input
  //        type="password"
  //         className="form-control mb-3"
  //         placeholder="Enter Password"
  //         value={password}
  //         onChange={(e) => setPassword(e.target.value)}
  //       /> */}
  //       <button className="btn btn-esic mb-2" onClick={handleLogin} disabled={loading}>
  //         {loading ? "Sending OTP. Please wait..." : "Login"}
  //       </button>
  //       {showOtp && (
  //         <OtpModal
  //           userId={userId}
  //           otpData={otpData}
  //           onClose={() => setShowOtp(false)}
  //           onSuccess={() => navigate("/dashboard")}
  //         />
  //       )}
  //     </div>
  //   </div>
  // );
  return (
    <div
      style={{
        minHeight: "80vh",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
        background: "linear-gradient(to bottom right, #fff, #FBFAC2)",
        // background: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // padding: "20px",
      }}
    >
      <div
        className="card border-0 shadow rounded-4 overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "430px",
        }}
      >
        {/* TOP */}

        <div
          className="text-center p-4"
          style={{
            background: "#FBFAC2",
          }}
        >
          <div
            className="mx-auto mb-3 rounded-circle d-inline-flex align-items-center justify-content-center"
            style={{
              width: "75px",
              height: "75px",
              background: "#fff",
            }}
          >
            <MdLogin size={36} color="#742902" />
          </div>

          <h4 className="fw-bold mb-2" style={{ color: "#742902" }}>
            Secure Login
          </h4>

          <p className="text-muted small mb-0">
            Access ESIC CHC-PHC healthcare services securely using OTP
            authentication.
          </p>
        </div>

        {/* BODY */}

        <div className="card-body p-4">
          <div className="mb-4">
            {/* <label className="form-label fw-semibold">
              Username / Employee ID
            </label> */}

            <input
              className="form-control form-control-lg"
              placeholder="Enter Username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <button
            className="btn btn-esic w-100 py-2 fw-semibold"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Sending OTP. Please wait..." : "Login"}
          </button>

          <div className="mt-4 text-center">
            <small className="text-muted">
              Authorized access only. All activities may be monitored for
              security and administrative purposes.
            </small>
          </div>

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
    </div>
  );
};

export default Login;
