import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Badge,
  Spinner,
  Table,
  Nav,
  Modal,
} from 'react-bootstrap';
import {
  BsSearch,
  BsExclamationTriangle,
  BsFilter,
  BsCalendar,
  BsGrid,
  BsListUl,
} from 'react-icons/bs';
import { apiSubPembelian } from '../../clients/SubPembelianService';
import { apiPembeli } from '../../clients/PembeliService';
import { GetPegawaiByAkunId } from '../../clients/PegawaiService';
import { decodeToken } from '../../utils/jwtUtils';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from '../../components/toast/ToastNotification';
import PaginationComponent from '../../components/pagination/Pagination';
import CardTransaksi from '../../components/card/CardTransaksi.jsx';

const DaftarTransaksi = () => {
  const [transaksiList, setTransaksiList] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [selectedView, setSelectedView] = useState('all');
  const [akun, setAkun] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const statusViews = [
    { id: 'all', name: 'Semua Transaksi' },
    { id: 'Menunggu diambil pembeli', name: 'Menunggu Diambil' },
    { id: 'Diproses', name: 'Diproses' },
    { id: 'Transaksi selesai', name: 'Selesai' },
    { id: 'Hangus', name: 'Hangus' },
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
      const response = await apiSubPembelian.getAllSubPembelian();
      const transaksiWithPembeli = await Promise.all(
        response.map(async (transaksi) => {
          try {
            const pembeliResponse = await apiPembeli.getPembeliById(transaksi.id_pembeli);
            return { ...transaksi, Pembeli: pembeliResponse.pembeli };
          } catch (error) {
            console.error(`Error fetching pembeli for ${transaksi.id_pembeli}:`, error);
            return { ...transaksi, Pembeli: null };
          }
        })
      );
      setTransaksiList(transaksiWithPembeli);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data transaksi. Silakan coba lagi nanti.');
      showNotification('Gagal memuat data transaksi. Silakan coba lagi nanti.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return dateString ? new Date(dateString).toLocaleDateString('id-ID', options) : '-';
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const filterTransaksiData = () => {
    let filtered = [...transaksiList];

    if (selectedView !== 'all') {
      filtered = filtered.filter((item) => item.pengiriman?.status_pengiriman === selectedView);
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

  const handleLihatDetail = (transaksi) => {
    setDetailTransaksi(transaksi);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu diambil pembeli':
        return <Badge bg="warning">Menunggu Diambil</Badge>;
      case 'Diproses':
        return <Badge bg="info">Diproses</Badge>;
      case 'Transaksi selesai':
        return <Badge bg="success">Selesai</Badge>;
      case 'Hangus':
        return <Badge bg="danger">Hangus</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const baseUrl = 'http://localhost:3000/uploads/barang/';

  const renderTransaksiCard = (transaksi) => {
    return (
      <Col xs={12} md={6} lg={4} key={transaksi.id_pembelian} className="mb-4">
        <CardTransaksi
          transaksi={transaksi}
          handleLihatDetail={handleLihatDetail}
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
                <th>Total Bayar</th>
                <th>Status</th>
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
                        <div
                          className="me-2"
                          style={{ width: '40px', height: '40px', overflow: 'hidden' }}
                        >
                          <img
                            src={`${baseUrl}${transaksi.barang[0].gambar.split(',')[0]}`}
                            alt={transaksi.barang[0].nama}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </div>
                      ) : null}
                      <div>
                        <div className="fw-bold">{transaksi.barang?.[0]?.nama || '-'}</div>
                        <small className="text-muted">
                          {transaksi.barang?.length > 1
                            ? `${transaksi.barang.length} barang`
                            : transaksi.barang?.[0]?.id_barang || '-'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{transaksi.Pembeli?.nama || '-'}</td>
                  <td>{formatDate(transaksi.tanggal_pembelian)}</td>
                  <td className="fw-bold" style={{ color: '#028643' }}>
                    {formatRupiah(transaksi.total_bayar || 0)}
                  </td>
                  <td>{getStatusBadge(transaksi.pengiriman?.status_pengiriman)}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleLihatDetail(transaksi)}
                    >
                      Lihat Detail
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
              Daftar Transaksi
            </h2>
            <p className="text-muted mt-1">Daftar transaksi pembelian barang</p>
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
                      onClick={clearDateFilter}
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

      {detailTransaksi && (
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
                <p>{detailTransaksi.id_pembelian}</p>
              </Col>
              <Col md={6}>
                <h6>Status Pengiriman</h6>
                {getStatusBadge(detailTransaksi.pengiriman?.status_pengiriman)}
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <h6>Pembeli</h6>
                <p>{detailTransaksi.Pembeli?.nama || '-'}</p>
              </Col>
              <Col md={6}>
                <h6>Tanggal Pembelian</h6>
                <p>{formatDate(detailTransaksi.tanggal_pembelian)}</p>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <h6>Total Bayar</h6>
                <p className="fw-bold" style={{ color: '#028643' }}>
                  {formatRupiah(detailTransaksi.total_bayar || 0)}
                </p>
              </Col>
              <Col md={6}>
                <h6>Ongkir</h6>
                <p>{formatRupiah(detailTransaksi.ongkir || 0)}</p>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <h6>Barang</h6>
                {detailTransaksi.barang?.map((b, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    {b.gambar ? (
                      <img
                        src={`${baseUrl}${b.gambar.split(',')[0]}`}
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
            <Row className="mt-3">
              <Col md={6}>
                <h6>Jenis Pengiriman</h6>
                <p>{detailTransaksi.pengiriman?.jenis_pengiriman || '-'}</p>
              </Col>
              <Col md={6}>
                <h6>Status Pembelian</h6>
                <p>{detailTransaksi.status_pembelian || '-'}</p>
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

export default DaftarTransaksi;