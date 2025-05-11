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
          {barang.gambar ? (
            <img 
              src={barang.gambar.split(',')[0].trim()} 
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
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .barang-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .card-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .barang-id {
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
          height: 48px;
        }
        
        .image-container {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #f8f9fa;
          border-radius: 6px;
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
        }
        
        .kategori-badge {
          font-size: 0.75rem;
          background-color: #f0f0f0;
          color: #333;
          padding: 5px 10px;
          border-radius: 12px;
        }
        
        .barang-info {
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .fw-medium {
          font-weight: 500;
        }
        
        .action-buttons {
          margin-top: 10px;
        }
        
        .edit-btn, .delete-btn {
          font-size: 0.8rem;
          padding: 4px 8px;
        }
        
        .edit-btn {
          border-color: #028643;
          color: #028643;
        }
        
        .edit-btn:hover {
          background-color: #028643;
          color: white;
        }
        
        .delete-btn {
          border-color: #dc3545;
          color: #dc3545;
        }
        
        .delete-btn:hover {
          background-color: #dc3545;
          color: white;
        }
        
        @media (max-width: 768px) {
          .image-container {
            height: 140px;
          }
        }
      `}</style>
    </Card>
  );
};

export default CardListBarang;