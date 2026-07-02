import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./../assets/esic_header_logo.jpg";
import indiaGovSymbol from "./../assets/India_gov_symbol_header.png";
import { MdLocalHospital } from "react-icons/md";
import { TbLogout2 } from "react-icons/tb";
import { FaUserDoctor } from "react-icons/fa6";
import { showToast } from "../util/toastUtil";
import LoadingSpinner from "./LoadingSpinner";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location.pathname]);

  const hideLogout =
    location.pathname === "/login" || location.pathname === "/";

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Logged out successfully.", "info");
      navigate("/");
    }, 1000);
  };

  return (
    <div
      id="header"
      style={{
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* ---------- ROW 1 ---------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 20px",
        }}
      >
        {/* ESIC Logo */}
        <a>
          <img
            src={logo}
            alt="ESIC Logo"
            style={{ height: "75px", objectFit: "contain", cursor: "pointer" }}
            onClick={() => navigate("/home")}
          />
        </a>

        {/* Labour Logo */}
        <a
          href="https://labour.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={indiaGovSymbol}
            alt="Labour Ministry"
            style={{ height: "75px", objectFit: "contain" }}
          />
        </a>
      </div>

      {/* ---------- LINE AFTER FIRST ROW ---------- */}
      <hr style={{ margin: 0, borderTop: "1px solid black" }} />

      {/* ---------- ROW 2 ---------- */}

      <div
        className="emitra-title"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px 0",
          backgroundColor: "#fbfac2",
        }}
      >
        {/* Center Title */}
        <MdLocalHospital className="emitra-icon" />
        <h3 className="emitra-text">
          <span className="emitra-e">CHC-PHC</span>
        </h3>

        {/* Right Logout Button */}
        {!hideLogout && (
          <div
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span className="text-esic fw-bold">
              <FaUserDoctor size={20} /> &nbsp; {user?.location?.description || "" }
            </span>
            <button
              className="btn btn-danger btn-esic"
              style={{
                fontSize: "14px",
              }}
              onClick={logout}
              aria-label="Logout"
            >
              <div className="d-flex align-items-center">
                {loading ? (
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></div>
                ) : (
                  <span>
                    &nbsp;Logout <TbLogout2 size={20} />
                  </span>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
