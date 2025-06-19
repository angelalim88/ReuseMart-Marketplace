import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaStar, FaRegStar } from 'react-icons/fa';

const RatingModal = ({ show, onHide, currentTransaction, rating, setRating, submittingRating, handleSubmitRating, formatCurrency }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Berikan Rating</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {currentTransaction && (
          <div>
            <h6 className="mb-3">Transaksi: {currentTransaction.pembelian.id_pembelian}</h6>
            <div className="mb-3">
              <p className="text-muted mb-2">
                Rating ini akan diberikan kepada penitip yang menjual produk dalam transaksi ini
              </p>
              <label className="form-label">Rating (1-5 bintang):</label>
              <div className="d-flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => setRating(star)}
                    style={{ fontSize: '2rem', color: star <= rating ? '#FFD700' : '#D9D9D9' }}
                    disabled={submittingRating}
                  >
                    {star <= rating ? <FaStar /> : <FaRegStar />}
                  </button>
                ))}
              </div>
              <small className="text-muted">Rating yang dipilih: {rating} bintang</small>
            </div>
            <div className="mb-3">
              <label className="form-label">Produk yang akan dirating:</label>
              {currentTransaction.barang?.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                  <img
                    src={`http://localhost:3000/uploads/barang/${item.gambar?.split(',')[0] || 'default.jpg'}`}
                    alt={item.nama}
                    className="rounded me-2"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'default.jpg'; }}
                  />
                  <div>
                    <small className="fw-bold">{item.nama}</small><br/>
                    <small className="text-muted">Penitip: {item.id_penitip}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submittingRating}>
          Batal
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmitRating}
          disabled={rating === 0 || submittingRating}
        >
          {submittingRating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Mengirim...
            </>
          ) : (
            'Kirim Rating'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RatingModal;