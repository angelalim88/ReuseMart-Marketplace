import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { BsBox } from 'react-icons/bs';

const DetailBarangModal = ({ showModal, setShowModal, penitipan, imagePreview, kategoriOptions }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak tersedia';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Terjual':
        return <Badge bg="success">Terjual</Badge>;
      case 'Dibeli':
        return <Badge bg="warning">Dibeli</Badge>;
      case 'Dalam masa penitipan':
        return <Badge bg="info">Dalam masa penitipan</Badge>;
      case 'Didonasikan':
        return <Badge bg="danger">Didonasikan</Badge>;
      case 'Menunggu didonasikan':
        return <Badge bg="secondary">Menunggu didonasikan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Modal 
      show={showModal} 
      onHide={() => setShowModal(false)} 
      size="lg" 
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Detail Barang Penitipan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {penitipan ? (
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Informasi Barang</h5>
              <div className="mb-2">
                <strong>ID Penitipan:</strong> {penitipan.id_penitipan}
              </div>
              <div className="mb-2">
                <strong>Nama Barang:</strong> {penitipan.Barang.nama}
              </div>
              <div className="mb-2">
                <strong>Kategori:</strong> {penitipan.Barang.kategori_barang}
              </div>
              <div className="mb-2">
                <strong>Harga:</strong> Rp {parseFloat(penitipan.Barang.harga).toLocaleString('id-ID')}
              </div>
              <div className="mb-2">
                <strong>Berat:</strong> {penitipan.Barang.berat} kg
              </div>
              <div className="mb-2">
                <strong>Status QC:</strong> {penitipan.Barang.status_qc}
              </div>
              <div className="mb-2">
                <strong>Garansi:</strong> 
                {penitipan.Barang.garansi_berlaku ? (
                  <Badge bg="success" className="ms-2">Ada</Badge>
                ) : (
                  <Badge bg="light" text="dark" className="ms-2">Tidak ada</Badge>
                )}
              </div>
              {penitipan.Barang.garansi_berlaku && (
                <div className="mb-2">
                  <strong>Tanggal Garansi:</strong> {formatDate(penitipan.Barang.tanggal_garansi)}
                </div>
              )}
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Informasi Penitipan</h5>
              <div className="mb-2">
                <strong>Status:</strong> {getStatusBadge(penitipan.status_penitipan)}
              </div>
              <div className="mb-2">
                <strong>Tanggal Awal:</strong> {formatDate(penitipan.tanggal_awal_penitipan)}
              </div>
              <div className="mb-2">
                <strong>Tanggal Akhir:</strong> {formatDate(penitipan.tanggal_akhir_penitipan)}
              </div>
              <div className="mb-2">
                <strong>Batas Pengambilan:</strong> {formatDate(penitipan.tanggal_batas_pengambilan)}
              </div>
              <div className="mb-2">
                <strong>Perpanjangan:</strong> 
                {penitipan.perpanjangan ? (
                  <Badge bg="success" className="ms-2">Ya</Badge>
                ) : (
                  <Badge bg="light" text="dark" className="ms-2">Tidak</Badge>
                )}
              </div>
              <h5 className="mt-4 mb-3">Gambar Barang</h5>
              {imagePreview.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {imagePreview.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Gambar ${index + 1}`}
                      style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                      onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=No+Image'}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <BsBox size={40} className="text-muted" />
                  <p className="text-muted mt-2">Tidak ada gambar</p>
                </div>
              )}
            </Col>
          </Row>
        ) : (
          <p className="text-muted">Tidak ada data penitipan yang dipilih</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailBarangModal;