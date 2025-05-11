import React from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { BsUpload } from 'react-icons/bs';
import ImagePreviewComponent from '../imagePreview/ImagePreview';

const AddEditBarangModal = ({
  showModal,
  setShowModal,
  formData,
  handleInputChange,
  handleDateChange,
  handleImageChange,
  imagePreview,
  handleSubmit,
  currentBarang,
  penitipList,
  pegawaiList,
  kategoriOptions,
  statusQCOptions,
}) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
      <Modal.Header closeButton style={{ backgroundColor: '#028643', color: 'white' }}>
        <Modal.Title>{currentBarang ? 'Edit Barang' : 'Tambah Barang Baru'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Penitip</Form.Label>
                <Form.Select 
                  name="id_penitip"
                  value={formData.id_penitip}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                >
                  <option value="">Pilih Penitip</option>
                  {penitipList.map(penitip => (
                    <option key={penitip.id_penitip} value={penitip.id_penitip}>
                      {penitip.nama_penitip} - {penitip.id_penitip}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Kategori Barang</Form.Label>
                <Form.Select
                  name="kategori_barang"
                  value={formData.kategori_barang}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriOptions.map((kategori, index) => (
                    <option key={index} value={kategori}>{kategori}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Hunter (Opsional)</Form.Label>
                <Form.Select 
                  name="id_hunter"
                  value={formData.id_hunter}
                  onChange={handleInputChange}
                  className="form-control-custom"
                >
                  <option value="">Pilih Hunter</option>
                  {pegawaiList
                    .filter(pegawai => pegawai.Akun.role === "Hunter")
                    .map(pegawai => (
                      <option key={pegawai.id_pegawai} value={pegawai.id_pegawai}>
                        {pegawai.nama_pegawai} - {pegawai.id_pegawai}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Nama Barang</Form.Label>
            <Form.Control
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              placeholder="Masukkan nama barang"
              required
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deskripsi</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              placeholder="Masukkan deskripsi barang"
              required
              className="form-control-custom"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Harga (Rp)</Form.Label>
                <Form.Control
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  placeholder="Masukkan harga barang"
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Berat (Kg)</Form.Label>
                <Form.Control
                  type="number"
                  name="berat"
                  value={formData.berat}
                  onChange={handleInputChange}
                  placeholder="Masukkan berat barang"
                  step="0.01"
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status QC</Form.Label>
                <Form.Select
                  name="status_qc"
                  value={formData.status_qc}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                >
                  {statusQCOptions.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="garansi_berlaku"
                  label="Garansi Berlaku"
                  name="garansi_berlaku"
                  checked={formData.garansi_berlaku}
                  onChange={handleInputChange}
                  className="mt-4"
                />
              </Form.Group>
            </Col>
          </Row>

          {formData.garansi_berlaku && (
            <Form.Group className="mb-3">
              <Form.Label>Tanggal Garansi</Form.Label>
              <Form.Control
                type="date"
                value={formData.tanggal_garansi || ''}
                onChange={handleDateChange}
                required
                className="form-control-custom"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Gambar Barang (Maksimal 2 gambar)</Form.Label>
            <div className="input-group">
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="form-control form-control-custom"
              />
              <span className="input-group-text">
                <BsUpload />
              </span>
            </div>
            <Form.Text className="text-muted">
              Format yang didukung: JPEG, PNG, JPG. Ukuran maksimal: 5MB per file.
            </Form.Text>
            <ImagePreviewComponent imagePreview={imagePreview} />
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="outline-secondary" className="me-2" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="success" type="submit">
              {currentBarang ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
      
      <style jsx>{`
        .form-control-custom {
          border-radius: 6px;
          border-color: #E7E7E7;
          padding: 10px 12px;
        }
        
        .form-control-custom:focus {
          box-shadow: none;
          border-color: #028643;
        }
        
        .modal-content {
          border-radius: 8px;
          border: none;
        }
      `}</style>
    </Modal>
  );
};

export default AddEditBarangModal;