import React from 'react';
import logo from './../assets/esic_header_logo.jpg';
import hospitalLogo from './../assets/hospital.png';
import indiaGovSymbol from './../assets/India_gov_symbol_header.png';

const Header = () => {
  return (
    <div
      id="header"
      style={{
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 15px',
        borderBottom: '1px solid black',
        position: 'sticky', // Added to fix to top
        top: 0, // Stick to top
        left: 0,
        width: '100%',
        zIndex: 1000 // Ensure it stays above other content
      }}
    >
      {/* Left Logo */}
      <a href="https://esic.gov.in/">
        <img
          src={logo}
          alt="MainLogo"
          style={{ height: '80px', objectFit: 'contain', paddingLeft: '20px' }}
          title="Home"
        />
      </a>

      {/* Center Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <img
          src={hospitalLogo}
          alt="Hospital Logo"
          style={{ height: '40px', objectFit: 'contain', marginRight: '10px' }}
          title="Hospital"
        />
        <h3 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '2px' }}>MITHRA</h3>
      </div>
      
      {/* Right Logo */}
      <a
        href="https://labour.gov.in/"
        id="a1"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={indiaGovSymbol}
          alt="India Government Symbol"
          style={{ height: '80px', objectFit: 'contain', paddingRight: '40px' }}
          title="Minister of Labour & Employment"
        />
      </a>
    </div>
  );
};


export default Header;
