import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Table, Nav, Modal, Badge } from 'react-bootstrap';
import { BsSearch, BsExclamationTriangle, BsFilter, BsCalendar, BsGrid, BsListUl } from 'react-icons/bs';
import { apiSubPembelian } from '../../clients/SubPembelianService';
import { apiPembeli } from '../../clients/PembeliService';
import { GetPegawaiByAkunId, GetAllPegawai } from '../../clients/PegawaiService';
import { decodeToken } from '../../utils/jwtUtils';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from '../../components/toast/ToastNotification';
import PaginationComponent from '../../components/pagination/Pagination';
import CetakNotaPengambilan from '../../components/pdf/CetakNotaPengambilan';
import TransaksiCard from '../../components/card/CardListPengiriman';
import { UpdatePengirimanStatus } from '../../clients/PengirimanService';
import { CreateTransaksi } from '../../clients/TransaksiService'; // Add this
import { UpdateKeuntunganPenitip } from '../../clients/PenitipService';
import { UpdatePoinPembeli } from '../../clients/PembeliService';


const Pengiriman = () => {
  const [transaksiList, setTransaksiList] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [filteredKurir, setFilteredKurir] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [selectedView, setSelectedView] = useState('Diproses');
  const [akun, setAkun] = useState(null);
  const [pegawai, setPegawai] = useState('');
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const statusViews = [
    { id: 'Diproses', name: 'Diproses' },
    { id: 'Sedang dikirim', name: 'Sedang Dikirim' },
  ];

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token tidak ditemukan');
        const decoded = decodeToken(token);
        setAkun(decoded);
        if (!decoded?.id) throw new Error('Invalid token structure');
        if (decoded.role === 'Pegawai Gudang') {
          const response = await GetPegawaiByAkunId(decoded.id);
          setPegawai(response.data);
        }
        // Fetch all pegawai and filter for Kurir role
        const pegawaiResponse = await GetAllPegawai();
        // console.log('pegawai', pegawaiResponse.data)
        const kurirList = pegawaiResponse.data.filter(peg => peg.Akun?.role === 'Kurir');
        setFilteredKurir(kurirList);
        // console.log('kurir list', kurirList)
      } catch (err) {
        setError('Gagal memuat data user!');
        console.error('Error:', err);
        showNotification('Gagal memuat data user!', 'danger');
      }
    };

    fetchUserData();
    fetchData();
  }, []);

  useEffect(() => {
    filterTransaksiData();
  }, [selectedView, transaksiList, searchTerm, startDate, endDate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransaksi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchData = async () => {
    setLoading(true);
    try {
      const transaksiResponse = await apiSubPembelian.getAllSubPembelian();
      const updatedTransaksi = await Promise.all(
        transaksiResponse.map(async (transaksi) => {
          if (transaksi.pengiriman?.jenis_pengiriman === 'Dikirim kurir') {
            const pembeliResponse = await apiPembeli.getPembeliById(transaksi.id_pembeli);
            return { ...transaksi, Pembeli: pembeliResponse.pembeli };
          }
          return null;
        })
      );

      const filteredTransaksi = updatedTransaksi.filter((item) => item);
      setTransaksiList(filteredTransaksi);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi nanti.');
      showNotification('Gagal memuat data. Silakan coba lagi nanti.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  const filterTransaksiData = () => {
    let filtered = [...transaksiList];

    if (selectedView !== 'all') {
      filtered = filtered.filter((item) =>
        item.pengiriman?.status_pengiriman === selectedView ||
        (selectedView === 'Menunggu diambil pembeli' && item.pengiriman?.status_pengiriman === 'Diproses')
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          (item.id_pembelian &&
            item.id_pembelian.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.Pembeli?.nama &&
            item.Pembeli.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.barang?.some((b) =>
            b.nama.toLowerCase().includes(searchTerm.toLowerCase())
          )) ||
          (item.barang?.some((b) =>
            b.id_barang.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      );
    }

    if (startDate || endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.tanggal_pembelian).setHours(0, 0, 0, 0);
        const startDateTime = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : -Infinity;
        const endDateTime = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
        return itemDate >= startDateTime && itemDate <= endDateTime;
      });
    }

    setFilteredTransaksi(filtered);
    setCurrentPage(1);
  };

  const handleCetakNota = async (transaksi) => {
    try {
      if (!transaksi || !transaksi.id_pembelian) {
        throw new Error('Transaksi tidak valid');
      }
      setSelectedTransaksi(transaksi);
      setShowNotaModal(true);
      setTransaksiList((prev) =>
        prev.map((item) =>
          item.id_pembelian === transaksi.id_pembelian ? { ...item, cetakNotaDone: true } : item
        )
      );
    } catch (error) {
      console.error('Error preparing nota:', error);
      showNotification('Gagal memuat data untuk cetak nota!', 'danger');
    }
  };

  const calculatePoinPembeli = (totalHargaBarang) => {
    const harga = parseFloat(totalHargaBarang);
    
    // Base poin: tiap 10.000 dapat 1 poin
    let basePoin = Math.floor(harga / 10000);
    
    // Bonus 20% jika pembelian di atas 500.000
    if (harga > 500000) {
      const bonusPoin = Math.floor(basePoin * 0.20);
      basePoin += bonusPoin;
    }
    
    return basePoin;
  };


  const handleConfirmDiambil = async (transaksi) => {
    try {
      const today = new Date().toISOString();
      const updatedStatus = 'Sudah diterima kurir';

      // Update Pengiriman status
      await UpdatePengirimanStatus(transaksi.pengiriman.id_pengiriman, {
        id_pembelian: transaksi.id_pembelian,
        tanggal_mulai: transaksi.pengiriman.tanggal_mulai,
        tanggal_berakhir: today,
        status_pengiriman: updatedStatus,
        jenis_pengiriman: 'Dikirim kurir',
      });

      // Create Transaksi for each barang
      for (const barang of transaksi.barang) {
        if (barang.id_penitip) {
          try {
            const id_sub_pembelian = barang.id_sub_pembelian;
            if (!id_sub_pembelian) throw new Error(`SubPembelian not found for barang ${barang.id_barang}`);

            const penitipan = barang.Penitipan;
            if (!penitipan) throw new Error(`Penitipan not found for barang ${barang.id_barang}`);

            const harga = parseFloat(barang.harga);
            let komisi_reusemart_percent = penitipan.perpanjangan ? 0.25 : 0.20;
            let komisi_reusemart = harga * komisi_reusemart_percent;
            let komisi_hunter = barang.id_hunter ? harga * 0.05 : 0;
            if (komisi_hunter > 0) komisi_reusemart -= komisi_hunter;

            const saleDate = new Date(transaksi.tanggal_pembelian);
            const penitipanDate = new Date(penitipan.tanggal_awal_penitipan);
            const daysDiff = (saleDate - penitipanDate) / (1000 * 60 * 60 * 24);
            let bonus_cepat = daysDiff < 7 ? harga * 0.10 * komisi_reusemart_percent : 0;
            if (bonus_cepat > 0) komisi_reusemart -= bonus_cepat;

            const pendapatan = harga - komisi_reusemart - komisi_hunter;

            const transaksiPayload = {
              id_sub_pembelian,
              komisi_reusemart,
              komisi_hunter: komisi_hunter ? komisi_hunter : 0,
              pendapatan,
              bonus_cepat: bonus_cepat ? bonus_cepat : 0,
            };
            
            console.log(`Creating Transaksi for barang ${barang.id_barang}:`, transaksiPayload);
            await CreateTransaksi(transaksiPayload);
            console.log(`Created Transaksi for barang ${barang.id_barang}, id_sub_pembelian: ${id_sub_pembelian}`);
            
            // 🔥 UPDATE SALDO PENITIP
            const totalKeuntunganPenitip = pendapatan + (bonus_cepat || 0);
            await UpdateKeuntunganPenitip(barang.id_penitip, totalKeuntunganPenitip);
            console.log(`Updated keuntungan for penitip ${barang.id_penitip}: +${totalKeuntunganPenitip}`);
            
          } catch (err) {
            console.error(`Failed to create Transaksi for barang ${barang.id_barang}:`, err.message, err.response);
            showNotification(`Gagal membuat transaksi untuk barang ${barang.nama}!`, 'danger');
          }
        }
      }

      // 🔥 UPDATE POIN PEMBELI (SETELAH LOOP SELESAI)
      try {
        // Hitung total harga barang (tanpa ongkir)
        const totalHargaBarang = transaksi.barang.reduce((total, barang) => {
          return total + parseFloat(barang.harga || 0);
        }, 0);

        // Hitung poin yang didapat
        const poinDidapat = calculatePoinPembeli(totalHargaBarang);

        if (poinDidapat > 0) {
          await UpdatePoinPembeli(transaksi.id_pembeli, poinDidapat);
          console.log(`Updated poin for pembeli ${transaksi.id_pembeli}: +${poinDidapat} poin`);
          showNotification(`Pembeli mendapat ${poinDidapat} poin loyalitas!`, 'success');
        }
      } catch (poinError) {
        console.error('Error updating poin pembeli:', poinError);
        showNotification('Transaksi berhasil, namun gagal menambah poin pembeli!', 'warning');
      }

      // Update transaksiList
      setFilteredTransaksi((prev) =>
        prev.map((item) =>
          item.id_pembelian === transaksi.id_pembelian
            ? {
                ...item,
                pengiriman: {
                  ...item.pengiriman,
                  status_pengiriman: updatedStatus,
                  tanggal_berakhir: today,
                  id_pengkonfirmasi: pegawai.id_pegawai,
                },
              }
            : item
        )
      );

      showNotification(`Pengambilan ${updatedStatus} berhasil disimpan!`, 'success');
    } catch (error) {
      console.error('Error in handleConfirmDiambil:', error.message, error.response?.data);
      showNotification('Gagal mengkonfirmasi pengambilan!', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sedang dikirim':
        return <Badge bg="warning">Sedang dikirim</Badge>;
      case 'Diproses':
        return <Badge bg="info">Diproses</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleLihatDetail = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowDetailModal(true);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const renderTransaksiCard = (transaksi) => {
    console.log(transaksi);
    
    return (
      <Col xs={12} md={6} lg={4} key={transaksi.id_pembelian} className="mb-4">
        <TransaksiCard
          transaksi={transaksi}
          handleCetakNota={handleCetakNota}
          handleConfirmDiambil={handleConfirmDiambil}
          handleLihatDetail={handleLihatDetail}
          setTransaksiList={setTransaksiList}
          pegawai={filteredKurir}
        />
      </Col>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" style={{ color: '#028643' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Memuat data transaksi...</p>
        </div>
      );
    }

    if (filteredTransaksi.length === 0) {
      return (
        <div className="text-center py-5">
          <BsExclamationTriangle style={{ fontSize: '3rem', color: '#D9D9D9' }} />
          <p className="mt-3 text-muted">Tidak ada data transaksi yang ditemukan</p>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return <Row>{currentItems.map((transaksi) => renderTransaksiCard(transaksi))}</Row>;
    } else {
      return (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>ID Pembelian</th>
                <th>Barang</th>
                <th>Pembeli</th>
                <th>Tanggal Pembelian</th>
                <th>Total Harga</th>
                <th>Status Pengiriman</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((transaksi) => (
                <tr key={transaksi.id_pembelian}>
                  <td>{transaksi.id_pembelian}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {transaksi.barang?.[0]?.gambar ? (
                        <div className="me-2" style={{ width: '40px', height: '40px', overflow: 'hidden' }}>
                          <img
                            src={`http://localhost:3000/uploads/barang/${transaksi.barang[0].gambar.split(',')[0]}`}
                            alt={transaksi.barang[0].nama}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </div>
                      ) : null}
                      <div>
                        <div className="fw-bold">{transaksi.barang?.[0]?.nama || '-'}</div>
                        <small className="text-muted">
                          {transaksi.barang?.length > 1 ? `${transaksi.barang.length} barang` : transaksi.barang?.[0]?.id_barang || '-'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{transaksi.Pembeli?.nama || '-'}</td>
                  <td>{formatDate(transaksi.tanggal_pembelian)}</td>
                  <td className="fw-bold" style={{ color: '#028643' }}>
                    {formatRupiah(transaksi.total_harga || 0)}
                  </td>
                  <td>{getStatusBadge(transaksi.pengiriman?.status_pengiriman)}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="cetak-nota-btn"
                      onClick={() => handleCetakNota(transaksi)}
                      disabled={transaksi.cetakNotaDone}
                    >
                      <BsPrinter className="me-1" /> Cetak Nota
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return dateString ? new Date(dateString).toLocaleDateString('id-ID', options) : '-';
  };

  return (
    <Container fluid className="p-0 bg-white">
      <ToastNotification
        show={showToast}
        setShow={setShowToast}
        message={toastMessage}
        type={toastType}
      />

      <div className="max-width-container mx-auto pt-4 px-3">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}

        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>
              Daftar Pengiriman
            </h2>
            <p className="text-muted mt-1">Daftar pengiriman barang oleh pembeli atau penitip</p>
          </Col>
        </Row>

        <Row>
          <Col md={3}>
            <RoleSidebar
              namaSidebar={'Status Pengiriman'}
              roles={statusViews}
              selectedRole={selectedView}
              handleRoleChange={setSelectedView}
            />
          </Col>

          <Col md={9}>
            <div className="mb-4">
              <Row className="align-items-center">
                <Col>
                  <div className="position-relative">
                    <BsSearch className="search-icon" />
                    <Form.Control
                      type="search"
                      placeholder="Cari ID pembelian, nama pembeli, nama barang..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </Col>
                <Col xs="auto" className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={toggleDateFilter}
                    className="filter-btn"
                  >
                    <BsFilter /> Filter Tanggal
                  </Button>
                  <Nav className="view-mode-toggle">
                    <Nav.Link
                      className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <BsGrid />
                    </Nav.Link>
                    <Nav.Link
                      className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      <BsListUl />
                    </Nav.Link>
                  </Nav>
                </Col>
              </Row>

              {showDateFilter && (
                <Row className="mt-3">
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small">
                        <BsCalendar className="me-1" /> Tanggal Mulai
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="date-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small">
                        <BsCalendar className="me-1" /> Tanggal Akhir
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="date-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      variant="outline-danger"
                      className="mb-3 w-100 clear-btn"
                      onClick={() => { setStartDate(''); setEndDate(''); }}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              )}
            </div>

            {renderContent()}

            {!loading && filteredTransaksi.length > 0 && totalPages > 1 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
              />
            )}
          </Col>
        </Row>
      </div>

      {selectedTransaksi && (
        <CetakNotaPengambilan
          show={showNotaModal}
          handleClose={() => setShowNotaModal(false)}
          transaksi={selectedTransaksi}
        />
      )}
      
      {selectedTransaksi && (
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Detail Transaksi</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h6>ID Pembelian</h6>
                <p>{selectedTransaksi.id_pembelian}</p>
              </Col>
              <Col md={6}>
                <h6>Status Pengiriman</h6>
                {getStatusBadge(selectedTransaksi.pengiriman?.status_pengiriman)}
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <h6>Pembeli</h6>
                <p>{selectedTransaksi.Pembeli?.nama || '-'}</p>
              </Col>
              <Col md={6}>
                <h6>Tanggal Pembelian</h6>
                <p>{formatDate(selectedTransaksi.tanggal_pembelian)}</p>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <h6>Barang</h6>
                {selectedTransaksi.barang?.map((b, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    {b.gambar ? (
                      <img
                        src={`http://localhost:3000/uploads/barang/${b.gambar.split(',')[0]}`}
                        alt={b.nama}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#f8f9fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '10px',
                          borderRadius: '4px',
                        }}
                      >
                        <span className="text-muted">No Image</span>
                      </div>
                    )}
                    <div>
                      <p className="mb-0 fw-bold">{b.nama}</p>
                      <small className="text-muted">{b.id_barang}</small>
                      <p className="mb-0">{formatRupiah(b.harga)}</p>
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDetailModal(false)}
            >
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>
      )}



      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border-color: #E7E7E7;
          color: #686868;
        }

        .filter-btn:hover {
          background-color: #f8f9fa;
          border-color: #E7E7E7;
          color: #03081F;
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

        .clear-btn:hover {
          background-color: #dc3545;
          color: white;
        }

        .position-relative {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #686868;
          z-index: 10;
        }

        .search-input {
          height: 45px;
          padding-left: 45px;
          border-radius: 25px;
          border: 1px solid #E7E7E7;
        }

        .search-input:focus {
          box-shadow: none;
          border-color: #028643;
        }

        .date-input {
          border-radius: 6px;
          border: 1px solid #E7E7E7;
          padding: 8px 12px;
        }

        .date-input:focus {
          box-shadow: none;
          border-color: #028643;
        }

        .view-mode-toggle {
          display: flex;
          border: 1px solid #E7E7E7;
          border-radius: 6px;
          overflow: hidden;
        }

        .view-mode-btn {
          padding: 8px 12px;
          color: #686868;
          transition: background-color 0.2s, color 0.2s;
        }

        .view-mode-btn:hover,
        .view-mode-btn.active {
          background-color: #f8f9fa;
          color: #03081F;
        }

        .view-mode-btn.active {
          font-weight: 500;
          color: #028643;
        }

        .table {
          border-collapse: separate;
          border-spacing: 0;
        }

        .table th {
          background-color: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
          font-weight: 600;
          color: #495057;
          padding: 12px 16px;
        }

        .table td {
          vertical-align: middle;
          border-top: 1px solid #e9ecef;
          padding: 12px 16px;
        }

        .table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .pagination .page-item.active .page-link {
          background-color: #028643;
          border-color: #028643;
        }

        .pagination .page-link {
          color: #028643;
        }

        .pagination .page-link:hover {
          color: #026d36;
        }

        @media (max-width: 768px) {
          .filter-btn {
            margin-top: 10px;
            width: 100%;
          }

          .view-mode-toggle {
            margin-top: 10px;
            width: 100%;
            justify-content: space-between;
          }

          .view-mode-btn {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </Container>
  );
};

export default Pengiriman;