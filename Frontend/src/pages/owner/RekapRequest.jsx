import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Badge } from 'react-bootstrap';
import TopNavigation from "../../components/navigation/TopNavigation";
import ToastNotification from "../../components/toast/ToastNotification";
import PaginationComponent from "../../components/pagination/Pagination";
import { 
  GetAllRequestDonasi, 
  GetRequestDonasiById, 
  DeleteRequestDonasi 
} from '../../clients/RequestDonasiService';
import { CetakLaporanRequest } from '../../components/pdf/CetakLaporanRequest';

const RekapRequest = () => {
  const [requestList, setRequestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modals state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState({
    id_request_donasi: '',
    id_organisasi: '',
    deskripsi_request: '',
    tanggal_request: '',
    status_request: '',
    OrganisasiAmal: {
      nama_organisasi: '',
      alamat: '',
      tanggal_registrasi: '',
      Akun: {
        email: ''
      }
    }
  });

  useEffect(() => {
    fetchRequestDonasi();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const fetchRequestDonasi = async () => {
    try {
      setLoading(true);
      console.log('Fetching all request data...');
      const response = await GetAllRequestDonasi();
      console.log('Request data fetched successfully:', response.data);
      setRequestList(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching request data:', error);
      setError('Failed to load request data. Please try again.');
      showNotification('Failed to load request data. Please try again.', 'danger');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status === selectedStatus ? '' : status);
  };

  const handleViewDetails = async (id) => {
    try {
      console.log(`Fetching request details for ID: ${id}`);
      const response = await GetRequestDonasiById(id);
      const requestData = response.data;
      console.log('Request details fetched successfully:', requestData);
      
      setCurrentRequest({
        ...requestData,
        tanggal_request: requestData.tanggal_request ? requestData.tanggal_request.split('T')[0] : ''
      });
      
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
      setError('Failed to load request details. Please try again.');
      showNotification('Failed to load request details. Please try again.', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        console.log(`Deleting request with ID: ${id}`);
        const response = await DeleteRequestDonasi(id);
        console.log('Request deleted successfully:', response.data);
        showNotification('Request berhasil dihapus!', 'success');
        fetchRequestDonasi();
      } catch (error) {
        console.error('Error deleting request:', error);
        setError('Failed to delete request. Please try again.');
        showNotification('Gagal menghapus request. Silakan coba lagi.', 'danger');
      }
    }
  };

  // Filter requests based on search term and selected status
  const filteredRequests = requestList.filter(request => {
    const matchesSearch = !searchTerm || 
      (request.id_request_donasi && request.id_request_donasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.id_organisasi && request.id_organisasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.OrganisasiAmal?.nama_organisasi && request.OrganisasiAmal.nama_organisasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.deskripsi_request && request.deskripsi_request.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !selectedStatus || request.status_request === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Status badge color mapping
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'menunggu konfirmasi':
        return '#FC8A06'; // Orange
      case 'diterima':
        return '#028643'; // Green
      case 'ditolak':
        return '#FF1700'; // Red
      default:
        return '#686868'; // Grey
    }
  };

  // Get status badge style including text color
  const getStatusBadgeStyle = (status) => {
    const backgroundColor = getStatusBadgeColor(status);
    return { 
      backgroundColor, 
      color: 'white',
      padding: '3px 7px',
      borderRadius: '10px',
      fontWeight: '400',
      fontSize: '0.75rem'
    };
  };

  const handleCetakLaporan = () => {
    CetakLaporanRequest();
  }

  return (
    <Container fluid className="p-0 bg-white">
      {/* Toast Notification */}
      <ToastNotification 
        show={showToast} 
        setShow={setShowToast} 
        message={toastMessage} 
        type={toastType} 
      />

      <div className="max-width-container mx-auto pt-4 px-3">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Rekap Data Request Donasi</h2>
            <p className="text-muted mt-1">Daftar request yang diajukan Organisasi Amal</p>
          </Col>
        </Row>

        <Row>
          {/* Main content */}
          <Col>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div className="position-relative search-container">
                  <i className="bi bi-search search-icon"></i>
                  <Form.Control
                    type="search"
                    placeholder="Cari id, organisasi, deskripsi..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
                
                <div className="d-flex gap-2 flex-wrap">
                  <button className="btn btn-success rounded" onClick={handleCetakLaporan}>Cetak Laporan</button>
                  <Button 
                    className={`status-filter-btn ${selectedStatus === 'Menunggu konfirmasi' ? 'active-pending' : ''}`}
                    onClick={() => handleStatusChange('Menunggu konfirmasi')}
                  >
                    Menunggu Konfirmasi
                  </Button>
                  <Button 
                    className={`status-filter-btn ${selectedStatus === 'Diterima' ? 'active-approved' : ''}`}
                    onClick={() => handleStatusChange('Diterima')}
                  >
                    Diterima
                  </Button>
                  <Button 
                    className={`status-filter-btn ${selectedStatus === 'Ditolak' ? 'active-rejected' : ''}`}
                    onClick={() => handleStatusChange('Ditolak')}
                  >
                    Ditolak
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: '#028643' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Memuat data request donasi...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-file-earmark-x" style={{ fontSize: '3rem', color: '#D9D9D9' }}></i>
                <p className="mt-3 text-muted">Tidak ada data request donasi yang sesuai dengan pencarian</p>
              </div>
            ) : (
              <>
               {currentItems.map((request) => (
                  <Card key={request.id_request_donasi} className="mb-3 border request-card">
                    <Card.Body className="p-3">
                      <Row className="align-items-center">
                        <Col xs={12} md={9}>
                          <div className="mb-1">
                            <span className="request-id">#{request.id_request_donasi}</span>
                            <span className="ms-2" 
                              style={getStatusBadgeStyle(request.status_request)}
                            >
                              {request.status_request || 'Unknown'}
                            </span>
                          </div>
                          
                          <h5 className="request-org mb-2">
                            {request.OrganisasiAmal?.nama_organisasi || request.id_organisasi || 'Tanpa Organisasi'}
                          </h5>
                          
                          <div className="mb-1">
                            <span className="text-muted">Tanggal Request: </span>
                            <span>{formatDate(request.tanggal_request)}</span>
                          </div>
                          
                          <div className="request-desc mt-2">
                            <p>{request.deskripsi_request || '-'}</p>
                          </div>
                        </Col>
                      </Row>
                      
                      <div className="button-container mt-3 d-flex justify-content-end">
                        <Button 
                          variant="danger" 
                          className="delete-btn me-2"
                          onClick={() => handleDelete(request.id_request_donasi)}
                        >
                          Delete
                        </Button>
                        <Button 
                          variant="primary"
                          className="view-btn"
                          onClick={() => handleViewDetails(request.id_request_donasi)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}

                {/* Pagination */}
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

      {/* Detail Modal - Simplified Version without approval/rejection functionality */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: '#028643', color: 'white' }}>
          <Modal.Title>Detail Request Donasi</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {/* Request Information Section */}
          <div className="mb-4">
            <h5 className="border-bottom pb-2 mb-3">Informasi Request</h5>
            <Row className="mb-3">
              <Col md={4} className="text-muted">ID Request:</Col>
              <Col md={8} className="fw-bold">{currentRequest.id_request_donasi || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Tanggal Request:</Col>
              <Col md={8}>{formatDate(currentRequest.tanggal_request) || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Status:</Col>
              <Col md={8}>
                <span 
                  style={getStatusBadgeStyle(currentRequest.status_request)}
                >
                  {currentRequest.status_request || 'Unknown'}
                </span>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Deskripsi Request:</Col>
              <Col md={8}>
                <div className="p-3 bg-light rounded">
                  {currentRequest.deskripsi_request || '-'}
                </div>
              </Col>
            </Row>
          </div>
          
          {/* Organization Information Section */}
          <div>
            <h5 className="border-bottom pb-2 mb-3">Informasi Organisasi</h5>
            <Row className="mb-3">
              <Col md={4} className="text-muted">ID Organisasi:</Col>
              <Col md={8}>{currentRequest.id_organisasi || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Nama Organisasi:</Col>
              <Col md={8} className="fw-bold">{currentRequest.OrganisasiAmal?.nama_organisasi || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Email:</Col>
              <Col md={8}>{currentRequest.OrganisasiAmal?.Akun?.email || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Alamat:</Col>
              <Col md={8}>{currentRequest.OrganisasiAmal?.alamat || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Terdaftar Sejak:</Col>
              <Col md={8}>{formatDate(currentRequest.OrganisasiAmal?.tanggal_registrasi) || '-'}</Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        /* Request Card Styles */
        .request-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        
        .request-card:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .request-id {
          color: #686868;
          font-size: 0.9rem;
        }
        
        .role-badge {
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .request-org {
          color: #03081F;
          font-weight: 600;
        }
        
        .request-desc {
          color: #4A4A4A;
        }
        
        /* Button Styles */
        .delete-btn {
          background-color: #FF1700;
          border-color: #FF1700;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .delete-btn:hover {
          background-color: #e61500;
          border-color: #e61500;
        }
        
        .view-btn {
          background-color: #028643;
          border-color: #028643;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .view-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
        }
        
        /* Search Input */
        .search-container {
          position: relative;
          min-width: 300px;
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
        
        /* Status Filter Buttons */
        .status-filter-btn {
          background-color: #FFFFFF;
          border: 1px solid #E7E7E7;
          color: #686868;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .status-filter-btn:hover {
          background-color: #f8f9fa;
          border-color: #E7E7E7;
          color: #03081F;
        }
        
        .active-pending {
          background-color: #FC8A06 !important;
          border-color: #FC8A06 !important;
          color: white !important;
        }
        
        .active-approved {
          background-color: #028643 !important;
          border-color: #028643 !important;
          color: white !important;
        }
        
        .active-rejected {
          background-color: #FF1700 !important;
          border-color: #FF1700 !important;
          color: white !important;
        }
        
        /* Form Controls */
        .form-control-custom:focus {
          border-color: #028643;
          box-shadow: 0 0 0 0.25rem rgba(2, 134, 67, 0.25);
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .search-container {
            width: 100%;
          }
        }
      `}</style>
    </Container>
  );
};

export default RekapRequest;