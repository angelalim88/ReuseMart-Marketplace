import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import defaultAvatar from '../../assets/images/logo.png';

const EmployeeCard = ({ 
  employee, 
  onEdit, 
  onDelete, 
  getRoleName 
}) => {
  const getProfilePicture = (employee) => {
    if (employee.Akun?.profile_picture) return employee.Akun.profile_picture;
    if (employee.akun?.profile_picture) return employee.akun.profile_picture;
    return defaultAvatar;
  };

  return (
    <Card className="mb-3 border employee-card">
      <Card.Body className="p-3">
        <Row className="align-items-center">
          <Col xs={12} md={9}>
            <div className="mb-1">
              <span className="employee-id">#{employee.id_pegawai}</span>
              <span className="badge bg-light text-dark ms-2 role-badge">
                {getRoleName(employee.Akun?.role || employee.akun?.role || 'Unknown')}
              </span>
            </div>
            <h5 className="employee-name mb-2">{employee.nama_pegawai}</h5>
            <div className="mb-1">
              <span className="text-muted">ID Akun: </span>
              <span>{employee.id_akun}</span>
            </div>
            <div className="mb-1">
              <span className="text-muted">Email: </span>
              <span>{employee.Akun?.email || employee.akun?.email || '-'}</span>
            </div>
            <div className="mb-0">
              <span className="text-muted">Tanggal Lahir: </span>
              <span>{employee.tanggal_lahir ? new Date(employee.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</span>
            </div>
          </Col>
          <Col xs={12} md={3} className="d-flex justify-content-center justify-content-md-end mt-3 mt-md-0">
            <div className="avatar-container">
              <img 
                src={getProfilePicture(employee)} 
                alt={employee.nama_pegawai || 'Employee Avatar'} 
                className="employee-avatar"
                onError={(e) => {e.target.src = defaultAvatar}}
              />
            </div>
          </Col>
        </Row>
        <div className="button-container mt-3 d-flex justify-content-end">
          <Button 
            variant="danger" 
            className="delete-btn me-2"
            onClick={() => onDelete(employee.id_pegawai)}
          >
            Delete
          </Button>
          <Button 
            variant="success"
            className="edit-btn"
            onClick={() => onEdit(employee.id_pegawai)}
          >
            Edit
          </Button>
        </div>
      </Card.Body>

      <style jsx>{`
        .employee-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .employee-id {
          color: #686868;
          font-size: 0.9rem;
        }
        
        .role-badge {
          font-size: 0.75rem;
          background-color: #f0f0f0;
          color: #686868;
          font-weight: 500;
        }
        
        .employee-name {
          color: #03081F;
          font-weight: 600;
        }
        
        .employee-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
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
        
        @media (max-width: 768px) {
          .employee-avatar {
            width: 60px;
            height: 60px;
            margin-top: 10px;
          }
        }
      `}</style>
    </Card>
  );
};

export default EmployeeCard;