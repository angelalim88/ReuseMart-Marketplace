import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Alert, Table, Badge, Pagination } from 'react-bootstrap';
import { Link } from "react-router-dom";
import TopNavigation from "../../components/navigation/TopNavigation";
import { GetAllPenitipan } from "../../clients/PenitipanService";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PaginationComponent from '../../components/pagination/Pagination';
import CetakLaporanStokGudang from '../../components/pdf/CetakLaporanStokGudang';

const LaporanStokGudang = () => {
  const [penitipanData, setPenitipanData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Summary data
  const [summaryData, setSummaryData] = useState({
    totalPenitipan: 0,
    totalNilaiStok: 0,
    totalBeratStok: 0,
    penitipanPerpanjangan: 0,
    kategoriDistribusi: [],
    statusDistribusi: [],
    rataRataHarga: 0
  });

  // Color palette consistent with LaporanBulananPage
  const colors = {
    primary: '#028643',    
    secondary: '#FC8A06',  
    white: '#FFFFFF',      
    dark: '#03081F',       
    gray: '#D9D9D9',       
    muted: '#686868'       
  };

  const statusColors = {
    'Berakhir': '#dc3545',
    'Aktif': colors.primary,
    'Menunggu': colors.secondary,
    'Dibatalkan': colors.muted
  };

  useEffect(() => {
    fetchPenitipanData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [penitipanData, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const fetchPenitipanData = async () => {
    setLoading(true);
    try {
      const response = await GetAllPenitipan();
      const data = response.data || [];
      setPenitipanData(data);
      processSummaryData(data);
    } catch (error) {
      console.error('Error fetching penitipan data:', error);
    }
    setLoading(false);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const processSummaryData = (data) => {
    if (!data || data.length === 0) {
      setSummaryData({
        totalPenitipan: 0,
        totalNilaiStok: 0,
        totalBeratStok: 0,
        penitipanPerpanjangan: 0,
        kategoriDistribusi: [],
        statusDistribusi: [],
        rataRataHarga: 0
      });
      return;
    }

    const totalPenitipan = data.length;
    const totalNilaiStok = data.reduce((sum, item) => sum + parseFloat(item.Barang?.harga || 0), 0);
    const totalBeratStok = data.reduce((sum, item) => sum + parseFloat(item.Barang?.berat || 0), 0);
    const penitipanPerpanjangan = data.filter(item => item.perpanjangan).length;
    const rataRataHarga = totalPenitipan > 0 ? totalNilaiStok / totalPenitipan : 0;

    // Kategori distribution
    const kategoriMap = {};
    data.forEach(item => {
      const kategori = item.Barang?.kategori_barang || 'Tidak Dikategorikan';
      if (!kategoriMap[kategori]) {
        kategoriMap[kategori] = { name: kategori, value: 0, count: 0 };
      }
      kategoriMap[kategori].value += parseFloat(item.Barang?.harga || 0);
      kategoriMap[kategori].count += 1;
    });
    const kategoriDistribution = Object.values(kategoriMap);

    // Status distribution
    const statusMap = {};
    data.forEach(item => {
      const status = item.status_penitipan || 'Unknown';
      if (!statusMap[status]) {
        statusMap[status] = { name: status, value: 0, count: 0 };
      }
      statusMap[status].value += parseFloat(item.Barang?.harga || 0);
      statusMap[status].count += 1;
    });
    const statusDistribution = Object.values(statusMap);

    setSummaryData({
      totalPenitipan,
      totalNilaiStok,
      totalBeratStok,
      penitipanPerpanjangan,
      kategoriDistribusi: kategoriDistribution,
      statusDistribusi: statusDistribution,
      rataRataHarga
    });
  };

  const filterAndSortData = () => {
    let filtered = [...penitipanData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.Barang?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id_penitipan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Barang?.Penitip?.nama_penitip?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.Barang?.kategori_barang === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(item => item.status_penitipan === selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'nama') {
        aValue = a.Barang?.nama || '';
        bValue = b.Barang?.nama || '';
      } else if (sortBy === 'harga') {
        aValue = parseFloat(a.Barang?.harga) || 0;
        bValue = parseFloat(b.Barang?.harga) || 0;
      } else if (sortBy === 'berat') {
        aValue = parseFloat(a.Barang?.berat) || 0;
        bValue = parseFloat(b.Barang?.berat) || 0;
      } else if (sortBy === 'kategori_barang') {
        aValue = a.Barang?.kategori_barang || '';
        bValue = b.Barang?.kategori_barang || '';
      } else if (sortBy === 'status_penitipan') {
        aValue = a.status_penitipan || '';
        bValue = b.status_penitipan || '';
      } else if (sortBy === 'nama_penitip') {
        aValue = a.Barang?.Penitip?.nama_penitip || '';
        bValue = b.Barang?.Penitip?.nama_penitip || '';
      } else if (sortBy === 'id_penitipan') {
        aValue = a.id_penitipan || '';
        bValue = b.id_penitipan || '';
      } else if (sortBy === 'tanggal_awal_penitipan') {
        aValue = new Date(a.tanggal_awal_penitipan).getTime();
        bValue = new Date(b.tanggal_awal_penitipan).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const getUniqueCategories = () => {
    return [...new Set(penitipanData.map(item => item.Barang?.kategori_barang).filter(Boolean))];
  };

  const getUniqueStatuses = () => {
    return [...new Set(penitipanData.map(item => item.status_penitipan).filter(Boolean))];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatWeight = (weight) => {
    return `${parseFloat(weight || 0).toFixed(2)} kg`;
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : '-';
  };

  const getStatusBadge = (status) => {
    const color = statusColors[status] || colors.muted;
    return (
      <Badge style={{ backgroundColor: color, color: colors.white }}>
        {status}
      </Badge>
    );
  };

  const showDetailModal = (penitipan) => {
    setSelectedPenitipan(penitipan);
    setShowModal(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: colors.white,
          border: `2px solid ${colors.primary}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ color: colors.dark, fontWeight: 'bold', margin: 0 }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              Jumlah: {entry.payload.count} item
              <br />
              Nilai: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Container fluid className="p-0 bg-white">
      <TopNavigation />
      
      <div className="max-width-container mx-auto pt-4 px-3">
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 fw-bold" style={{ color: colors.dark }}>
              Laporan Stok Gudang
            </h2>
            <p className="text-muted mt-1">Monitoring inventori dan manajemen barang</p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-3 align-items-center">
              <Button 
                onClick={fetchPenitipanData}
                className="view-btn"
                disabled={loading}
              >
                Refresh Data
              </Button>
              <CetakLaporanStokGudang 
                summaryData={summaryData}
                filteredData={filteredData}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                formatWeight={formatWeight}
                getStatusBadge={getStatusBadge}
                statusColors={statusColors}
                colors={colors}
              />
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: colors.primary }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Memuat data penitipan gudang...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <Row className="mb-4">
              {[
                { title: 'Total Barang', value: formatNumber(summaryData.totalPenitipan), icon: '📦', color: colors.primary },
                { title: 'Total Nilai Stok', value: formatCurrency(summaryData.totalNilaiStok), icon: '💰', color: colors.secondary },
                { title: 'Total Berat Stok', value: formatWeight(summaryData.totalBeratStok), icon: '⚖️', color: colors.dark },
                { title: 'Perpanjangan', value: formatNumber(summaryData.penitipanPerpanjangan), icon: '🔄', color: colors.gray }
              ].map((item, index) => (
                <Col md={3} className="mb-3" key={index}>
                  <Card className="penitipan-card">
                    <Card.Body className="text-center" style={{ backgroundColor: `${item.color}15`, border: `2px solid ${item.color}30` }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{item.icon}</div>
                      <h3 className="fw-bold" style={{ color: item.color, fontSize: '1.8rem', marginBottom: '5px' }}>
                        {item.value}
                      </h3>
                      <p className="text-muted mb-0">{item.title}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Charts */}
            <Row className="mb-4">
              <Col md={6}>
                <Card className="penitipan-card">
                  <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.primary}` }}>
                    <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                      📊 Distribusi Kategori Barang
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={summaryData.kategoriDistribusi}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        >
                          {summaryData.kategoriDistribusi.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? colors.primary : colors.secondary} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="penitipan-card">
                  <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.secondary}` }}>
                    <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                      📈 Status Penitipan
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={summaryData.statusDistribusi}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.gray} />
                        <XAxis 
                          dataKey="name" 
                          stroke={colors.dark}
                          tick={{ fill: colors.dark }}
                        />
                        <YAxis 
                          stroke={colors.dark}
                          tick={{ fill: colors.dark }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          fill={colors.secondary}
                          name="Jumlah Penitipan"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-4">
              <Col>
                <Card className="penitipan-card">
                  <Card.Body>
                    <Row className="align-items-end">
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>
                            Pencarian
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Cari nama barang, ID penitipan, atau penitip..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>
                            Kategori
                          </Form.Label>
                          <Form.Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="search-input"
                          >
                            <option value="">Semua Kategori</option>
                            {getUniqueCategories().map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>
                            Status Penitipan
                          </Form.Label>
                          <Form.Select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="search-input"
                          >
                            <option value="">Semua Status</option>
                            {getUniqueStatuses().map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>
                            Urutkan
                          </Form.Label>
                          <Form.Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="search-input"
                          >
                            <option value="id_penitipan">ID Barang</option>
                            <option value="nama">Nama Barang</option>
                            <option value="harga">Harga</option>
                            <option value="berat">Berat</option>
                            <option value="kategori_barang">Kategori</option>
                            <option value="status_penitipan">Status Penitipan</option>
                            <option value="nama_penitip">Nama Penitip</option>
                            <option value="tanggal_awal_penitipan">Tanggal Awal</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>
                            Urutan
                          </Form.Label>
                          <Form.Select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="search-input"
                          >
                            <option value="asc">A-Z / Kecil-Besar</option>
                            <option value="desc">Z-A / Besar-Kecil</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={1}>
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                            setSelectedStatus('');
                            setSortBy('id_penitipan');
                            setSortOrder('asc');
                          }}
                          className="w-100"
                        >
                          Refresh
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Data Table */}
            <Row className="mb-4">
              <Col>
                <Card className="penitipan-card">
                  <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.primary}` }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                        📋 Detail Penitipan Barang
                      </h4>
                      <span className="text-muted">
                        Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} penitipan
                      </span>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {currentItems.length > 0 ? (
                      <Table responsive striped className="mb-0">
                        <thead style={{ backgroundColor: `${colors.primary}10` }}>
                          <tr>
                            <th style={{ color: colors.dark }}>ID Barang</th>
                            <th style={{ color: colors.dark }}>Nama Barang</th>
                            <th style={{ color: colors.dark }}>Kategori</th>
                            <th style={{ color: colors.dark }}>Penitip</th>
                            <th style={{ color: colors.dark }}>Harga</th>
                            <th style={{ color: colors.dark }}>Berat</th>
                            <th style={{ color: colors.dark }}>Tanggal Awal</th>
                            <th style={{ color: colors.dark }}>Tanggal Akhir</th>
                            <th style={{ color: colors.dark }}>Batas Pengambilan</th>
                            <th style={{ color: colors.dark }}>Perpanjangan</th>
                            <th style={{ color: colors.dark }}>Status</th>
                            <th style={{ color: colors.dark }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((penitipan, index) => (
                            <tr key={penitipan.id_barang}>
                              <td className="fw-bold" style={{ color: colors.primary }}>
                                {penitipan.id_barang}
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">{penitipan.Barang?.nama}</div>
                                </div>
                              </td>
                              <td>
                                <Badge style={{ backgroundColor: `${colors.muted}20`}}>
                                  {penitipan.Barang?.kategori_barang}
                                </Badge>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">{penitipan.Barang?.Penitip?.nama_penitip || '-'}</div>
                                  <small className="text-muted">
                                    Email: {penitipan.Barang?.Penitip?.Akun?.email || '-'}
                                  </small>
                                </div>
                              </td>
                              <td className="fw-bold" style={{ color: colors.primary }}>
                                {formatCurrency(penitipan.Barang?.harga)}
                              </td>
                              <td>{formatWeight(penitipan.Barang?.berat)}</td>
                              <td>{formatDate(penitipan.tanggal_awal_penitipan)}</td>
                              <td>{formatDate(penitipan.tanggal_akhir_penitipan)}</td>
                              <td>{formatDate(penitipan.tanggal_batas_pengambilan)}</td>
                              <td>
                                <Badge bg={penitipan.perpanjangan ? 'success' : 'secondary'}>
                                  {penitipan.perpanjangan ? 'Ya' : 'Tidak'}
                                </Badge>
                              </td>
                              <td>{getStatusBadge(penitipan.status_penitipan)}</td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => showDetailModal(penitipan)}
                                >
                                  Lihat Detail
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: colors.gray }}></i>
                        <h4 className="mt-3">Tidak ada data penitipan</h4>
                        <p className="text-muted">
                          Tidak ada penitipan yang sesuai dengan filter yang dipilih.
                        </p>
                      </div>
                    )}
                  </Card.Body>
                  {currentItems.length > 0 && totalPages > 1 && (
                    <Card.Footer style={{ backgroundColor: colors.white, borderTop: `1px solid ${colors.gray}` }}>
                      <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        paginate={paginate}
                      />
                    </Card.Footer>
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Detail Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header 
            closeButton 
            style={{ 
              backgroundColor: colors.primary, 
              color: colors.white,
              border: 'none'
            }}
          >
            <Modal.Title className="fw-bold">
              Detail Penitipan: {selectedPenitipan?.id_penitipan}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: colors.white }}>
            {selectedPenitipan && (
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>ID Penitipan:</strong>
                    <div style={{ color: colors.primary, fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {selectedPenitipan.id_penitipan}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>ID Barang:</strong>
                    <div>{selectedPenitipan.id_barang}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Nama Barang:</strong>
                    <div>{selectedPenitipan.Barang?.nama}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Kategori:</strong>
                    <div>
                      <Badge style={{ backgroundColor: colors.secondary }}>
                        {selectedPenitipan.Barang?.kategori_barang}
                      </Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Harga:</strong>
                    <div style={{ color: colors.primary, fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {formatCurrency(selectedPenitipan.Barang?.harga)}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Berat:</strong>
                    <div>{formatWeight(selectedPenitipan.Barang?.berat)}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Tanggal Awal Penitipan:</strong>
                    <div>{formatDate(selectedPenitipan.tanggal_awal_penitipan)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Tanggal Akhir Penitipan:</strong>
                    <div>{formatDate(selectedPenitipan.tanggal_akhir_penitipan)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Batas Pengambilan:</strong>
                    <div>{formatDate(selectedPenitipan.tanggal_batas_pengambilan)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Perpanjangan:</strong>
                    <div>
                      <Badge bg={selectedPenitipan.perpanjangan ? 'success' : 'secondary'}>
                        {selectedPenitipan.perpanjangan ? 'Ya' : 'Tidak'}
                      </Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Status Penitipan:</strong>
                    <div>{getStatusBadge(selectedPenitipan.status_penitipan)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Penitip:</strong>
                    <div>
                      <div className="fw-bold">{selectedPenitipan.Barang?.Penitip?.nama_penitip || '-'}</div>
                      <small className="text-muted">
                        Email: {selectedPenitipan.Barang?.Penitip?.Akun?.email || '-'}
                        <br />
                        Total Poin: {selectedPenitipan.Barang?.Penitip?.total_poin || 0}
                      </small>
                    </div>
                  </div>
                </Col>
                {selectedPenitipan.Barang?.gambar && (
                  <Col xs={12} className="mt-3">
                    <strong>Gambar Barang:</strong>
                    <div className="mt-2">
                      {selectedPenitipan.Barang.gambar.split(',').map((img, index) => (
                        <img
                          key={index}
                          src={img.trim()}
                          alt={`${selectedPenitipan.Barang.nama} ${index + 1}`}
                          style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover',
                            marginRight: '10px',
                            marginBottom: '10px',
                            borderRadius: '8px',
                            border: `2px solid ${colors.gray}`
                          }}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: `${colors.gray}20`, border: 'none' }}>
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowModal(false)}
              className="cancel-btn"
            >
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        .penitipan-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        
        .penitipan-card:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .view-btn {
          background-color: #028643;
          border-color: #028643;
          font-weight: 500;
          border-radius: 4px;
          color: white;
        }
        
        .view-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
          color: white;
        }
        
        .cancel-btn {
          border-color: #E7E7E7;
          color: #03081F;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .cancel-btn:hover {
          background-color: #f8f9fa;
          border-color: #D9D9D9;
        }
        
        .search-input {
          height: 45px;
          border-radius: 8px;
          border: 1px solid #E7E7E7;
          padding: 0 15px;
        }
        
        .search-input:focus {
          box-shadow: none;
          border-color: #028643;
        }
        
        .table td, .table th {
          vertical-align: middle;
          padding: 12px;
        }
        
        .table thead th {
          font-weight: 600;
          border-bottom: 2px solid #028643;
        }
        
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
        
        .pagination .page-link {
          color: #028643;
          border: 1px solid #E7E7E7;
        }
        
        .pagination .page-item.active .page-link {
          background-color: #028643;
          border-color: #028643;
        }
        
        .pagination .page-link:hover {
          color: #026d36;
          background-color: #f8f9fa;
        }
        
        .modal-content {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .badge {
          font-size: 0.8rem;
          padding: 6px 10px;
          border-radius: 6px;
        }
        
        @media (max-width: 768px) {
          .d-flex.gap-3 {
            flex-direction: column;
            gap: 10px !important;
          }
          
          .view-btn {
            width: 100%;
          }
          
          .table-responsive {
            font-size: 0.9rem;
          }
          
          .card-body .row {
            margin: 0;
          }
          
          .card-body .row .col-md-2,
          .card-body .row .col-md-3 {
            margin-bottom: 15px;
          }
        }
        
        @media (max-width: 576px) {
          .container-fluid {
            padding: 0 10px;
          }
          
          .summary-cards .col-md-3 {
            margin-bottom: 15px;
          }
          
          .chart-container {
            height: 250px !important;
          }
          
          .table {
            font-size: 0.8rem;
          }
          
          .pagination {
            justify-content: center;
            flex-wrap: wrap;
          }
        }
        
        /* Custom scrollbar */
        .table-responsive::-webkit-scrollbar {
          height: 8px;
        }
        
        .table-responsive::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .table-responsive::-webkit-scrollbar-thumb {
          background: #028643;
          border-radius: 4px;
        }
        
        .table-responsive::-webkit-scrollbar-thumb:hover {
          background: #026d36;
        }
        
        /* Animation for loading */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinner-border {
          animation: spin 1s linear infinite;
        }
        
        /* Chart hover effects */
        .recharts-wrapper {
          transition: all 0.3s ease;
        }
        
        .recharts-wrapper:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </Container>
  );
};

export default LaporanStokGudang;