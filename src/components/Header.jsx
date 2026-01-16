import React from 'react';
import logo from './../assets/esic_header_logo.jpg';
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
        borderBottom: '1px solid black'
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
      <h3 style={{padding: 5}}>ESIC MITHRA</h3>
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
