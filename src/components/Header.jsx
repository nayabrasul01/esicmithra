import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./../assets/esic_header_logo.jpg";
import indiaGovSymbol from "./../assets/India_gov_symbol_header.png";
import { MdLocalHospital } from "react-icons/md";
import { TbLogout2 } from "react-icons/tb";
import { showToast } from "../util/toastUtil";
import LoadingSpinner from "./LoadingSpinner"

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);

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
        <a href="https://esic.gov.in/">
          <img
            src={logo}
            alt="ESIC Logo"
            style={{ height: "75px", objectFit: "contain" }}
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
          }}
        >
          {/* Center Title */}
          <MdLocalHospital className="emitra-icon" />
          <h3 className="emitra-text">
            <span className="emitra-e">CHC-PHC</span>
          </h3>

          {/* Right Logout Button */}
          {!hideLogout && (
            <button
              className="btn btn-danger btn-esic position-absolute"
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "14px",
              }}
              onClick={logout}
              aria-label="Logout"
            >
            {loading ? <div className="spinner-border spinner-border-sm" role="status"></div> : ""} Logout <TbLogout2 />
            </button>
          )}
        </div>


    </div>
  );
};

export default Header;
