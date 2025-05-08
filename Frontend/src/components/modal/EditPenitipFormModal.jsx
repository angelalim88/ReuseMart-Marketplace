import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { UpdatePenitip } from "../../clients/PenitipService";

const EditPenitipFormModal = ({ show, handleClose, penitip, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama_penitip: "",
    nomor_ktp: "",
    email: "",
    foto_ktp: null,
    profile_picture: null,
    keuntungan: "",
    rating: "",
    badge: "",
    total_poin: "",
    tanggal_registrasi: "",
  });

  useEffect(() => {
    if (penitip) {
      setFormData({
        nama_penitip: penitip.nama_penitip || "",
        nomor_ktp: penitip.nomor_ktp || "",
        email: penitip.Akun?.email || "",
        foto_ktp: null,
        profile_picture: null,
        keuntungan: penitip.keuntungan || "",
        rating: penitip.rating || "",
        badge: penitip.badge || "",
        total_poin: penitip.total_poin || "",
        tanggal_registrasi: penitip.tanggal_registrasi
          ? new Date(penitip.tanggal_registrasi).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [penitip]);

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
      if (formData.foto_ktp) data.append("foto_ktp", formData.foto_ktp);
      if (formData.profile_picture) data.append("profile_picture", formData.profile_picture);
      data.append("akun[email]", formData.email);
      data.append("keuntungan", formData.keuntungan);
      data.append("rating", formData.rating);
      data.append("badge", formData.badge);
      data.append("total_poin", formData.total_poin);
      data.append("tanggal_registrasi", formData.tanggal_registrasi);

      const response = await UpdatePenitip(penitip.id_penitip, data);
      console.log("Update response:", response.data); 

      alert("Penitip berhasil diperbarui!");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Gagal memperbarui penitip:", error.response?.data || error.message);
      alert(`Gagal memperbarui penitip: ${error.response?.data?.error || "Cek kembali inputan atau server."}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Penitip</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nama Penitip</Form.Label>
            <Form.Control
              type="text"
              name="nama_penitip"
              value={formData.nama_penitip}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nomor KTP</Form.Label>
            <Form.Control
              type="text"
              name="nomor_ktp"
              value={formData.nomor_ktp}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email Akun</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Foto KTP (Kosongkan jika tidak ingin mengubah)</Form.Label>
            <Form.Control
              type="file"
              name="foto_ktp"
              accept="image/*"
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Foto Profil (Kosongkan jika tidak ingin mengubah)</Form.Label>
            <Form.Control
              type="file"
              name="profile_picture"
              accept="image/*"
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Keuntungan</Form.Label>
            <Form.Control
              type="number"
              name="keuntungan"
              value={formData.keuntungan}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Badge</Form.Label>
            <Form.Select
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              required
            >
              <option value="0">0</option>
              <option value="1">1</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Total Poin</Form.Label>
            <Form.Control
              type="number"
              name="total_poin"
              value={formData.total_poin}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tanggal Registrasi</Form.Label>
            <Form.Control
              type="datetime-local"
              name="tanggal_registrasi"
              value={formData.tanggal_registrasi}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button variant="success" type="submit" className="w-100">
            Simpan Perubahan
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPenitipFormModal;