import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { BsSearch, BsExclamationTriangle } from 'react-icons/bs';
import { GetOrganisasiAmalByAkun } from '../../clients/OrganisasiAmalService';
import { GetRequestDonasiByOrganisasi, DeleteRequestDonasi } from '../../clients/RequestDonasiService';
import { decodeToken } from '../../utils/jwtUtils';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from '../../components/toast/ToastNotification';
import PaginationComponent from '../../components/pagination/Pagination';
import RequestDonasiModal from '../../components/modal/RequestDonasiModal';
import UpdateRequestDonasiModal from '../../components/modal/UpdateRequestDonasiModal';
import ConfirmationModalUniversal from '../../components/modal/ConfirmationModalUniversal';

const RequestCard = ({ request, onEdit, onDelete, formatDate }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return <Badge bg="warning" text="dark">Belum Ada Tanggapan</Badge>;
      case 'Diterima':
        return <Badge bg="success">Diterima</Badge>;
      case 'Ditolak':
        return <Badge bg="danger">Ditolak</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Col xs={12} md={6} lg={4} className="mb-4">
      <div className="barang-card card">
        <div className="image-container">
          <img
            src={request.OrganisasiAmal?.Akun?.profile_picture ? `http://localhost:3000/uploads/profile_picture/${request.OrganisasiAmal.Akun.profile_picture}` : '/default-profile.png'}
            alt="Profile"
            className="barang-image"
          />
        </div>
        <div className="card-body">
          <div className="card-header-section">
            <span className="barang-id">#{request.id_request_donasi}</span>
            {getStatusBadge(request.status_request)}
          </div>
          <h5 className="barang-name">{request.deskripsi_request || "-"}</h5>
          <div className="barang-info">
            <p><span className="fw-medium">Organisasi:</span> {request.OrganisasiAmal?.nama_organisasi || '-'}</p>
            <p><span className="fw-medium">Tanggal:</span> {formatDate(request.tanggal_request)}</p>
          </div>
          <div className="action-buttons d-flex gap-2">
            <Button variant="outline-primary" className="edit-btn" onClick={() => onEdit(request)}>
              Edit
            </Button>
            <Button variant="outline-danger" className="delete-btn" onClick={() => onDelete(request)}>
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </Col>
  );
};

const ORequest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [requestList, setRequestList] = useState([]);
  const [filteredRequestList, setFilteredRequestList] = useState([]);
  const [selectedView, setSelectedView] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [idOrganisasi, setIdOrganisasi] = useState(null);
  const [akun, setAkun] = useState(null);
  const [organisasi, setOrganisasi] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const requestViews = [
    { id: 'all', name: 'Semua Request' },
    { id: 'Menunggu Konfirmasi', name: 'Menunggu Konfirmasi' },
    { id: 'Diterima', name: 'Diterima' },
    { id: 'Ditolak', name: 'Ditolak' },
  ];

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Token tidak ditemukan");

        const decoded = decodeToken(token);
        setAkun(decoded);

        if (!decoded?.id) throw new Error("Struktur token tidak valid");

        if (decoded.role === "Organisasi Amal") {
          const resOrganisasi = await GetOrganisasiAmalByAkun(decoded.id);
          const organisasiData = resOrganisasi.data;
          setOrganisasi(organisasiData);

          const orgId = organisasiData.id_organisasi;
          setIdOrganisasi(orgId);

          const resRequest = await GetRequestDonasiByOrganisasi(orgId);
          setRequestList(resRequest.data || []);
          setFilteredRequestList(resRequest.data || []);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError("Terjadi kesalahan saat memuat data");
        showNotification("Terjadi kesalahan saat memuat data", 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...requestList];
    if (selectedView !== 'all') {
      filtered = filtered.filter(r => r.status_request === selectedView);
    }
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.id_request_donasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.deskripsi_request.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.status_request.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.OrganisasiAmal?.nama_organisasi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredRequestList(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedView, requestList]);

  const refreshData = async () => {
    if (idOrganisasi) {
      try {
        const response = await GetRequestDonasiByOrganisasi(idOrganisasi);
        setRequestList(response.data || []);
        showNotification('Data request berhasil diperbarui', 'success');
      } catch (err) {
        console.error('Refresh error:', err);
        const message = err.response?.status === 404 ? 'Tidak ada data request ditemukan' :
                        err.response?.status === 500 ? 'Server error: Tidak dapat memperbarui data' :
                        `Gagal memperbarui data: ${err.message}`;
        showNotification(message, 'danger');
        setRequestList([]);
      }
    }
  };

  const handleDelete = (request) => {
    setConfirmAction(() => async () => {
      try {
        await DeleteRequestDonasi(request.id_request_donasi);
        showNotification('Request berhasil dihapus', 'success');
        await refreshData();
      } catch (error) {
        console.error('Gagal menghapus request:', error);
        showNotification('Gagal menghapus request. Cek kembali koneksi atau server.', 'danger');
      }
    });
    setConfirmMessage(`Apakah Anda yakin ingin menghapus request "${request.nama_barang}"?`);
    setShowConfirmModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('id-ID')} | ${date.toLocaleTimeString('id-ID', { hour12: false })}`;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequestList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequestList.length / itemsPerPage);
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
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>
              Kelola Request Donasi
            </h2>
            <p className="text-muted mt-1">
              Daftar request donasi dari {organisasi?.nama_organisasi || 'Organisasi Amal'}
            </p>
          </Col>
          <Col xs="auto">
            <Button className="tambah-barang-btn" onClick={() => setShowModal(true)}>
              Tambah Request
            </Button>
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <RoleSidebar
              namaSidebar={'Status Request'}
              roles={requestViews}
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
                    placeholder="Cari ID, deskripsi, atau status..."
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
                <p className="mt-3 text-muted">Memuat data request...</p>
              </div>
            ) : filteredRequestList.length === 0 ? (
              <div className="text-center py-5">
                <BsExclamationTriangle style={{ fontSize: '3rem', color: '#D9D9D9' }} />
                <p className="mt-3 text-muted">Tidak ada data request yang ditemukan</p>
              </div>
            ) : (
              <>
                <Row>
                  {currentItems.map(request => (
                    <RequestCard
                      key={request.id_request_donasi}
                      request={request}
                      onEdit={() => {
                        setSelectedRequest(request);
                        setShowUpdateModal(true);
                      }}
                      onDelete={handleDelete}
                      formatDate={formatDate}
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
      <RequestDonasiModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={refreshData}
        idOrganisasi={idOrganisasi}
      />
      <UpdateRequestDonasiModal
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        requestData={selectedRequest}
        onSuccess={refreshData}
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

export default ORequest;