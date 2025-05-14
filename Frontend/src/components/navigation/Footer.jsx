import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFacebookF, FaInstagram, FaTiktok, FaSnapchatGhost, FaApple, FaGooglePlay } from 'react-icons/fa';

const Footer = () => {
  // Styles
  const styles = {
    footer: {
      backgroundColor: '#D9D9D9',
      color: '#FFFFFF',
      padding: '3rem 0 2rem',
      fontFamily: 'Arial, sans-serif',
    },
    logo: {
      marginBottom: '20px',
      display: 'block',
    },
    appButton: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      border: '1px solid #D9D9D9',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      padding: '6px 12px',
      margin: '0 0 10px 0',
      fontSize: '12px',
      width: 'fit-content',
      textDecoration: 'none',
    },
    appIcon: {
      fontSize: '20px',
      marginRight: '8px',
    },
    appText: {
      display: 'flex',
      flexDirection: 'column',
    },
    appTextSmall: {
      fontSize: '8px',
      lineHeight: '1',
    },
    appTextMain: {
      fontSize: '12px',
      fontWeight: 'bold',
    },
    subscribeButton: {
      backgroundColor: '#FC8A06',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '0 4px 4px 0',
      padding: '8px 16px',
      fontWeight: 'bold',
    },
    input: {
      borderRadius: '4px 0 0 4px',
      border: '1px solid #D9D9D9',
      padding: '8px 12px',
    },
    socialIcon: {
      color: '#03081F',
      fontSize: '20px',
      marginRight: '20px',
      display: 'inline-block',
    },
    formContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '25px',
      borderRadius: '8px',
    },
    link: {
      color: '#03081F',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '12px',
      fontSize: '14px',
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#03081F',
      fontSize: '16px',
    },
    address: {
      fontSize: '14px',
      color: '#03081F',
      lineHeight: '1.6',
      marginTop: '5px',
    },
    copyright: {
      borderTop: '1px solid rgba(3, 8, 31, 0.1)',
      marginTop: '30px',
      paddingTop: '20px',
      fontSize: '14px',
      color: '#03081F',
    },
    emailPolicy: {
      color: '#03081F', 
      fontSize: '12px',
      marginTop: '8px',
    },
    emailPolicyLink: {
      color: '#03081F', 
      textDecoration: 'underline',
    },
    socialContainer: {
      marginTop: '25px',
    },
  };

  return (
    <footer style={styles.footer}>
      <div className="container">
        <div className="row">
          {/* Logo and Download Section */}
          <div className="col-md-3 mb-4">
            <div style={styles.logo}>
              <img src="../src/assets/images/logo.png" alt="ReuseMart Logo" />
            </div>
            
            <div className="app-download mb-3">
              <a href="#" style={styles.appButton}>
                <FaApple style={styles.appIcon} />
                <div style={styles.appText}>
                  <span style={styles.appTextSmall}>Download on the</span>
                  <span style={styles.appTextMain}>App Store</span>
                </div>
              </a>
              
              <a href="#" style={styles.appButton}>
                <FaGooglePlay style={styles.appIcon} />
                <div style={styles.appText}>
                  <span style={styles.appTextSmall}>GET IT ON</span>
                  <span style={styles.appTextMain}>Google Play</span>
                </div>
              </a>
            </div>
            
            <div style={styles.address}>
              ReuseMart, Yogyakarta 55100<br />
              Jl. Babarsari #3
            </div>
          </div>
          
          {/* Subscribe Section */}
          <div className="col-md-4 mb-4">
            <div style={styles.formContainer}>
              <h5 style={styles.sectionTitle}>Dapatkan Penawaran Menarik</h5>
              
              <div className="input-group mb-2">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="youremail@gmail.com" 
                  style={styles.input}
                />
                <div className="input-group-append">
                  <button className="btn" style={styles.subscribeButton}>Subscribe</button>
                </div>
              </div>
              
              <div style={styles.emailPolicy}>
                We won't spam, read our <a href="#" style={styles.emailPolicyLink}>email policy</a>
              </div>
              
              <div style={styles.socialContainer}>
                <a href="#" style={styles.socialIcon}><FaFacebookF /></a>
                <a href="#" style={styles.socialIcon}><FaInstagram /></a>
                <a href="#" style={styles.socialIcon}><FaTiktok /></a>
                <a href="#" style={styles.socialIcon}><FaSnapchatGhost /></a>
              </div>
            </div>
          </div>
          
          {/* Legal Pages */}
          <div className="col-md-2 mb-4">
            <h5 style={styles.sectionTitle}>Legal Pages</h5>
            <a href="#" style={styles.link}>Terms and conditions</a>
            <a href="#" style={styles.link}>Privacy</a>
            <a href="#" style={styles.link}>Cookies</a>
            <a href="#" style={styles.link}>Modern Slavery Statement</a>
          </div>
          
          {/* Important Links */}
          <div className="col-md-3 mb-4">
            <h5 style={styles.sectionTitle}>Important Links</h5>
            <a href="#" style={styles.link}>Get help</a>
            <a href="#" style={styles.link}>Add your restaurant</a>
            <a href="#" style={styles.link}>Sign up to deliver</a>
            <a href="#" style={styles.link}>Create a business account</a>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="row" style={styles.copyright}>
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