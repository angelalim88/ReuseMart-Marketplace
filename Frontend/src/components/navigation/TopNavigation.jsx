import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from "react-router-dom";

const TopNavigation = ({ activeTab }) => {
  return (
    <div className="bg-white pt-4 px-3">
      <div className="max-width-container mx-auto">
        <Nav className="nav-tabs-custom border-0">
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to="/pegawai" 
              className="px-5 py-2" 
              active={activeTab === 'pegawai'}
            >
              Data Pegawai
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to="/organisasi" 
              className="px-5 py-2" 
              active={activeTab === 'organisasi'}
            >
              Data Organisasi
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to="/merchandise" 
              className="px-5 py-2" 
              active={activeTab === 'merchandise'}
            >
              Data Merchandise
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
      
      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        /* Navigation Tab Styles */
        .nav-tabs-custom {
          display: flex;
          border-bottom: 1px solid #E7E7E7;
        }
        
        .nav-tabs-custom .nav-link {
          color: #686868;
          border: none;
          margin-right: 20px;
          padding-bottom: 10px;
          font-weight: 500;
        }
        
        .nav-tabs-custom .nav-link.active {
          color: #03081F;
          font-weight: 600;
          border-bottom: 2px solid #028643;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .nav-tabs-custom .nav-link {
            padding: 10px;
            margin-right: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default TopNavigation;