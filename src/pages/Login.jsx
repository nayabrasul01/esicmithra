import { useState } from "react";
import { sendOtp } from "../services/authService";
import OtpModal from "../components/OtpModal";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!userId) return alert("Enter User ID");

    await sendOtp(userId);
    setShowOtp(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div style={styles.container}>
      <h2>Login</h2>

      <input
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      {showOtp && (
        <OtpModal
          onClose={() => setShowOtp(false)}
          onSuccess={() => navigate("/dashboard")}
        />
      )}
      </div>
    </div>
    
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    margin: "100px auto",
    gap: "10px"
  }
};

export default Login;
