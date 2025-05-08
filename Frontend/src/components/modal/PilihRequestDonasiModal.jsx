import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import { CreateDonasiBarang } from '../../clients/DonasiBarangService';
import { GetAllRequestDonasi, UpdateStatusRequestDonasi } from '../../clients/RequestDonasiService';
import { GetPegawaiByAkunId } from '../../clients/PegawaiService';
import { decodeToken } from '../../utils/jwtUtils';

const PilihRequestDonasiModal = ({ show, onHide, penitipan, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestList, setRequestList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState('');
  const [error, setError] = useState('');
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    if (show) {
      fetchRequestDonasi();
      getCurrentUser();
    }
  }, [show]);

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token tidak ditemukan");
      
      const decoded = decodeToken(token);
      if (!decoded?.id) throw new Error("Invalid token structure");
      
      if (decoded.role === "Owner") {
        const response = await GetPegawaiByAkunId(decoded.id);
        setOwner(response.data.id_pegawai);
      } else {
        throw new Error("User tidak memiliki akses");
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      setError("Gagal memuat data user!");
    }
  };

  const fetchRequestDonasi = async () => {
    try {
      setLoading(true);
      const response = await GetAllRequestDonasi();
      const activeRequests = response.data.filter(req => req.status_request === "Menunggu konfirmasi");
      console.log(activeRequests);
      setRequestList(activeRequests);
      if (activeRequests.length > 0) {
        setSelectedRequest(activeRequests[0].id_request_donasi);
      }
    } catch (error) {
      console.error("Error fetching request donasi:", error);
      setError("Gagal memuat data request donasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) {
      setError("Silakan pilih request donasi terlebih dahulu");
      return;
    }

    if (!owner) {
      setError("Data pegawai tidak ditemukan");
      return;
    }

    try {
      setSubmitting(true);
      
      const donasiData = {
        id_request_donasi: selectedRequest,
        id_owner: owner,
        id_barang: penitipan.id_barang,
        tanggal_donasi: new Date().toISOString().split('T')[0]
      };

      console.log(selectedRequest);
      await CreateDonasiBarang(donasiData);
      await UpdateStatusRequestDonasi(selectedRequest, "Diterima");
      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error submitting donation:", error);
      setError("Gagal membuat donasi barang");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Pilih Request Donasi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="success" />
            <p className="mt-2">Memuat data request donasi...</p>
          </div>
        ) : requestList.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-inbox" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
            <p className="mt-2">Tidak ada request donasi yang aktif saat ini</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p>
                <strong>Barang yang akan didonasikan:</strong> {penitipan?.Barang?.nama || "N/A"}
              </p>
              <p>
                <strong>ID Penitipan:</strong> {penitipan?.id_penitipan || "N/A"}
              </p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Pilih Request Donasi</Form.Label>
              <Form.Select 
                value={selectedRequest}
                onChange={(e) => setSelectedRequest(e.target.value)}
                required
              >
                {requestList.map((request) => (
                  <option key={request.id_request_donasi} value={request.id_request_donasi}>
                    {request.id_request_donasi} - {request.OrganisasiAmal?.nama_organisasi || "N/A"}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selectedRequest && (
              <Card className="mb-3 mt-4 border-primary-subtle">
                <Card.Header className="bg-primary-subtle">Detail Request Donasi</Card.Header>
                <Card.Body>
                  {requestList.map((request) => {
                    if (request.id_request_donasi === selectedRequest) {
                      return (
                        <Row key={request.id_request_donasi}>
                          <Col md={6}>
                            <p><strong>ID Request:</strong> {request.id_request_donasi}</p>
                            <p><strong>Organisasi:</strong> {request.OrganisasiAmal?.nama_organisasi}</p>
                            <p><strong>Tanggal Request:</strong> {formatDate(request.tanggal_request)}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Status:</strong> <span className="badge bg-success">{request.status_request}</span></p>
                            <p><strong>Alamat Organisasi:</strong> {request.OrganisasiAmal?.alamat || "-"}</p>
                          </Col>
                          <Col md={12} className="mt-2">
                            <p><strong>Deskripsi:</strong> {request.deskripsi_request || "-"}</p>
                          </Col>
                        </Row>
                      );
                    }
                    return null;
                  })}
                </Card.Body>
              </Card>
            )}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Batal
        </Button>
        <Button 
          variant="success" 
          onClick={handleSubmit} 
          disabled={submitting || loading || requestList.length === 0}
        >
          {submitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              Memproses...
            </>
          ) : (
            "Konfirmasi Donasi"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PilihRequestDonasiModal;