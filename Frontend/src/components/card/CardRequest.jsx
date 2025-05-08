import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';

const RequestCard = ({ 
  request, 
  onEdit, 
  onDelete 
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Status badge color mapping
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FC8A06'; // Orange
      case 'approved':
        return '#028643'; // Green
      case 'rejected':
        return '#FF1700'; // Red
      default:
        return '#686868'; // Grey
    }
  };

  return (
    <Card className="mb-3 border request-card">
      <Card.Body className="p-3">
        <Row className="align-items-center">
          <Col xs={12}>
            <div className="mb-1">
              <span className="request-id">#{request.id_request_donasi}</span>
              <span className="badge ms-2 role-badge" style={{ backgroundColor: getStatusBadgeColor(request.status_request), color: 'white' }}>
                {request.status_request || 'Unknown'}
              </span>
            </div>
            
            <h5 className="request-org mb-2">
              {request.id_organisasi ? `Organisasi: ${request.id_organisasi}` : 'Tanpa Organisasi'}
            </h5>
            
            <div className="mb-1">
              <span className="text-muted">Tanggal Request: </span>
              <span>{formatDate(request.tanggal_request)}</span>
            </div>
            
            <div className="request-desc mt-2">
              <p>{request.deskripsi_request || '-'}</p>
            </div>
          </Col>
        </Row>
        
        <div className="button-container mt-3 d-flex justify-content-end">
          <Button 
            variant="danger" 
            className="delete-btn me-2"
            onClick={() => onDelete(request.id_request_donasi)}
          >
            Delete
          </Button>
          <Button 
            variant="success"
            className="edit-btn"
            onClick={() => onEdit(request.id_request_donasi)}
          >
            Edit
          </Button>
        </div>
      </Card.Body>

      <style jsx>{`
        .request-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .request-id {
          color: #686868;
          font-size: 0.9rem;
        }
        
        .role-badge {
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .request-org {
          color: #03081F;
          font-weight: 600;
        }
        
        .request-desc {
          color: #4A4A4A;
        }
        
        .delete-btn {
          background-color: #FF1700;
          border-color: #FF1700;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .delete-btn:hover {
          background-color: #e61500;
          border-color: #e61500;
        }
        
        .edit-btn {
          background-color: #028643;
          border-color: #028643;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .edit-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
        }
      `}</style>
    </Card>
  );
};

export default RequestCard;