import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { AddRequestDonasi } from "../../clients/RequestDonasiService";

const RequestDonasiModal = ({ show, handleClose, onSuccess, idOrganisasi }) => {
  const [deskripsi, setDeskripsi] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tanggalRequest = new Date().toISOString().slice(0, 19).replace("T", " ");
      const newRequest = {
        id_organisasi: idOrganisasi,
        deskripsi_request: deskripsi,
        tanggal_request: tanggalRequest,
        status_request: "Menunggu Konfirmasi",
      };

      await AddRequestDonasi(newRequest);

      onSuccess();     
      handleClose();
    } catch (error) {
      console.error("Gagal menambah request:", error);
      alert("Gagal menambah request. Silakan cek kembali.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tambah Request Donasi</Modal.Title>
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
            Kirim Request
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RequestDonasiModal;