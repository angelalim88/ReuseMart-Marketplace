import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { UpdateRequestDonasi } from "../../clients/RequestDonasiService";

const UpdateRequestDonasiModal = ({ show, handleClose, requestData, onSuccess }) => {
  const [deskripsi, setDeskripsi] = useState("");

  useEffect(() => {
    if (requestData) {
      setDeskripsi(requestData.deskripsi_request);
    }
  }, [requestData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await UpdateRequestDonasi(requestData.id_request_donasi, {
        deskripsi_request: deskripsi,
      });

      onSuccess();     // Refresh list
      handleClose();   // Tutup modal
    } catch (error) {
      console.error("Gagal update request donasi:", error);
      alert("Gagal mengupdate. Cek kembali koneksi atau input.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ubah Request Donasi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Deskripsi Request</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Simpan Perubahan
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateRequestDonasiModal;