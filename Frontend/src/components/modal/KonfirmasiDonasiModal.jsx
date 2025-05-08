import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const KonfirmasiDonasi = ({
  show,
  onHide,
  penitipan,
  onConfirm,
  headerBgColor = '#FC8A06',
  headerColor = 'white',
  confirmBtnColor = '#FC8A06',
  confirmBtnText = 'Ya, Donasikan'
}) => {
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ backgroundColor: headerBgColor, color: headerColor }}>
        <Modal.Title>Konfirmasi Donasi</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <i className="bi bi-gift-fill" style={{ fontSize: '3rem', color: headerBgColor }}></i>
        </div>
        
        <p className="text-center">
          Apakah Anda yakin ingin mendonasikan barang dengan nama <strong>{penitipan?.Barang?.nama || '-'}</strong>?
        </p>
        
        <div className="donation-details p-3 bg-light rounded mb-3">
          <Row className="mb-2">
            <Col xs={5} className="text-muted">ID Penitipan:</Col>
            <Col xs={7}>{penitipan?.id_penitipan || '-'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} className="text-muted">Nama Barang:</Col>
            <Col xs={7} className="fw-bold">{penitipan?.Barang?.nama || '-'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} className="text-muted">Pemilik:</Col>
            <Col xs={7}>{penitipan?.Barang?.Penitip?.nama_penitip || '-'}</Col>
          </Row>
          <Row>
            <Col xs={5} className="text-muted">Nilai Barang:</Col>
            <Col xs={7}>{formatCurrency(penitipan?.Barang?.harga || 0)}</Col>
          </Row>
        </div>
        
        <p className="text-muted small">
          Barang yang telah didonasikan tidak dapat dikembalikan dan akan disalurkan ke pihak yang membutuhkan.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Batal
        </Button>
        <Button 
          variant="warning" 
          style={{ backgroundColor: confirmBtnColor, borderColor: confirmBtnColor }}
          onClick={onConfirm}
        >
          {confirmBtnText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default KonfirmasiDonasi;