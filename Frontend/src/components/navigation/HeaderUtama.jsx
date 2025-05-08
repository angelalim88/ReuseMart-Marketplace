import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSearch, FaShoppingCart, FaBell } from 'react-icons/fa';
import { GetAkunById } from "../../clients/AkunService";
import { decodeToken } from '../../utils/jwtUtils';

const HeaderUtama = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null); // Menyimpan data akun pengguna
  const [isHovered, setIsHovered] = useState(false); // State untuk hover pada tombol login

  // Fungsi untuk mengambil data akun pengguna
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return; // Jika tidak ada token, tidak bisa ambil data

    const idAkun = decodeToken(token).id;
    if (!idAkun) {
      console.error("ID Akun tidak ditemukan di token");
      return;
    }

    try {
      const response = await GetAkunById(idAkun);
      setUserData(response); // Menyimpan data akun pengguna ke state
      console.log('response data', response);
      
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  // Memanggil fetchUserData saat komponen dimuat
  useEffect(() => {
    fetchUserData();
  }, []);

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
    position: 'relative',
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

            {/* Dropdown Menu untuk pengguna yang sudah login */}
            {userData != null ? (
              <button
                style={loginButtonStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div style={userIconStyle}>
                  <img
                    src={userData.profilePictureUrl} // Gambar profil dari response API
                    alt="User"
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                  />
                </div>
                {userData.email} {/* Nama pengguna dari response API */}

                {/* Dropdown Menu */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      backgroundColor: '#fff',
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      padding: '10px',
                      zIndex: '100',
                    }}
                  >
                    <button
                      style={{
                        backgroundColor: '#028643',
                        color: '#fff',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                      onClick={() => (window.location.href = '/profile')}
                    >
                      Profil
                    </button>
                    <button
                      style={{
                        backgroundColor: '#ff4d4d',
                        color: '#fff',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        width: '100%',
                        marginTop: '5px',
                      }}
                      onClick={() => {
                        localStorage.removeItem('authToken');
                        window.location.href = '/login'; // Logout and redirect to login
                      }}
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </button>
            ) : (
              // Tombol Masuk/Daftar untuk pengguna yang belum login
              <button
                style={loginButtonStyle}
                onClick={() => (window.location.href = '/login')}
              >
                <div style={userIconStyle}>
                  <span>U</span>
                </div>
                Masuk/Daftar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderUtama;
