import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSearch, FaShoppingCart, FaBell, FaClock, FaBolt } from 'react-icons/fa';
import { GetAkunById } from "../../clients/AkunService";
import { decodeToken } from '../../utils/jwtUtils';
import { useSearch } from '../../utils/searchContext';
import { useNavigate } from 'react-router-dom';
import { GetAllBarang } from "../../clients/BarangService";

const HeaderUtama = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const [userData, setUserData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isNotificationHovered, setIsNotificationHovered] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState({ filtered: [], recent: [], popular: [] });
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Sample data untuk suggestions - dalam aplikasi nyata bisa dari API
  const popularSearches = [
    "Kursi Estetik",
    "Meja Kerja",
    "Lemari Pakaian", 
    "Sofa Minimalis",
    "Rak Buku",
    "Tempat Tidur",
    "Meja Makan",
    "Kursi Gaming"
  ];

  const recentSearches = [
    "Kursi Kantor",
    "Meja Komputer",
    "Lampu Meja"
  ];

  const fetchBarangData = async () => {
    try {
      const response = await GetAllBarang();
      const barangList = response.data; // Asumsi response berisi array barang
      const popularItems = barangList.map(item => item.nama).slice(0, 5); // Ambil 5 nama barang populer
      const categories = [...new Set(barangList.map(item => item.kategori_barang))].slice(0, 3); // Ambil kategori unik
      setSuggestions(prev => ({
        ...prev,
        popular: [...popularItems, ...categories], // Gabungkan nama barang dan kategori
      }));
    } catch (error) {
      console.error("Failed to fetch barang data:", error);
    }
  };

  // Fungsi untuk mengambil data akun pengguna
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const idAkun = decodeToken(token).id;
    if (!idAkun) {
      console.error("ID Akun tidak ditemukan di token");
      return;
    }

    try {
      const response = await GetAkunById(idAkun);
      setUserData(response);
      console.log('response data', response);
      
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const getRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    return recent.slice(0, 3); // Batasi 3 pencarian terakhir
  };

  // Filter suggestions based on search query
  const filterSuggestions = async (query) => {
    try {
      const response = await GetAllBarang();
      const barangList = response.data;

      if (!query.trim()) {
        return {
          recent: getRecentSearches(),
          popular: suggestions.popular,
        };
      }

      const filtered = barangList.filter(item =>
        item.nama.toLowerCase().includes(query.toLowerCase()) ||
        item.kategori_barang.toLowerCase().includes(query.toLowerCase())
      ).map(item => item.nama).slice(0, 6);

      return {
        filtered,
        recent: getRecentSearches(),
        popular: query.length < 2 ? suggestions.popular : [],
      };
    } catch (error) {
      console.error("Failed to filter suggestions:", error);
      return {
        recent: getRecentSearches(),
        popular: suggestions.popular,
      };
    }
  };

  // Handle input change
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const newSuggestions = await filterSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(true);
    setActiveSuggestionIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    const newSuggestions = filterSuggestions(searchQuery);
    setSuggestions(newSuggestions);
    setShowSuggestions(true);
  };

  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    recent = [query, ...recent.filter(item => item !== query)].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(recent));
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    saveRecentSearch(suggestion); // Simpan ke riwayat
    setShowSuggestions(false);
    navigate('/');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const totalSuggestions = (suggestions.filtered?.length || 0) + 
                           (suggestions.recent?.length || 0) + 
                           (suggestions.popular?.length || 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < totalSuggestions - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0) {
        // Get the active suggestion
        let allSuggestions = [];
        if (suggestions.filtered) allSuggestions = [...suggestions.filtered];
        if (suggestions.recent) allSuggestions = [...allSuggestions, ...suggestions.recent];
        if (suggestions.popular) allSuggestions = [...allSuggestions, ...suggestions.popular];
        
        if (allSuggestions[activeSuggestionIndex]) {
          handleSuggestionClick(allSuggestions[activeSuggestionIndex]);
        }
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    saveRecentSearch(searchQuery); // Simpan pencarian ke riwayat
    setShowSuggestions(false);
    navigate('/');
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    zIndex: 2,
  };

  const searchInputStyle = {
    padding: '10px 15px 10px 40px',
    borderRadius: '25px',
    border: '1px solid #D9D9D9',
    width: '100%',
    backgroundColor: '#F8F9FA',
    position: 'relative',
    zIndex: 1,
  };

  // Suggestions dropdown style
  const suggestionsDropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    zIndex: 1000,
    maxHeight: '400px',
    overflowY: 'auto',
    marginTop: '4px',
  };

  const suggestionItemStyle = (isActive) => ({
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: isActive ? '#F0F8FF' : '#FFFFFF',
    borderBottom: '1px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
  });

  const suggestionTextStyle = {
    marginLeft: '12px',
    fontSize: '14px',
    color: '#333333',
  };

  const sectionHeaderStyle = {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666666',
    backgroundColor: '#F8F9FA',
    borderBottom: '1px solid #F0F0F0',
  };

  // Enhanced cart icon style with hover animations
  const cartIconStyle = {
    position: 'relative',
    backgroundColor: isCartHovered ? '#026535' : '#028643',
    color: '#FFFFFF',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isCartHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
    boxShadow: isCartHovered 
      ? '0 8px 25px rgba(2, 134, 67, 0.4), 0 0 0 3px rgba(2, 134, 67, 0.1)' 
      : '0 2px 8px rgba(2, 134, 67, 0.2)',
  };

  // Enhanced notification icon style with hover animations
  const notificationIconStyle = {
    position: 'relative',
    color: isNotificationHovered ? '#026535' : '#028643',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: isNotificationHovered ? 'rgba(2, 134, 67, 0.08)' : 'transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isNotificationHovered ? 'scale(1.1)' : 'scale(1)',
  };

  // Cart badge style with pulse animation
  const cartBadgeStyle = {
    fontSize: '10px',
    animation: isCartHovered ? 'pulse 1s ease-in-out infinite' : 'none',
    transform: isCartHovered ? 'scale(1.1)' : 'scale(1)',
    transition: 'transform 0.2s ease',
  };

  // Bell icon animation style
  const bellIconStyle = {
    fontSize: '18px',
    transform: isNotificationHovered ? 'rotate(15deg)' : 'rotate(0deg)',
    transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
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

  // CSS animations (inject into head)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-5px);
        }
        60% {
          transform: translateY(-3px);
        }
      }
      
      .notification-dot {
        animation: ${isNotificationHovered ? 'bounce 0.6s ease' : 'none'};
      }

      .suggestions-dropdown::-webkit-scrollbar {
        width: 6px;
      }
      
      .suggestions-dropdown::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      .suggestions-dropdown::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }
      
      .suggestions-dropdown::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isNotificationHovered]);

  // Render suggestions function
  const renderSuggestions = () => {
    let currentIndex = 0;
    const elements = [];

    // Render filtered suggestions
    if (suggestions.filtered && suggestions.filtered.length > 0) {
      elements.push(
        <div key="filtered-header" style={sectionHeaderStyle}>
          <FaSearch style={{ marginRight: '8px', fontSize: '10px' }} />
          Hasil Pencarian
        </div>
      );
      
      suggestions.filtered.forEach((item, index) => {
        elements.push(
          <div
            key={`filtered-${index}`}
            style={suggestionItemStyle(currentIndex === activeSuggestionIndex)}
            onClick={() => handleSuggestionClick(item)}
            onMouseEnter={() => setActiveSuggestionIndex(currentIndex)}
          >
            <FaSearch style={{ color: '#028643', fontSize: '12px' }} />
            <span style={suggestionTextStyle}>{item}</span>
          </div>
        );
        currentIndex++;
      });
    }

    // Render recent searches
    if (suggestions.recent && suggestions.recent.length > 0) {
      elements.push(
        <div key="recent-header" style={sectionHeaderStyle}>
          <FaClock style={{ marginRight: '8px', fontSize: '10px' }} />
          Pencarian Terakhir
        </div>
      );
      
      suggestions.recent.forEach((item, index) => {
        elements.push(
          <div
            key={`recent-${index}`}
            style={suggestionItemStyle(currentIndex === activeSuggestionIndex)}
            onClick={() => handleSuggestionClick(item)}
            onMouseEnter={() => setActiveSuggestionIndex(currentIndex)}
          >
            <FaClock style={{ color: '#666666', fontSize: '12px' }} />
            <span style={suggestionTextStyle}>{item}</span>
          </div>
        );
        currentIndex++;
      });
    }

    // Render popular searches
    if (suggestions.popular && suggestions.popular.length > 0) {
      elements.push(
        <div key="popular-header" style={sectionHeaderStyle}>
          <FaBolt style={{ marginRight: '8px', fontSize: '10px' }} />
          Pencarian Populer
        </div>
      );
      
      suggestions.popular.forEach((item, index) => {
        elements.push(
          <div
            key={`popular-${index}`}
            style={suggestionItemStyle(currentIndex === activeSuggestionIndex)}
            onClick={() => handleSuggestionClick(item)}
            onMouseEnter={() => setActiveSuggestionIndex(currentIndex)}
          >
            <FaBolt style={{ color: '#FF6B6B', fontSize: '12px' }} />
            <span style={suggestionTextStyle}>{item}</span>
          </div>
        );
        currentIndex++;
      });
    }

    return elements;
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
            <form onSubmit={handleSearchSubmit}>
              <div style={searchContainerStyle} ref={searchRef}>
                <FaSearch style={searchIconStyle} />
                <input
                  type="text"
                  placeholder='Ketik "Kursi Estetik" 👀'
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  style={searchInputStyle}
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div 
                    style={suggestionsDropdownStyle} 
                    ref={suggestionsRef}
                    className="suggestions-dropdown"
                  >
                    {renderSuggestions()}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="col-auto d-flex align-items-center">
            <a href="/pembeli/keranjang">
              <div 
                style={cartIconStyle}
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
              >
                <FaShoppingCart style={{ fontSize: '18px' }} />
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                  style={cartBadgeStyle}
                >
                  10
                </span>
              </div>
            </a>

            <div 
              style={notificationIconStyle}
              onMouseEnter={() => setIsNotificationHovered(true)}
              onMouseLeave={() => setIsNotificationHovered(false)}
            >
              <FaBell style={bellIconStyle} />
              {/* Optional notification dot */}
              <span 
                className="notification-dot position-absolute" 
                style={{
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ff4757',
                  borderRadius: '50%',
                  border: '2px solid white',
                }}
              />
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
                    src={userData.profilePictureUrl}
                    alt="User"
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                  />
                </div>
                {userData.email}

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
                        window.location.href = '/login';
                      }}
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </button>
            ) : (
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