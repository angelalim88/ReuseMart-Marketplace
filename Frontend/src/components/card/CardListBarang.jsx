import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { BsPencil, BsTrash, BsBox } from 'react-icons/bs';

const CardListBarang = ({ 
  barang, 
  getPenitipName, 
  onEdit, 
  onDelete, 
  getStatusBadge 
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

  const imageUrl = getImageUrl(barang.gambar);

  return (
    <Card className="barang-card h-100 border">
      <Card.Body className="p-3">
        <div className="mb-2 card-header-section">
          <span className="barang-id">#{barang.id_barang}</span>
          <div className="ms-auto">
            {getStatusBadge(barang.status_qc)}
          </div>
        </div>
        
        <div className="image-container mb-3">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={barang.nama} 
              className="barang-image"
              onError={(e) => {e.target.src = 'https://via.placeholder.com/200?text=No+Image'}}
            />
          ) : (
            <div className="no-image-placeholder">
              <BsBox size={40} color="#d9d9d9" />
            </div>
          )}
        </div>
        
        <h5 className="barang-name mb-2">{barang.nama}</h5>
        
        <div className="mb-2">
          <Badge bg="light" text="dark" className="kategori-badge">
            {barang.kategori_barang}
          </Badge>
        </div>
        
        <div className="barang-info mb-1">
          <span className="text-muted">Penitip: </span>
          <span className="fw-medium">{getPenitipName(barang.id_penitip)}</span>
        </div>
        
        <div className="barang-info mb-1">
          <span className="text-muted">Harga: </span>
          <span className="fw-medium">Rp {parseFloat(barang.harga).toLocaleString()}</span>
        </div>
        
        <div className="barang-info mb-1">
          <span className="text-muted">Berat: </span>
          <span className="fw-medium">{barang.berat} kg</span>
        </div>
        
        <div className="barang-info mb-3">
          <span className="text-muted">Garansi: </span>
          <span className="fw-medium">{barang.garansi_berlaku ? 'Ya' : 'Tidak'}</span>
        </div>
        
        <div className="action-buttons mt-auto d-flex justify-content-end">
          <Button 
            variant="outline-success" 
            size="sm"
            className="edit-btn me-2"
            onClick={() => onEdit(barang)}
          >
            <BsPencil /> Edit
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            className="delete-btn"
            onClick={() => onDelete(barang.id_barang)}
          >
            <BsTrash /> Hapus
          </Button>
        </div>
      </Card.Body>

      <style jsx>{`
        .barang-card {
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .barang-card:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .card-header-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .barang-id {
          font-size: 0.9rem;
          color: #6c757d;
        }
        .image-container {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        .barang-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .no-image-placeholder {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
        }
        .barang-name {
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .kategori-badge {
          background-color: #f0f0f0;
          font-weight: 500;
        }
        .barang-info {
          font-size: 0.9rem;
        }
        .fw-medium {
          font-weight: 500;
        }
        .edit-btn, .delete-btn {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>
    </Card>
  );
};

export default CardListBarang;