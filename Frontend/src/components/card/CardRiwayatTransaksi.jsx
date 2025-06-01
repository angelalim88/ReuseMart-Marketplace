import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { FaStar, FaReceipt, FaCalendarAlt } from 'react-icons/fa';

const CardRiwayatTransaksi = ({ 
  transaction, 
  handleViewDetails, 
  handleRatingClick, 
  generateNotaNumber, 
  formatDate, 
  formatCurrency, 
  getStatusBadgeColor, 
  canBeRated 
}) => {
  console.log("Rendering CardRiwayatTransaksi for:", transaction);

  const getStatusColor = (status) => {
    const colors = {
      'completed': '#028643',
      'pending': '#FFA500',
      'cancelled': '#FF1700',
      'processing': '#007bff'
    };
    return colors[status?.toLowerCase()] || '#6c757d';
  };

  const transactionId = transaction.pembelian?.id_pembelian || 'N/A';
  const status = transaction.pembelian?.status_pembelian || 'Unknown';
  const notaNumber = generateNotaNumber ? generateNotaNumber(transaction) : 'N/A';
  const transactionDate = transaction.pembelian?.tanggal_pembelian 
    ? (formatDate ? formatDate(transaction.pembelian.tanggal_pembelian) : new Date(transaction.pembelian.tanggal_pembelian).toLocaleDateString('id-ID'))
    : '-';
  const totalAmount = transaction.pembelian?.total_bayar || 0;
  const formattedTotal = formatCurrency ? formatCurrency(totalAmount) : `Rp ${totalAmount.toLocaleString('id-ID')}`;
  const productCount = transaction.barang?.length || 0;
  const productNames = transaction.barang?.slice(0, 2).map(item => item.nama).join(', ') || '';
  const additionalProducts = transaction.barang?.length > 2 ? ` +${transaction.barang.length - 2} lainnya` : '';
  const hasExistingReview = transaction.existing_review;
  const canRate = canBeRated ? canBeRated(transaction) : false;

  console.log("Transaction Status:", status);
  console.log("Can be rated:", canRate);
  console.log("Has existing review:", hasExistingReview);

  return (
    <Card className="mb-3 border transaction-card">
      <Card.Body className="p-3">
        <Row className="align-items-center">
          <Col xs={12} md={9}>
            <div className="mb-1">
              <span className="transaction-id">#{transactionId}</span>
              <span className="badge bg-light text-dark ms-2 status-badge">
                {status}
              </span>
              {hasExistingReview && (
                <span className="badge bg-light text-dark ms-2 rating-badge">
                  <FaStar className="me-1" style={{ color: '#FFA500' }} />
                  {hasExistingReview.rating}/5
                </span>
              )}
            </div>
            <h5 className="transaction-title mb-2">
              Transaksi {transactionDate}
            </h5>
            <div className="mb-1">
              <span className="text-muted">No. Nota: </span>
              <span>{notaNumber}</span>
            </div>
            <div className="mb-1">
              <span className="text-muted">
                <FaCalendarAlt className="me-1" />
                Tanggal: 
              </span>
              <span className="ms-1">{transactionDate}</span>
            </div>
            <div className="mb-1">
              <span className="text-muted">Produk ({productCount}): </span>
              <span>{productNames}{additionalProducts}</span>
            </div>
            <div className="mb-0">
              <span className="text-muted">Total: </span>
              <span className="transaction-total">{formattedTotal}</span>
            </div>
          </Col>
          <Col xs={12} md={3} className="d-flex justify-content-center justify-content-md-end mt-3 mt-md-0">
            <div className="transaction-icon-container">
              <div className="transaction-icon">
                <FaReceipt size={32} color="#686868" />
              </div>
            </div>
          </Col>
        </Row>
        <div className="button-container mt-3 d-flex justify-content-end">
          <Button 
            variant="primary" 
            className="detail-btn me-2"
            onClick={() => {
              console.log("View Details Clicked for:", transaction);
              handleViewDetails && handleViewDetails(transaction);
            }}
          >
            <FaReceipt className="me-1" />
            Lihat Detail
          </Button>
          {canRate ? (
            <Button 
              variant="warning"
              className="rating-btn"
              onClick={() => {
                console.log("Rating Clicked for:", transaction);
                handleRatingClick && handleRatingClick(transaction);
              }}
            >
              <FaStar className="me-1" />
              Beri Rating
            </Button>
          ) : hasExistingReview ? (
            <Button 
              variant="success"
              className="rated-btn"
              disabled
            >
              <FaStar className="me-1" />
              Sudah Dirating
            </Button>
          ) : null}
        </div>
      </Card.Body>

      <style jsx>{`
        .transaction-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .transaction-id {
          color: #686868;
          font-size: 0.9rem;
        }
        
        .status-badge {
          font-size: 0.75rem;
          background-color: #f0f0f0;
          color: #686868;
          font-weight: 500;
        }
        
        .rating-badge {
          font-size: 0.75rem;
          background-color: #fff3cd;
          color: #856404;
          font-weight: 500;
        }
        
        .transaction-title {
          color: #03081F;
          font-weight: 600;
        }
        
        .transaction-total {
          color: #028643;
          font-weight: 600;
        }
        
        .transaction-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .transaction-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e9ecef;
        }
        
        .detail-btn {
          background-color: #007bff;
          border-color: #007bff;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .detail-btn:hover {
          background-color: #0056b3;
          border-color: #0056b3;
        }
        
        .rating-btn {
          background-color: #FFA500;
          border-color: #FFA500;
          font-weight: 500;
          border-radius: 4px;
          color: #fff;
        }
        
        .rating-btn:hover {
          background-color: #e6940a;
          border-color: #e6940a;
        }
        
        .rated-btn {
          background-color: #028643;
          border-color: #028643;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .rated-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
        }
        
        @media (max-width: 768px) {
          .transaction-icon {
            width: 60px;
            height: 60px;
            margin-top: 10px;
          }
          
          .button-container {
            flex-direction: column;
            gap: 8px;
          }
          
          .detail-btn, .rating-btn, .rated-btn {
            width: 100%;
            margin-right: 0 !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default CardRiwayatTransaksi;