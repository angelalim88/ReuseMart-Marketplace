import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Alert, Table } from 'react-bootstrap';
import { Link } from "react-router-dom";
import TopNavigation from "../../components/navigation/TopNavigation";
import { GetAllTransaksi } from "../../clients/TransaksiService";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CetakLaporanBulanan from '../../components/pdf/CetakLaporanBulanan';

const LaporanBulananPage = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [transaksiData, setTransaksiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState({
    totalPendapatan: 0,
    totalKomisiReusemart: 0,
    totalKomisiHunter: 0,
    totalBonusCepat: 0,
    keuntunganBersih: 0,
    totalTransaksi: 0,
    rataRataPendapatan: 0,
    dailyData: [],
    weeklyData: [],
    komisiDistribution: []
  });
  const [annualReportData, setAnnualReportData] = useState({
    monthlyItemSales: [],
    monthlySummary: []
  });

  const colors = {
    primary: '#028643',
    secondary: '#FC8A06',
    white: '#FFFFFF',
    dark: '#03081F',
    gray: '#D9D9D9',
    muted: '#686868'
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchTransaksiData();
  }, [selectedYear, selectedMonth]);

  const fetchTransaksiData = async () => {
    setLoading(true);
    try {
      const response = await GetAllTransaksi();
      const data = response.data;
      
      const filteredData = data.filter(transaksi => {
        const tanggalPembelian = new Date(transaksi.SubPembelian?.Pembelian?.tanggal_pelunasan);
        return tanggalPembelian.getFullYear() === selectedYear && 
               tanggalPembelian.getMonth() + 1 === selectedMonth;
      });

      setTransaksiData(filteredData);
      processReportData(filteredData);
      processAnnualReportData(data);
    } catch (error) {
      console.error('Error fetching transaksi data:', error);
    }
    setLoading(false);
  };

  const processReportData = (data) => {
    if (!data || data.length === 0) {
      setReportData({
        totalPendapatan: 0,
        totalKomisiReusemart: 0,
        totalKomisiHunter: 0,
        totalBonusCepat: 0,
        keuntunganBersih: 0,
        totalTransaksi: 0,
        rataRataPendapatan: 0,
        dailyData: [],
        weeklyData: [],
        komisiDistribution: []
      });
      return;
    }

    const totalPendapatan = data.reduce((sum, t) => sum + parseFloat(t.pendapatan || 0), 0);
    const totalKomisiReusemart = data.reduce((sum, t) => sum + parseFloat(t.komisi_reusemart || 0), 0);
    const totalKomisiHunter = data.reduce((sum, t) => sum + parseFloat(t.komisi_hunter || 0), 0);
    const totalBonusCepat = data.reduce((sum, t) => sum + parseFloat(t.bonus_cepat || 0), 0);
    const keuntunganBersih = totalPendapatan - totalKomisiReusemart - totalKomisiHunter - totalBonusCepat;

    const dailyMap = {};
    data.forEach(transaksi => {
      const tanggal = new Date(transaksi.SubPembelian?.Pembelian?.tanggal_pelunasan);
      const day = tanggal.getDate();
      
      if (!dailyMap[day]) {
        dailyMap[day] = {
          hari: day,
          pendapatan: 0,
          komisiReusemart: 0,
          komisiHunter: 0,
          bonusCepat: 0,
          keuntungan: 0,
          transaksi: 0
        };
      }
      
      dailyMap[day].pendapatan += parseFloat(transaksi.pendapatan || 0);
      dailyMap[day].komisiReusemart += parseFloat(transaksi.komisi_reusemart || 0);
      dailyMap[day].komisiHunter += parseFloat(transaksi.komisi_hunter || 0);
      dailyMap[day].bonusCepat += parseFloat(transaksi.bonus_cepat || 0);
      dailyMap[day].keuntungan = dailyMap[day].pendapatan - dailyMap[day].komisiReusemart - dailyMap[day].komisiHunter - dailyMap[day].bonusCepat;
      dailyMap[day].transaksi += 1;
    });

    const dailyData = Object.values(dailyMap).sort((a, b) => a.hari - b.hari);

    const weeklyMap = {};
    data.forEach(transaksi => {
      const tanggal = new Date(transaksi.SubPembelian?.Pembelian?.tanggal_pelunasan);
      const week = Math.ceil(tanggal.getDate() / 7);
      
      if (!weeklyMap[week]) {
        weeklyMap[week] = {
          minggu: `Minggu ${week}`,
          pendapatan: 0,
          keuntungan: 0,
          transaksi: 0
        };
      }
      
      const pendapatan = parseFloat(transaksi.pendapatan || 0);
      const komisiTotal = parseFloat(transaksi.komisi_reusemart || 0) + 
                         parseFloat(transaksi.komisi_hunter || 0) + 
                         parseFloat(transaksi.bonus_cepat || 0);
      
      weeklyMap[week].pendapatan += pendapatan;
      weeklyMap[week].keuntungan += (pendapatan - komisiTotal);
      weeklyMap[week].transaksi += 1;
    });

    const weeklyData = Object.values(weeklyMap);

    const komisiDistribution = [
      { name: 'Komisi Reusemart', value: totalKomisiReusemart, color: colors.primary },
      { name: 'Komisi Hunter', value: totalKomisiHunter, color: colors.secondary },
      { name: 'Bonus Cepat', value: totalBonusCepat, color: colors.gray },
      { name: 'Keuntungan Bersih', value: keuntunganBersih, color: colors.dark }
    ];

    setReportData({
      totalPendapatan,
      totalKomisiReusemart,
      totalKomisiHunter,
      totalBonusCepat,
      keuntunganBersih,
      totalTransaksi: data.length,
      rataRataPendapatan: data.length > 0 ? totalPendapatan / data.length : 0,
      dailyData,
      weeklyData,
      komisiDistribution
    });
  };

  const processAnnualReportData = (data) => {
    if (!data || data.length === 0) {
      setAnnualReportData({
        monthlyItemSales: [],
        monthlySummary: []
      });
      return;
    }

    const monthlyMap = {};
    months.forEach((month, index) => {
      monthlyMap[index + 1] = {
        bulan: month,
        itemSold: 0,
        totalPendapatan: 0,
        totalTransaksi: 0
      };
    });

    data.forEach(transaksi => {
      const tanggal = new Date(transaksi.SubPembelian?.Pembelian?.tanggal_pelunasan);
      if (tanggal.getFullYear() === selectedYear) {
        const month = tanggal.getMonth() + 1;
        monthlyMap[month].itemSold += 1;
        monthlyMap[month].totalPendapatan += parseFloat(transaksi.pendapatan || 0);
        monthlyMap[month].totalTransaksi += 1;
      }
    });

    const monthlyItemSales = Object.values(monthlyMap);
    const monthlySummary = Object.values(monthlyMap).map(item => ({
      bulan: item.bulan,
      itemSold: item.itemSold,
      totalPendapatan: item.totalPendapatan,
      totalTransaksi: item.totalTransaksi,
      rataRataPendapatan: item.totalTransaksi > 0 ? item.totalPendapatan / item.totalTransaksi : 0
    }));

    setAnnualReportData({
      monthlyItemSales,
      monthlySummary
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
            {typeof label === 'string' ? label : `Hari ${label}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {entry.name.includes('Pendapatan') ? formatCurrency(entry.value) : formatNumber(entry.value)}
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
              Laporan Penjualan Bulanan
            </h2>
            <p className="text-muted mt-1">Dashboard analisis keuangan dan performa penjualan</p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-3 align-items-center">
              <div className="position-relative search-container">
                <i className="bi bi-search search-icon"></i>
                <Form.Select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="search-input"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="position-relative search-container">
                <i className="bi bi-calendar search-icon"></i>
                <Form.Select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="search-input"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </div>
              <Button 
                onClick={() => setShowModal(true)}
                className="view-btn"
              >
                Export PDF
              </Button>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: colors.primary }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Memuat data laporan...</p>
          </div>
        ) : (
          <>
            <Row className="mb-4">
              {[
                { title: 'Total Pendapatan', value: formatCurrency(reportData.totalPendapatan), icon: '💰', color: colors.primary },
                { title: 'Keuntungan Bersih', value: formatCurrency(reportData.keuntunganBersih), icon: '🎯', color: colors.secondary },
                { title: 'Total Transaksi', value: formatNumber(reportData.totalTransaksi), icon: '📈', color: colors.dark },
                { title: 'Rata-rata/Transaksi', value: formatCurrency(reportData.rataRataPendapatan), icon: '📊', color: colors.gray }
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

            {reportData.dailyData.length > 0 ? (
              <>
                <Row className="mb-4">
                  <Col>
                    <Card className="penitipan-card">
                      <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.primary}` }}>
                        <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                          📈 Trend Pendapatan & Keuntungan Harian
                        </h4>
                      </Card.Header>
                      <Card.Body>
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={reportData.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.gray} />
                            <XAxis 
                              dataKey="hari" 
                              stroke={colors.dark}
                              tick={{ fill: colors.dark }}
                            />
                            <YAxis 
                              stroke={colors.dark}
                              tick={{ fill: colors.dark }}
                              tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="pendapatan" 
                              stroke={colors.primary}
                              strokeWidth={3}
                              name="Pendapatan"
                              dot={{ fill: colors.primary, strokeWidth: 2, r: 6 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="keuntungan" 
                              stroke={colors.secondary}
                              strokeWidth={3}
                              name="Keuntungan"
                              dot={{ fill: colors.secondary, strokeWidth: 2, r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={8}>
                    <Card className="penitipan-card">
                      <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.secondary}` }}>
                        <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                          📊 Performa Mingguan
                        </h4>
                      </Card.Header>
                      <Card.Body>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={reportData.weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.gray} />
                            <XAxis 
                              dataKey="minggu" 
                              stroke={colors.dark}
                              tick={{ fill: colors.dark }}
                            />
                            <YAxis 
                              stroke={colors.dark}
                              tick={{ fill: colors.dark }}
                              tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                              dataKey="pendapatan" 
                              fill={colors.primary}
                              name="Pendapatan"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="keuntungan" 
                              fill={colors.secondary}
                              name="Keuntungan"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={4}>
                    <Card className="penitipan-card">
                      <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.dark}` }}>
                        <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                          🥧 Distribusi Keuangan
                        </h4>
                      </Card.Header>
                      <Card.Body>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={reportData.komisiDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            >
                              {reportData.komisiDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="mt-3">
                          {reportData.komisiDistribution.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex align-items-center">
                                <div 
                                  style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    backgroundColor: item.color,
                                    marginRight: '8px',
                                    borderRadius: '2px'
                                  }}
                                ></div>
                                <span style={{ fontSize: '0.9rem', color: colors.dark }}>{item.name}</span>
                              </div>
                              <span style={{ fontWeight: 'bold', color: colors.dark, fontSize: '0.9rem' }}>
                                {formatCurrency(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col>
                    <Card className="penitipan-card">
                      <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.primary}` }}>
                        <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                          💼 Rincian Komisi & Bonus
                        </h4>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          {[
                            { title: 'Komisi Reusemart', value: formatCurrency(reportData.totalKomisiReusemart), percent: ((reportData.totalKomisiReusemart / reportData.totalPendapatan) * 100).toFixed(1), color: colors.primary },
                            { title: 'Komisi Hunter', value: formatCurrency(reportData.totalKomisiHunter), percent: ((reportData.totalKomisiHunter / reportData.totalPendapatan) * 100).toFixed(1), color: colors.secondary },
                            { title: 'Bonus Cepat', value: formatCurrency(reportData.totalBonusCepat), percent: ((reportData.totalBonusCepat / reportData.totalPendapatan) * 100).toFixed(1), color: colors.dark },
                            { title: 'Margin Keuntungan', value: `${((reportData.keuntunganBersih / reportData.totalPendapatan) * 100).toFixed(1)}%`, percent: null, color: colors.primary, highlighted: true }
                          ].map((item, index) => (
                            <Col md={3} className="text-center mb-3" key={index}>
                              <div style={{ 
                                padding: '20px', 
                                backgroundColor: item.highlighted ? `${item.color}10` : `${item.color}15`, 
                                borderRadius: '12px',
                                border: item.highlighted ? `3px solid ${item.color}` : `2px solid ${item.color}30`,
                                boxShadow: item.highlighted ? `0 4px 15px ${item.color}30` : 'none'
                              }}>
                                <h5 className="fw-bold" style={{ color: item.color }}>{item.title}</h5>
                                <h3 className="fw-bold" style={{ color: item.color, marginBottom: '10px' }}>
                                  {item.value}
                                </h3>
                                {item.percent && (
                                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                    {item.percent}% dari pendapatan
                                  </p>
                                )}
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col>
                    <Card className="penitipan-card">
                      <Card.Header style={{ backgroundColor: colors.white, borderBottom: `3px solid ${colors.primary}` }}>
                        <h4 className="mb-0 fw-bold" style={{ color: colors.dark }}>
                          📅 Insight Penjualan Tahunan {selectedYear}
                        </h4>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <h5 className="fw-bold" style={{ color: colors.dark, marginBottom: '20px' }}>
                              Jumlah Barang Terjual per Bulan
                            </h5>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={annualReportData.monthlyItemSales}>
                                <CartesianGrid strokeDasharray="3 3" stroke={colors.gray} />
                                <XAxis 
                                  dataKey="bulan" 
                                  stroke={colors.dark}
                                  tick={{ fill: colors.dark }}
                                />
                                <YAxis 
                                  stroke={colors.dark}
                                  tick={{ fill: colors.dark }}
                                  tickFormatter={(value) => formatNumber(value)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar 
                                  dataKey="itemSold" 
                                  fill={colors.primary}
                                  name="Barang Terjual"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </Col>
                          <Col md={6}>
                            <h5 className="fw-bold" style={{ color: colors.dark, marginBottom: '20px' }}>
                              Ringkasan Bulanan
                            </h5>
                            <Table striped bordered hover responsive>
                              <thead>
                                <tr style={{ backgroundColor: `${colors.primary}20`, color: colors.dark }}>
                                  <th>Bulan</th>
                                  <th>Barang Terjual</th>
                                  <th>Total Pendapatan</th>
                                  <th>Total Transaksi</th>
                                  <th>Rata-rata/Transaksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {annualReportData.monthlySummary.map((item, index) => (
                                  <tr key={index}>
                                    <td>{item.bulan}</td>
                                    <td>{formatNumber(item.itemSold)}</td>
                                    <td>{formatCurrency(item.totalPendapatan)}</td>
                                    <td>{formatNumber(item.totalTransaksi)}</td>
                                    <td>{formatCurrency(item.rataRataPendapatan)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              <Row>
                <Col>
                  <Alert variant="info" className="text-center py-5" style={{ 
                    backgroundColor: `${colors.primary}15`, 
                    borderColor: colors.primary,
                    color: colors.dark
                  }}>
                    <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: colors.gray }}></i>
                    <h4 className="mt-3">Tidak ada data transaksi</h4>
                    <p className="mb-0">
                      Tidak ada transaksi yang ditemukan untuk periode {months[selectedMonth - 1]} {selectedYear}.
                      <br />
                      Silakan pilih bulan dan tahun yang berbeda.
                    </p>
                  </Alert>
                </Col>
              </Row>
            )}
          </>
        )}

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
              📄 Export Laporan ke PDF
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: colors.white }}>
            <div className="text-center py-4">
              <i className="bi bi-file-earmark-arrow-down" style={{ fontSize: '4rem', color: colors.primary, marginBottom: '20px' }}></i>
              <h4 style={{ color: colors.dark, marginBottom: '15px' }}>
                Laporan Penjualan {months[selectedMonth - 1]} {selectedYear}
              </h4>
              <p style={{ color: colors.dark, marginBottom: '30px' }}>
                Laporan akan mencakup ringkasan keuangan, performa harian, analisis mingguan, dan insight tahunan.
              </p>
              
              <div style={{ 
                backgroundColor: `${colors.gray}20`, 
                padding: '20px', 
                borderRadius: '10px',
                marginBottom: '30px'
              }}>
                <Row>
                  <Col md={6}>
                    <strong style={{ color: colors.dark }}>Total Pendapatan:</strong>
                    <br />
                    <span style={{ color: colors.primary, fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {formatCurrency(reportData.totalPendapatan)}
                    </span>
                  </Col>
                  <Col md={6}>
                    <strong style={{ color: colors.dark }}>Keuntungan Bersih:</strong>
                    <br />
                    <span style={{ color: colors.secondary, fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {formatCurrency(reportData.keuntunganBersih)}
                    </span>
                  </Col>
                </Row>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: `${colors.gray}20`, border: 'none' }}>
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowModal(false)}
              className="cancel-btn"
            >
              Batal
            </Button>
            <CetakLaporanBulanan 
              reportData={reportData}
              annualReportData={annualReportData}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              months={months}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              setShowModal={setShowModal}
            />
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
        }
        
        .view-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
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
        
        .search-container {
          position: relative;
          min-width: 150px;
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
        
        @media (max-width: 768px) {
          .search-container {
            width: 100%;
          }
        }
      `}</style>
    </Container>
  );
};

export default LaporanBulananPage;