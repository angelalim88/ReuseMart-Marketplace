import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { BsGift } from 'react-icons/bs';

const ClaimMerchandiseModal = ({ show, onHide, selectedClaim }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu Diambil':
        return <Badge bg="warning" text="dark">Menunggu Diambil</Badge>;
      case 'Diproses':
        return <Badge bg="info">Diproses</Badge>;
      case 'Selesai':
        return <Badge bg="success">Selesai</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (!selectedClaim) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">Detail Claim Merchandise</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Row>
            <Col lg={5}>
              <div className="detail-image-container">
                {selectedClaim.Merchandise?.gambar ? (
                  <img 
                    src={selectedClaim.Merchandise.gambar.split(',')[0]} 
                    alt={selectedClaim.Merchandise.nama_merchandise}
                    className="detail-merchandise-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="no-image-placeholder-detail" style={{ display: selectedClaim.Merchandise?.gambar ? 'none' : 'flex' }}>
                  <BsGift size={60} color="#D9D9D9" />
                </div>
              </div>
            </Col>
            
            <Col lg={7}>
              <div className="detail-info">
                <div className="merchandise-header">
                  <h4 className="merchandise-title">{selectedClaim.Merchandise?.nama_merchandise}</h4>
                  <div className="status-section">
                    {getStatusBadge(selectedClaim.status_claim_merchandise)}
                  </div>
                </div>
                
                <div className="info-sections">
                  <div className="info-section">
                    <h6 className="section-title">
                      <span className="section-icon">🎁</span>
                      Informasi Merchandise
                    </h6>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="info-label">Harga Poin:</span>
                        <span className="info-value poin-highlight">{selectedClaim.Merchandise?.harga_poin || 0} poin</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Stok:</span>
                        <span className="info-value">{selectedClaim.Merchandise?.stok_merchandise || 0}</span>
                      </div>
                      <div className="info-row full-width">
                        <span className="info-label">Deskripsi:</span>
                        <span className="info-value description">{selectedClaim.Merchandise?.deskripsi || 'Tidak ada deskripsi'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-section">
                    <h6 className="section-title">
                      <span className="section-icon">👤</span>
                      Informasi Pembeli
                    </h6>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="info-label">Nama:</span>
                        <span className="info-value">{selectedClaim.Pembeli?.nama}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{selectedClaim.Pembeli?.Akun?.email}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Total Poin:</span>
                        <span className="info-value poin-highlight">{selectedClaim.Pembeli?.total_poin || 0} poin</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Tanggal Registrasi:</span>
                        <span className="info-value">{formatDate(selectedClaim.Pembeli?.tanggal_registrasi)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-section">
                    <h6 className="section-title">
                      <span className="section-icon">📋</span>
                      Informasi Claim
                    </h6>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="info-label">ID Claim:</span>
                        <span className="info-value claim-id">{selectedClaim.id_claim_merchandise}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Tanggal Claim:</span>
                        <span className="info-value">{formatDate(selectedClaim.tanggal_claim)}</span>
                      </div>
                      {selectedClaim.tanggal_ambil && (
                        <div className="info-row">
                          <span className="info-label">Tanggal Ambil:</span>
                          <span className="info-value">{formatDate(selectedClaim.tanggal_ambil)}</span>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="info-label">Status:</span>
                        <span className="info-value">{selectedClaim.status_claim_merchandise}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={onHide} className="close-btn">
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .modal-header-custom {
          background: linear-gradient(135deg, #028643 0%, #026d36 100%);
          color: white;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
        }
        
        .modal-title-custom {
          font-weight: 600;
          font-size: 1.25rem;
        }
        
        .modal-body-custom {
          padding: 2rem;
          background-color: #fafbfc;
        }
        
        .modal-footer-custom {
          background-color: #fafbfc;
          border-top: 1px solid #e9ecef;
          padding: 1rem 2rem;
        }
        
        .detail-image-container {
          height: 280px;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .detail-merchandise-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .no-image-placeholder-detail {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .merchandise-header {
          margin-bottom: 1.5rem;
        }
        
        .merchandise-title {
          color: #03081F;
          font-weight: 700;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        
        .status-section {
          margin-top: 0.5rem;
        }
        
        .info-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .info-section {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-left: 4px solid #028643;
        }
        
        .section-title {
          color: #028643;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-icon {
          font-size: 1.1rem;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        
        .info-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .info-row.full-width {
          grid-column: span 2;
        }
        
        .info-label {
          font-size: 0.85rem;
          color: #686868;
          font-weight: 500;
        }
        
        .info-value {
          font-size: 0.9rem;
          color: #333;
          font-weight: 400;
          line-height: 1.4;
        }
        
        .info-value.description {
          word-wrap: break-word;
          line-height: 1.5;
        }
        
        .poin-highlight {
          color: #028643 !important;
          font-weight: 600 !important;
        }
        
        .claim-id {
          font-family: 'Courier New', monospace;
          background-color: #f8f9fa;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85rem !important;
        }
        
        .close-btn {
          background-color: #6c757d;
          border-color: #6c757d;
          font-weight: 500;
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
        }
        
        .close-btn:hover {
          background-color: #5a6268;
          border-color: #545b62;
        }
        
        @media (max-width: 992px) {
          .detail-image-container {
            height: 220px;
            margin-bottom: 1.5rem;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .info-row.full-width {
            grid-column: span 1;
          }
          
          .modal-body-custom {
            padding: 1.5rem;
          }
          
          .merchandise-title {
            font-size: 1.25rem;
          }
        }
        
        @media (max-width: 576px) {
          .modal-body-custom {
            padding: 1rem;
          }
          
          .info-section {
            padding: 1rem;
          }
          
          .detail-image-container {
            height: 180px;
          }
        }
      `}</style>
    </>
  );
};

export default ClaimMerchandiseModal;