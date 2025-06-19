import React from 'react';
import { Modal, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const DetailTransaksiModal = ({ show, onHide, currentTransaction, generateNotaNumber, formatDate, formatCurrency, getStatusBadgeColor }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detail Transaksi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {currentTransaction && (
          <div>
            <h5 className="mb-3">Informasi Pemesanan</h5>
            <Row className="mb-3">
              <Col md={6}>
                <p><strong>ID Pembelian:</strong> {currentTransaction.pembelian.id_pembelian}</p>
                <p><strong>No. Nota:</strong> {generateNotaNumber(currentTransaction)}</p>
                <p><strong>Tanggal:</strong> {formatDate(currentTransaction.pembelian.tanggal_pembelian)}</p>
                <p><strong>Status:</strong> 
                  <Badge 
                    bg={getStatusBadgeColor(currentTransaction.pembelian.status_pembelian)}
                    className="ms-2"
                  >
                    {currentTransaction.pembelian.status_pembelian}
                  </Badge>
                </p>
              </Col>
              <Col md={6}>
                <p><strong>Pembeli:</strong> {currentTransaction.nama_pembeli}</p>
                <p><strong>Alamat:</strong> {currentTransaction.alamat_pembeli}</p>
                <p><strong>Total:</strong> {formatCurrency(currentTransaction.pembelian.total_bayar)}</p>
                <p><strong>Poin Diperoleh:</strong> {currentTransaction.pembelian.poin_diperoleh || 0} poin</p>
                {currentTransaction.existing_review && (
                  <p><strong>Rating Diberikan:</strong> 
                    <span className="ms-2">
                      {[...Array(5)].map((_, index) => (
                        <FaStar 
                          key={index} 
                          style={{ 
                            color: index < currentTransaction.existing_review.rating ? '#FFD700' : '#D9D9D9',
                            marginRight: '2px'
                          }} 
                        />
                      ))}
                      <span className="ms-1">({currentTransaction.existing_review.rating}/5)</span>
                    </span>
                  </p>
                )}
              </Col>
            </Row>

            {currentTransaction.pengiriman && (
              <div className="mb-3">
                <h5>Informasi Pengiriman</h5>
                <p><strong>Jenis Pengiriman:</strong> {currentTransaction.pengiriman.jenis_pengiriman}</p>
                <p><strong>Status Pengiriman:</strong> 
                  <Badge 
                    bg={getStatusBadgeColor(currentTransaction.pengiriman.status_pengiriman)}
                    className="ms-2"
                  >
                    {currentTransaction.pengiriman.status_pengiriman}
                  </Badge>
                </p>
                <p><strong>Tanggal Mulai:</strong> {formatDate(currentTransaction.pengiriman.tanggal_mulai)}</p>
                <p><strong>Tanggal Berakhir:</strong> {formatDate(currentTransaction.pengiriman.tanggal_berakhir)}</p>
              </div>
            )}

            <h5 className="mb-3">Detail Produk</h5>
            {currentTransaction.barang?.map((item, index) => (
              <Card key={index} className="mb-2">
                <Card.Body className="p-3">
                  <Row className="align-items-center">
                    <Col xs={3} md={2}>
                      <img
                        src={`http://localhost:3000/uploads/barang/${item.gambar?.split(',')[0] || 'default.jpg'}`}
                        alt={item.nama}
                        className="img-fluid rounded"
                        style={{ maxHeight: '80px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'default.jpg'; }}
                      />
                    </Col>
                    <Col xs={9} md={10}>
                      <h6 className="mb-1">{item.nama}</h6>
                      <p className="mb-1 text-muted small">{item.deskripsi}</p>
                      <p className="mb-1"><strong>Penjual:</strong> {item.id_penitip}</p>
                      <p className="mb-0 text-primary fw-bold">{formatCurrency(item.harga)}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailTransaksiModal;