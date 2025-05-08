import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Badge } from 'react-bootstrap';
import { Link } from "react-router-dom";
import TopNavigation from "../../components/navigation/TopNavigation";
import ToastNotification from "../../components/toast/ToastNotification";
import PaginationComponent from "../../components/pagination/Pagination";
import { GetAllPenitipan, GetPenitipanById } from '../../clients/PenitipanService';
import { GetAllDonasiBarang, GetDonasiBarangById } from '../../clients/DonasiBarangService';
import { GetAllRequestDonasi, GetRequestDonasiById } from '../../clients/RequestDonasiService';
import { GetAllOrganisasiAmal, GetOrganisasiAmalById } from '../../clients/OrganisasiAmalService';

const ProdukDisumbangkanPage = () => {
  const [donasiBarangList, setDonasiBarangList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentDonasi, setCurrentDonasi] = useState({
    id_donasi_barang: '',
    id_request_donasi: '',
    id_owner: '',
    id_barang: '',
    tanggal_donasi: '',
    Barang: {
      id_barang: '',
      nama: '',
      gambar: '',
      harga: 0,
      garansi_berlaku: false,
      tanggal_garansi: '',
      berat: 0,
      status_qc: '',
      kategori_barang: ''
    },
    RequestDonasi: {
      id_request_donasi: '',
      id_organisasi: '',
      deskripsi_request: '',
      tanggal_request: '',
      status_request: '',
      OrganisasiAmal: {
        id_organisasi: '',
        nama_organisasi: '',
        alamat: '',
        tanggal_registrasi: '',
        Akun: {
          id_akun: '',
          email: '',
          profile_picture: ''
        }
      }
    },
    Owner: {
      id_owner: '',
      nama_owner: '',
      Akun: {
        id_akun: '',
        email: '',
        profile_picture: ''
      }
    }
  });

  useEffect(() => {
    fetchDonasiBarangData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const fetchDonasiBarangData = async () => {
    try {
      setLoading(true);
      console.log('Fetching all donasi barang data...');
      const response = await GetAllDonasiBarang();
      console.log('Donasi Barang data fetched successfully:', response.data);
      
      const enhancedData = await Promise.all(response.data.map(async (donasi) => {
        try {
          // Get Request Donasi details to get organization info
          const requestDonasiResponse = await GetRequestDonasiById(donasi.id_request_donasi);
          const requestDonasi = requestDonasiResponse.data;
          
          // Get Organization details
          const organisasiResponse = await GetOrganisasiAmalById(requestDonasi.id_organisasi);
          const organisasi = organisasiResponse.data;
          
          // Get Barang details
          const barangResponse = await fetch(`http://localhost:3000/api/barang/${donasi.id_barang}`);
          const barang = await barangResponse.json();
          
          return {
            ...donasi,
            RequestDonasi: {
              ...requestDonasi,
              OrganisasiAmal: organisasi
            },
            Barang: barang
          };
        } catch (error) {
          console.error('Error fetching related data:', error);
          return donasi;
        }
      }));
      
      setDonasiBarangList(enhancedData || []);
      setFilteredList(enhancedData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donasi barang data:', error);
      setError('Failed to load donasi barang data. Please try again.');
      showNotification('Failed to load donasi barang data. Please try again.', 'danger');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (id) => {
    try {
      console.log(`Fetching donasi barang details for ID: ${id}`);
      const response = await GetDonasiBarangById(id);
      const donasiData = response.data;
      console.log('Donasi details fetched successfully:', donasiData);
      const requestResponse = await GetRequestDonasiById(donasiData.id_request_donasi);
      const organisasiResponse = await GetOrganisasiAmalById(requestResponse.data.id_organisasi);
      
      setCurrentDonasi({
        ...donasiData,
        tanggal_donasi: donasiData.tanggal_donasi ? donasiData.tanggal_donasi.split('T')[0] : '',
        RequestDonasi: {
          ...requestResponse.data,
          tanggal_request: requestResponse.data.tanggal_request ? requestResponse.data.tanggal_request.split('T')[0] : '',
          OrganisasiAmal: organisasiResponse.data
        }
      });
      
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching donasi details:', error);
      setError('Failed to load donasi details. Please try again.');
      showNotification('Failed to load donasi details. Please try again.', 'danger');
    }
  };

  const searchedItems = filteredList.filter(item => {
    return (
      (item.id_donasi_barang && item.id_donasi_barang.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id_barang && item.id_barang.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.Barang?.nama && item.Barang.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.RequestDonasi?.OrganisasiAmal?.nama_organisasi && 
        item.RequestDonasi.OrganisasiAmal.nama_organisasi.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(searchedItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Barang Yang Telah Didonasikan</h2>
            <p className="text-muted mt-1">Daftar barang yang sudah disalurkan sebagai donasi dan organisasi penerimanya</p>
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
                    placeholder="Cari ID donasi, nama barang, organisasi penerima..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: '#028643' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Memuat data donasi barang...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-gift" style={{ fontSize: '3rem', color: '#D9D9D9' }}></i>
                <p className="mt-3 text-muted">Tidak ada barang yang sudah didonasikan saat ini</p>
              </div>
            ) : (
              <>
                {currentItems.map((item) => (
                  <Card key={item.id_donasi_barang} className="mb-3 border penitipan-card">
                    <Card.Body className="p-3">
                      <Row className="align-items-center">
                        <Col xs={12} md={2} className="mb-3 mb-md-0">
                          <div className="item-image-container">
                            {item.Barang?.gambar ? (
                              <img 
                                src={item.Barang.gambar.includes(',') ? 
                                  item.Barang.gambar.split(',')[1].trim() : 
                                  item.Barang.gambar} 
                                alt={item.Barang.nama} 
                                className="item-image" 
                              />
                            ) : (
                              <div className="no-image-placeholder">
                                <i className="bi bi-gift"></i>
                              </div>
                            )}
                          </div>
                        </Col>
                        <Col xs={12} md={7}>
                          <div className="mb-1">
                            <span className="penitipan-id">#{item.id_donasi_barang}</span>
                            <span className="ms-2 donated-badge">
                              Didonasikan
                            </span>
                          </div>
                          
                          <h5 className="item-name mb-2">
                            {item.Barang?.nama || "Unnamed Item"}
                          </h5>
                          
                          <div className="mb-1">
                            <span className="text-muted">Tanggal Donasi: </span>
                            <span>{formatDate(item.tanggal_donasi) || "-"}</span>
                          </div>
                          
                          <div className="mb-1">
                            <span className="text-muted">Penerima: </span>
                            <span className="fw-bold">
                              {item.RequestDonasi?.OrganisasiAmal?.nama_organisasi || "-"}
                            </span>
                          </div>
                          
                          <div className="mb-1">
                            <span className="text-muted">Status Request: </span>
                            <span className={`status-badge ${item.RequestDonasi?.status_request === 'Selesai' ? 'success' : 'pending'}`}>
                              {item.RequestDonasi?.status_request || "-"}
                            </span>
                          </div>
                        </Col>
                        <Col xs={12} md={3} className="text-md-end mt-3 mt-md-0">
                          <Button 
                            variant="primary"
                            className="view-btn"
                            onClick={() => handleViewDetails(item.id_donasi_barang)}
                          >
                            View Details
                          </Button>
                        </Col>
                      </Row>
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

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: '#5CB85C', color: 'white' }}>
          <Modal.Title>Detail Barang Donasi</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {/* Item Information Section */}
          <div className="mb-4">
            <h5 className="border-bottom pb-2 mb-3">Informasi Barang</h5>
            <Row className="mb-3">
              <Col md={4} className="text-muted">ID Donasi Barang:</Col>
              <Col md={8} className="fw-bold">{currentDonasi.id_donasi_barang || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">ID Barang:</Col>
              <Col md={8}>{currentDonasi.id_barang || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Nama Barang:</Col>
              <Col md={8} className="fw-bold">{currentDonasi.Barang?.nama || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Kategori:</Col>
              <Col md={8}>{currentDonasi.Barang?.kategori_barang || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Harga:</Col>
              <Col md={8}>{formatCurrency(currentDonasi.Barang?.harga || 0)}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Berat:</Col>
              <Col md={8}>{currentDonasi.Barang?.berat || 0} kg</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Status QC:</Col>
              <Col md={8}>{currentDonasi.Barang?.status_qc || '-'}</Col>
            </Row>
          </div>
          
          {/* Donation Information Section */}
          <div className="mb-4">
            <h5 className="border-bottom pb-2 mb-3">Informasi Donasi</h5>
            <Row className="mb-3">
              <Col md={4} className="text-muted">Tanggal Donasi:</Col>
              <Col md={8}>{formatDate(currentDonasi.tanggal_donasi) || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">ID Request Donasi:</Col>
              <Col md={8}>{currentDonasi.id_request_donasi || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Tanggal Request:</Col>
              <Col md={8}>{formatDate(currentDonasi.RequestDonasi?.tanggal_request) || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Status Request:</Col>
              <Col md={8}>
                <span className={`status-badge ${currentDonasi.RequestDonasi?.status_request === 'Selesai' ? 'success' : 'pending'}`}>
                  {currentDonasi.RequestDonasi?.status_request || '-'}
                </span>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Deskripsi Request:</Col>
              <Col md={8}>{currentDonasi.RequestDonasi?.deskripsi_request || '-'}</Col>
            </Row>
          </div>
          
          {/* Organization Information Section */}
          <div>
            <h5 className="border-bottom pb-2 mb-3">Informasi Organisasi Penerima</h5>
            <Row className="mb-3">
              <Col md={4} className="text-muted">ID Organisasi:</Col>
              <Col md={8}>{currentDonasi.RequestDonasi?.OrganisasiAmal?.id_organisasi || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Nama Organisasi:</Col>
              <Col md={8} className="fw-bold">{currentDonasi.RequestDonasi?.OrganisasiAmal?.nama_organisasi || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Email:</Col>
              <Col md={8}>{currentDonasi.RequestDonasi?.OrganisasiAmal?.Akun?.email || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Alamat:</Col>
              <Col md={8}>{currentDonasi.RequestDonasi?.OrganisasiAmal?.alamat || '-'}</Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4} className="text-muted">Terdaftar Sejak:</Col>
              <Col md={8}>{formatDate(currentDonasi.RequestDonasi?.OrganisasiAmal?.tanggal_registrasi) || '-'}</Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Link to="/owner/rekap">
            <Button variant="success">
              Lihat History Donasi
            </Button>
          </Link>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        /* Penitipan Card Styles */
        .penitipan-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        
        .penitipan-card:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .penitipan-id {
          color: #686868;
          font-size: 0.9rem;
        }
        
        .donated-badge {
          background-color: #5CB85C;
          color: white;
          padding: 3px 7px;
          border-radius: 10px;
          font-weight: 400;
          font-size: 0.75rem;
        }
        
        .status-badge {
          padding: 3px 7px;
          border-radius: 10px;
          font-weight: 400;
          font-size: 0.75rem;
          color: white;
        }
        
        .status-badge.success {
          background-color: #28a745;
        }
        
        .status-badge.pending {
          background-color: #ffc107;
          color: #212529;
        }
        
        .item-name {
          color: #03081F;
          font-weight: 600;
        }
        
        .item-price {
          color: #4A4A4A;
        }
        
        .item-image-container {
          width: 100%;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 6px;
          background-color: #f8f9fa;
        }
        
        .item-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .no-image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: #f8f9fa;
          color: #adb5bd;
          font-size: 2rem;
        }
        
        /* Button Styles */
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

export default ProdukDisumbangkanPage;