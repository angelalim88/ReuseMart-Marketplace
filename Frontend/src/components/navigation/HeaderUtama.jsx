import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSearch, FaShoppingCart, FaBell } from 'react-icons/fa';

const HeaderUtama = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const headerStyle = {
    padding: '12px 0',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '20px',
  };

  const logoTextStyle = {
    fontWeight: 'bold',
    fontSize: '24px',
    margin: 0,
    color: '#000000',
  };

  const logoGreenStyle = {
    color: '#028643',
    backgroundColor: '#028643',
    padding: '0 8px',
    // color: '#FFFFFF',
  };

  const searchContainerStyle = {
    position: 'relative',
    flex: 1,
  };

  const searchIconStyle = {
    position: 'absolute',
    top: '50%',
    left: '15px',
    transform: 'translateY(-50%)',
    color: '#D9D9D9',
  };

  const searchInputStyle = {
    padding: '10px 15px 10px 40px',
    borderRadius: '25px',
    border: '1px solid #D9D9D9',
    width: '100%',
    backgroundColor: '#F8F9FA',
  };

  const cartIconStyle = {
    position: 'relative',
    backgroundColor: '#028643',
    color: '#FFFFFF',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
    cursor: 'pointer',
  };

  const notificationIconStyle = {
    position: 'relative',
    color: '#028643',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
    cursor: 'pointer',
  };

  const loginButtonStyle = {
    backgroundColor: '#03081F',
    color: '#FFFFFF',
    borderRadius: '25px',
    padding: '8px 20px',
    border: 'none',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const userIconStyle = {
    backgroundColor: '#FC8A06',
    color: '#FFFFFF',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    fontSize: '12px',
  };

  return (
    <header style={headerStyle}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-auto">
            <div style={logoContainerStyle}>
              <a href="/" style={{ textDecoration: 'none' }}>
                <img src="..\src\assets\images\logo.png" alt="logo" />
              </a>
            </div>
          </div>

          <div className="col">
            <div style={searchContainerStyle}>
              <FaSearch style={searchIconStyle} />
              <input
                type="text"
                placeholder='Ketik "Kursi Estetik" 👀'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchInputStyle}
              />
            </div>
          </div>

          <div className="col-auto d-flex align-items-center">
            <div style={cartIconStyle}>
              <FaShoppingCart />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                10
              </span>
            </div>

            <div style={notificationIconStyle}>
              <FaBell />
            </div>

            <button style={loginButtonStyle} onClick={() => (window.location.href = '/login')}>
              <div style={userIconStyle}>
                <span>U</span>
              </div>
              Masuk/Daftar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderUtama;