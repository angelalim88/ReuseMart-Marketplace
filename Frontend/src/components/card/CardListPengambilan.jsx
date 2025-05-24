import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { BsBoxSeam } from 'react-icons/bs';
import ConfirmationModal from '../../components/modal/ConfirmationModal';

const CardListPengambilan = ({ penitipan, handleCetakNota, handleConfirmDiambil, pegawai }) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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
      case 'Dalam masa penitipan':
        return <Badge bg="info">Dalam Penitipan</Badge>;
      case 'Terjual':
        return <Badge bg="primary">Terjual</Badge>;
      case 'Dibeli':
        return <Badge bg="primary">Dibeli</Badge>;
      case 'Didonasikan':
        return <Badge bg="success">Didonasikan</Badge>;
      case 'Menunggu didonasikan':
        return <Badge bg="warning">Menunggu Didonasikan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleOpenConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  return (
    <>
      <Card className="transaksi-card h-100">
        <Card.Body>
          <div className="row mb-3">
            <div className="col-6 transaksi-info">
              <small className="text-muted transaksi-id">{penitipan.id_penitipan}</small>
              <div className="status-badge mt-1">{getStatusBadge(penitipan.status_penitipan)}</div>
            </div>
            <div className="col-6 text-end date-info">
              <div className="text-muted small">Terakhir Ambil</div>
              <div className="fw-medium" style={{ fontSize: '0.75rem' }}>{formatDate(penitipan.tanggal_batas_pengambilan)}</div>
            </div>
          </div>

          <div className="barang-info-container mb-3">
            <div className="d-flex align-items-center">
              {penitipan.Barang?.gambar ? (
                <div className="me-3" style={{ width: '60px', height: '60px', overflow: 'hidden' }}>
                  <img
                    src={penitipan.Barang.gambar.split(',')[0]}
                    alt={penitipan.Barang.nama}
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
                <h6 className="barang-name mb-1">{penitipan.Barang?.nama || '-'}</h6>
                <small className="text-muted">{penitipan.Barang?.id_barang || '-'}</small>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <div>
              <div className="text-muted small">Penitip</div>
              <div className="fw-medium">{penitipan.Barang?.Penitip?.nama_penitip || '-'}</div>
            </div>
            <div className="text-end">
              <div className="text-muted small">Harga</div>
              <div className="fw-bold" style={{ color: '#028643' }}>
                {formatRupiah(penitipan.Barang?.harga || 0)}
              </div>
            </div>
          </div>

          <div className="d-flex flex-column gap-2 mt-3">
            <Button
              variant="outline-success"
              className="atur-pengiriman-btn"
              onClick={handleOpenConfirmationModal}
              disabled = {penitipan.status_penitipan === "Diambil kembali"}
            >
              <BsBoxSeam className="me-1" /> Konfirmasi Diambil
            </Button>
          </div>
        </Card.Body>
      </Card>

      {showConfirmationModal && (
        <ConfirmationModal
          show={showConfirmationModal}
          handleClose={handleCloseConfirmationModal}
          penitipan={penitipan}
          handleConfirm={handleConfirmDiambil}
          handleCetakNota={handleCetakNota}
        />
      )}

      <style jsx>{`
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

        .transaksi-id {
          color: #686868;
          font-size: 0.9rem;
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

        .cetak-nota-btn {
          border-color: #028643;
          color: #028643;
        }

        .cetak-nota-btn:hover {
          background-color: #028643;
          color: white;
          border-color: #028643;
        }

        .atur-pengiriman-btn {
          border-color: #198754;
          color: #198754;
        }

        .atur-pengiriman-btn:hover {
          background-color: #198754;
          color: white;
          border-color: #198754;
        }

        .atur-pengiriman-btn:disabled {
          border-color: #6c757d;
          color: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
    </>
  );
};

export default CardListPengambilan;