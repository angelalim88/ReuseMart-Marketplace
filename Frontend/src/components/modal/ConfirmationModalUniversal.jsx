
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsExclamationTriangleFill, BsQuestionCircleFill, BsInfoCircleFill, BsCheckCircleFill } from 'react-icons/bs';

/**
 * A reusable confirmation modal component
 * @param {boolean} show - Whether to show the modal
 * @param {function} onHide - Function to call when closing the modal
 * @param {function} onConfirm - Function to call when confirming the action
 * @param {string} title - The title of the modal
 * @param {string} message - The message to display in the modal
 * @param {string} confirmButtonText - The text for the confirm button
 * @param {string} cancelButtonText - The text for the cancel button
 * @param {string} type - The type of confirmation (danger, warning, info, success)
 */
const ConfirmationModalUniversal = ({
  show,
  onHide,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melakukan tindakan ini?",
  confirmButtonText = "Ya",
  cancelButtonText = "Batal",
  type = "warning"
}) => {
  
  // Map type to color scheme and icon
  const typeConfig = {
    danger: {
      headerBg: '#dc3545',
      icon: <BsExclamationTriangleFill className="me-2" size={24} />,
      confirmBtnVariant: 'danger',
      iconColor: '#dc3545'
    },
    warning: {
      headerBg: '#ffc107',
      icon: <BsExclamationTriangleFill className="me-2" size={24} />,
      confirmBtnVariant: 'warning',
      iconColor: '#ffc107'
    },
    info: {
      headerBg: '#0dcaf0',
      icon: <BsInfoCircleFill className="me-2" size={24} />,
      confirmBtnVariant: 'info',
      iconColor: '#0dcaf0'
    },
    success: {
      headerBg: '#028643',
      icon: <BsCheckCircleFill className="me-2" size={24} />,
      confirmBtnVariant: 'success',
      iconColor: '#028643'
    },
    question: {
      headerBg: '#6c757d',
      icon: <BsQuestionCircleFill className="me-2" size={24} />,
      confirmBtnVariant: 'primary',
      iconColor: '#6c757d'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;

  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      backdrop="static" 
      keyboard={false}
      centered
      size="sm"
      className="confirmation-modal"
    >
      <Modal.Header style={{ backgroundColor: config.headerBg, color: 'white' }}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <div className="d-flex align-items-center mb-3">
          <div style={{ color: config.iconColor, fontSize: '2rem' }}>
            {config.icon}
          </div>
          <div className="ms-3 fw-medium message-text">
            {message}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pt-0 pb-4">
        <Button 
          variant="outline-secondary" 
          onClick={onHide}
          className="px-4 cancel-btn"
        >
          {cancelButtonText}
        </Button>
        <Button 
          variant={config.confirmBtnVariant} 
          onClick={handleConfirm}
          className="px-4 confirm-btn"
        >
          {confirmButtonText}
        </Button>
      </Modal.Footer>

      <style jsx>{`
        .confirmation-modal .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .confirmation-modal .modal-header {
          border-bottom: none;
          padding: 1.25rem 1.5rem;
        }
        
        .confirmation-modal .modal-title {
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .message-text {
          font-size: 1rem;
          color: #333;
          line-height: 1.5;
        }
        
        .cancel-btn, .confirm-btn {
          border-radius: 6px;
          font-weight: 500;
          padding: 8px 20px;
          transition: all 0.2s;
        }
        
        .cancel-btn:hover {
          background-color: #e2e6ea;
        }
        
        .confirm-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </Modal>
  );
};

export default ConfirmationModalUniversal;