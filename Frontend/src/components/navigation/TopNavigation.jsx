import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';

const TopNavigation = ({ userRole }) => {
  const location = useLocation();

  const getRoleBasedMenu = (role) => {
    switch (role) {
      case 'Admin':
        return [
          { name: 'Data Pegawai', path: '/admin/pegawai' },
          { name: 'Data Organisasi', path: '/admin/organisasi' },
          { name: 'Data Merchandise', path: '/admin/merchandise' },
        ];
      case 'Pegawai Gudang':
        return [
          { name: 'Daftar Barang', path: '/pegawai-gudang/barang' },
          { name: 'Daftar Transaksi', path: '/pegawai-gudang/transaksi' },
          { name: 'Pengambilan', path: '/pegawai-gudang/pengambilan' },
          { name: 'Pengiriman', path: '/pegawai-gudang/pengiriman' },
        ];
      case 'Owner':
        return [
          { name: 'Produk Disumbangkan', path: '/owner/produk' },
          { name: 'Laporan Bulanan', path: '/owner/bulanan' },
          { name: 'Laporan Komisi', path: '/owner/komisi' },
          { name: 'Laporan Stok Gudang', path: '/owner/stok' },
          { name: 'Laporan Kategori', path: '/owner/kategori' },
          { name: 'Penitipan Habis', path: '/owner/penitipan' },
          { name: 'Laporan Donasi', path: '/owner/donasi' },
          { name: 'Rekap Request', path: '/owner/rekap' },
          { name: 'Laporan Transaksi Penitip', path: '/owner/transaksi' },
        ];
      case 'Customer Service':
        return [
          { name: 'Data Penitip', path: '/cs/penitip' },
          { name: 'Bukti Transfer', path: '/cs/bukti' },
          { name: 'Diskusi Produk', path: '/cs/diskusi' },
          { name: 'Kelola Merchandise', path: '/cs/merch' },
          { name: 'History Merchandise', path: '/cs/history' },
        ];
      case 'Penitip':
        return [
          { name: 'Daftar Barang', path: '/penitip/barang' },
          { name: 'History Penjualan', path: '/penitip/history' },
          { name: 'Laporan Transaksi', path: '/penitip/laporan' },
        ];
      case 'Organisasi Amal':
        return [
          { name: 'Produk Disumbangkan', path: '/organisasi/produk' },
          { name: 'Kelola Request', path: '/organisasi/request' },
          { name: 'History Donasi', path: '/organisasi/history' },
        ];
      default:
        return [];
    }
  };

  const roleMenu = getRoleBasedMenu(userRole);

  const isActiveLink = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path) &&
          location.pathname !== item.path &&
          !item.exact;
  };

  return (
    <div className="bg-white pt-4 px-3">
      <div className="max-width-container mx-auto">
        <Nav className="nav-tabs-custom border-0">
          {roleMenu.map((item, index) => (
          <Nav.Item key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `${isActiveLink(item) || isActive ? 'active' : ''} nav-link`
              }
              style={{ 
                textDecoration: 'none',
                animationDelay: `${index * 0.1}s`
              }}
            >
              {item.name}
            </NavLink>
          </Nav.Item>
          ))}
        </Nav>
      </div>

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        .nav-tabs-custom {
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #E7E7E7;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          position: relative;
        }
        .nav-tabs-custom::-webkit-scrollbar {
          display: none;
        }
        .nav-tabs-custom .nav-link {
          color: #686868 !important;
          border: none;
          margin: 0 15px;
          padding: 12px 20px;
          font-weight: 500;
          font-size: 14px;
          white-space: nowrap;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 8px;
          background: transparent;
          transform: translateY(0);
          opacity: 0;
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-tabs-custom .nav-link:hover {
          color: #03081F !important;
          background: rgba(2, 134, 67, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(2, 134, 67, 0.15);
        }
        
        .nav-tabs-custom .nav-link.active {
          color: #03081F !important;
          font-weight: 600;
          background: linear-gradient(135deg, rgba(2, 134, 67, 0.1), rgba(2, 134, 67, 0.05));
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(2, 134, 67, 0.1);
        }
        
        .nav-tabs-custom .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 3px;
          background: linear-gradient(90deg, #028643, #02a651);
          border-radius: 2px;
          animation: expandWidth 0.4s ease-out;
        }
        
        @keyframes expandWidth {
          from {
            width: 0%;
          }
          to {
            width: 80%;
          }
        }
        
        .nav-tabs-custom .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 134, 67, 0.1);
          border-radius: 8px;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
          z-index: -1;
        }
        
        .nav-tabs-custom .nav-link:hover::before {
          opacity: 1;
          transform: scale(1);
        }
        
        @media (max-width: 768px) {
          .nav-tabs-custom {
            justify-content: flex-start;
            padding: 0 10px;
          }
          .nav-tabs-custom .nav-link {
            padding: 10px 12px;
            margin: 0 5px;
            font-size: 13px;
          }
        }
        
        @media (max-width: 480px) {
          .nav-tabs-custom .nav-link {
            padding: 8px 10px;
            margin: 0 3px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default TopNavigation;