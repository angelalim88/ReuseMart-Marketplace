import React from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { FaStar, FaReceipt, FaCalendarAlt, FaStarHalfAlt, FaRegStar, FaEdit, FaCheck, FaClock, FaLock } from 'react-icons/fa';

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
  
  // Fixed review checking logic - sesuai dengan struktur backend
  const hasExistingReview = transaction.existing_review && 
                           transaction.existing_review.id_review && 
                           transaction.existing_review.rating;
  const canRate = canBeRated ? canBeRated(transaction) : false;
  const reviewRating = hasExistingReview ? transaction.existing_review.rating : 0;
  const reviewDate = hasExistingReview && transaction.existing_review.tanggal_review 
                     ? new Date(transaction.existing_review.tanggal_review).toLocaleDateString('id-ID') 
                     : null;

  console.log("Transaction Status:", status);
  console.log("Can be rated:", canRate);
  console.log("Has existing review:", hasExistingReview);
  console.log("Review data:", transaction.existing_review);

  // Render stars for rating display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="star-icon filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-icon empty" />);
      }
    }
    return stars;
  };

  // Fixed review status determination
  const getReviewStatus = () => {
    // Jika sudah ada review (berdasarkan id_review dan rating)
    if (hasExistingReview) {
      return {
        type: 'completed',
        hasReview: true,
        canGiveRating: false,
        canEditRating: false, // Disable edit untuk sekali review saja
        buttonText: `Sudah Dirating (${reviewRating}/5)`,
        buttonVariant: 'success', 
        buttonIcon: FaCheck,
        disabled: true, // Button di-disable setelah review
        badge: {
          text: `Rated ${reviewRating}/5`,
          variant: 'success',
          icon: FaStar
        }
      };
    } 
    // Jika dapat memberikan rating dan belum pernah review
    else if (canRate) {
      return {
        type: 'can_rate',
        hasReview: false,
        canGiveRating: true,
        canEditRating: false,
        buttonText: 'Beri Rating',
        buttonVariant: 'warning',
        buttonIcon: FaStar,
        disabled: false,
        badge: {
          text: 'Dapat Dirating',
          variant: 'info',
          icon: FaClock
        }
      };
    } 
    // Jika belum dapat memberikan rating
    else {
      return {
        type: 'cannot_rate',
        hasReview: false,
        canGiveRating: false,
        canEditRating: false,
        buttonText: 'Belum Dapat Dirating',
        buttonVariant: 'secondary',
        buttonIcon: FaLock,
        disabled: true,
        badge: {
          text: 'Belum Dapat Dirating',
          variant: 'secondary',
          icon: FaLock
        }
      };
    }
  };

  const reviewStatus = getReviewStatus();

  return (
    <Card className="mb-3 border transaction-card">
      <Card.Body className="p-3">
        <Row className="align-items-center">
          <Col xs={12} md={9}>
            <div className="mb-2">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="transaction-id">#{transactionId}</span>
                <Badge 
                  bg="light" 
                  text="dark" 
                  className="status-badge"
                >
                  {status}
                </Badge>
                
                {/* Enhanced Review Status Badge */}
                <Badge 
                  bg={reviewStatus.badge.variant} 
                  className={`review-badge d-flex align-items-center ${reviewStatus.type}`}
                >
                  <reviewStatus.badge.icon className="me-1" style={{ fontSize: '0.75rem' }} />
                  {reviewStatus.badge.text}
                </Badge>
              </div>
            </div>

            <h5 className="transaction-title mb-2">
              Transaksi {transactionDate}
            </h5>

            {/* Transaction Details */}
            <div className="transaction-details">
              <div className="detail-row mb-1">
                <span className="detail-label">No. Nota:</span>
                <span className="detail-value">{notaNumber}</span>
              </div>
              <div className="detail-row mb-1">
                <span className="detail-label">
                  <FaCalendarAlt className="me-1" />
                  Tanggal:
                </span>
                <span className="detail-value">{transactionDate}</span>
              </div>
              <div className="detail-row mb-1">
                <span className="detail-label">Produk ({productCount}):</span>
                <span className="detail-value">{productNames}{additionalProducts}</span>
              </div>
              <div className="detail-row mb-2">
                <span className="detail-label">Total:</span>
                <span className="detail-value transaction-total">{formattedTotal}</span>
              </div>

              {/* Enhanced Review Display - Show only when review exists */}
              {reviewStatus.hasReview && (
                <div className="review-section p-2 mb-2 bg-light rounded">
                  <div className="detail-row mb-1">
                    <span className="detail-label">
                      <FaStar className="me-1 text-warning" />
                      Rating Anda:
                    </span>
                    <div className="detail-value d-flex align-items-center">
                      <div className="rating-stars me-2">
                        {renderStars(reviewRating)}
                      </div>
                      <span className="rating-text">({reviewRating}/5)</span>
                    </div>
                  </div>
                  {reviewDate && (
                    <div className="detail-row">
                      <span className="detail-label">Tanggal Review:</span>
                      <span className="detail-value review-date">{reviewDate}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Col>

          <Col xs={12} md={3} className="d-flex justify-content-center justify-content-md-end mt-3 mt-md-0">
            <div className="transaction-icon-container">
              <div className={`transaction-icon ${reviewStatus.type}`}>
                <FaReceipt size={32} color="#686868" />
                {reviewStatus.hasReview && (
                  <div className="review-indicator">
                    <FaStar size={16} color="#FFA500" />
                  </div>
                )}
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
          
          <Button 
            variant={reviewStatus.buttonVariant}
            className={`rating-btn ${reviewStatus.type} ${reviewStatus.hasReview ? 'rated-btn' : ''}`}
            disabled={reviewStatus.disabled}
            onClick={() => {
              if (!reviewStatus.disabled && reviewStatus.canGiveRating) {
                console.log("Rating Clicked for:", transaction);
                handleRatingClick && handleRatingClick(transaction, false); // Always false since no editing allowed
              }
            }}
          >
            <reviewStatus.buttonIcon className="me-1" />
            {reviewStatus.buttonText}
          </Button>
        </div>
      </Card.Body>

      <style jsx>{`
        .transaction-card {
          border-radius: 12px;
          border-color: #E7E7E7;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          background: #fff;
          position: relative;
          overflow: hidden;
        }
        
        .transaction-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        
        .transaction-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #028643, #66bb6a);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .transaction-card:hover::before {
          opacity: 1;
        }
        
        .transaction-id {
          color: #686868;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .status-badge {
          font-size: 0.75rem;
          background-color: #f8f9fa !important;
          color: #495057 !important;
          font-weight: 500;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
        }
        
        .review-badge {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .review-badge.completed {
          background: linear-gradient(135deg, #028643, #66bb6a);
          color: white;
          animation: pulse 2s infinite;
        }
        
        .review-badge.can_rate {
          background: linear-gradient(135deg, #17a2b8, #5bc0de);
          color: white;
        }
        
        .review-badge.cannot_rate {
          background: #6c757d;
          color: white;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .transaction-title {
          color: #03081F;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .transaction-details {
          color: #495057;
        }
        
        .review-section {
          border-left: 4px solid #28a745;
          background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%) !important;
        }
        
        .detail-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .detail-label {
          color: #6c757d;
          font-size: 0.9rem;
          min-width: fit-content;
          margin-right: 0.5rem;
          font-weight: 500;
        }
        
        .detail-value {
          font-weight: 500;
          flex: 1;
        }
        
        .transaction-total {
          color: #028643;
          font-weight: 700;
          font-size: 1.05rem;
        }
        
        .rating-stars {
          display: flex;
          gap: 2px;
        }
        
        .star-icon {
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        
        .star-icon.filled {
          color: #FFA500;
          text-shadow: 0 0 4px rgba(255, 165, 0, 0.3);
        }
        
        .star-icon.empty {
          color: #e0e0e0;
        }
        
        .rating-text {
          font-size: 0.9rem;
          color: #495057;
          font-weight: 600;
        }
        
        .review-date {
          color: #6c757d;
          font-size: 0.85rem;
          font-style: italic;
        }
        
        .transaction-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .transaction-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .transaction-icon.completed {
          border-color: #028643;
          background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
        }
        
        .transaction-icon.can_rate {
          border-color: #17a2b8;
          background: linear-gradient(135deg, #e1f7fa 0%, #bee5eb 100%);
        }
        
        .transaction-card:hover .transaction-icon {
          transform: scale(1.05);
        }
        
        .transaction-icon.completed:hover {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        }
        
        .review-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 24px;
          height: 24px;
          background: #FFA500;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .button-container {
          gap: 0.5rem;
        }
        
        .detail-btn {
          background-color: #007bff;
          border-color: #007bff;
          font-weight: 500;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }
        
        .detail-btn:hover {
          background-color: #0056b3;
          border-color: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,123,255,0.3);
        }
        
        .rating-btn {
          font-weight: 500;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          min-width: 180px;
          position: relative;
        }
        
        .rating-btn:not(:disabled):hover {
          transform: translateY(-1px);
        }
        
        .rating-btn.can_rate {
          background: linear-gradient(135deg, #FFA500, #FFB84D);
          border-color: #FFA500;
          color: #fff;
        }
        
        .rating-btn.can_rate:hover {
          background: linear-gradient(135deg, #e6940a, #e6a429);
          border-color: #e6940a;
          box-shadow: 0 4px 12px rgba(255,165,0,0.4);
        }
        
        .rating-btn.completed {
          background: linear-gradient(135deg, #28a745, #34ce57);
          border-color: #28a745;
          color: white;
          cursor: not-allowed;
        }
        
        .rating-btn.completed:disabled {
          background: linear-gradient(135deg, #28a745, #34ce57);
          border-color: #28a745;
          opacity: 0.8;
        }
        
        .rating-btn.cannot_rate {
          background-color: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .rating-btn:disabled {
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .transaction-icon {
            width: 60px;
            height: 60px;
            margin-top: 10px;
          }
          
          .review-indicator {
            width: 20px;
            height: 20px;
            top: -1px;
            right: -1px;
          }
          
          .button-container {
            flex-direction: column;
            gap: 8px;
          }
          
          .detail-btn, .rating-btn {
            width: 100%;
            margin-right: 0 !important;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .detail-label {
            margin-bottom: 0.25rem;
          }
          
          .rating-stars {
            margin-bottom: 0.25rem;
          }
        }
        
        @media (max-width: 576px) {
          .review-badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
          }
          
          .transaction-title {
            font-size: 1rem;
          }
          
          .detail-label, .detail-value {
            font-size: 0.85rem;
          }
          
          .rating-btn {
            min-width: 160px;
          }
        }
      `}</style>
    </Card>
  );
};

export default CardRiwayatTransaksi;