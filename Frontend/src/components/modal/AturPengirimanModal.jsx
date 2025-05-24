import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { BsBoxSeam, BsCalendar } from 'react-icons/bs';
import { CreatePengiriman } from '../../clients/PengirimanService';
import { apiPembelian } from '../../clients/PembelianService';

const AturPengirimanModal = ({ show, handleClose, penitipan, pegawai, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pembelian, setPembelian] = useState(null);
  const [formData, setFormData] = useState({
    id_pengiriman: `PENG-${Date.now()}`, // Generate unique ID
    id_pembelian: '',
    id_pengkonfirmasi: '',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_berakhir: '',
    status_pengiriman: 'Menunggu Pengiriman',
    jenis_pengiriman: 'Reguler',
    kurir: '',
  });

  useEffect(() => {
    const fetchPembelian = async () => {
      if (show && penitipan?.id_pembelian) {
        try {
          const response = await apiPembelian.getPembelianById(penitipan.id_pembelian);
          setPembelian(response);
        } catch (err) {
          console.error('Error fetching pembelian:', err);
          setError('Gagal memuat data pembelian.');
        }
      }
    };

    fetchPembelian();

    if (show && penitipan && pegawai) {
      setFormData((prev) => ({
        ...prev,
        id_pembelian: penitipan.id_pembelian || penitipan.id_penitipan, // Fallback to id_penitipan if no pembelian
        id_pengkonfirmasi: pegawai.id_pegawai || '',
      }));
    }
  }, [show, penitipan, pegawai]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await CreatePengiriman(formData);
      setLoading(false);
      onSuccess(response);
      showNotification('Data pengiriman berhasil disimpan!', 'success');
      handleClose();
    } catch (error) {
      console.error('Error creating pengiriman:', error);
      setError('Gagal membuat data pengiriman. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    // Assuming a global or parent toast notification handler
    if (onSuccess) {
      onSuccess({ message, type });
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <BsBoxSeam className="me-2" />
          Atur Pengiriman Barang
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>ID Pengiriman</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.id_pengiriman}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">ID pengiriman otomatis diisi</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>ID Transaksi</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.id_pembelian}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  ID transaksi otomatis diisi dari data pembelian/penitipan
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Barang</Form.Label>
                <Form.Control
                  type="text"
                  value={penitipan?.Barang?.nama || '-'}
                  disabled
                  className="bg-light"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Harga Barang</Form.Label>
                <Form.Control
                  type="text"
                  value={new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(penitipan?.Barang?.harga || 0)}
                  disabled
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pembeli</Form.Label>
                <Form.Control
                  type="text"
                  value={pembelian?.Pembeli?.nama_pembeli || '-'}
                  disabled
                  className="bg-light"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Alamat Pengiriman</Form.Label>
                <Form.Control
                  type="text"
                  value={pembelian?.AlamatPembeli?.alamat_lengkap || '-'}
                  disabled
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Kurir</Form.Label>
                <Form.Select
                  name="kurir"
                  value={formData.kurir}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Kurir</option>
                  <option value="JNE">JNE</option>
                  <option value="J&T">J&T</option>
                  <option value="SiCepat">SiCepat</option>
                  <option value="AnterAja">AnterAja</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Jenis Pengiriman</Form.Label>
                <Form.Select
                  name="jenis_pengiriman"
                  value={formData.jenis_pengiriman}
                  onChange={handleChange}
                  required
                >
                  <option value="Reguler">Reguler (2-3 hari)</option>
                  <option value="Express">Express (1 hari)</option>
                  <option value="Same Day">Same Day (Hari yang sama)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <BsCalendar className="me-1" /> Tanggal Mulai Pengiriman
                </Form.Label>
                <Form.Control
                  type="date"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleChange}
                  required
                  className="date-input"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <BsCalendar className="me-1" /> Estimasi Tanggal Sampai
                </Form.Label>
                <Form.Control
                  type="date"
                  name="tanggal_berakhir"
                  value={formData.tanggal_berakhir}
                  onChange={handleChange}
                  className="date-input"
                />
                <Form.Text className="text-muted">
                  Opsional, dapat diisi setelah barang dikirim
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status Pengiriman</Form.Label>
                <Form.Select
                  name="status_pengiriman"
                  value={formData.status_pengiriman}
                  onChange={handleChange}
                  required
                >
                  <option value="Menunggu Pengiriman">Menunggu Pengiriman</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Dikirim">Dikirim</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pengkonfirmasi</Form.Label>
                <Form.Control
                  type="text"
                  value={pegawai?.id_pegawai || '-'}
                  disabled
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2" disabled={loading}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={loading || !formData.kurir}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Data Pengiriman'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <style jsx>{`
        .date-input:focus {
          box-shadow: none;
          border-color: #028643;
        }
      `}</style>
    </Modal>
  );
};

export default AturPengirimanModal;