import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';

const CardTransaksi = ({ transaksi, handleLihatDetail }) => {
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return dateString ? new Date(dateString).toLocaleDateString('id-ID', options) : '-';
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu diambil pembeli':
        return <Badge bg="warning">Menunggu Diambil</Badge>;
      case 'Diproses':
        return <Badge bg="info">Diproses</Badge>;
      case 'Transaksi selesai':
        return <Badge bg="success">Selesai</Badge>;
      case 'Hangus':
        return <Badge bg="danger">Hangus</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const baseUrl = 'http://localhost:3000/uploads/barang/';

  return (
    <>
      <Card className="transaksi-card h-100">
        <Card.Body>
          <div className="row mb-3">
            <div className="col-6 transaksi-info">
              <small className="text-muted transaksi-id">{transaksi.id_pembelian}</small>
              <div className="status-badge mt-1">{getStatusBadge(transaksi.pengiriman?.status_pengiriman)}</div>
            </div>
            <div className="col-6 text-end date-info">
              <div className="text-muted small">Tanggal Pembelian</div>
              <div className="fw-medium" style={{ fontSize: '0.75rem' }}>
                {formatDate(transaksi.tanggal_pembelian)}
              </div>
            </div>
          </div>

          <div className="barang-info-container mb-3">
            <div className="d-flex align-items-center">
              {transaksi.barang?.[0]?.gambar ? (
                <div className="me-3" style={{ width: '60px', height: '60px', overflow: 'hidden' }}>
                  <img
                    src={`${baseUrl}${transaksi.barang[0].gambar.split(',')[0]}`}
                    alt={transaksi.barang[0].nama}
                    className="barang-image rounded"
                  />
                </div>
              ) : (
                <div
                  className="me-3 no-image-placeholder rounded"
                  style={{ width: '60px', height: '60px' }}
                >
                  <span className="text-muted">No Image</span>
                </div>
              )}
              <div>
                <h6 className="barang-name mb-1">{transaksi.barang?.[0]?.nama || '-'}</h6>
                <small className="text-muted">
                  {transaksi.barang?.length > 1
                    ? `${transaksi.barang.length} barang`
                    : transaksi.barang?.[0]?.id_barang || '-'}
                </small>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <div>
              <div className="text-muted small">Pembeli</div>
              <div className="fw-medium">{transaksi.Pembeli?.nama || '-'}</div>
            </div>
            <div className="text-end">
              <div className="text-muted small">Total Bayar</div>
              <div className="fw-bold" style={{ color: '#028643' }}>
                {formatRupiah(transaksi.total_bayar || 0)}
              </div>
            </div>
          </div>

          <div className="d-flex flex-column gap-2 mt-3">
            <Button
              variant="outline-primary"
              className="lihat-detail-btn"
              onClick={() => handleLihatDetail(transaksi)}
            >
              Lihat Detail
            </Button>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .transaksi-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .transaksi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .transaksi-info {
          display: flex;
          flex-direction: column;
          padding-right: 10px;
        }

        .transaksi-id {
          color: #686868;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .status-badge {
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.85rem;
        }

        .status-badge .badge {
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .date-info {
          padding-left: 10px;
        }

        .barang-name {
          color: #03081F;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .barang-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
          font-size: 0.7rem;
        }

        .lihat-detail-btn {
          border-color: #028643;
          color: #028643;
        }

        .lihat-detail-btn:hover {
          background-color: #028643;
          color: white;
          border-color: #028643;
        }
      `}</style>
    </>
  );
};

export default CardTransaksi;