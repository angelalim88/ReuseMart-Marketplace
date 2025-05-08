import React from 'react';
import { Card } from 'react-bootstrap';

const RoleSidebar = ({ namaSidebar, roles, selectedRole, handleRoleChange }) => {
  return (
    <Card className="border role-card">
      <Card.Header className="bg-white border-bottom p-3">
        <div className="d-flex align-items-center">
          <i className="bi bi-list-ul me-2" style={{ color: '#03081F' }}></i>
          <strong style={{ color: '#03081F' }}>{namaSidebar}</strong>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <ul className="list-group list-group-flush role-list">
          {roles.map(role => (
            <li 
              key={role.id} 
              className={`list-group-item px-3 py-3 ${selectedRole === role.id ? 'active-role' : ''}`}
              onClick={() => handleRoleChange(role.id)}
            >
              {role.name}
            </li>
          ))}
        </ul>
      </Card.Body>

      <style jsx>{`
        .role-card {
          border-radius: 4px;
          overflow: hidden;
          border-color: #E7E7E7;
        }
        
        .role-list .list-group-item {
          border-left: none;
          border-right: none;
          cursor: pointer;
          color: #686868;
          border-color: #E7E7E7;
          transition: all 0.2s;
        }
        
        .role-list .list-group-item:first-child {
          border-top: none;
        }
        
        .role-list .list-group-item.active-role {
          background-color: #03081F;
          color: white;
          font-weight: 500;
        }
        
        .role-list .list-group-item:hover:not(.active-role) {
          background-color: #f8f9fa;
        }
      `}</style>
    </Card>
  );
};

export default RoleSidebar;