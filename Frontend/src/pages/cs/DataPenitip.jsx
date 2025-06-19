import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { BsSearch, BsExclamationTriangle } from 'react-icons/bs';
import { GetAllPenitip, DeletePenitip } from '../../clients/PenitipService';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from '../../components/toast/ToastNotification';
import PaginationComponent from '../../components/pagination/Pagination';
import PenitipFormModal from '../../components/modal/PenitipFormModal';
import EditPenitipFormModal from '../../components/modal/EditPenitipFormModal';
import ConfirmationModalUniversal from '../../components/modal/ConfirmationModalUniversal';

const PenitipCard = ({ penitip, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  return (
    <Col xs={12} md={6} lg={4} className="mb-4">
      <div className="barang-card card">
        <div className="image-container">
          <img
            src={penitip.Akun.profile_picture || '/default-profile.png'}
            alt="Profile"
            className="barang-image"
          />
        </div>
        <div className="card-body">
          <div className="card-header-section">
            <span className="barang-id">ID: {penitip.id_penitip}</span>
            {penitip.badge && <Badge bg="warning" text="dark">Top Seller</Badge>}
          </div>
          <h5 className="barang-name">{penitip.nama_penitip}</h5>
          <div className="barang-info">
            <p><span className="fw-medium">Email:</span> {penitip.Akun.email}</p>
            <p><span className="fw-medium">Rating:</span> {penitip.rating} stars</p>
            <p><span className="fw-medium">Total Points:</span> {penitip.total_poin}</p>
            <p><span className="fw-medium">Keuntungan:</span> Rp {penitip.keuntungan.toLocaleString()}</p>
            <p><span className="fw-medium">Registrasi:</span> {formatDate(penitip.tanggal_registrasi)}</p>
          </div>
          <div className="action-buttons d-flex gap-2">
            <Button variant="outline-primary" className="edit-btn" onClick={() => onEdit(penitip)}>
              Edit
            </Button>
            <Button variant="outline-danger" className="delete-btn" onClick={() => onDelete(penitip)}>
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </Col>
  );
};

const DataPenitip = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [penitipList, setPenitipList] = useState([]);
  const [filteredPenitip, setFilteredPenitip] = useState([]);
  const [selectedView, setSelectedView] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPenitip, setSelectedPenitip] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const penitipViews = [
    { id: 'all', name: 'Semua Penitip' },
    { id: 'top_seller', name: 'Top Seller' },
    { id: 'high_rating', name: 'Rating Tinggi' },
  ];

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const fetchPenitip = async () => {
    setLoading(true);
    try {
      const response = await GetAllPenitip();
      setPenitipList(response.data);
      setFilteredPenitip(response.data);
    } catch (err) {
      setError('Gagal memuat data penitip.');
      showNotification('Gagal memuat data penitip.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenitip();
  }, []);

  useEffect(() => {
    let filtered = [...penitipList];
    if (selectedView === 'top_seller') {
      filtered = filtered.filter(p => p.badge);
    } else if (selectedView === 'high_rating') {
      filtered = filtered.filter(p => p.rating >= 4);
    }
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.nama_penitip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.Akun.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id_penitip.toString().includes(searchQuery)
      );
    }
    setFilteredPenitip(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedView, penitipList]);

  const handleDelete = (penitip) => {
    setConfirmAction(() => async () => {
      try {
        await DeletePenitip(penitip.id_penitip);
        showNotification('Penitip berhasil dihapus.', 'success');
        fetchPenitip();
      } catch (error) {
        showNotification('Gagal menghapus penitip. Cek kembali koneksi atau server.', 'danger');
      }
    });
    setConfirmMessage(`Apakah Anda yakin ingin menghapus penitip "${penitip.nama_penitip}"?`);
    setShowConfirmModal(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPenitip.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPenitip.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container fluid className="p-0 bg-white">
      <ToastNotification
        show={showToast}
        setShow={setShowToast}
        message={toastMessage}
        type={toastType}
      />
      <ConfirmationModalUniversal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title="Konfirmasi Tindakan"
        message={confirmMessage}
        confirmButtonText="Ya"
        cancelButtonText="Batal"
        type="danger"
      />
      <div className="max-width-container mx-auto pt-4 px-3">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Kelola Data Penitip</h2>
            <p className="text-muted mt-1">Daftar penitip yang terdaftar</p>
          </Col>
          <Col xs="auto">
            <Button className="tambah-barang-btn" onClick={() => setShowModal(true)}>
              Tambah Penitip
            </Button>
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <RoleSidebar
              namaSidebar={'Filter Penitip'}
              roles={penitipViews}
              selectedRole={selectedView}
              handleRoleChange={setSelectedView}
            />
          </Col>
          <Col md={9}>
            <Row className="mb-4">
              <Col md={6}>
                <div className="position-relative">
                  <BsSearch className="search-icon" />
                  <Form.Control
                    type="search"
                    placeholder="Cari nama, email, atau ID penitip..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </Col>
            </Row>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" style={{ color: '#028643' }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted">Memuat data penitip...</p>
              </div>
            ) : filteredPenitip.length === 0 ? (
              <div className="text-center py-5">
                <BsExclamationTriangle style={{ fontSize: '3rem', color: '#D9D9D9' }} />
                <p className="mt-3 text-muted">Tidak ada data penitip yang ditemukan</p>
              </div>
            ) : (
              <>
                <Row>
                  {currentItems.map(penitip => (
                    <PenitipCard
                      key={penitip.id_penitip}
                      penitip={penitip}
                      onEdit={() => {
                        setSelectedPenitip(penitip);
                        setShowEditModal(true);
                      }}
                      onDelete={handleDelete}
                    />
                  ))}
                </Row>
                {totalPages > 1 && (
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                  />
                )}
              </>
            )}
          </Col>
        </Row>
      </div>
      <PenitipFormModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={fetchPenitip}
      />
      <EditPenitipFormModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        penitip={selectedPenitip}
        onSuccess={fetchPenitip}
      />
      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        .tambah-barang-btn {
          background-color: #028643;
          border-color: #028643;
          color: white;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 6px;
        }
        .tambah-barang-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
        }
        .position-relative {
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #686868;
          z-index: 10;
        }
        .search-input {
          height: 45px;
          padding-left: 45px;
          border-radius: 25px;
          border: 1px solid #E7E7E7;
        }
        .search-input:focus {
          box-shadow: none;
          border-color: #028643;
        }
        .barang-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .barang-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .card-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .barang-id {
          color: #686868;
          font-size: 0.9rem;
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
        .image-container {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #f8f9fa;
          border-radius: 6px;
        }
        .barang-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .barang-info {
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .fw-medium {
          font-weight: 500;
        }
        .action-buttons {
          margin-top: 10px;
        }
        .edit-btn, .delete-btn {
          font-size: 0.8rem;
          padding: 4px 8px;
        }
        .edit-btn {
          border-color: #028643;
          color: #028643;
        }
        .edit-btn:hover {
          background-color: #028643;
          color: white;
        }
        .delete-btn {
          border-color: #dc3545;
          color: #dc3545;
        }
        .delete-btn:hover {
          background-color: #dc3545;
          color: white;
        }
        .pagination .page-item.active .page-link {
          background-color: #028643;
          border-color: #028643;
        }
        .pagination .page-link {
          color: #028643;
        }
        .pagination .page-link:hover {
          color: #026d36;
        }
        @media (max-width: 768px) {
          .image-container {
            height: 140px;
          }
          .barang-card {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </Container>
  );
};

export default DataPenitip;