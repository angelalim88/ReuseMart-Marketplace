import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { BsExclamationTriangle } from 'react-icons/bs';
import { FaBox, FaList, FaHistory } from 'react-icons/fa';
import { GetOrganisasiAmalByAkun } from '../../clients/OrganisasiAmalService';
import { decodeToken } from '../../utils/jwtUtils';
import ToastNotification from '../../components/toast/ToastNotification';

const MenuCard = ({ item, onClick }) => {
  return (
    <Col xs={12} md={6} lg={4} className="mb-4">
      <div className="barang-card card" onClick={onClick}>
        <div className="card-body">
          <div className="card-header-section">
            <div className="icon-container" style={{ backgroundColor: `${item.color}10` }}>
              <item.icon size={24} style={{ color: item.color }} />
            </div>
          </div>
          <h5 className="barang-name">{item.title}</h5>
          <p className="barang-info text-muted">{item.description}</p>
        </div>
      </div>
    </Col>
  );
};

const OrganisasiPage = () => {
  const [organisasiData, setOrganisasiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('danger');

  const menuItems = [
    {
      title: 'Produk Donasi',
      description: 'Kelola produk donasi organisasi',
      icon: FaBox,
      path: '/organisasi/produk',
      color: '#028643',
    },
    {
      title: 'Permintaan Donasi',
      description: 'Kelola permintaan donasi',
      icon: FaList,
      path: '/organisasi/request',
      color: '#028643',
    },
    {
      title: 'Riwayat Donasi',
      description: 'Lihat riwayat donasi organisasi',
      icon: FaHistory,
      path: '/organisasi/history',
      color: '#028643',
    },
  ];

  const showNotification = (message, type = 'danger') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          showNotification('Token tidak ditemukan. Silakan login kembali.');
          setTimeout(() => (window.location.href = '/login'), 3000);
          return;
        }

        const decoded = decodeToken(token);
        if (!decoded || !decoded.id) {
          showNotification('Token tidak valid. Silakan login kembali.');
          setTimeout(() => (window.location.href = '/login'), 3000);
          return;
        }

        const organisasi = await GetOrganisasiAmalByAkun(decoded.id);
        setOrganisasiData(organisasi.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching organisasi data:', err);
        showNotification('Gagal memuat data organisasi. Silakan coba lagi.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <Container fluid className="p-0 bg-white">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" style={{ color: '#028643' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Memuat data organisasi...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0 bg-white">
      <ToastNotification
        show={showToast}
        setShow={setShowToast}
        message={toastMessage}
        type={toastType}
      />
      <div className="max-width-container mx-auto pt-4 px-3">
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>
              Dashboard Organisasi Amal
            </h2>
            <p className="text-muted mt-1">
              Selamat datang, {organisasiData?.nama_organisasi || 'Organisasi Amal'}
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            {menuItems.length === 0 ? (
              <div className="text-center py-5">
                <BsExclamationTriangle style={{ fontSize: '3rem', color: '#D9D9D9' }} />
                <p className="mt-3 text-muted">Tidak ada menu yang tersedia</p>
              </div>
            ) : (
              <Row>
                {menuItems.map((item, index) => (
                  <MenuCard
                    key={index}
                    item={item}
                    onClick={() => handleNavigation(item.path)}
                  />
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </div>
      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        .barang-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .barang-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .card-header-section {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 10px;
        }
        .icon-container {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .barang-name {
          color: #03081F;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          height: 48px;
        }
        .barang-info {
          font-size: 0.875rem;
          line-height: 1.5;
        }
        @media (max-width: 768px) {
          .barang-card {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </Container>
  );
};

export default OrganisasiPage;