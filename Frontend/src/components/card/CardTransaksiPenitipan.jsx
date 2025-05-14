import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { BsPrinter } from 'react-icons/bs';

const CardTransaksiPenitipan = ({ penitipan, handleCetakNota }) => {
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Dalam masa penitipan':
        return <Badge bg="info">Dalam Penitipan</Badge>;
      case 'Selesai':
        return <Badge bg="success">Selesai</Badge>;
      case 'Tidak diambil':
        return <Badge bg="danger">Tidak Diambil</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="transaksi-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <small className="text-muted transaksi-id">{penitipan.id_penitipan}</small>
            <div className="status-badge mt-1">
              {getStatusBadge(penitipan.status_penitipan)}
            </div>
          </div>
          <div className="text-end">
            <div className="text-muted small">Tanggal Penitipan</div>
            <div className="fw-medium">{formatDate(penitipan.tanggal_awal_penitipan)}</div>
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
              <div className="me-3 no-image-placeholder rounded" style={{ width: '60px', height: '60px' }}>
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

        <div className="mt-3">
          <Button 
            variant="outline-primary" 
            className="cetak-nota-btn w-100"
            onClick={() => handleCetakNota(penitipan)}
          >
            <BsPrinter className="me-1" /> Cetak Nota
          </Button>
        </div>
      </Card.Body>
      <style jsx>{`
        .transaksi-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .transaksi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
      `}</style>
    </Card>
  );
};

export default CardTransaksiPenitipan;