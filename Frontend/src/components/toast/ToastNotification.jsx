import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastNotification = ({ show, setShow, message, type = 'success' }) => {
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
      <Toast 
        show={show} 
        onClose={() => setShow(false)} 
        bg={type}
        delay={5000}
        autohide
      >
        <Toast.Header closeButton>
          <strong className="me-auto">
            {type === 'success' ? 'Berhasil' : 'Gagal'}
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;