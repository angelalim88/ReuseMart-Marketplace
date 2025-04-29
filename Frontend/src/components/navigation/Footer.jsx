import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFacebookF, FaInstagram, FaTiktok, FaSnapchatGhost } from 'react-icons/fa';
import { FaApple } from 'react-icons/fa';
import { FaGooglePlay } from 'react-icons/fa';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#D9D9D9',
    color: '#FFFFFF',
    padding: '2rem 0',
    fontFamily: 'Arial, sans-serif',
  };

  const logoStyle = {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '24px',
    marginBottom: '15px',
  };

  const logoGreenStyle = {
    color: '#028643',
    fontWeight: 'bold',
  };

  const appButtonStyle = {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    border: '1px solid #D9D9D9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    padding: '5px 12px',
    margin: '5px 0',
    fontSize: '12px',
    width: 'fit-content',
  };

  const appIconStyle = {
    fontSize: '20px',
    marginRight: '8px',
  };

  const subscribeButtonStyle = {
    backgroundColor: '#FC8A06',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0 4px 4px 0',
    padding: '8px 16px',
    fontWeight: 'bold',
  };

  const inputStyle = {
    borderRadius: '4px 0 0 4px',
    border: '1px solid #D9D9D9',
    padding: '8px 12px',
  };

  const socialIconStyle = {
    color: '#03081F',
    fontSize: '18px',
    marginRight: '15px',
  };

  const formContainerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '20px',
    borderRadius: '8px',
  };

  const linkStyle = {
    color: '#03081F',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '10px',
  };

  const linkHeaderStyle = {
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#03081F'
  };

  const addressStyle = {
    fontSize: '14px',
    color: '#03081F',
  };

  const copyrightStyle = {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '20px',
    paddingTop: '20px',
    fontSize: '14px',
    color: '#03081F',
  };

  return (
    <footer style={footerStyle}>
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4">
            <div style={logoStyle}>
              <img src="..\src\assets\images\logo.png" alt="logo" />
            </div>
            
            <div className="app-download mb-3">
              <a href="#" style={appButtonStyle}>
                <FaApple style={appIconStyle} />
                <div>
                  <small style={{fontSize: '8px'}}>Download on the</small>
                  <div>App Store</div>
                </div>
              </a>
              
              <a href="#" style={appButtonStyle}>
                <FaGooglePlay style={appIconStyle} />
                <div>
                  <small style={{fontSize: '8px'}}>GET IT ON</small>
                  <div>Google Play</div>
                </div>
              </a>
            </div>
            
            <div style={addressStyle}>
              ReuseMart, Yogyakarta 55100<br />
              Jl. Babarsari #3
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div style={formContainerStyle}>
              <h5 style={linkHeaderStyle}>Dapatkan Penawaran Menarik</h5>
              
              <div className="input-group mb-3">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="youremail@gmail.com" 
                  style={inputStyle}
                />
                <div className="input-group-append">
                  <button style={subscribeButtonStyle}>Subscribe</button>
                </div>
              </div>
              
              <small style={{color: '#D9D9D9', fontSize: '12px'}}>
                we won't spam, read our <a href="#" style={{color: '#D9D9D9', textDecoration: 'underline'}}>email policy</a>
              </small>
              
              <div className="social-icons mt-4">
                <a href="#" style={socialIconStyle}><FaFacebookF /></a>
                <a href="#" style={socialIconStyle}><FaInstagram /></a>
                <a href="#" style={socialIconStyle}><FaTiktok /></a>
                <a href="#" style={socialIconStyle}><FaSnapchatGhost /></a>
              </div>
            </div>
          </div>
          
          <div className="col-md-2 mb-4">
            <h5 style={linkHeaderStyle}>Legal Pages</h5>
            <a href="#" style={linkStyle}>Terms and conditions</a>
            <a href="#" style={linkStyle}>Privacy</a>
            <a href="#" style={linkStyle}>Cookies</a>
            <a href="#" style={linkStyle}>Modern Slavery Statement</a>
          </div>
          
          <div className="col-md-3 mb-4">
            <h5 style={linkHeaderStyle}>Important Links</h5>
            <a href="#" style={linkStyle}>Get help</a>
            <a href="#" style={linkStyle}>Add your restaurant</a>
            <a href="#" style={linkStyle}>Sign up to deliver</a>
            <a href="#" style={linkStyle}>Create a business account</a>
          </div>
        </div>
        
        <div className="row" style={copyrightStyle}>
          <div className="col-md-6">
            <p>ReuseMart copyright 2025, All Rights Reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p>All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;