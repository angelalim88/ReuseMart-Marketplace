import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Alert } from 'react-bootstrap';
import { Link } from "react-router-dom";
import TopNavigation from "../../components/navigation/TopNavigation";
import { GetAllTransaksi } from "../../clients/TransaksiService";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable correctly

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

  // Color palette consistent with PenitipanHabisPage
  const colors = {
    primary: '#028643',    // Ijo Tua
    secondary: '#FC8A06',  // Orange
    white: '#FFFFFF',      // Putih
    dark: '#03081F',       // Item
    gray: '#D9D9D9',       // Abu-abu
    muted: '#686868'       // Text muted
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Apply autoTable to jsPDF instance
    doc.autoTable = autoTable;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(2, 134, 67);
    doc.text('LAPORAN PENJUALAN BULANAN', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(3, 8, 31);
    doc.text(`${months[selectedMonth - 1]} ${selectedYear}`, pageWidth / 2, 30, { align: 'center' });
    
    // Summary Box
    doc.setDrawColor(217, 217, 217);
    doc.setFillColor(249, 249, 249);
    doc.roundedRect(15, 40, pageWidth - 30, 60, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(3, 8, 31);
    
    doc.text('RINGKASAN KEUANGAN', 20, 50);
    doc.text(`Total Pendapatan: ${formatCurrency(reportData.totalPendapatan)}`, 20, 60);
    doc.text(`Komisi Reusemart: ${formatCurrency(reportData.totalKomisiReusemart)}`, 20, 70);
    doc.text(`Komisi Hunter: ${formatCurrency(reportData.totalKomisiHunter)}`, 20, 80);
    doc.text(`Bonus Cepat: ${formatCurrency(reportData.totalBonusCepat)}`, 20, 90);
    
    doc.setTextColor(2, 134, 67);
    doc.setFontSize(14);
    doc.text(`KEUNTUNGAN BERSIH: ${formatCurrency(reportData.keuntunganBersih)}`, pageWidth / 2 + 10, 60);
    
    doc.setTextColor(3, 8, 31);
    doc.setFontSize(12);
    doc.text(`Total Transaksi: ${formatNumber(reportData.totalTransaksi)}`, pageWidth / 2 + 10, 75);
    doc.text(`Rata-rata per Transaksi: ${formatCurrency(reportData.rataRataPendapatan)}`, pageWidth / 2 + 10, 85);
    
    // Daily performance table
    if (reportData.dailyData.length > 0) {
      doc.text('PERFORMA HARIAN', 20, 120);
      
      const tableData = reportData.dailyData.map(day => [
        day.hari.toString(),
        formatCurrency(day.pendapatan),
        formatCurrency(day.keuntungan),
        day.transaksi.toString()
      ]);
      
      doc.autoTable({
        startY: 125,
        head: [['Tanggal', 'Pendapatan', 'Keuntungan', 'Transaksi']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [2, 134, 67],
          textColor: [255, 255, 255]
        },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Weekly summary
    if (reportData.weeklyData.length > 0) {
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 180;
      
      doc.text('RINGKASAN MINGGUAN', 20, finalY);
      
      const weeklyTableData = reportData.weeklyData.map(week => [
        week.minggu,
        formatCurrency(week.pendapatan),
        formatCurrency(week.keuntungan),
        week.transaksi.toString()
      ]);
      
      doc.autoTable({
        startY: finalY + 5,
        head: [['Periode', 'Pendapatan', 'Keuntungan', 'Transaksi']],
        body: weeklyTableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [252, 138, 6],
          textColor: [255, 255, 255]
        },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Laporan dibuat pada: ${new Date().toLocaleDateString('id-ID')}`, 20, footerY);
    doc.text('Reusemart - Sistem Laporan Penjualan', pageWidth - 20, footerY, { align: 'right' });
    
    doc.save(`Laporan-Penjualan-${months[selectedMonth - 1]}-${selectedYear}.pdf`);
    setShowModal(false);
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
              {entry.name}: {formatCurrency(entry.value)}
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
                📄 Export PDF
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
                Laporan akan mencakup ringkasan keuangan, performa harian, dan analisis mingguan.
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
            <Button 
              onClick={generatePDF}
              className="view-btn"
            >
              📥 Download PDF
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