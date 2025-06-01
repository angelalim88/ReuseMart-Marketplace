import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form,  
  Spinner
} from 'react-bootstrap';
import { 
  BsSearch, 
  BsExclamationTriangle
} from 'react-icons/bs';
import { GetAllClaimMerchandise, GetClaimMerchandiseById } from '../../clients/ClaimMerchandiseService';
import { decodeToken } from '../../utils/jwtUtils';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from '../../components/toast/ToastNotification';
import PaginationComponent from '../../components/pagination/Pagination';
import ConfirmationModalUniversal from '../../components/modal/ConfirmationModalUniversal';
import ClaimMerchandiseCard from '../../components/card/CardClaimMerchandise';
import ClaimMerchandiseModal from '../../components/modal/DetailClaimMerchandiseModal';

const HistoryClaimMerchandisePage = () => {
  const [claimList, setClaimList] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmType, setConfirmType] = useState('warning');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [selectedView, setSelectedView] = useState('all');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Increased from 6 to 9 for better grid layout
  const [akun, setAkun] = useState(null);

  const statusViews = [
    { id: 'all', name: 'Semua Status' },
    { id: 'Menunggu diambil', name: 'Menunggu Diambil' },
    { id: 'Diproses', name: 'Diproses' },
    { id: 'Selesai', name: 'Selesai' }
  ];

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }
        
        const decoded = decodeToken(token);
        setAkun(decoded);
        
        if (!decoded?.id) {
          throw new Error("Invalid token structure");
        }
      } catch (err) {
        setError("Gagal memuat data user!");
        console.error("Error:", err);
      }
    };

    fetchUserData();
    fetchData();
  }, []);

  useEffect(() => {
    filterClaimData();
  }, [selectedView, claimList, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClaims.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await GetAllClaimMerchandise();
      setClaimList(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi nanti.');
      showNotification('Gagal memuat data. Silakan coba lagi nanti.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filterClaimData = () => {
    let filtered = [...claimList];
    
    if (selectedView !== 'all') {
      filtered = filtered.filter(claim => claim.status_claim_merchandise === selectedView);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(claim => 
        claim.id_claim_merchandise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.Pembeli?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.Merchandise?.nama_merchandise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.status_claim_merchandise.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredClaims(filtered);
    setCurrentPage(1);
  };

  const handleViewDetail = async (claimId) => {
    try {
      const response = await GetClaimMerchandiseById(claimId);
      setSelectedClaim(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching claim detail:', error);
      showNotification('Gagal memuat detail claim merchandise.', 'danger');
    }
  };

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
        type={confirmType}
      />

      <ClaimMerchandiseModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        selectedClaim={selectedClaim}
      />

      <div className="max-width-container mx-auto pt-4 px-3">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="page-title">Kelola Claim Merchandise</h2>
            <p className="page-subtitle">Daftar claim merchandise yang dilakukan oleh pembeli</p>
          </Col>
        </Row>

        <Row>
          <Col lg={3} md={4}>
            <RoleSidebar 
              namaSidebar={'Status Claim'}
              roles={statusViews} 
              selectedRole={selectedView} 
              handleRoleChange={setSelectedView} 
            />
          </Col>

          <Col lg={9} md={8}>
            <Row className="mb-4">
              <Col md={12}>
                <div className="search-container">
                  <BsSearch className="search-icon" />
                  <Form.Control
                    type="search"
                    placeholder="Cari ID claim, nama pembeli, merchandise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </Col>
            </Row>

            {loading ? (
              <div className="loading-container">
                <Spinner animation="border" role="status" className="loading-spinner">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="loading-text">Memuat data claim merchandise...</p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="empty-state">
                <BsExclamationTriangle className="empty-icon" />
                <p className="empty-text">Tidak ada data claim merchandise yang ditemukan</p>
              </div>
            ) : (
              <>
                <Row className="claims-grid">
                  {currentItems.map(claim => (
                    <Col xs={12} sm={6} lg={4} key={claim.id_claim_merchandise} className="mb-3">
                      <ClaimMerchandiseCard 
                        claim={claim}
                        onViewDetail={handleViewDetail}
                      />
                    </Col>
                  ))}
                </Row>
                
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <PaginationComponent 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      paginate={paginate}
                    />
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        .page-title {
          margin-bottom: 0;
          font-weight: 700;
          color: #03081F;
          font-size: 2rem;
        }
        
        .page-subtitle {
          color: #686868;
          margin-top: 0.5rem;
          font-size: 1rem;
          font-weight: 400;
        }
        
        .search-container {
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
          height: 48px;
          padding-left: 45px;
          border-radius: 12px;
          border: 2px solid #E7E7E7;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        
        .search-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(2, 134, 67, 0.15);
          border-color: #028643;
        }
        
        .search-input::placeholder {
          color: #9ca3af;
        }
        
        .loading-container {
          text-align: center;
          padding: 4rem 0;
        }
        
        .loading-spinner {
          color: #028643;
          width: 3rem;
          height: 3rem;
        }
        
        .loading-text {
          margin-top: 1.5rem;
          color: #686868;
          font-size: 1rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 0;
        }
        
        .empty-icon {
          font-size: 4rem;
          color: #D9D9D9;
          margin-bottom: 1rem;
        }
        
        .empty-text {
          color: #686868;
          font-size: 1.1rem;
          margin: 0;
        }
        
        .claims-grid {
          margin: 0 -0.5rem;
        }
        
        .claims-grid > .col-12,
        .claims-grid > .col-sm-6,
        .claims-grid > .col-lg-4 {
          padding: 0 0.5rem;
        }
        
        .pagination-container {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
        }
        
        :global(.pagination .page-item.active .page-link) {
          background-color: #028643;
          border-color: #028643;
        }
        
        :global(.pagination .page-link) {
          color: #028643;
          border-radius: 8px;
          margin: 0 2px;
          border: 1px solid #E7E7E7;
        }
        
        :global(.pagination .page-link:hover) {
          color: #026d36;
          background-color: #f8f9fa;
          border-color: #028643;
        }
        
        @media (max-width: 992px) {
          .page-title {
            font-size: 1.75rem;
          }
          
          .claims-grid {
            margin: 0 -0.25rem;
          }
          
          .claims-grid > .col-12,
          .claims-grid > .col-sm-6,
          .claims-grid > .col-lg-4 {
            padding: 0 0.25rem;
          }
        }
        
        @media (max-width: 768px) {
          .page-title {
            font-size: 1.5rem;
          }
          
          .page-subtitle {
            font-size: 0.9rem;
          }
          
          .search-input {
            height: 44px;
            font-size: 0.9rem;
          }
          
          .loading-container {
            padding: 3rem 0;
          }
          
          .empty-state {
            padding: 3rem 0;
          }
          
          .empty-icon {
            font-size: 3rem;
          }
          
          .empty-text {
            font-size: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .claims-grid > .col-12 {
            margin-bottom: 1rem;
          }
          
          .pagination-container {
            margin-top: 1.5rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default HistoryClaimMerchandisePage;