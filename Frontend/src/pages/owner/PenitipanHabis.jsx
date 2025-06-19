import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Badge } from 'react-bootstrap';
import { Link } from "react-router-dom";
import TopNavigation from "../../components/navigation/TopNavigation";
import ToastNotification from "../../components/toast/ToastNotification";
import PaginationComponent from "../../components/pagination/Pagination";
import { GetAllPenitipan, GetPenitipanById, UpdatePenitipan } from '../../clients/PenitipanService';
import DetailPenitipanHabis from '../../components/modal/DetailPenitipanHabisModal';
import KonfirmasiDonasi from '../../components/modal/KonfirmasiDonasiModal';
import PilihRequestDonasiModal from '../../components/modal/PilihRequestDonasiModal';
import { decodeToken } from '../../utils/jwtUtils';
import { GetPegawaiByAkunId } from '../../clients/PegawaiService';
import { UpdateTotalPoinPenitip } from '../../clients/PenitipService';
import { CetakLaporanPenitipanHabis } from '../../components/pdf/CetakLaporanPenitipanHabis';

const PenitipanHabisPage = () => {
  const [penitipanList, setPenitipanList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [akun, setAkun] = useState(null);
  const [owner, setOwner] = useState(null);

  // Modals state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showRequestDonasiModal, setShowRequestDonasiModal] = useState(false);
  const [currentPenitipan, setCurrentPenitipan] = useState({
    id_penitipan: '',
    id_barang: '',
    tanggal_awal_penitipan: '',
    tanggal_akhir_penitipan: '',
    tanggal_batas_pengambilan: '',
    perpanjangan: 0,
    status_penitipan: '',
    Barang: {
      id_barang: '',
      id_penitip: '',
      nama: '',
      gambar: '',
      harga: 0,
      garansi_berlaku: false,
      tanggal_garansi: '',
      berat: 0,
      status_qc: '',
      kategori_barang: '',
      Penitip: {
        id_penitip: '',
        nama_penitip: '',
        total_poin: 0,
        tanggal_registrasi: '',
        Akun: {
          id_akun: '',
          email: '',
          profile_picture: '',
          role: ''
        }
      }
    }
  });

  useEffect(() => {
    fetchPenitipanData();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (penitipanList.length > 0) {
      const expiredItems = penitipanList
        .filter(item => item.status_penitipan === "Menunggu didonasikan")
        .map(item => {
          const gambarArray = item.Barang?.gambar.split(',').map(g => g.trim()) || [];
          const gambarKedua = gambarArray[1] || gambarArray[0] || '';
          return {
            ...item,
          };
        });
  
      console.log("Penitipan list (gambar displit): ", expiredItems);
      setFilteredList(expiredItems);
    }
  }, [penitipanList]);  

  const fetchCurrentUser = async () => {
    if(localStorage.getItem("authToken")) {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Token tidak ditemukan");
        
        const decoded = decodeToken(token);
        setAkun(decoded);
        if (!decoded?.id) throw new Error("Invalid token structure");
        if(decoded.role === "Owner") {
          const response = await GetPegawaiByAkunId(decoded.id);
          setOwner(response.data);
        }
      } catch (err) {
        setError("Gagal memuat data user!");
        console.error("Error:", err);
      }
    }
  };

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const fetchPenitipanData = async () => {
    try {
      setLoading(true);
      console.log('Fetching all penitipan data...');
      const response = await GetAllPenitipan();
      console.log('Penitipan data fetched successfully:', response.data);
      setPenitipanList(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching penitipan data:', error);
      setError('Failed to load penitipan data. Please try again.');
      showNotification('Failed to load penitipan data. Please try again.', 'danger');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (id) => {
    try {
      console.log(`Fetching penitipan details for ID: ${id}`);
      const response = await GetPenitipanById(id);
      const penitipanData = response.data;
      console.log('Penitipan details fetched successfully:', penitipanData);
      
      setCurrentPenitipan({
        ...penitipanData,
        tanggal_awal_penitipan: penitipanData.tanggal_awal_penitipan ? penitipanData.tanggal_awal_penitipan.split('T')[0] : '',
        tanggal_akhir_penitipan: penitipanData.tanggal_akhir_penitipan ? penitipanData.tanggal_akhir_penitipan.split('T')[0] : '',
        tanggal_batas_pengambilan: penitipanData.tanggal_batas_pengambilan ? penitipanData.tanggal_batas_pengambilan.split('T')[0] : ''
      });
      
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching penitipan details:', error);
      setError('Failed to load penitipan details. Please try again.');
      showNotification('Failed to load penitipan details. Please try again.', 'danger');
    }
  };

  const handleDonateClick = (penitipan) => {
    setCurrentPenitipan(penitipan);
    setShowDetailModal(false);
    setShowDonationModal(true);
  };

  const handleConfirmDonation = () => {
    setShowDonationModal(false);
    setShowRequestDonasiModal(true);
  };

  const handleDonationSuccess = async () => {
    try {
      const hargaBarang = parseFloat(currentPenitipan.Barang.harga);
      const poinTambahan = Math.floor(hargaBarang / 10000);
  
      const updatedPenitip = {
        ...currentPenitipan.Barang.Penitip,
        total_poin: currentPenitipan.Barang.Penitip.total_poin + poinTambahan,
      };
  
      const updatedBarang = {
        ...currentPenitipan.Barang,
        Penitip: updatedPenitip,
      };
  
      const updateData = {
        ...currentPenitipan,
        status_penitipan: "Didonasikan",
        Barang: updatedBarang,
      };
  
      console.log("Update Data:", updateData);
  
      await UpdatePenitipan(currentPenitipan.id_penitipan, updateData);
      await UpdateTotalPoinPenitip(currentPenitipan.Barang.Penitip.id_penitip, currentPenitipan.Barang.Penitip.total_poin + poinTambahan);
  
      showNotification(
        `Barang dengan ID ${currentPenitipan.id_barang} telah berhasil didonasikan! Penitip mendapatkan tambahan ${poinTambahan} poin.`,
        'success'
      );      
      setShowRequestDonasiModal(false);
      fetchPenitipanData(); // Refresh list
    } catch (error) {
      console.error('Error updating penitipan status:', error);
      setError('Failed to update penitipan status. Please try again.');
      showNotification('Failed to update penitipan status. Please try again.', 'danger');
    }
  };  

  const searchedItems = filteredList.filter(item => {
    return (
      (item.id_penitipan && item.id_penitipan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id_barang && item.id_barang.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.Barang?.nama && item.Barang.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.Barang?.Penitip?.nama_penitip && item.Barang.Penitip.nama_penitip.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(searchedItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCetakLaporan = async () => {
    await CetakLaporanPenitipanHabis(filteredList);
  };

  return (
    <Container fluid className="p-0 bg-white">
      {/* Toast Notification */}
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
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Barang Dengan Masa Penitipan Habis</h2>
            <p className="text-muted mt-1">Daftar barang yang menunggu untuk didonasikan</p>
          </Col>
          <Col md="auto">
            <Button variant="success" onClick={handleCetakLaporan}>
              Cetak Laporan
            </Button>
          </Col>
        </Row>

        <Row>
          {/* Main content */}
          <Col>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div className="position-relative search-container">
                  <i className="bi bi-search search-icon"></i>
                  <Form.Control
                    type="search"
                    placeholder="Cari ID penitipan, nama barang..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: '#028643' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Memuat data penitipan...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#D9D9D9' }}></i>
                <p className="mt-3 text-muted">Tidak ada barang yang menunggu donasi saat ini</p>
              </div>
            ) : (
              <>
                {currentItems.map((item) => (
                  <Card key={item.id_penitipan} className="mb-3 border penitipan-card">
                    <Card.Body className="p-3">
                      <Row className="align-items-center">
                        <Col xs={12} md={2} className="mb-3 mb-md-0">
                          <div className="item-image-container">
                            {item.Barang?.gambar ? (
                              <img 
                                src={item.Barang.gambar.split(',')[0].trim()} 
                                alt={item.Barang.nama} 
                                className="item-image" 
                              />
                            ) : (
                              <div className="no-image-placeholder">
                                <i className="bi bi-box-seam"></i>
                              </div>
                            )}
                          </div>
                        </Col>
                        <Col xs={12} md={7}>
                          <div className="mb-1">
                            <span className="penitipan-id">#{item.id_penitipan}</span>
                            <span className="ms-2 donation-badge">
                              {item.status_penitipan || 'Unknown'}
                            </span>
                          </div>
                          
                          <h5 className="item-name mb-2">
                            {item.Barang?.nama || "Unnamed Item"}
                          </h5>
                          
                          <div className="mb-1">
                            <span className="text-muted">Pemilik: </span>
                            <span>{item.Barang?.Penitip?.nama_penitip || "-"}</span>
                          </div>
                          
                          <div className="mb-1">
                            <span className="text-muted">Masa Penitipan: </span>
                            <span>{formatDate(item.tanggal_awal_penitipan)} s/d {formatDate(item.tanggal_akhir_penitipan)}</span>
                          </div>
                          
                          <div className="item-price mt-2">
                            <span className="text-muted">Harga: </span>
                            <span className="fw-bold">{formatCurrency(item.Barang?.harga || 0)}</span>
                          </div>
                        </Col>
                        <Col xs={12} md={3} className="text-md-end mt-3 mt-md-0">
                          <Button 
                            variant="primary"
                            className="view-btn"
                            onClick={() => handleViewDetails(item.id_penitipan)}
                          >
                            View Details
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <PaginationComponent 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                  />
                )}
              </>
            )}
          </Col>
        </Row>
      </div>

      {/* Detail Penitipan Modal */}
      <DetailPenitipanHabis
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        penitipan={currentPenitipan}
        onDonateClick={handleDonateClick}
      />

      {/* Konfirmasi Donasi Modal */}
      <KonfirmasiDonasi
        show={showDonationModal}
        onHide={() => setShowDonationModal(false)}
        penitipan={currentPenitipan}
        onConfirm={handleConfirmDonation}
      />

      {/* Pilih Request Donasi Modal */}
      <PilihRequestDonasiModal
        show={showRequestDonasiModal}
        onHide={() => setShowRequestDonasiModal(false)}
        penitipan={currentPenitipan}
        onSuccess={handleDonationSuccess}
      />

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        /* Penitipan Card Styles */
        .penitipan-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        
        .penitipan-card:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .penitipan-id {
          color: #686868;
          font-size: 0.9rem;
        }
        
        .donation-badge {
          background-color: #FC8A06;
          color: white;
          padding: 3px 7px;
          border-radius: 10px;
          font-weight: 400;
          font-size: 0.75rem;
        }
        
        .item-name {
          color: #03081F;
          font-weight: 600;
        }
        
        .item-price {
          color: #4A4A4A;
        }
        
        .item-image-container {
          width: 100%;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 6px;
          background-color: #f8f9fa;
        }
        
        .item-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .no-image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: #f8f9fa;
          color: #adb5bd;
          font-size: 2rem;
        }
        
        /* Button Styles */
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
        
        /* Search Input */
        .search-container {
          position: relative;
          min-width: 300px;
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
        
        /* Form Controls */
        .form-control-custom:focus {
          border-color: #028643;
          box-shadow: 0 0 0 0.25rem rgba(2, 134, 67, 0.25);
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .search-container {
            width: 100%;
          }
        }
      `}</style>
    </Container>
  );
};

export default PenitipanHabisPage;