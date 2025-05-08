import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const DetailProdukDisumbangkanModal = ({ 
  show, 
  handleClose, 
  donationData,
  formatDate,
  formatCurrency 
}) => {
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#5CB85C', color: 'white' }}>
        <Modal.Title>Detail Barang Donasi</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Item Information Section */}
        <div className="mb-4">
          <h5 className="border-bottom pb-2 mb-3">Informasi Barang</h5>
          <Row className="mb-3">
            <Col md={4} className="text-muted">ID Penitipan:</Col>
            <Col md={8} className="fw-bold">{donationData.penitipan.id_penitipan || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">ID Barang:</Col>
            <Col md={8}>{donationData.penitipan.id_barang || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Nama Barang:</Col>
            <Col md={8} className="fw-bold">{donationData.penitipan.Barang?.nama || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Kategori:</Col>
            <Col md={8}>{donationData.penitipan.Barang?.kategori_barang || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Harga:</Col>
            <Col md={8}>{formatCurrency(donationData.penitipan.Barang?.harga || 0)}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Status:</Col>
            <Col md={8}>
              <span className="donated-badge">
                {donationData.penitipan.status_penitipan || 'Unknown'}
              </span>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Berat:</Col>
            <Col md={8}>{donationData.penitipan.Barang?.berat || 0} kg</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Status QC:</Col>
            <Col md={8}>{donationData.penitipan.Barang?.status_qc || '-'}</Col>
          </Row>
        </div>
        
        {/* Donation Information Section */}
        <div className="mb-4">
          <h5 className="border-bottom pb-2 mb-3">Informasi Donasi</h5>
          <Row className="mb-3">
            <Col md={4} className="text-muted">ID Donasi:</Col>
            <Col md={8}>{donationData.donasi.id_donasi_barang || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Tanggal Donasi:</Col>
            <Col md={8}>
              {formatDate(donationData.donasi.tanggal_donasi || donationData.penitipan.tanggal_donasi) || '-'}
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Organisasi Penerima:</Col>
            <Col md={8} className="fw-bold">
              {donationData.organisasi.nama_organisasi || donationData.penitipan.penerima_donasi || '-'}
            </Col>
          </Row>
          
          {donationData.organisasi.id_organisasi && (
            <>
              <Row className="mb-3">
                <Col md={4} className="text-muted">Alamat Organisasi:</Col>
                <Col md={8}>{donationData.organisasi.alamat || '-'}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={4} className="text-muted">Terdaftar Sejak:</Col>
                <Col md={8}>{formatDate(donationData.organisasi.tanggal_registrasi) || '-'}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={4} className="text-muted">Request Donasi:</Col>
                <Col md={8}>#{donationData.request.id_request_donasi || '-'}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={4} className="text-muted">Deskripsi Request:</Col>
                <Col md={8}>{donationData.request.deskripsi_request || '-'}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={4} className="text-muted">Tanggal Request:</Col>
                <Col md={8}>{formatDate(donationData.request.tanggal_request) || '-'}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={4} className="text-muted">Status Request:</Col>
                <Col md={8}>
                  <Badge bg={donationData.request.status_request === "Selesai" ? "success" : "primary"}>
                    {donationData.request.status_request || '-'}
                  </Badge>
                </Col>
              </Row>
            </>
          )}
        </div>
        
        {/* Penitipan Information Section */}
        <div className="mb-4">
          <h5 className="border-bottom pb-2 mb-3">Informasi Masa Penitipan</h5>
          <Row className="mb-3">
            <Col md={4} className="text-muted">Tanggal Awal:</Col>
            <Col md={8}>{formatDate(donationData.penitipan.tanggal_awal_penitipan) || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Tanggal Akhir:</Col>
            <Col md={8}>{formatDate(donationData.penitipan.tanggal_akhir_penitipan) || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Batas Pengambilan:</Col>
            <Col md={8}>{formatDate(donationData.penitipan.tanggal_batas_pengambilan) || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Perpanjangan:</Col>
            <Col md={8}>{donationData.penitipan.perpanjangan || 0} kali</Col>
          </Row>
        </div>
        
        {/* Owner Information Section */}
        <div>
          <h5 className="border-bottom pb-2 mb-3">Informasi Pemilik</h5>
          <Row className="mb-3">
            <Col md={4} className="text-muted">ID Penitip:</Col>
            <Col md={8}>{donationData.penitipan.Barang?.Penitip?.id_penitip || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Nama Penitip:</Col>
            <Col md={8} className="fw-bold">{donationData.penitipan.Barang?.Penitip?.nama_penitip || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Email:</Col>
            <Col md={8}>{donationData.penitipan.Barang?.Penitip?.Akun?.email || '-'}</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Total Poin:</Col>
            <Col md={8}>{donationData.penitipan.Barang?.Penitip?.total_poin || 0} poin</Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={4} className="text-muted">Terdaftar Sejak:</Col>
            <Col md={8}>{formatDate(donationData.penitipan.Barang?.Penitip?.tanggal_registrasi) || '-'}</Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Link to="/owner/rekap">
          <Button variant="success">
            Lihat History Donasi
          </Button>
        </Link>
      </Modal.Footer>

      <style jsx>{`
        .donated-badge {
          background-color: #5CB85C;
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

export default DetailProdukDisumbangkanModal;