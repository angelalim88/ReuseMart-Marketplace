import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const DetailPenitipanHabis = ({ 
  show, 
  onHide, 
  penitipan, 
  onDonateClick,
  headerBgColor = '#028643',
  headerColor = 'white',
  title = 'Detail Barang Penitipan'
}) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ backgroundColor: headerBgColor, color: headerColor }}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Item Information Section */}
        <div className="mb-4">
          <h5 className="border-bottom pb-2 mb-3">Informasi Barang</h5>
          <Row className="mb-3">
            <Col md={4} className="text-muted">ID Penitipan:</Col>
            <Col md={8} className="fw-bold">{penitipan.id_penitipan || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">ID Barang:</Col>
            <Col md={8}>{penitipan.id_barang || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Nama Barang:</Col>
            <Col md={8} className="fw-bold">{penitipan.Barang?.nama || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Kategori:</Col>
            <Col md={8}>{penitipan.Barang?.kategori_barang || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Harga:</Col>
            <Col md={8}>{formatCurrency(penitipan.Barang?.harga || 0)}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Status Penitipan:</Col>
            <Col md={8}>
              <span className="donation-badge">
                {penitipan.status_penitipan || 'Unknown'}
              </span>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Berat:</Col>
            <Col md={8}>{penitipan.Barang?.berat || 0} kg</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Status QC:</Col>
            <Col md={8}>{penitipan.Barang?.status_qc || '-'}</Col>
          </Row>
        </div>
        
        {/* Penitipan Information Section */}
        <div className="mb-4">
          <h5 className="border-bottom pb-2 mb-3">Informasi Masa Penitipan</h5>
          <Row className="mb-3">
            <Col md={4} className="text-muted">Tanggal Awal:</Col>
            <Col md={8}>{formatDate(penitipan.tanggal_awal_penitipan) || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Tanggal Akhir:</Col>
            <Col md={8}>{formatDate(penitipan.tanggal_akhir_penitipan) || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Batas Pengambilan:</Col>
            <Col md={8}>{formatDate(penitipan.tanggal_batas_pengambilan) || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Perpanjangan:</Col>
            <Col md={8}>{penitipan.perpanjangan || 0} kali</Col>
          </Row>
        </div>
        
        {/* Owner Information Section */}
        <div>
          <h5 className="border-bottom pb-2 mb-3">Informasi Pemilik</h5>
          <Row className="mb-3">
            <Col md={4} className="text-muted">ID Penitip:</Col>
            <Col md={8}>{penitipan.Barang?.Penitip?.id_penitip || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Nama Penitip:</Col>
            <Col md={8} className="fw-bold">{penitipan.Barang?.Penitip?.nama_penitip || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Email:</Col>
            <Col md={8}>{penitipan.Barang?.Penitip?.Akun?.email || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Total Poin:</Col>
            <Col md={8}>{penitipan.Barang?.Penitip?.total_poin || 0} poin</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Terdaftar Sejak:</Col>
            <Col md={8}>{formatDate(penitipan.Barang?.Penitip?.tanggal_registrasi) || '-'}</Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {onDonateClick && (
          <Button 
            variant="success" 
            onClick={() => onDonateClick(penitipan)}
          >
            Donasikan Barang
          </Button>
        )}
      </Modal.Footer>

      <style jsx>{`
        .donation-badge {
          background-color: #FC8A06;
          color: white;
          padding: 3px 7px;
          border-radius: 10px;
          font-weight: 400;
          font-size: 0.75rem;
        }
      `}</style>
    </Modal>
  );
};

export default DetailPenitipanHabis;