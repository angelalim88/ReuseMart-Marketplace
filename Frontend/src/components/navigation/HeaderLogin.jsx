import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const HeaderLogin = ({ routes }) => {
  const navigate = useNavigate();

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

  const titleStyle = {
    fontWeight: 'bold',
    fontSize: '20px',
    margin: 0,
    color: '#000000',
  };

  const backButtonContainerStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const backButtonStyle = {
    backgroundColor: 'transparent',
    color: '#028643',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  };

  const homeButtonStyle = {
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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header style={headerStyle}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-auto">
            <div style={backButtonContainerStyle}>
              <button style={backButtonStyle} onClick={handleBack}>
                <FaArrowLeft />
              </button>
            </div>
          </div>

          <div className="col">
            <div style={logoContainerStyle}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <img src="/src/assets/images/logo.png" alt="logo" />
              </Link>
            </div>
          </div>

          <div className="col-auto d-flex align-items-center">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button style={homeButtonStyle}>
                Kembali ke Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderLogin;