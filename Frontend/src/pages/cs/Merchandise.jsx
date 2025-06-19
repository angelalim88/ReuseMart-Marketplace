import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form,  
  Spinner,
  Button,
  Badge,
  Card
} from 'react-bootstrap';
import { 
  BsSearch, 
  BsExclamationTriangle,
  BsArrowDownUp,
  BsCheckCircle,
  BsClock,
  BsPersonFill,
  BsBoxSeam
} from 'react-icons/bs';
import { GetAllClaimMerchandise, UpdateClaimMerchandise } from '../../clients/ClaimMerchandiseService';
import { decodeToken } from '../../utils/jwtUtils';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from '../../components/toast/ToastNotification';
import PaginationComponent from '../../components/pagination/Pagination';
import ConfirmationModalUniversal from '../../components/modal/ConfirmationModalUniversal';

const KelolaMerchandisePage = () => {
  const [claimList, setClaimList] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmType, setConfirmType] = useState('success');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [selectedView, setSelectedView] = useState('menunggu');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [akun, setAkun] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [processingClaims, setProcessingClaims] = useState(new Set());

  const statusViews = [
    { id: 'menunggu', name: 'Menunggu Diambil' },
    { id: 'all', name: 'Semua Status' },
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
  }, [selectedView, claimList, searchTerm, sortOrder]);

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
    
    if (selectedView === 'menunggu') {
      filtered = filtered.filter(claim => claim.status_claim_merchandise === 'Menunggu diambil');
    } else if (selectedView !== 'all') {
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
    
    // Sort by tanggal_claim
    filtered.sort((a, b) => {
      const dateA = new Date(a.tanggal_claim);
      const dateB = new Date(b.tanggal_claim);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredClaims(filtered);
    setCurrentPage(1);
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleCompleteClaimConfirm = (claim) => {
    setSelectedClaim(claim);
    setConfirmMessage(`Apakah Anda yakin ingin menyelesaikan claim merchandise "${claim.Merchandise?.nama_merchandise}" untuk pembeli "${claim.Pembeli?.nama}"?`);
    setConfirmType('success');
    setConfirmAction(() => () => handleCompleteClaim(claim.id_claim_merchandise));
    setShowConfirmModal(true);
  };

  const handleCompleteClaim = async (claimId) => {
    if (processingClaims.has(claimId)) {
      return; // Prevent double processing
    }

    setProcessingClaims(prev => new Set(prev).add(claimId));
    
    try {
      const currentDate = new Date().toISOString();
      
      const updateData = {
        status_claim_merchandise: 'Selesai',
        tanggal_ambil: currentDate
      };

      await UpdateClaimMerchandise(claimId, updateData);
      
      // Update local state
      setClaimList(prevList => 
        prevList.map(claim => 
          claim.id_claim_merchandise === claimId 
            ? { 
                ...claim, 
                status_claim_merchandise: 'Selesai',
                tanggal_ambil: currentDate
              }
            : claim
        )
      );

      showNotification('Claim merchandise berhasil diselesaikan!', 'success');
      setShowConfirmModal(false);
      
    } catch (error) {
      console.error('Error completing claim:', error);
      showNotification('Gagal menyelesaikan claim merchandise. Silakan coba lagi.', 'danger');
    } finally {
      setProcessingClaims(prev => {
        const newSet = new Set(prev);
        newSet.delete(claimId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu diambil':
        return <Badge bg="warning" className="status-badge"><BsClock className="me-1" />Menunggu Diambil</Badge>;
      case 'Diproses':
        return <Badge bg="info" className="status-badge"><BsClock className="me-1" />Diproses</Badge>;
      case 'Selesai':
        return <Badge bg="success" className="status-badge"><BsCheckCircle className="me-1" />Selesai</Badge>;
      default:
        return <Badge bg="secondary" className="status-badge">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ClaimCard = ({ claim }) => {
    const isProcessing = processingClaims.has(claim.id_claim_merchandise);
    
    return (
      <Card className="claim-card h-100">
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="claim-id mb-1">{claim.id_claim_merchandise}</h6>
              <small className="text-muted">Claim ID</small>
            </div>
            {getStatusBadge(claim.status_claim_merchandise)}
          </div>
          
          <div className="claim-info mb-3 flex-grow-1">
            <div className="info-item mb-2">
              <BsPersonFill className="info-icon me-2" />
              <div>
                <div className="info-label">Pembeli</div>
                <div className="info-value">{claim.Pembeli?.nama}</div>
                <small className="text-muted">{claim.Pembeli?.Akun?.email}</small>
              </div>
            </div>
            
            <div className="info-item mb-2">
              <BsBoxSeam className="info-icon me-2" />
              <div>
                <div className="info-label">Merchandise</div>
                <div className="info-value">{claim.Merchandise?.nama_merchandise}</div>
                <small className="text-muted">{claim.Merchandise?.harga_poin} poin</small>
              </div>
            </div>
            
            <div className="date-info mt-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Tanggal Claim:</span>
                <span>{formatDate(claim.tanggal_claim)}</span>
              </div>
              {claim.tanggal_ambil && (
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tanggal Ambil:</span>
                  <span>{formatDate(claim.tanggal_ambil)}</span>
                </div>
              )}
            </div>
          </div>
          
          {claim.status_claim_merchandise === 'Menunggu diambil' && (
            <Button
              variant="success"
              size="sm"
              className="complete-btn w-100"
              onClick={() => handleCompleteClaimConfirm(claim)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Memproses...
                </>
              ) : (
                <>
                  <BsCheckCircle className="me-2" />
                  Selesaikan Claim
                </>
              )}
            </Button>
          )}
        </Card.Body>
      </Card>
    );
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
        title="Konfirmasi Penyelesaian Claim"
        message={confirmMessage}
        confirmButtonText="Ya, Selesaikan"
        cancelButtonText="Batal"
        type={confirmType}
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
            <p className="page-subtitle">Kelola dan proses claim merchandise dari pembeli</p>
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
            <Row className="mb-4 align-items-center">
              <Col md={10}>
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
              <Col md={2} className="text-end">
                <Button
                  variant="outline-primary"
                  className="sort-button"
                  onClick={handleSortToggle}
                  title={`Urutkan berdasarkan tanggal (${sortOrder === 'asc' ? 'terlama' : 'terbaru'})`}
                >
                  <BsArrowDownUp className="me-1" />
                  {sortOrder === 'asc' ? 'Terlama' : 'Terbaru'}
                </Button>
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
                <p className="empty-text">
                  {selectedView === 'menunggu' 
                    ? 'Tidak ada claim merchandise yang menunggu diambil' 
                    : 'Tidak ada data claim merchandise yang ditemukan'
                  }
                </p>
              </div>
            ) : (
              <>
                <Row className="claims-grid">
                  {currentItems.map(claim => (
                    <Col xs={12} sm={6} lg={4} key={claim.id_claim_merchandise} className="mb-3">
                      <ClaimCard claim={claim} />
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
          border-radius: 25px;
          border: 2px solid #E7E7E7;
        }
        
        .search-input:focus {
          box-shadow: none;
          border-color: #028643;
        }
        
        .search-input::placeholder {
          color: #9ca3af;
        }
        
        .sort-button {
          height: 48px;
          border-radius: 25px;
          border: 2px solid #E7E7E7;
          color: #028643;
          font-size: 0.9rem;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sort-button:hover {
          background-color: #028643;
          color: white;
          border-color: #028643;
        }
        
        .sort-button svg {
          width: 16px;
          height: 16px;
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
        
        .claim-card {
          border: 1px solid #E7E7E7;
          border-radius: 12px;
          transition: all 0.3s ease;
          height: 100%;
        }
        
        .claim-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .claim-id {
          font-weight: 600;
          color: #03081F;
          font-size: 1rem;
        }
        
        .status-badge {
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          width: fit-content;
        }
        
        .claim-info {
          border-top: 1px solid #f8f9fa;
          border-bottom: 1px solid #f8f9fa;
          padding: 1rem 0;
        }
        
        .info-item {
          display: flex;
          align-items: flex-start;
        }
        
        .info-icon {
          color: #028643;
          font-size: 1.1rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .info-label {
          font-size: 0.75rem;
          color: #686868;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-size: 0.9rem;
          color: #03081F;
          font-weight: 500;
          margin-top: 2px;
        }
        
        .date-info {
          font-size: 0.85rem;
          background-color: #f8f9fa;
          padding: 0.75rem;
          border-radius: 8px;
        }
        
        .complete-btn {
          background-color: #028643;
          border-color: #028643;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .complete-btn:hover:not(:disabled) {
          background-color: #026d36;
          border-color: #026d36;
          transform: translateY(-1px);
        }
        
        .complete-btn:disabled {
          background-color: #6c757d;
          border-color: #6c757d;
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
          
          .sort-button {
            height: 44px;
            font-size: 0.85rem;
            padding: 0 0.75rem;
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
          
          .claim-card {
            margin-bottom: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .claims-grid > .col-12 {
            margin-bottom: 1rem;
          }
          
          .pagination-container {
            margin-top: 1.5rem;
          }
          
          .sort-button {
            width: 100%;
            margin-top: 0.5rem;
          }
          
          .status-badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
          }
          
          .info-value {
            font-size: 0.85rem;
          }
          
          .complete-btn {
            font-size: 0.85rem;
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default KelolaMerchandisePage;