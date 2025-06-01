import React, { useState, useEffect } from 'react';
import { FaChartLine, FaFileAlt, FaMoneyBillWave, FaBoxOpen, FaTags, FaClock, FaHandsHelping, FaList } from 'react-icons/fa';
import { GetPegawaiByAkunId } from '../../clients/PegawaiService';
import { decodeToken } from '../../utils/jwtUtils';

const OwnerPage = () => {
  const [pegawaiData, setPegawaiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          window.location.href = '/login';
          return;
        }
        
        const decoded = decodeToken(token);
        if (!decoded || !decoded.id) {
          window.location.href = '/login';
          return;
        }

        // Ambil data pegawai berdasarkan ID akun
        const pegawai = await GetPegawaiByAkunId(decoded.id);
        console.log(pegawai.data);
        setPegawaiData(pegawai.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        window.location.href = '/login';
      }
    };

    fetchUserData();
  }, []);

  const menuItems = [
    {
      title: 'Produk Disumbang',
      description: 'Kelola produk yang disumbangkan',
      icon: FaBoxOpen,
      path: '/owner/produk',
      color: '#3B82F6'
    },
    {
      title: 'Laporan Bulanan',
      description: 'Lihat laporan penjualan bulanan',
      icon: FaChartLine,
      path: '/owner/bulanan',
      color: '#10B981'
    },
    {
      title: 'Laporan Komisi',
      description: 'Kelola komisi penitip',
      icon: FaMoneyBillWave,
      path: '/owner/komisi',
      color: '#F59E0B'
    },
    {
      title: 'Laporan Stok',
      description: 'Pantau stok barang',
      icon: FaBoxOpen,
      path: '/owner/stok',
      color: '#EF4444'
    },
    {
      title: 'Laporan Kategori',
      description: 'Analisis performa kategori produk',
      icon: FaTags,
      path: '/owner/kategori',
      color: '#8B5CF6'
    },
    {
      title: 'Penitipan Habis',
      description: 'Kelola barang penitipan yang habis',
      icon: FaClock,
      path: '/owner/penitipan',
      color: '#3B82F6'
    },
    {
      title: 'Laporan Donasi',
      description: 'Lihat riwayat donasi',
      icon: FaHandsHelping,
      path: '/owner/donasi',
      color: '#10B981'
    },
    {
      title: 'Rekap Request',
      description: 'Lihat rekap permintaan organisasi',
      icon: FaList,
      path: '/owner/rekap',
      color: '#F59E0B'
    }
  ];

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3B82F6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6B7280', margin: 0 }}>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <h1 style={{ 
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 0.5rem 0'
          }}>
            Dashboard Pemilik ReuseMart
          </h1>
          <p style={{ 
            fontSize: '1rem',
            color: '#6B7280',
            margin: 0
          }}>
            Selamat datang, {pegawaiData?.nama_pegawai || 'Owner'}
          </p>
        </div>

        {/* Menu Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem'
        }}>
          {menuItems.map((item, index) => (
            <div 
              key={index}
              onClick={() => handleNavigation(item.path)}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}20`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: `${item.color}10`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  flexShrink: 0
                }}>
                  <item.icon size={24} style={{ color: item.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{ 
            fontSize: '0.875rem',
            color: '#9CA3AF',
            margin: 0
          }}>
            Pilih menu di atas untuk mulai bekerja
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          div[style*="padding: 2rem 1rem"] {
            padding: 1rem 0.5rem !important;
          }
          
          h1 {
            font-size: 1.5rem !important;
          }
          
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OwnerPage;