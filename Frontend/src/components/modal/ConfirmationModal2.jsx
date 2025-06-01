import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsPrinter } from 'react-icons/bs';
import CetakNotaPengambilan from '../pdf/CetakNotaPengambilan';

const ConfirmationModal = ({ show, handleClose, penitipan, handleConfirm, handleCetakNota }) => {
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [notaPrinted, setNotaPrinted] = useState(false);

  const handleNotaClick = () => {
    handleCetakNota(penitipan);
    setNotaPrinted(true);
    setShowNotaModal(true);
  };

  const handleConfirmClick = () => {
    handleConfirm(penitipan);
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Pengambilan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah Anda yakin barang ini telah diambil?</p>
          <Button
            variant="outline-primary"
            onClick={handleNotaClick}
            disabled={notaPrinted}
            className="mb-3"
          >
            <BsPrinter className="me-1" /> Cetak Nota
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmClick}
            disabled={!notaPrinted}
          >
            Konfirmasi
          </Button>
        </Modal.Footer>
      </Modal>

      {showNotaModal && (
        <CetakNotaPengambilan
          show={showNotaModal}
          handleClose={() => setShowNotaModal(false)}
          penitipan={penitipan}
        />
      )}
    </>
  );
};

export default ConfirmationModal;