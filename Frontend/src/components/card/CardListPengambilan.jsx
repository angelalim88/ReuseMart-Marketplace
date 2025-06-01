import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { BsBoxSeam, BsCalendar } from 'react-icons/bs';
import ConfirmationModal from '../../components/modal/ConfirmationModal2';
import CetakNotaPengambilan from '../../components/pdf/CetakNotaPengambilan';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SchedulePickup } from '../../clients/PenitipanService';
import { UpdatePengirimanStatus } from '../../clients/PengirimanService';

const CardListPengambilan = ({ penitipan, handleCetakNota, handleConfirmDiambil, setPenitipanList }) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notaPrinted, setNotaPrinted] = useState(penitipan.cetakNotaDone || false);
  const [selectedDate, setSelectedDate] = useState(null);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Dalam masa penitipan':
        return <Badge bg="info">Dalam Penitipan</Badge>;
      case 'Terjual':
        return <Badge bg="primary">Terjual</Badge>;
      case 'Dibeli':
        return <Badge bg="primary">Dibeli</Badge>;
      case 'Didonasikan':
        return <Badge bg="success">Didonasikan</Badge>;
      case 'Menunggu didonasikan':
        return <Badge bg="warning">Menunggu Didonasikan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleOpenConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const handleOpenScheduleModal = () => {
    setShowScheduleModal(true);
  };

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedDate(null);
  };

  const handleScheduleSubmit = async () => {
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(8, 0, 0, 0);
      const startDateWIB = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000));

      let endDate = new Date(startDate);
      let daysAdded = 0;
      while (daysAdded < 2) {
        endDate.setDate(endDate.getDate() + 1);
        const endDayOfWeek = endDate.getDay();
        if (endDayOfWeek !== 0 && endDayOfWeek !== 6) {
          daysAdded++;
        }
      }
      endDate.setHours(20, 0, 0, 0);
      const endDateWIB = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000));

      const scheduleResponse = await SchedulePickup(penitipan.pengiriman.id_pengiriman, {
        tanggal_mulai: startDateWIB.toISOString(),
        tanggal_berakhir: endDateWIB.toISOString(),
      });

      const updateResponse = await UpdatePengirimanStatus(
        penitipan.pengiriman.id_pengiriman,
        'Menunggu diambil pembeli',
        startDateWIB.toISOString(),
        endDateWIB.toISOString()
      );

      console.log('Schedule Response:', scheduleResponse.data);
      console.log('Update Response:', updateResponse.data);

      setPenitipanList((prev) => {
        const newList = [...prev];
        const index = newList.findIndex((item) => item.id_penitipan === penitipan.id_penitipan);
        if (index !== -1) {
          newList[index] = {
            ...newList[index],
            pengiriman: {
              ...newList[index].pengiriman,
              status_pengiriman: 'Menunggu diambil pembeli',
              tanggal_mulai: startDateWIB.toISOString(),
              tanggal_berakhir: endDateWIB.toISOString(),
            },
          };
        }
        return newList;
      });

      handleCloseScheduleModal();
      alert('Jadwal pengambilan berhasil disimpan!');
    } catch (error) {
      console.error('Error scheduling pickup:', error.response?.data || error.message);
      alert('Gagal menyimpan jadwal pengambilan. Silakan coba lagi.');
    }
  };

  return (
    <>
      <Card className="transaksi-card h-100">
        <Card.Body>
          <div className="barang-info-container mb-3">
            <div className="d-flex align-items-center">
              {penitipan.Barang?.gambar ? (
                <div className="me-3" style={{ width: '60px', height: '60px', overflow: 'hidden' }}>
                  <img
                    src={penitipan.Barang.gambar.split(',')[0]}
                    alt={penitipan.Barang.nama}
                    className="barang-image rounded"
                  />
                </div>
              ) : (
                <div
                  className="me-3 no-image-placeholder rounded"
                  style={{ width: '60px', height: '60px' }}
                >
                  <span className="text-muted">No Image</span>
                </div>
              )}
              <div>
                <h6 className="barang-name mb-1">{penitipan.Barang?.nama || '-'}</h6>
                <small className="text-muted">{penitipan.Barang?.id_barang || '-'}</small>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <div>
              <div className="text-muted small">Pembeli</div>
              <div className="fw-medium">{penitipan.pembelian?.pembeli?.nama || '-'}</div>
            </div>
            <div className="text-end">
              <div className="text-muted small">Harga</div>
              <div className="fw-bold" style={{ color: '#028643' }}>
                {formatRupiah(penitipan.Barang?.harga || 0)}
              </div>
            </div>
          </div>

          <div className="barang-details mb-3 flex-grow-1">
            <div className="info-row">
              <span className="info-label">Pembeli</span>
              <span className="info-value">{penitipan.pembelian?.pembeli?.nama || '-'}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Harga</span>
              <span className="info-value fw-bold text-success">
                Rp {parseFloat(penitipan.Barang.harga).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Tanggal Pembelian</span>
              <span className="info-value">{formatDate(penitipan.pembelian.tanggal_pembelian)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Status Penitipan</span>
              <span className="info-value">{getStatusBadge(penitipan.status_penitipan)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Status Pengiriman</span>
              <span className="info-value">{getStatusBadge(penitipan.pengiriman.status_pengiriman)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Tanggal Mulai</span>
              <span className="info-value">{penitipan.pengiriman.tanggal_mulai ? formatDate(penitipan.pengiriman.tanggal_mulai) : '-'}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Tanggal Berakhir</span>
              <span className="info-value">{penitipan.pengiriman.tanggal_berakhir ? formatDate(penitipan.pengiriman.tanggal_berakhir) : '-'}</span>
            </div>
          </div>

          <div className="d-flex flex-column gap-2 mt-3">
            <Button
              variant="outline-success"
              className="atur-pengiriman-btn"
              onClick={handleOpenConfirmationModal}
              disabled={penitipan.pengiriman.status_pengiriman !== 'Menunggu diambil pembeli'}
            >
              <BsBoxSeam className="me-1" /> Konfirmasi Diambil
            </Button>

            <Button
              variant="outline-primary"
              className="schedule-btn"
              onClick={handleOpenScheduleModal}
            >
              <BsCalendar className="me-1" /> Atur Jadwal Pengambilan
            </Button>
          </div>
        </Card.Body>
      </Card>

      {showConfirmationModal && (
        <ConfirmationModal
          show={showConfirmationModal}
          handleClose={handleCloseConfirmationModal}
          penitipan={penitipan}
          handleConfirm={handleConfirmDiambil}
          handleCetakNota={handleCetakNota}
        />
      )}

      <Modal show={showScheduleModal} onHide={handleCloseScheduleModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Atur Jadwal Pengambilan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Pilih Tanggal Mulai (Senin-Jumat)</Form.Label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              filterDate={(date) => {
                const day = date.getDay();
                return day !== 0 && day !== 6;
              }}
              className="form-control"
              placeholderText="Pilih tanggal"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseScheduleModal}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleScheduleSubmit} disabled={!selectedDate}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>


      <style jsx>{`
        .transaksi-info {
          display: flex;
          flex-direction: column; 
          padding-right: 10px; 
        }

        .transaksi-id {
          color: #686868;
          font-size: 0.9rem;
          margin-bottom: 4px; 
        }

        .status-badge {
          display: inline-block; 
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis; 
          white-space: nowrap; 
          font-size: 0.85rem; 
        }

        .status-badge .badge {
          display: inline-block;
          max-width: 100%; 
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .date-info {
          padding-left: 10px;
        }
        .transaksi-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .transaksi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .transaksi-id {
          color: #686868;
          font-size: 0.9rem;
        }

        .barang-name {
          color: #03081F;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .barang-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
          font-size: 0.7rem;
        }

        .cetak-nota-btn {
          border-color: #028643;
          color: #028643;
        }

        .cetak-nota-btn:hover {
          background-color: #028643;
          color: white;
          border-color: #028643;
        }

        .atur-pengiriman-btn {
          border-color: #198754;
          color: #198754;
        }

        .atur-pengiriman-btn:hover {
          background-color: #198754;
          color: white;
          border-color: #198754;
        }

        .atur-pengiriman-btn:disabled {
          border-color: #6c757d;
          color: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .barang-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e9ecef;
        }

        .barang-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
          border-color: #028643;
        }

        .card-header-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .barang-id {
          font-size: 0.9rem;
          color: #6c757d;
          background-color: #f8f9fa;
          padding: 3px 8px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
        }

        .status-badge .badge {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 8px;
        }

        .image-container {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(145deg, #f8f9fa, #e9ecef);
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .barang-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 6px;
        }

        .no-image-placeholder {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .no-image-text {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .barang-name {
          font-weight: 600;
          font-size: 1.1rem;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 2.6rem;
        }

        .barang-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 4px 0;
        }

        .info-label {
          font-size: 0.85rem;
          color: #6c757d;
          font-weight: 500;
          flex: 0 0 40%;
        }

        .info-value {
          font-size: 0.85rem;
          color: #495057;
          font-weight: 600;
          flex: 1;
          word-break: break-word;
          text-align: right;
        }

        .action-buttons {
          gap: 6px;
        }

        .action-btn {
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 6px 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          border-width: 1.5px;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .btn-outline-success:hover {
          background-color: #028643;
          border-color: #028643;
        }

        @media (max-width: 768px) {
          .image-container {
            height: 160px;
          }
          
          .barang-name {
            font-size: 1rem;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .action-btn {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 576px) {
          .card-header-section {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
          
          .status-badge {
            align-self: flex-end;
          }
        }
      `}</style>
    </>
  );
};

export default CardListPengambilan;