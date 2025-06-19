import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Table, Badge, Pagination } from 'react-bootstrap';
import TopNavigation from "../../components/navigation/TopNavigation";
import { CetakLaporanKategori } from '../../components/pdf/CetakLaporanKategori';
import { apiSubPembelian } from '../../clients/SubPembelianService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PaginationComponent from '../../components/pagination/Pagination';

const LaporanKategori = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('kategori');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const colors = {
    primary: '#028643',
    secondary: '#FC8A06',
    white: '#FFFFFF',
    dark: '#03081F',
    gray: '#D9D9D9',
    muted: '#686868'
  };

  const statusColors = {
    'Pembayaran valid': colors.primary,
    'Pembayaran tidak valid': colors.muted
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [data, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiSubPembelian.getAllSubPembelian();
      setData(response || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processDataByCategory = () => {
    const categoryStats = {};

    data.forEach(item => {
      if (item.barang && item.barang.length > 0) {
        item.barang.forEach(barang => {
          const kategori = barang.kategori_barang;
          const statusPembelian = item.status_pembelian;

          if (!categoryStats[kategori]) {
            categoryStats[kategori] = {
              terjual: 0,
              gagalTerjual: 0
            };
          }

          if (statusPembelian === 'Pembayaran valid') {
            categoryStats[kategori].terjual += 1;
          } else if (statusPembelian === 'Pembayaran tidak valid') {
            categoryStats[kategori].gagalTerjual += 1;
          }
        });
      }
    });

    return Object.entries(categoryStats).map(([kategori, stats]) => ({
      kategori,
      terjual: stats.terjual,
      gagalTerjual: stats.gagalTerjual,
      total: stats.terjual + stats.gagalTerjual
    }));
  };

  const processSummaryData = () => {
    const categoryData = processDataByCategory();
    const totalTerjual = categoryData.reduce((sum, cat) => sum + cat.terjual, 0);
    const totalGagal = categoryData.reduce((sum, cat) => sum + cat.gagalTerjual, 0);
    const totalTransaksi = totalTerjual + totalGagal;

    const kategoriDistribusi = categoryData.map(item => ({
      name: item.kategori,
      value: item.total,
      count: item.total
    }));

    const statusDistribusi = [
      { name: 'Pembayaran valid', value: totalTerjual, count: totalTerjual },
      { name: 'Pembayaran tidak valid', value: totalGagal, count: totalGagal }
    ];

    return {
      totalTransaksi,
      totalTerjual,
      totalGagal,
      kategoriDistribusi,
      statusDistribusi
    };
  };

  const filterAndSortData = () => {
    let filtered = processDataByCategory();

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.kategori === selectedCategory);
    }

    if (selectedStatus) {
      filtered = filtered.filter(item =>
        selectedStatus === 'Pembayaran valid' ? item.terjual > 0 : item.gagalTerjual > 0
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'kategori') {
        aValue = a.kategori;
        bValue = b.kategori;
      } else if (sortBy === 'terjual') {
        aValue = a.terjual;
        bValue = b.terjual;
      } else if (sortBy === 'gagalTerjual') {
        aValue = a.gagalTerjual;
        bValue = b.gagalTerjual;
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

  const handleCetakPDF = async () => {
    setLoading(true);
    try {
      await CetakLaporanKategori(data, tahun);
    } catch (err) {
      setError('Gagal mencetak PDF');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    return [...new Set(data.flatMap(item => item.barang?.map(b => b.kategori_barang) || []))];
  };

  const getStatusBadge = (status) => {
    const color = statusColors[status] || colors.muted;
    return (
      <Badge style={{ backgroundColor: color, color: colors.white }}>
        {status}
      </Badge>
    );
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const summaryData = processSummaryData();
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
              Laporan Penjualan per Kategori Barang
            </h2>
            <p className="text-muted mt-1">Analisis penjualan berdasarkan kategori barang</p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-3 align-items-center">
              <Button 
                onClick={fetchData}
                className="view-btn"
                disabled={loading}
              >
                Refresh Data
              </Button>
              <Button 
                className="view-btn"
                onClick={handleCetakPDF}
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Cetak PDF'}
              </Button>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: colors.primary }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Memuat data penjualan...</p>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-4">
              {[
                { title: 'Total Transaksi', value: formatNumber(summaryData.totalTransaksi), icon: '📦', color: colors.primary },
                { title: 'Item Terjual', value: formatNumber(summaryData.totalTerjual), icon: '✅', color: colors.secondary },
                { title: 'Item Gagal Terjual', value: formatNumber(summaryData.totalGagal), icon: '❌', color: colors.dark }
              ].map((item, index) => (
                <Col md={4} className="mb-3" key={index}>
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
                      📈 Status Penjualan
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
                          name="Jumlah Penjualan"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

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
                            placeholder="Cari kategori barang..."
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
                            Status
                          </Form.Label>
                          <Form.Select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="search-input"
                          >
                            <option value="">Semua Status</option>
                            <option value="Pembayaran valid">Pembayaran valid</option>
                            <option value="Pembayaran tidak valid">Pembayaran tidak valid</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>
                            Tahun
                          </Form.Label>
                          <Form.Control
                            type="number"
                            value={tahun}
                            onChange={(e) => setTahun(parseInt(e.target.value))}
                            min="2020"
                            max="2030"
                            className="search-input"
                          />
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
                            <option value="kategori">Kategori</option>
                            <option value="terjual">Terjual</option>
                            <option value="gagalTerjual">Gagal Terjual</option>
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
                            setSortBy('kategori');
                            setSortOrder('asc');
                            setTahun(new Date().getFullYear());
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

            <Row className="mb-4">
              <Col>
                <Card className="penitipan-card">
                  <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.primary}` }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                        📋 Detail Penjualan per Kategori
                      </h4>
                      <span className="text-muted">
                        Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} kategori
                      </span>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {currentItems.length > 0 ? (
                      <Table responsive striped className="mb-0">
                        <thead style={{ backgroundColor: `${colors.primary}10` }}>
                          <tr>
                            <th style={{ color: colors.dark }}>Kategori</th>
                            <th style={{ color: colors.dark }}>Jumlah Item Terjual</th>
                            <th style={{ color: colors.dark }}>Jumlah Item Gagal Terjual</th>
                            <th style={{ color: colors.dark }}>Total Transaksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((item, index) => (
                            <tr key={item.kategori}>
                              <td className="fw-bold" style={{ color: colors.primary }}>
                                {item.kategori}
                              </td>
                              <td>{formatNumber(item.terjual)}</td>
                              <td>{formatNumber(item.gagalTerjual)}</td>
                              <td className="fw-bold" style={{ color: colors.secondary }}>
                                {formatNumber(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: colors.gray }}></i>
                        <h4 className="mt-3">Tidak ada data penjualan</h4>
                        <p className="text-muted">
                          Tidak ada data penjualan yang sesuai dengan filter yang dipilih.
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
          
          .summary-cards .col-md-4 {
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

export default LaporanKategori;