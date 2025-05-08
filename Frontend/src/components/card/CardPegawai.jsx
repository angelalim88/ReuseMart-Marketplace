import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import defaultAvatar from '../../assets/images/profile_picture/default.jpg';

const EmployeeCard = ({ 
  employee, 
  onEdit, 
  onDelete,
  getRoleName,
  setSelectedEmployee
}) => {
  console.log("Rendering EmployeeCard for:", employee);

  const getProfilePicture = (employee) => {
    const profilePic = employee.Akun?.profile_picture || employee.akun?.profile_picture || defaultAvatar;
    console.log("Profile Picture URL:", profilePic);
    return profilePic;
  };

  const role = getRoleName(employee.Akun?.role || employee.akun?.role || 'Unknown');
  console.log("Employee Role:", role);
  
  const email = employee.Akun?.email || employee.akun?.email || '-';
  console.log("Employee Email:", email);

  const birthDate = employee.tanggal_lahir 
    ? new Date(employee.tanggal_lahir).toLocaleDateString('id-ID') 
    : '-';
  console.log("Employee Birth Date:", birthDate);

  return (
    <Card className="mb-3 border employee-card">
      <Card.Body className="p-3">
        <Row className="align-items-center">
          <Col xs={12} md={9}>
            <div className="mb-1">
              <span className="employee-id">#{employee.id_pegawai}</span>
              <span className="badge bg-light text-dark ms-2 role-badge">
                {role}
              </span>
            </div>
            <h5 className="employee-name mb-2">{employee.nama_pegawai}</h5>
            <div className="mb-1">
              <span className="text-muted">ID Akun: </span>
              <span>{employee.id_akun}</span>
            </div>
            <div className="mb-1">
              <span className="text-muted">Email: </span>
              <span>{email}</span>
            </div>
            <div className="mb-0">
              <span className="text-muted">Tanggal Lahir: </span>
              <span>{birthDate}</span>
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
            variant="primary" 
            className="reset-btn me-2"
            type="button"
            data-bs-toggle="modal" data-bs-target="#reset-emmployee-pass-modal"
            onClick={() => {
              console.log("Reset Password Clicked for:", employee);
              setSelectedEmployee(employee);
            }}
          >
            Reset Password
          </Button>
          <Button 
            variant="danger" 
            className="delete-btn me-2"
            onClick={() => {
              console.log("Delete Clicked for ID:", employee.id_pegawai);
              onDelete(employee.id_pegawai);
            }}
          >
            Delete
          </Button>
          <Button 
            variant="success"
            className="edit-btn"
            onClick={() => {
              console.log("Edit Clicked for ID:", employee.id_pegawai);
              onEdit(employee.id_pegawai);
            }}
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