import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { AddPenitip } from "../../clients/PenitipService";

const PenitipFormModal = ({ show, handleClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama_penitip: "",
    nomor_ktp: "",
    email: "",
    password: "",
    foto_ktp: null,
    profile_picture: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("nama_penitip", formData.nama_penitip);
      data.append("nomor_ktp", formData.nomor_ktp);
      data.append("foto_ktp", formData.foto_ktp); 
      data.append("profile_picture", formData.profile_picture);
      data.append("akun[email]", formData.email); 
      data.append("akun[password]", formData.password);

      await AddPenitip(data);

      onSuccess();     
      handleClose();   
    } catch (error) {
      console.error("Gagal menambah penitip:", error);
      alert("Gagal menambah penitip. Cek kembali inputan atau server.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tambah Penitip</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nama Penitip</Form.Label>
            <Form.Control type="text" name="nama_penitip" onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nomor KTP</Form.Label>
            <Form.Control type="text" name="nomor_ktp" onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email Akun</Form.Label>
            <Form.Control type="email" name="email" onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password Akun</Form.Label>
            <Form.Control type="password" name="password" onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Foto KTP</Form.Label>
            <Form.Control type="file" name="foto_ktp" accept="image/*" onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Foto Profile</Form.Label>
            <Form.Control type="file" name="profile_picture" accept="image/*" onChange={handleChange} required />
          </Form.Group>
          <Button variant="success" type="submit" className="w-100">
            Simpan
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PenitipFormModal;