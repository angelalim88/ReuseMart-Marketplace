import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { BsCalendar, BsPerson, BsGift, BsInfoCircle, BsPhone, BsEnvelope, BsClock, BsStarFill } from 'react-icons/bs';

const ClaimMerchandiseCard = ({ claim, onViewDetail }) => {
  const merchandise = claim.Merchandise || {};
  const pembeli = claim.Pembeli || {};
  const akun = pembeli.Akun || {};

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu diambil':
        return <Badge bg="warning" text="dark" className="status-badge">Menunggu Diambil</Badge>;
      case 'Diproses':
        return <Badge bg="info" className="status-badge">Diproses</Badge>;
      case 'Selesai':
        return <Badge bg="success" className="status-badge">Selesai</Badge>;
      default:
        return <Badge bg="secondary" className="status-badge">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="claim-card">
        <Card.Body className="p-3">
          {/* Header Section with Priority Indicator */}
          <div className="card-header-section">
            <div className="merchandise-info">
              <div className="merchandise-image-thumb">
                {merchandise.gambar ? (
                  <img 
                    src={merchandise.gambar.split(',')[0]} 
                    alt={merchandise.nama_merchandise}
                    className="thumb-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="no-image-thumb" style={{ display: merchandise.gambar ? 'none' : 'flex' }}>
                  <BsGift size={20} color="#D9D9D9" />
                </div>
              </div>
              
              <div className="merchandise-details">
                <h6 className="merchandise-name">{merchandise.nama_merchandise || 'Merchandise Tidak Diketahui'}</h6>
                <small className="claim-id">ID: {claim.id_claim_merchandise}</small>
              </div>
            </div>
            
            <div className="status-section">
              {getStatusBadge(claim.status_claim_merchandise)}
            </div>
          </div>

          {/* Enhanced Info Section */}
          <div className="claim-info-section">
            <div className="customer-info">
              <div className="info-item">
                <BsPerson size={12} className="info-icon" />
                <span className="info-text">{pembeli.nama || 'Tidak Diketahui'}</span>
              </div>
              
              {pembeli.nomor_telepon && (
                <div className="info-item">
                  <BsPhone size={12} className="info-icon" />
                  <span className="info-text">{pembeli.nomor_telepon}</span>
                </div>
              )}
            </div>

            <div className="claim-details">
              <div className="info-item">
                <BsCalendar size={12} className="info-icon" />
                <span className="info-text">{formatDate(claim.tanggal_claim)}</span>
              </div>
              
              <div className="info-item">
                <BsClock size={12} className="info-icon" />
                <span className="info-text">{formatDateTime(claim.tanggal_ambil)}</span>
              </div>
            </div>

            {/* Points and Additional Info */}
            <div className="additional-info">
              <div className="poin-info">
                <span className="poin-label">Poin:</span>
                <span className="poin-value">{merchandise.harga_poin || 0}</span>
              </div>
              
              {claim.catatan && (
                <div className="note-info">
                  <span className="note-label">Catatan:</span>
                  <span className="note-text">{claim.catatan}</span>
                </div>
              )}
              
              {claim.alamat_pengambilan && (
                <div className="address-info">
                  <span className="address-label">Lokasi:</span>
                  <span className="address-text truncate">{claim.alamat_pengambilan}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="action-section">
            <Button 
              variant="outline-success" 
              size="sm" 
              className="detail-btn"
              onClick={() => onViewDetail(claim.id_claim_merchandise)}
            >
              <BsInfoCircle size={12} className="me-1" />
              Lihat Detail
            </Button>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .claim-card {
          border-radius: 16px;
          border: 1px solid #E7E7E7;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          height: 100%;
          min-height: 220px;
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
          position: relative;
          overflow: hidden;
        }
        
        .claim-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(2, 134, 67, 0.15);
          border-color: #028643;
        }
        
        .claim-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #028643, #26a69a);
        }
        
        .card-header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .merchandise-info {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        
        .merchandise-image-thumb {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #E7E7E7;
        }
        
        .thumb-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .no-image-thumb {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .merchandise-details {
          flex: 1;
          min-width: 0;
        }
        
        .merchandise-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #03081F;
          margin: 0 0 4px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.3;
        }
        
        .claim-id {
          color: #686868;
          font-size: 0.75rem;
          font-weight: 500;
          display: block;
          margin-bottom: 4px;
        }
        
        .priority-indicator {
          display: flex;
          align-items: center;
          font-size: 0.7rem;
          font-weight: 600;
          margin-top: 2px;
        }
        
        .priority-text {
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-section {
          flex-shrink: 0;
        }
        
        .status-badge {
          font-size: 0.7rem;
          padding: 5px 10px;
          border-radius: 8px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        
        .claim-info-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .customer-info,
        .claim-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
        }
        
        .info-icon {
          color: #028643;
          flex-shrink: 0;
        }
        
        .info-text {
          color: #333;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .truncate {
          max-width: 120px;
        }
        
        .additional-info {
          background: linear-gradient(135deg, #f8f9fa, #ffffff);
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #E7E7E7;
        }
        
        .poin-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        
        .poin-label {
          color: #686868;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .poin-value {
          color: #028643;
          font-weight: 700;
          font-size: 0.85rem;
        }
        
        .note-info,
        .address-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 6px;
        }
        
        .note-info:last-child,
        .address-info:last-child {
          margin-bottom: 0;
        }
        
        .note-label,
        .address-label {
          color: #686868;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .note-text,
        .address-text {
          color: #333;
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1.3;
        }
        
        .action-section {
          margin-top: auto;
        }
        
        .detail-btn {
          width: 100%;
          border-color: #028643;
          color: #028643;
          font-size: 0.8rem;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 600;
          border-width: 2px;
          transition: all 0.2s ease;
        }
        
        .detail-btn:hover {
          background: linear-gradient(135deg, #028643, #026d36);
          color: white;
          border-color: #028643;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(2, 134, 67, 0.3);
        }
        
        .detail-btn:active {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .claim-card {
            min-height: 200px;
          }
          
          .merchandise-image-thumb {
            width: 40px;
            height: 40px;
          }
          
          .merchandise-name {
            font-size: 0.9rem;
          }
          
          .claim-info-section {
            gap: 10px;
          }
          
          .info-item {
            font-size: 0.75rem;
          }
          
          .truncate {
            max-width: 100px;
          }
          
          .additional-info {
            padding: 8px;
          }
        }
        
        @media (max-width: 576px) {
          .claim-card {
            min-height: 180px;
          }
          
          .card-header-section {
            margin-bottom: 12px;
          }
          
          .claim-info-section {
            gap: 8px;
            margin-bottom: 12px;
          }
          
          .merchandise-name {
            font-size: 0.85rem;
          }
          
          .detail-btn {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default ClaimMerchandiseCard;