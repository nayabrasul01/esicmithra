import React from "react";
import logo from "./../assets/esic_header_logo.jpg";
import indiaGovSymbol from "./../assets/India_gov_symbol_header.png";
import { MdLocalHospital } from "react-icons/md";

const Header = () => {
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
      <div className="emitra-title"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px 0",
        }}
      >
        <MdLocalHospital className="emitra-icon" />
        <h3  className="emitra-text"> 
          <span className="emitra-e">e</span>-MITRA
        </h3>
      </div>
    </div>
  );
};

export default Header;
