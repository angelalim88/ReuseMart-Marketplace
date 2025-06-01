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
        ];
      case 'Customer Service':
        return [
          { name: 'Data Penitip', path: '/cs/penitip' },
          { name: 'Bukti Transfer', path: '/cs/bukti' },
          { name: 'Diskusi Produk', path: '/cs/diskusi' },
          { name: 'Merchandise', path: '/cs/merch' },
          { name: 'History Merchandise', path: '/cs/history' },
        ];
      case 'Penitip':
        return [
          { name: 'Daftar barang', path: '/penitip/barang' },
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
          {roleMenu.map((item) => (
          <Nav.Item key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `${isActiveLink(item) || isActive ? 'active' : ''} nav-link`
              }
              style={{ textDecoration: 'none' }}
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
          border-bottom: 1px solid #E7E7E7;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .nav-tabs-custom::-webkit-scrollbar {
          display: none;
        }
        .nav-tabs-custom .nav-link {
          color: #686868 !important;
          border: none;
          margin-right: 20px;
          padding-bottom: 10px;
          font-weight: 500;
          white-space: nowrap;
          position: relative;
          transition: all 0.2s ease;
        }
        .nav-tabs-custom .nav-link:hover {
          color: #03081F !important;
        }
        .nav-tabs-custom .nav-link.active {
          color: #03081F !important;
          font-weight: 600;
        }
        .nav-tabs-custom .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #028643;
        }
        @media (max-width: 768px) {
          .nav-tabs-custom .nav-link {
            padding: 10px 8px;
            margin-right: 10px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default TopNavigation;