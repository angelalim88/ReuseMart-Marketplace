import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import TopNavigation from "../../components/navigation/TopNavigation";
import { CetakLaporanKategori } from '../../components/pdf/CetakLaporanKategori';
import { apiSubPembelian } from '../../clients/SubPembelianService';


const LaporanKategori = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiSubPembelian.getAllSubPembelian();
      setData(response || []);
      console.log('response data subpembelian: ',response);
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
    
    return categoryStats;
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

  const categoryData = processDataByCategory();
  const totalTerjual = Object.values(categoryData).reduce((sum, cat) => sum + cat.terjual, 0);
  const totalGagal = Object.values(categoryData).reduce((sum, cat) => sum + cat.gagalTerjual, 0);

  return (
    <Container fluid className="p-0 bg-white">
      <TopNavigation />
      
      <Container className="mt-4">
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h4>Laporan Penjualan per Kategori Barang</h4>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Tahun</Form.Label>
                      <Form.Control
                        type="number"
                        value={tahun}
                        onChange={(e) => setTahun(parseInt(e.target.value))}
                        min="2020"
                        max="2030"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button 
                      variant="primary" 
                      onClick={handleCetakPDF}
                      disabled={loading}
                    >
                      {loading ? 'Memproses...' : 'Cetak PDF'}
                    </Button>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Kategori</th>
                        <th>Jumlah Item Terjual</th>
                        <th>Jumlah Item Gagal Terjual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(categoryData).map(([kategori, stats]) => (
                        <tr key={kategori}>
                          <td>{kategori}</td>
                          <td>{stats.terjual}</td>
                          <td>{stats.gagalTerjual}</td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td>Total</td>
                        <td>{totalTerjual}</td>
                        <td>{totalGagal}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default LaporanKategori;
