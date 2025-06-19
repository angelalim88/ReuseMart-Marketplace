import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { BsUpload, BsXCircle } from 'react-icons/bs';

const AddEditBarangModal = ({
  showModal,
  setShowModal,
  formData,
  handleInputChange,
  handleDateChange,
  handleImageChange,
  handleRemoveImage,
  imagePreview,
  handleSubmit,
  currentBarang,
  penitipList,
  pegawaiList,
  kategoriOptions,
  statusQCOptions,
}) => {
  const [validationError, setValidationError] = useState('');

  const handleFileInputChange = (e) => {
    setValidationError('');
    
    // Panggil handleImageChange dari parent
    handleImageChange(e);
  };

  const handleRemoveImageClick = (index) => {
    // Panggil handleRemoveImage dari parent
    handleRemoveImage(index);
  };

  const getImagePreviewUrl = (index) => {
    const imageKey = index === 0 ? 'image1' : 'image2';
    return imagePreview[imageKey] || null;
  };

  const shouldShowGaransi = () => {
    return formData.kategori_barang === 'Elektronik & Gadget';
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
      <Modal.Header closeButton style={{ backgroundColor: '#028643', color: 'white' }}>
        <Modal.Title>{currentBarang ? 'Edit Barang' : 'Tambah Barang Baru'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          {validationError && (
            <Alert variant="danger" className="mb-3">
              {validationError}
            </Alert>
          )}

          {/* Basic Information */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Penitip <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="id_penitip"
                  value={formData.id_penitip || ''}
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
                <Form.Label>Kategori Barang <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="kategori_barang"
                  value={formData.kategori_barang || ''}
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
                  value={formData.id_hunter || ''}
                  onChange={handleInputChange}
                  className="form-control-custom"
                >
                  <option value="">Pilih Hunter</option>
                  {pegawaiList
                    .filter(pegawai => pegawai.Akun && pegawai.Akun.role === "Hunter")
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
            <Form.Label>Nama Barang <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="nama"
              value={formData.nama || ''}
              onChange={handleInputChange}
              placeholder="Masukkan nama barang"
              required
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deskripsi <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="deskripsi"
              value={formData.deskripsi || ''}
              onChange={handleInputChange}
              placeholder="Masukkan deskripsi barang"
              required
              className="form-control-custom"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Harga (Rp) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="harga"
                  value={formData.harga || ''}
                  onChange={handleInputChange}
                  placeholder="Masukkan harga barang"
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Berat (Kg) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="berat"
                  value={formData.berat || ''}
                  onChange={handleInputChange}
                  placeholder="Masukkan berat barang"
                  step="0.01"
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Status QC - Dapat dipilih oleh Pegawai Gudang */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status Quality Check <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="status_qc"
                  value={formData.status_qc || ''}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                >
                  <option value="">Pilih Status QC</option>
                  {statusQCOptions.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Tentukan status quality check untuk barang ini
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {shouldShowGaransi() && (
            <>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="garansi_berlaku"
                      label="Garansi Berlaku"
                      name="garansi_berlaku"
                      checked={formData.garansi_berlaku === true || formData.garansi_berlaku === "true"}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {(formData.garansi_berlaku === true || formData.garansi_berlaku === "true") && (
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Garansi <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="tanggal_garansi"
                    value={formData.tanggal_garansi || ''}
                    onChange={handleDateChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              )}
            </>
          )}

          {/* Gambar Section */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Gambar Barang 1 
                  {!currentBarang && <span className="text-danger">*</span>}
                </Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileInputChange}
                    data-index="0"
                    className="form-control form-control-custom"
                  />
                  <span className="input-group-text">
                    <BsUpload />
                  </span>
                </div>
                <Form.Text className="text-muted d-block mb-2">
                  Format: JPEG, PNG, JPG. Maks: 5MB.
                </Form.Text>

                {getImagePreviewUrl(0) && (
                  <div className="image-preview-item mt-2">
                    <div className="position-relative">
                      <img
                        src={getImagePreviewUrl(0)}
                        alt="Preview 1"
                        className="preview-image"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="remove-image-btn"
                        onClick={() => handleRemoveImageClick(0)}
                        type="button"
                      >
                        <BsXCircle />
                      </Button>
                    </div>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Gambar Barang 2 (Opsional)</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileInputChange}
                    data-index="1"
                    className="form-control form-control-custom"
                  />
                  <span className="input-group-text">
                    <BsUpload />
                  </span>
                </div>
                <Form.Text className="text-muted d-block mb-2">
                  Format: JPEG, PNG, JPG. Maks: 5MB.
                </Form.Text>

                {getImagePreviewUrl(1) && (
                  <div className="image-preview-item mt-2">
                    <div className="position-relative">
                      <img
                        src={getImagePreviewUrl(1)}
                        alt="Preview 2"
                        className="preview-image"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="remove-image-btn"
                        onClick={() => handleRemoveImageClick(1)}
                        type="button"
                      >
                        <BsXCircle />
                      </Button>
                    </div>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

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

        .image-preview-item {
          width: 100%;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .preview-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(220, 53, 69, 0.9);
          border: none;
        }

        .remove-image-btn:hover {
          background-color: rgba(220, 53, 69, 1);
        }
      `}</style>
    </Modal>
  );
};

export default AddEditBarangModal;