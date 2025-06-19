import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { BsInfoCircle, BsPersonFill, BsBoxSeam, BsCheckCircle, BsClock } from 'react-icons/bs';

const ClaimMerchandiseCard = ({ claim, onViewDetail }) => {
  const merchandise = claim.Merchandise || {};
  const pembeli = claim.Pembeli || {};
  const akun = pembeli.Akun || {};

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

  const baseUrl = 'http://localhost:3000/uploads/merchandise/';

  return (
    <>
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
                <div className="info-value">{pembeli.nama || '-'}</div>
                <small className="text-muted">{akun.email || '-'}</small>
              </div>
            </div>
            
            <div className="info-item mb-2">
              <BsBoxSeam className="info-icon me-2" />
              <div>
                <div className="info-label">Merchandise</div>
                <div className="info-value">{merchandise.nama_merchandise || '-'}</div>
                <small className="text-muted">{merchandise.harga_poin || 0} poin</small>
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
              {claim.catatan && (
                <div className="mt-2">
                  <span className="text-muted">Catatan:</span>
                  <div className="info-value">{claim.catatan}</div>
                </div>
              )}
              {claim.alamat_pengambilan && (
                <div className="mt-2">
                  <span className="text-muted">Lokasi:</span>
                  <div className="info-value">{claim.alamat_pengambilan}</div>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="outline-primary"
            className="lihat-detail-btn w-100"
            onClick={() => onViewDetail(claim.id_claim_merchandise)}
          >
            <BsInfoCircle className="me-2" />
            Lihat Detail
          </Button>
        </Card.Body>
      </Card>

      <style jsx>{`
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
        
        .status-badge svg {
          width: 12px;
          height: 12px;
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
        
        .date-info .text-muted {
          font-size: 0.85rem;
        }
        
        .date-info .info-value {
          font-size: 0.85rem;
          font-weight: 400;
        }
        
        .lihat-detail-btn {
          border-color: #028643;
          color: #028643;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .lihat-detail-btn:hover {
          background-color: #028643;
          color: white;
          border-color: #028643;
          transform: translateY(-1px);
        }
        
        .lihat-detail-btn svg {
          width: 16px;
          height: 16px;
        }
        
        @media (max-width: 768px) {
          .claim-card {
            margin-bottom: 1rem;
          }
          
          .status-badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
          }
          
          .info-value {
            font-size: 0.85rem;
          }
          
          .lihat-detail-btn {
            font-size: 0.85rem;
            padding: 0.5rem 0.75rem;
          }
        }
        
        @media (max-width: 576px) {
          .status-badge {
            font-size: 0.65rem;
            padding: 0.2rem 0.4rem;
          }
          
          .status-badge svg {
            width: 10px;
            height: 10px;
          }
          
          .info-label {
            font-size: 0.7rem;
          }
          
          .info-value {
            font-size: 0.8rem;
          }
          
          .date-info {
            font-size: 0.8rem;
          }
          
          .lihat-detail-btn {
            font-size: 0.8rem;
            padding: 0.4rem 0.6rem;
          }
          
          .lihat-detail-btn svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default ClaimMerchandiseCard;