import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { BsClock, BsEye, BsCalendarCheck, BsBoxArrowRight } from 'react-icons/bs';

const CardListPenitipan = ({ 
  penitipan, 
  onModal, 
  onPerpanjang,
  onAmbil,
  getStatusBadge,
  remainingDays
}) => {
  // Parse image URLs safely
  const getImageUrl = (imageString) => {
    if (!imageString) return null;
    try {
      return imageString.split(',')[0].trim();
    } catch (error) {
      console.error("Error parsing image string:", error);
      return null;
    }
  };

  // Get remaining days status and color
  const getRemainingDaysStatus = (days) => {
    if (days === null) return { text: 'Tidak tersedia', variant: 'secondary', icon: BsClock };
    if (days < 0) return { text: 'Sudah berakhir', variant: 'danger', icon: BsClock };
    if (days <= 7) return { text: `${days} hari lagi`, variant: 'warning', icon: BsClock };
    if (days <= 15) return { text: `${days} hari lagi`, variant: 'info', icon: BsClock };
    return { text: `${days} hari lagi`, variant: 'success', icon: BsCalendarCheck };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }) ;
  };

  const imageUrl = penitipan?.Barang?.gambar ? getImageUrl(penitipan.Barang.gambar) : null;
  const remainingStatus = getRemainingDaysStatus(remainingDays);
  const StatusIcon = remainingStatus.icon;

  return (
    <Card className="barang-card h-100 border-0 shadow-sm">
      <Card.Body className="p-3 d-flex flex-column">
        {/* Header Section */}
        <div className="card-header-section mb-3">
          <span className="barang-id fw-medium">#{penitipan.id_penitipan}</span>
          <div className="status-badge">
            {getStatusBadge(penitipan.status_penitipan)}
          </div>
        </div>
        
        {/* Image Section */}
        <div className="image-container mb-3">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={penitipan.Barang.nama} 
              className="barang-image"
              onError={(e) => {e.target.src = 'https://via.placeholder.com/200?text=No+Image'}}
            />
          ) : (
            <div className="no-image-placeholder">
              <BsBox size={40} className="text-muted opacity-50" />
              <span className="no-image-text">Tidak ada gambar</span>
            </div>
          )}
        </div>
        
        {/* Title Section */}
        <h5 className="barang-name mb-3 text-dark">{penitipan.Barang.nama}</h5>
        
        {/* Category Badge */}
        <div className="mb-3">
          <Badge bg="secondary">
            {penitipan.Barang.kategori_barang}
          </Badge>
        </div>
        
        {/* Info Section */}
        <div className="barang-details mb-3 flex-grow-1">
          <div className="info-row">
            <span className="info-label">Harga</span>
            <span className="info-value fw-bold text-success">
              Rp {parseFloat(penitipan.Barang.harga).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Tanggal Awal Penitipan</span>
            <span className="info-value fw-bold text-success">
              {formatDate(penitipan.tanggal_awal_penitipan)}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Tanggal Akhir Penitipan</span>
            <span className="info-value fw-bold text-success">
              {formatDate(penitipan.tanggal_akhir_penitipan)}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Tanggal Batas Pengambilan</span>
            <span className="info-value fw-bold text-success">
              {formatDate(penitipan.tanggal_batas_pengambilan)}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Perpanjangan</span>
            <span className="info-value">
              {penitipan?.perpanjangan !== undefined ? (
                penitipan.perpanjangan ? (
                  <Badge bg="success" className="ms-2">Ya</Badge>
                ) : (
                  <Badge bg="light" text="dark" className="ms-2">Tidak</Badge>
                )
              ) : (
                <Badge bg="light" text="dark" className="ms-2">Data tidak tersedia</Badge>
              )}
            </span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Garansi</span>
            <span className="info-value">
              {penitipan.Barang.garansi_berlaku ? (
                <Badge bg="success" className="small-badge">Ada</Badge>
              ) : (
                <Badge bg="light" text="dark" className="small-badge">Tidak ada</Badge>
              )}
            </span>
          </div>
        </div>
        
        {/* Remaining Days Section - Enhanced */}
        <div className="remaining-days-section mb-3">
          <div className={`remaining-days-card bg-${remainingStatus.variant}-subtle border-${remainingStatus.variant} border`}>
            <div className="d-flex align-items-center">
              <StatusIcon className={`me-2 text-${remainingStatus.variant}`} size={16} />
              <div className="flex-grow-1">
                <div className="remaining-label text-muted small">Sisa Masa Penitipan</div>
                <div className={`remaining-value fw-bold text-${remainingStatus.variant}`}>
                  {remainingStatus.text}
                </div>
              </div>
            </div>
          </div>
        </div>
        
       <div className="action-buttons mt-auto">
          <div className="button-row d-flex gap-2 mb-2">
            <Button 
              variant="outline-success" 
              size="sm"
              className="action-btn flex-fill"
              onClick={() => onModal(penitipan.id_penitipan)}
            >
              <BsEye className="me-1" size={14} />
              Detail Barang
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              className="action-btn flex-fill"
              onClick={() => onPerpanjang(penitipan.id_penitipan, penitipan.Barang.nama)}
              disabled={penitipan.status_penitipan === 'Menunggu diambil' || penitipan.status_penitipan === "Menunggu didonasikan"}
            >
              <BsClock className="me-1" size={14} />
              Perpanjang
            </Button>
          </div>
          <div className="button-row d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              className="action-btn flex-fill"
              onClick={() => onAmbil(penitipan.id_penitipan, penitipan.Barang.nama)}
              disabled={penitipan.status_penitipan === 'Menunggu diambil' || penitipan.status_penitipan === "Menunggu didonasikan"}
            >
              <BsBoxArrowRight className="me-1" size={14} />
              Ambil Penitipan
            </Button>
          </div>
        </div>
      </Card.Body>

      <style jsx>{`
        .barang-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e9ecef;
        }
        
        .barang-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
          border-color: #028643;
        }
        
        .card-header-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .barang-id {
          font-size: 0.9rem;
          color: #6c757d;
          background-color: #f8f9fa;
          padding: 3px 8px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
        }
        
        .status-badge .badge {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 8px;
        }
        
        .image-container {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(145deg, #f8f9fa, #e9ecef);
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .barang-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 6px;
        }
        
        .no-image-placeholder {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .no-image-text {
          font-size: 0.8rem;
          color: #6c757d;
        }
        
        .barang-name {
          font-weight: 600;
          font-size: 1.1rem;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 2.6rem;
        }
        
        .kategori-badge {
          background-color: #e3f2fd;
          color: #1B5E20; /* Changed text color to dark green */
          font-weight: 500;
          font-size: 0.75rem;
          padding: 6px 12px;
          border-radius: 20px;
          border: none;
        }
        
        .barang-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 4px 0;
        }
        
        .info-label {
          font-size: 0.85rem;
          color: #6c757d;
          font-weight: 500;
          flex: 0 0 40%;
        }
        
        .info-value {
          font-size: 0.85rem;
          color: #495057;
          font-weight: 600;
          flex: 1; /* Ambil sisa ruang */
          word-break: break-word;
          text-align: right;
        }
        
        .small-badge {
          font-size: 0.7rem;
          padding: 3px 8px;
        }
        
        .remaining-days-section {
          margin-top: auto;
        }
        
        .remaining-days-card {
          padding: 12px;
          border-radius: 8px;
          margin: 0;
        }
        
        .remaining-label {
          font-size: 0.75rem;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .remaining-value {
          font-size: 0.9rem;
          line-height: 1.2;
        }
        
        /* Bootstrap color variants for remaining days */
        .bg-success-subtle {
          background-color: #d1e7dd;
        }
        
        .bg-warning-subtle {
          background-color: #fff3cd;
        }
        
        .bg-danger-subtle {
          background-color: #f8d7da;
        }
        
        .bg-info-subtle {
          background-color: #d1ecf1;
        }
        
        .bg-secondary-subtle {
          background-color: #e2e3e5;
        }
        
        .border-success {
          border-color: #198754 !important;
        }
        
        .border-warning {
          border-color: #ffc107 !important;
        }
        
        .border-danger {
          border-color: #dc3545 !important;
        }
        
        .border-info {
          border-color: #0dcaf0 !important;
        }
        
        .border-secondary {
          border-color: #6c757d !important;
        }
        
        .action-buttons {
          gap: 6px;
        }
        
        .action-btn {
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 6px 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          border-width: 1.5px;
        }
        
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .btn-outline-success:hover {
          background-color: #028643;
          border-color: #028643;
        }
        
        .btn-outline-primary:hover {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        
        .btn-outline-danger:hover {
          background-color: #dc3545;
          border-color: #dc3545;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .image-container {
            height: 160px;
          }
          
          .barang-name {
            font-size: 1rem;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .action-btn {
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 576px) {
          .card-header-section {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
          
          .status-badge {
            align-self: flex-end;
          }
        }
      `}</style>
    </Card>
  );
};

export default CardListPenitipan;