import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Table, Badge, Pagination } from 'react-bootstrap';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import TopNavigation from '../../components/navigation/TopNavigation';
import { GetAllDonasiBarang } from '../../clients/DonasiBarangService';
import { CetakLaporanDonasi } from '../../components/pdf/CetakLaporanDonasi';
import PaginationComponent from '../../components/pagination/Pagination';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LaporanDonasi = () => {
  const [donasi, setDonasi] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [tahun, setTahun] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('id_donasi_barang');
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
    'Selesai': colors.primary,
    'Dibatalkan': colors.muted,
    'Menunggu': colors.secondary
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [donasi, keyword, tahun, selectedStatus, sortBy, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await GetAllDonasiBarang();
      if (response && response.data) {
        setDonasi(response.data);
        setError('');
      } else {
        throw new Error('Data tidak ditemukan');
      }
    } catch (error) {
      setError('Gagal mengambil data donasi');
      console.error('Gagal mengambil data: ', error);
      toast.error('Gagal mengambil data!');
    } finally {
      setLoading(false);
    }
  };

  const processSummaryData = () => {
    const totalDonasi = donasi.length;
    const totalBarang = donasi.reduce((sum, item) => sum + (item.Barang ? 1 : 0), 0);
    const totalNilai = donasi.reduce((sum, item) => sum + parseFloat(item.Barang?.harga || 0), 0);
    const rataRataNilai = totalDonasi > 0 ? totalNilai / totalDonasi : 0;

    const kategoriMap = {};
    donasi.forEach(item => {
      const kategori = item.Barang?.kategori_barang || 'Tidak Dikategorikan';
      if (!kategoriMap[kategori]) {
        kategoriMap[kategori] = { name: kategori, value: 0, count: 0 };
      }
      kategoriMap[kategori].value += parseFloat(item.Barang?.harga || 0);
      kategoriMap[kategori].count += 1;
    });
    const kategoriDistribusi = Object.values(kategoriMap);

    const statusMap = {};
    donasi.forEach(item => {
      const status = item.status_donasi || 'Selesai';
      if (!statusMap[status]) {
        statusMap[status] = { name: status, value: 0, count: 0 };
      }
      statusMap[status].value += parseFloat(item.Barang?.harga || 0);
      statusMap[status].count += 1;
    });
    const statusDistribusi = Object.values(statusMap);

    return {
      totalDonasi,
      totalBarang,
      totalNilai,
      rataRataNilai,
      kategoriDistribusi,
      statusDistribusi
    };
  };

  const filterAndSortData = () => {
    let filtered = [...donasi];

    if (tahun !== 'Semua') {
      filtered = filtered.filter(d => {
        const date = new Date(d?.tanggal_donasi);
        return !isNaN(date) && date.getFullYear().toString() === tahun;
      });
    }

    if (keyword) {
      filtered = filtered.filter(d =>
        d?.Barang?.nama?.toLowerCase().includes(keyword.toLowerCase()) ||
        d?.RequestDonasi?.OrganisasiAmal?.nama_organisasi?.toLowerCase().includes(keyword.toLowerCase()) ||
        d?.id_donasi_barang?.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(d => d?.status_donasi === selectedStatus);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'id_donasi_barang') {
        aValue = a.id_donasi_barang || '';
        bValue = b.id_donasi_barang || '';
      } else if (sortBy === 'nama_barang') {
        aValue = a.Barang?.nama || '';
        bValue = b.Barang?.nama || '';
      } else if (sortBy === 'organisasi') {
        aValue = a.RequestDonasi?.OrganisasiAmal?.nama_organisasi || '';
        bValue = b.RequestDonasi?.OrganisasiAmal?.nama_organisasi || '';
      } else if (sortBy === 'tanggal_donasi') {
        aValue = new Date(a.tanggal_donasi).getTime();
        bValue = new Date(b.tanggal_donasi).getTime();
      } else if (sortBy === 'kategori_barang') {
        aValue = a.Barang?.kategori_barang || '';
        bValue = b.Barang?.kategori_barang || '';
      } else if (sortBy === 'status_donasi') {
        aValue = a.status_donasi || '';
        bValue = b.status_donasi || '';
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

  const handleCetakLaporanDonasi = () => {
    try {
      CetakLaporanDonasi(tahun === 'Semua' ? null : tahun);
      toast.success('Laporan donasi berhasil dicetak');
    } catch (error) {
      setError('Gagal mencetak laporan donasi');
      toast.error('Gagal mencetak laporan donasi');
    }
  };

  const formatDateLong = (tgl) => {
    let date;
    if (typeof tgl === 'string' && tgl.includes('/')) {
      const [day, month, year] = tgl.split('/');
      date = new Date(`${year}-${month}-${day}`);
    } else {
      date = new Date(tgl);
    }
    if (isNaN(date)) return 'Tanggal tidak valid';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const getStatusBadge = (status) => {
    const color = statusColors[status] || colors.muted;
    return (
      <Badge style={{ backgroundColor: color, color: colors.white }}>
        {status || 'Selesai'}
      </Badge>
    );
  };

  const getTahunList = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const list = ['Semua'];
    for (let t = currentYear; t >= 2024; t--) {
      list.push(t.toString());
    }
    return list;
  };

  const getUniqueStatuses = () => {
    return [...new Set(donasi.map(item => item.status_donasi || 'Selesai').filter(Boolean))];
  };

  const getUniqueCategories = () => {
    return [...new Set(donasi.map(item => item.Barang?.kategori_barang).filter(Boolean))];
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
              Laporan Donasi Barang
            </h2>
            <p className="text-muted mt-1">Monitoring dan analisis donasi barang</p>
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
                onClick={handleCetakLaporanDonasi}
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Cetak Laporan Donasi'}
              </Button>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: colors.primary }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Memuat data donasi...</p>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-4">
              {[
                { title: 'Total Donasi', value: formatNumber(summaryData.totalDonasi), icon: '📦', color: colors.primary },
                { title: 'Total Barang', value: formatNumber(summaryData.totalBarang), icon: '🎁', color: colors.secondary },
                { title: 'Nilai Rata-rata', value: formatCurrency(summaryData.rataRataNilai), icon: '💰', color: colors.dark }
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
                      📈 Status Donasi
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
                          name="Jumlah Donasi"
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
                            placeholder="Cari nama barang, organisasi, atau ID donasi..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="search-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>
                            Tahun
                          </Form.Label>
                          <Form.Select
                            value={tahun}
                            onChange={(e) => setTahun(e.target.value)}
                            className="search-input"
                          >
                            {getTahunList().map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="fw-bold" style={{ color: colors.dark }}>
                            Status Donasi
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
                            <option value="id_donasi_barang">ID Donasi</option>
                            <option value="nama_barang">Nama Barang</option>
                            <option value="organisasi">Organisasi</option>
                            <option value="tanggal_donasi">Tanggal Donasi</option>
                            <option value="kategori_barang">Kategori Barang</option>
                            <option value="status_donasi">Status Donasi</option>
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
                            setKeyword('');
                            setTahun('Semua');
                            setSelectedStatus('');
                            setSortBy('id_donasi_barang');
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

            <Row className="mb-4">
              <Col>
                <Card className="penitipan-card">
                  <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.primary}` }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                        📋 Detail Donasi Barang
                      </h4>
                      <span className="text-muted">
                        Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} donasi
                      </span>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {currentItems.length > 0 ? (
                      <Table responsive striped className="mb-0">
                        <thead style={{ backgroundColor: `${colors.primary}10` }}>
                          <tr>
                            <th style={{ color: colors.dark }}>ID Donasi</th>
                            <th style={{ color: colors.dark }}>Nama Barang</th>
                            <th style={{ color: colors.dark }}>Kategori</th>
                            <th style={{ color: colors.dark }}>Organisasi</th>
                            <th style={{ color: colors.dark }}>Tanggal Donasi</th>
                            <th style={{ color: colors.dark }}>Nilai Barang</th>
                            <th style={{ color: colors.dark }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((d) => (
                            <tr key={d.id_donasi_barang}>
                              <td className="fw-bold" style={{ color: colors.primary }}>
                                {d.id_donasi_barang}
                              </td>
                              <td>
                                <Link to={`/barang/${d?.Barang?.id_barang}`} style={{ color: colors.primary, textDecoration: 'none' }}>
                                  {d?.Barang?.nama || '-'}
                                </Link>
                              </td>
                              <td>
                                <Badge style={{ backgroundColor: `${colors.muted}20` }}>
                                  {d?.Barang?.kategori_barang || '-'}
                                </Badge>
                              </td>
                              <td>
                                {d?.RequestDonasi?.OrganisasiAmal?.nama_organisasi || '-'}
                              </td>
                              <td>
                                {formatDateLong(d?.tanggal_donasi)}
                              </td>
                              <td className="fw-bold" style={{ color: colors.secondary }}>
                                {formatCurrency(d?.Barang?.harga || 0)}
                              </td>
                              <td>
                                {getStatusBadge(d?.status_donasi)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: colors.gray }}></i>
                        <h4 className="mt-3">Tidak ada data donasi</h4>
                        <p className="text-muted">
                          Tidak ada donasi yang sesuai dengan filter yang dipilih.
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

export default LaporanDonasi;