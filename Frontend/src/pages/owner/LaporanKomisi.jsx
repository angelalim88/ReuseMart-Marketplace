import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Table, Badge, Alert } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parseISO, isSameMonth, format, startOfMonth, endOfMonth } from 'date-fns';
import id from 'date-fns/locale/id';
import PropTypes from 'prop-types';
import TopNavigation from '../../components/navigation/TopNavigation';
import { GetAllTransaksi } from '../../clients/TransaksiService';
import { GetPenitipanByIdBarang } from '../../clients/PenitipanService';
import PaginationComponent from '../../components/pagination/Pagination';
import CetakLaporanKomisi from '../../components/pdf/CetakLaporanKomisi';

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num);
};

const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd MMMM yyyy', { locale: id });
  } catch {
    return '-';
  }
};

const LaporanKomisi = () => {
  const [transaksiData, setTransaksiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [penitipanData, setPenitipanData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // Default to current month

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Summary data
  const [summaryData, setSummaryData] = useState({
    totalTransaksi: 0,
    totalKomisiHunter: 0,
    totalKomisiReusemart: 0,
    totalBonusCepat: 0,
    kategoriDistribusi: [],
    statusDistribusi: [],
  });

  // Color palette
  const colors = {
    primary: '#028643',
    secondary: '#FC8A06',
    white: '#FFFFFF',
    dark: '#03081F',
    gray: '#D9D9D9',
    muted: '#686868',
  };

  const statusColors = {
    'Pembayaran valid': colors.primary,
    'Menunggu pembayaran': colors.secondary,
    'Dibatalkan': '#dc3545',
    'Perlu konfirmasi': '#6f42c1',
  };

  const fetchTransaksiData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await GetAllTransaksi();
      const data = response.data || [];

      // Filter transactions for the selected month
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      const filteredByMonth = data.filter((transaksi) => {
        const tanggalLaku = transaksi.SubPembelian?.Pembelian?.tanggal_pelunasan;
        if (!tanggalLaku) return false;
        try {
          const date = parseISO(tanggalLaku);
          return date >= monthStart && date <= monthEnd;
        } catch {
          return false;
        }
      });

      setTransaksiData(filteredByMonth);
      processSummaryData(filteredByMonth);

      // Fetch penitipan data
      const penitipanMap = {};
      const fetchPromises = filteredByMonth.map(async (transaksi) => {
        const idBarang = transaksi.SubPembelian?.id_barang;
        if (idBarang && !penitipanMap[idBarang]) {
          try {
            const penitipanResponse = await GetPenitipanByIdBarang(idBarang);
            penitipanMap[idBarang] = penitipanResponse.data?.tanggal_awal_penitipan || null;
          } catch (error) {
            console.error(`Error fetching penitipan for id_barang ${idBarang}:`, error);
            penitipanMap[idBarang] = null;
          }
        }
      });

      await Promise.all(fetchPromises);
      setPenitipanData(penitipanMap);
    } catch (error) {
      console.error('Error fetching transaksi data:', error);
      setError('Gagal memuat data transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchTransaksiData();
  }, [fetchTransaksiData]);

  useEffect(() => {
    filterAndSortData();
  }, [transaksiData, searchTerm, selectedCategory, sortBy, sortOrder]);

  const processSummaryData = (data) => {
    if (!data || data.length === 0) {
      setSummaryData({
        totalTransaksi: 0,
        totalKomisiHunter: 0,
        totalKomisiReusemart: 0,
        totalBonusCepat: 0,
        kategoriDistribusi: [],
        statusDistribusi: [],
      });
      return;
    }

    const totalTransaksi = data.length;
    const totalKomisiHunter = data.reduce((sum, item) => sum + (parseFloat(item.komisi_hunter) || 0), 0);
    const totalKomisiReusemart = data.reduce((sum, item) => sum + (parseFloat(item.komisi_reusemart) || 0), 0);
    const totalBonusCepat = data.reduce((sum, item) => sum + (parseFloat(item.bonus_cepat) || 0), 0);

    const kategoriMap = {};
    data.forEach((item) => {
      const kategori = item.SubPembelian?.Barang?.kategori_barang || 'Tidak Dikategorikan';
      if (!kategoriMap[kategori]) {
        kategoriMap[kategori] = { name: kategori, value: 0, count: 0 };
      }
      kategoriMap[kategori].value += parseFloat(item.SubPembelian?.Pembelian?.total_harga || 0);
      kategoriMap[kategori].count += 1;
    });
    const kategoriDistribution = Object.values(kategoriMap);

    const statusMap = {};
    data.forEach((item) => {
      const status = item.SubPembelian?.Pembelian?.status_pembelian || 'Unknown';
      if (!statusMap[status]) {
        statusMap[status] = { name: status, value: 0, count: 0 };
      }
      statusMap[status].value += parseFloat(item.SubPembelian?.Pembelian?.total_harga || 0);
      statusMap[status].count += 1;
    });
    const statusDistribution = Object.values(statusMap);

    setSummaryData({
      totalTransaksi,
      totalKomisiHunter,
      totalKomisiReusemart,
      totalBonusCepat,
      kategoriDistribusi: kategoriDistribution,
      statusDistribusi: statusDistribution,
    });
  };

  const filterAndSortData = () => {
    let filtered = [...transaksiData];

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.SubPembelian?.Barang?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.SubPembelian?.id_barang?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.SubPembelian?.Barang?.kategori_barang === selectedCategory);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'nama') {
        aValue = a.SubPembelian?.Barang?.nama || '';
        bValue = b.SubPembelian?.Barang?.nama || '';
      } else if (sortBy === 'harga_jual') {
        aValue = parseFloat(a.SubPembelian?.Pembelian?.total_harga) || 0;
        bValue = parseFloat(b.SubPembelian?.Pembelian?.total_harga) || 0;
      } else if (sortBy === 'tanggal_laku') {
        aValue = a.SubPembelian?.Pembelian?.tanggal_pelunasan ? new Date(a.SubPembelian.Pembelian.tanggal_pelunasan).getTime() : 0;
        bValue = b.SubPembelian?.Pembelian?.tanggal_pelunasan ? new Date(b.SubPembelian.Pembelian.tanggal_pelunasan).getTime() : 0;
      } else if (sortBy === 'komisi_hunter') {
        aValue = parseFloat(a.komisi_hunter) || 0;
        bValue = parseFloat(b.komisi_hunter) || 0;
      } else if (sortBy === 'komisi_reusemart') {
        aValue = parseFloat(a.komisi_reusemart) || 0;
        bValue = parseFloat(b.komisi_reusemart) || 0;
      } else if (sortBy === 'bonus_cepat') {
        aValue = parseFloat(a.bonus_cepat) || 0;
        bValue = parseFloat(b.bonus_cepat) || 0;
      } else if (sortBy === 'id_barang') {
        aValue = a.SubPembelian?.id_barang || '';
        bValue = b.SubPembelian?.id_barang || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const getUniqueCategories = () => {
    return [...new Set(transaksiData.map((item) => item.SubPembelian?.Barang?.kategori_barang).filter(Boolean))];
  };

  const getStatusBadge = (status) => {
    const color = statusColors[status] || colors.muted;
    return (
      <Badge style={{ backgroundColor: color, color: colors.white }} aria-label={`Status: ${status}`}>
        {status}
      </Badge>
    );
  };

  const showDetailModal = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowModal(true);
  };

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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ color: colors.dark, fontWeight: 'bold', margin: 0 }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              Jumlah: {entry.payload.count} transaksi
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
              Laporan Komisi Bulan {format(selectedMonth, 'MMMM yyyy', { locale: id })}
            </h2>
            <p className="text-muted mt-1">Monitoring komisi dan bonus per produk terjual untuk periode bulan ini</p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-3 align-items-center">
              <Form.Group>
                <Form.Label className="fw-bold" style={{ color: colors.dark }}>Pilih Bulan</Form.Label>
                <Form.Control
                  type="month"
                  value={format(selectedMonth, 'yyyy-MM')}
                  onChange={(e) => setSelectedMonth(parseISO(`${e.target.value}-01`))}
                  className="search-input"
                  aria-label="Pilih bulan untuk laporan"
                />
              </Form.Group>
              <Button
                onClick={fetchTransaksiData}
                className="view-btn"
                disabled={loading}
                aria-label="Refresh data transaksi"
              >
                Refresh Data
              </Button>
              <CetakLaporanKomisi
                filteredData={filteredData}
                summaryData={summaryData}
                penitipanData={penitipanData}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                formatDate={formatDate}
                period={format(selectedMonth, 'MMMM yyyy', { locale: id })}
              />
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: colors.primary }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Memuat data transaksi...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <Row className="mb-4">
              {[
                { title: 'Total Transaksi', value: formatNumber(summaryData.totalTransaksi), icon: '📦', color: colors.primary },
                { title: 'Komisi Hunter', value: formatCurrency(summaryData.totalKomisiHunter), icon: '💸', color: colors.secondary },
                { title: 'Komisi ReUse Mart', value: formatCurrency(summaryData.totalKomisiReusemart), icon: '🏬', color: colors.dark },
                { title: 'Bonus Penitip', value: formatCurrency(summaryData.totalBonusCepat), icon: '🎁', color: colors.gray },
              ].map((item, index) => (
                <Col md={3} className="mb-3" key={index}>
                  <Card className="penitipan-card">
                    <Card.Body className="text-center" style={{ backgroundColor: `${item.color}15`, border: `2px solid ${item.color}30` }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }} aria-hidden="true">{item.icon}</div>
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
                      📊 Distribusi Kategori Produk
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
                      📈 Status Transaksi
                    </h4>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={summaryData.statusDistribusi}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.gray} />
                        <XAxis dataKey="name" stroke={colors.dark} tick={{ fill: colors.dark }} />
                        <YAxis stroke={colors.dark} tick={{ fill: colors.dark }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill={colors.secondary} name="Jumlah Transaksi" radius={[4, 4, 0, 0]} />
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
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>Pencarian</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Cari nama produk atau kode produk..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            aria-label="Cari produk"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>Kategori</Form.Label>
                          <Form.Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="search-input"
                            aria-label="Pilih kategori produk"
                          >
                            <option value="">Semua Kategori</option>
                            {getUniqueCategories().map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>Urutkan</Form.Label>
                          <Form.Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="search-input"
                            aria-label="Pilih kriteria pengurutan"
                          >
                            <option value="id_barang">Kode Produk</option>
                            <option value="nama">Nama Produk</option>
                            <option value="harga_jual">Harga Jual</option>
                            <option value="tanggal_laku">Tanggal Laku</option>
                            <option value="komisi_hunter">Komisi Hunter</option>
                            <option value="komisi_reusemart">Komisi ReUse Mart</option>
                            <option value="bonus_cepat">Bonus Penitip</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>Urutan</Form.Label>
                          <Form.Select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="search-input"
                            aria-label="Pilih urutan pengurutan"
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
                            setSortBy('nama');
                            setSortOrder('asc');
                          }}
                          className="w-100"
                          aria-label="Reset filter"
                        >
                          Reset
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
                        📋 Detail Komisi Per Produk
                      </h4>
                      <span className="text-muted">
                        Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} transaksi
                      </span>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {currentItems.length > 0 ? (
                      <Table responsive striped className="mb-0">
                        <thead style={{ backgroundColor: `${colors.primary}10` }}>
                          <tr>
                            <th style={{ color: colors.dark }}>Kode Produk</th>
                            <th style={{ color: colors.dark }}>Nama Produk</th>
                            <th style={{ color: colors.dark }}>Harga Jual</th>
                            <th style={{ color: colors.dark }}>Tanggal Masuk</th>
                            <th style={{ color: colors.dark }}>Tanggal Laku</th>
                            <th style={{ color: colors.dark }}>Komisi Hunter</th>
                            <th style={{ color: colors.dark }}>Komisi ReUse Mart</th>
                            <th style={{ color: colors.dark }}>Bonus Penitip</th>
                            <th style={{ color: colors.dark }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((transaksi) => (
                            <tr key={transaksi.id_transaksi}>
                              <td className="fw-bold" style={{ color: colors.primary }}>
                                {transaksi.SubPembelian?.id_barang}
                              </td>
                              <td>
                                <div className="fw-bold">{transaksi.SubPembelian?.Barang?.nama}</div>
                                <small className="text-muted">
                                  Kategori: {transaksi.SubPembelian?.Barang?.kategori_barang}
                                </small>
                              </td>
                              <td className="fw-bold" style={{ color: colors.primary }}>
                                {formatCurrency(transaksi.SubPembelian?.Pembelian?.total_harga)}
                              </td>
                              <td>{formatDate(penitipanData[transaksi.SubPembelian?.id_barang])}</td>
                              <td>{formatDate(transaksi.SubPembelian?.Pembelian?.tanggal_pelunasan)}</td>
                              <td>{formatCurrency(transaksi.komisi_hunter)}</td>
                              <td>{formatCurrency(transaksi.komisi_reusemart)}</td>
                              <td>{formatCurrency(transaksi.bonus_cepat)}</td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => showDetailModal(transaksi)}
                                  aria-label={`Lihat detail transaksi ${transaksi.id_transaksi}`}
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
                        <i className="bi bi-cart-x" style={{ fontSize: '3rem', color: colors.gray }} aria-hidden="true"></i>
                        <h4 className="mt-3">Tidak ada data transaksi</h4>
                        <p className="text-muted">
                          Tidak ada transaksi yang sesuai untuk periode ini.
                        </p>
                      </div>
                    )}
                  </Card.Body>
                  {currentItems.length > 0 && totalPages > 1 && (
                    <Card.Footer style={{ backgroundColor: colors.white, borderTop: `1px solid ${colors.gray}` }}>
                      <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        paginate={(pageNumber) => setCurrentPage(pageNumber)}
                      />
                    </Card.Footer>
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Detail Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered aria-labelledby="detail-modal-title">
          <Modal.Header
            closeButton
            style={{ backgroundColor: colors.primary, color: colors.white, border: 'none' }}
          >
            <Modal.Title id="detail-modal-title" className="fw-bold">
              Detail Transaksi: {selectedTransaksi?.id_transaksi}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: colors.white }}>
            {selectedTransaksi && (
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>ID Transaksi:</strong>
                    <div style={{ color: colors.primary, fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {selectedTransaksi.id_transaksi}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Kode Produk:</strong>
                    <div>{selectedTransaksi.SubPembelian?.id_barang}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Nama Produk:</strong>
                    <div>{selectedTransaksi.SubPembelian?.Barang?.nama}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Kategori:</strong>
                    <div>
                      <Badge style={{ backgroundColor: colors.secondary }}>
                        {selectedTransaksi.SubPembelian?.Barang?.kategori_barang}
                      </Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Harga Jual:</strong>
                    <div style={{ color: colors.primary, fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {formatCurrency(selectedTransaksi.SubPembelian?.Pembelian?.total_harga)}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Tanggal Masuk:</strong>
                    <div>{formatDate(penitipanData[selectedTransaksi.SubPembelian?.id_barang])}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Tanggal Laku:</strong>
                    <div>{formatDate(selectedTransaksi.SubPembelian?.Pembelian?.tanggal_pelunasan)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Komisi Hunter:</strong>
                    <div>{formatCurrency(selectedTransaksi.komisi_hunter)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Komisi ReUse Mart:</strong>
                    <div>{formatCurrency(selectedTransaksi.komisi_reusemart)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Bonus Penitip:</strong>
                    <div>{formatCurrency(selectedTransaksi.bonus_cepat)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Status Transaksi:</strong>
                    <div>{getStatusBadge(selectedTransaksi.SubPembelian?.Pembelian?.status_pembelian)}</div>
                  </div>
                </Col>
                {selectedTransaksi.SubPembelian?.Barang?.gambar && (
                  <Col xs={12} className="mt-3">
                    <strong>Gambar Produk:</strong>
                    <div className="mt-2">
                      {selectedTransaksi.SubPembelian.Barang.gambar.split(',').map((img, index) => (
                        <img
                          key={index}
                          src={img.trim()}
                          alt={`${selectedTransaksi.SubPembelian.Barang.nama} ${index + 1}`}
                          style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover',
                            marginRight: '10px',
                            marginBottom: '10px',
                            borderRadius: '8px',
                            border: `2px solid ${colors.gray}`,
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
              aria-label="Tutup detail transaksi"
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-border {
          animation: spin 1s linear infinite;
        }
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

// PropTypes for type checking
LaporanKomisi.propTypes = {
  // No props are passed to this component
};

export default LaporanKomisi;