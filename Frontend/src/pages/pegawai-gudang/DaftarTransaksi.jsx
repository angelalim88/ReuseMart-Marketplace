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
  Nav
} from 'react-bootstrap';
import { 
  BsSearch, 
  BsExclamationTriangle,
  BsPrinter,
  BsFilter,
  BsCalendar,
  BsGrid,
  BsListUl
} from 'react-icons/bs';
import { GetAllPenitipan } from '../../clients/PenitipanService';
import { GetAllPenitip } from '../../clients/PenitipService';
import { GetPegawaiByAkunId } from '../../clients/PegawaiService';
import { decodeToken } from '../../utils/jwtUtils';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from "../../components/toast/ToastNotification";
import PaginationComponent from '../../components/pagination/Pagination';
import CetakNotaModal from '../../components/pdf/NotaPenitipanPdf';
import TransaksiCard from '../../components/card/CardTransaksiPenitipan';

const DaftarTransaksi = () => {
  const [penitipanList, setPenitipanList] = useState([]);
  const [filteredPenitipan, setFilteredPenitipan] = useState([]);
  const [penitipList, setPenitipList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedView, setSelectedView] = useState('all');
  const [akun, setAkun] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const statusViews = [
    { id: 'all', name: 'Semua Transaksi' },
    { id: 'Dalam masa penitipan', name: 'Dalam Penitipan' },
    { id: 'Selesai', name: 'Selesai' },
    { id: 'Tidak diambil', name: 'Tidak Diambil' }
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
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }
        
        const decoded = decodeToken(token);
        setAkun(decoded);
        
        if (!decoded?.id) {
          throw new Error("Invalid token structure");
        }
        
        if (decoded.role === "Pegawai Gudang") {
          const response = await GetPegawaiByAkunId(decoded.id);
          const dataPegawai = response.data;
          setPegawai(dataPegawai);
        }
      } catch (err) {
        setError("Gagal memuat data user!");
        console.error("Error:", err);
      }
    };

    fetchUserData();
    fetchData();
  }, []);

  useEffect(() => {
    filterPenitipanData();
  }, [selectedView, penitipanList, searchTerm, startDate, endDate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPenitipan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPenitipan.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [penitipanResponse, penitipResponse] = await Promise.all([
        GetAllPenitipan(),
        GetAllPenitip()
      ]);

      // Filter penitipan untuk barang yang lulus QC
      const filteredPenitipan = penitipanResponse.data.filter(item => 
        item.Barang && item.Barang.status_qc === 'Lulus'
      );

      setPenitipanList(filteredPenitipan);
      setPenitipList(penitipResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi nanti.');
      showNotification('Gagal memuat data. Silakan coba lagi nanti.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const filterPenitipanData = () => {
    let filtered = [...penitipanList];
    
    if (selectedView !== 'all') {
      filtered = filtered.filter(item => item.status_penitipan === selectedView);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        (item.id_penitipan && item.id_penitipan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.Barang && item.Barang.nama && item.Barang.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.Barang && item.Barang.id_barang && item.Barang.id_barang.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.Barang && item.Barang.Penitip && item.Barang.Penitip.nama_penitip && item.Barang.Penitip.nama_penitip.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date filtering
    if (startDate && endDate) {
      const startDateTime = new Date(startDate).setHours(0, 0, 0, 0);
      const endDateTime = new Date(endDate).setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.tanggal_awal_penitipan).getTime();
        return itemDate >= startDateTime && itemDate <= endDateTime;
      });
    } else if (startDate) {
      const startDateTime = new Date(startDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.tanggal_awal_penitipan).getTime();
        return itemDate >= startDateTime;
      });
    } else if (endDate) {
      const endDateTime = new Date(endDate).setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.tanggal_awal_penitipan).getTime();
        return itemDate <= endDateTime;
      });
    }
    
    setFilteredPenitipan(filtered);
    setCurrentPage(1);
  };

  const handleCetakNota = (penitipan) => {
    setSelectedPenitipan(penitipan);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Dalam masa penitipan':
        return <Badge bg="info">Dalam Penitipan</Badge>;
      case 'Selesai':
        return <Badge bg="success">Selesai</Badge>;
      case 'Tidak diambil':
        return <Badge bg="danger">Tidak Diambil</Badge>;
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

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const renderTransaksiCard = (penitipan) => {
    return (
      <Col xs={12} md={6} lg={4} key={penitipan.id_penitipan} className="mb-4">
        <TransaksiCard 
          penitipan={penitipan} 
          handleCetakNota={handleCetakNota} 
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
    
    if (filteredPenitipan.length === 0) {
      return (
        <div className="text-center py-5">
          <BsExclamationTriangle style={{ fontSize: '3rem', color: '#D9D9D9' }} />
          <p className="mt-3 text-muted">Tidak ada data transaksi yang ditemukan</p>
        </div>
      );
    }
    
    if (viewMode === 'grid') {
      return (
        <Row>
          {currentItems.map((penitipan) => renderTransaksiCard(penitipan))}
        </Row>
      );
    } else {
      return (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>ID Penitipan</th>
                <th>Barang</th>
                <th>Penitip</th>
                <th>Tanggal Penitipan</th>
                <th>Harga</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((penitipan) => (
                <tr key={penitipan.id_penitipan}>
                  <td>{penitipan.id_penitipan}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {penitipan.Barang?.gambar ? (
                        <div className="me-2" style={{ width: '40px', height: '40px', overflow: 'hidden' }}>
                          <img 
                            src={penitipan.Barang.gambar.split(',')[0]} 
                            alt={penitipan.Barang.nama} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </div>
                      ) : null}
                      <div>
                        <div className="fw-bold">{penitipan.Barang?.nama || '-'}</div>
                        <small className="text-muted">{penitipan.Barang?.id_barang || '-'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{penitipan.Barang?.Penitip?.nama_penitip || '-'}</td>
                  <td>{formatDate(penitipan.tanggal_awal_penitipan)}</td>
                  <td className="fw-bold" style={{ color: '#028643' }}>{formatRupiah(penitipan.Barang?.harga || 0)}</td>
                  <td>{getStatusBadge(penitipan.status_penitipan)}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="cetak-nota-btn"
                      onClick={() => handleCetakNota(penitipan)}
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
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Daftar Transaksi</h2>
            <p className="text-muted mt-1">Daftar transaksi barang yang lulus QC</p>
          </Col>
        </Row>

        <Row>
          <Col md={3}>
            <RoleSidebar 
              namaSidebar={'Status Transaksi'}
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
                      placeholder="Cari id penitipan, nama barang..."
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
                      <Form.Label className="small"><BsCalendar className="me-1" /> Tanggal Mulai</Form.Label>
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
                      <Form.Label className="small"><BsCalendar className="me-1" /> Tanggal Akhir</Form.Label>
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
            
            {!loading && filteredPenitipan.length > 0 && totalPages > 1 && (
              <PaginationComponent 
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
              />
            )}
          </Col>
        </Row>
      </div>

      {selectedPenitipan && (
        <CetakNotaModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          penitipan={selectedPenitipan}
        />
      )}

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        /* Button Styles */
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
        
        /* Search Input */
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
        
        /* Date Inputs */
        .date-input {
          border-radius: 6px;
          border: 1px solid #E7E7E7;
          padding: 8px 12px;
        }
        
        .date-input:focus {
          box-shadow: none;
          border-color: #028643;
        }
        
        /* View Mode Toggle */
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
        
        .view-mode-btn:hover, .view-mode-btn.active {
          background-color: #f8f9fa;
          color: #03081F;
        }
        
        .view-mode-btn.active {
          font-weight: 500;
          color: #028643;
        }
        
        /* Table Styles */
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

        /* Pagination Style */
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
        
        /* Responsive adjustments */
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