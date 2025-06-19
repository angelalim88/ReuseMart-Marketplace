import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Button, 
  Form,  
  Badge, 
  Spinner 
} from 'react-bootstrap';
import { 
  BsSearch, 
  BsExclamationTriangle 
} from 'react-icons/bs';
import { GetAllPenitipanByIdPenitip, GetPenitipanById, UpdatePenitipan } from '../../clients/PenitipanService';
import { GetPenitipByIdAkun } from '../../clients/PenitipService';
import { decodeToken } from '../../utils/jwtUtils';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from '../../components/toast/ToastNotification';
import PaginationComponent from '../../components/pagination/Pagination';
import DetailBarangModal from '../../components/modal/DetailBarangModal';
import CardListPenitipan from '../../components/card/CardListPenitipan';
import ConfirmationModalUniversal from '../../components/modal/ConfirmationModalUniversal';

const DaftarBarang = () => {
  const [penitipanList, setPenitipanList] = useState([]);
  const [filteredPenitipan, setFilteredPenitipan] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmType, setConfirmType] = useState('warning');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [imagePreview, setImagePreview] = useState([]);
  const [selectedView, setSelectedView] = useState('all');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [penitip, setPenitip] = useState(null);
  const [loggedInPenitipId, setLoggedInPenitipId] = useState('');

  const kategoriOptions = [
    'Elektronik & Gadget', 'Pakaian & Aksesori', 'Perabotan Rumah Tangga', 
    'Buku, Alat Tulis, & Peralatan Sekolah', 'Hobi, Mainan, & Koleksi', 
    'Perlengkapan Bayi & Anak', 'Otomotif & Aksesori', 'Perlengkapan Taman & Outdoor', 
    'Peralatan Kantor & Industri', 'Kosmetik & Perawatan diri'
  ];

  const penitipanViews = [
    { id: 'all', name: 'Semua Barang' },
    { id: 'Dalam masa penitipan', name: 'Dalam Masa Penitipan' },
    { id: 'Terjual', name: 'Terjual' },
    { id: 'Didonasikan', name: 'Didonasikan' },
    { id: 'Menunggu diambil', name: 'Menunggu diambil' },
    { id: 'Menunggu didonasikan', name: 'Menunggu Didonasikan' }
  ];

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const calculateRemainingDays = (penitipan) => {
    if (!penitipan || !penitipan.tanggal_akhir_penitipan) return null;
    const today = new Date();
    const endDate = new Date(penitipan.tanggal_akhir_penitipan);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Token tidak ditemukan");
        
        const decoded = decodeToken(token);
        console.log('Decoded token:', decoded);
        if (!decoded?.id) throw new Error("Invalid token structure");
        
        if (decoded.role === "Penitip") {
          const response = await GetPenitipByIdAkun(decoded.id);
          console.log('GetPenitipByIdAkun response:', response);
          
          const dataPenitip = response;
          console.log('Data penitip response:', dataPenitip);
          if (!dataPenitip || !dataPenitip.id_penitip) {
            throw new Error("Data penitip tidak valid atau id_penitip tidak ditemukan");
          }
          setPenitip(dataPenitip);
          setLoggedInPenitipId(dataPenitip.id_penitip);
          console.log('Set loggedInPenitipId:', dataPenitip.id_penitip);
        }
      } catch (err) {
        console.error("Error fetching user data:", err.message);
        setError("Gagal memuat data user: " + err.message);
        showNotification("Gagal memuat data user: " + err.message, "danger");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (loggedInPenitipId) {
      console.log('Fetching data for penitipId:', loggedInPenitipId);
      fetchData();
    }
  }, [loggedInPenitipId]);

  useEffect(() => {
    filterPenitipanData();
  }, [penitipanList, searchTerm, selectedCategory, selectedView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await Promise.race([
        GetAllPenitipanByIdPenitip(loggedInPenitipId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000))
      ]);
      console.log('GetAllPenitipanByIdPenitip response:', response);
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Data penitipan invalid atau kosong: " + JSON.stringify(response.data));
      }

      const today = new Date(); // Tanggal sekarang: 23 Mei 2025
      const updatedPenitipanList = await Promise.all(
        response.data.map(async (penitipan) => {
          const batasPengambilan = new Date(penitipan.tanggal_batas_pengambilan);
            if (batasPengambilan < today && penitipan.status_penitipan !== 'Menunggu didonasikan') {
              await UpdatePenitipan(penitipan.id_penitipan, {
                status_penitipan: 'Menunggu didonasikan'
              });
              return { ...penitipan, status_penitipan: 'Menunggu didonasikan' };
            }
          return penitipan;
        })
      );

      setPenitipanList(updatedPenitipanList);
      setFilteredPenitipan(updatedPenitipanList);
    } catch (error) {
      console.error('Error fetching penitipan data:', error);
      setError('Gagal memuat data penitipan: ' + error.message);
      showNotification('Gagal memuat data penitipan: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filterPenitipanData = () => {
    let filtered = [...penitipanList];

    if (selectedView !== 'all') {
      filtered = filtered.filter(penitipan => penitipan.status_penitipan === selectedView);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(penitipan => penitipan.Barang.kategori_barang === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(penitipan => 
        penitipan.id_penitipan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        penitipan.id_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        penitipan.status_penitipan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        penitipan.Barang.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        penitipan.Barang.kategori_barang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPenitipan(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPenitipan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPenitipan.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = async (id_penitipan) => {
    if (id_penitipan) {
      try {
        const response = await GetPenitipanById(id_penitipan);
        const data = response.data;
        setSelectedPenitipan(data);
        const baseUrl = 'http://localhost:3000/uploads/barang/'; 
        if (data.Barang.gambar) {
          const imageUrls = data.Barang.gambar
            .split(',')
            .map(img => `${baseUrl}${img.trim()}`); 
          setImagePreview(imageUrls.slice(0, 2)); 
        } else {
          setImagePreview([]);
        }
        setShowModal(true);
      } catch (error) {
        console.error('Error fetching penitipan details:', error);
        showNotification('Gagal memuat detail penitipan.', 'danger');
      }
    }
  };

  const handlePerpanjangan = (id, nama) => {
    setConfirmAction(() => async () => {
      try {
        const response = await GetPenitipanById(id);
        const penitipan = response.data;
        const endDate = new Date(penitipan.tanggal_akhir_penitipan);
        endDate.setDate(endDate.getDate() + 30);
        const batasPengambilan = new Date(endDate);
        batasPengambilan.setDate(batasPengambilan.getDate() + 7);

        await UpdatePenitipan(id, {
          tanggal_akhir_penitipan: endDate.toISOString(),
          tanggal_batas_pengambilan: batasPengambilan.toISOString(),
          perpanjangan: true
        });
        showNotification('Penitipan berhasil diperpanjang +30 hari', 'success');
        fetchData();
      } catch (error) {
        console.error('Error perpanjang penitipan:', error);
        showNotification('Gagal perpanjang penitipan.', 'danger');
      }
    });
    setConfirmType('warning');
    setConfirmMessage(`Apakah Anda yakin ingin memperpanjang penitipan barang "${nama}"?`);
    setShowConfirmModal(true);
  };

  const handlePengambilan = (id, nama) => {
    setConfirmAction(() => async () => {
      try {
        const today = new Date(); 
        const tanggalBaru = new Date(today);
        tanggalBaru.setDate(tanggalBaru.getDate() + 7); 

        await UpdatePenitipan(id, {
          tanggal_akhir_penitipan: tanggalBaru.toISOString(),
          tanggal_batas_pengambilan: tanggalBaru.toISOString(),
          status_penitipan: 'Menunggu diambil penitip'
        });
        showNotification('Penitipan berhasil diatur untuk diambil', 'success');
        fetchData();
      } catch (error) {
        console.error('Error mengatur pengambilan penitipan:', error);
        showNotification('Gagal mengatur pengambilan penitipan.', 'danger');
      }
    });
    setConfirmType('warning');
    setConfirmMessage(`Apakah Anda yakin ingin mengambil penitipan barang "${nama}"?`);
    setShowConfirmModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Terjual':
        return <Badge bg="success">Terjual</Badge>;
      case 'Dibeli':
        return <Badge bg="warning">Dibeli</Badge>;
      case 'Dalam masa penitipan':
        return <Badge bg="info">Dalam masa penitipan</Badge>;
      case 'Didonasikan':
        return <Badge bg="danger">Didonasikan</Badge>;
      case 'Menunggu didonasikan':
        return <Badge bg="secondary">Menunggu didonasikan</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const renderPenitipanCard = (penitipan) => {
    return (
      <Col xs={12} md={6} lg={4} key={penitipan.id_penitipan} className="mb-4">
        <CardListPenitipan 
          penitipan={penitipan}
          onModal={openModal}
          onPerpanjang={handlePerpanjangan}
          onAmbil={handlePengambilan}
          getStatusBadge={getStatusBadge}
          remainingDays={calculateRemainingDays(penitipan)}
        />
      </Col>
    );
  };

  return (
    <Container fluid className="p-0 bg-white">
      <ToastNotification 
        show={showToast} 
        setShow={setShowToast} 
        message={toastMessage} 
        type={toastType} 
      />

      <ConfirmationModalUniversal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title="Konfirmasi Tindakan"
        message={confirmMessage}
        confirmButtonText="Ya"
        cancelButtonText="Batal"
        type={confirmType}
      />

      <div className="max-width-container mx-auto pt-4 px-3">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Daftar Barang Saya</h2>
            <p className="text-muted mt-1">Kelola barang yang Anda titipkan</p>
          </Col>
        </Row>

        <Row>
          <Col md={3}>
            <RoleSidebar 
              namaSidebar={'Status Penitipan'}
              roles={penitipanViews} 
              selectedRole={selectedView} 
              handleRoleChange={setSelectedView} 
            />
          </Col>

          <Col md={9}>
            <Row className="mb-4">
              <Col md={6}>
                <div className="position-relative">
                  <BsSearch className="search-icon" />
                  <Form.Control
                    type="search"
                    placeholder="Cari id, nama barang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </Col>
              <Col md={6}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="all">Semua Kategori</option>
                  {kategoriOptions.map((kategori, index) => (
                    <option key={index} value={kategori}>{kategori}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" style={{ color: '#028643' }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted">Memuat data barang...</p>
              </div>
            ) : filteredPenitipan.length === 0 ? (
              <div className="text-center py-5">
                <BsExclamationTriangle style={{ fontSize: '3rem', color: '#D9D9D9' }} />
                <p className="mt-3 text-muted">Tidak ada data barang yang ditemukan</p>
              </div>
            ) : (
              <>
                <Row>
                  {currentItems.map(penitipan => renderPenitipanCard(penitipan))}
                </Row>
                
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

      <DetailBarangModal 
        showModal={showModal}
        setShowModal={setShowModal}
        penitipan={selectedPenitipan}
        imagePreview={imagePreview}
        kategoriOptions={kategoriOptions}
      />

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        .tambah-barang-btn {
          background-color: #028643;
          border-color: #028643;
          color: white;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 6px;
        }
        
        .tambah-barang-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
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
        
        .category-select {
          height: 45px;
          border-radius: 25px;
          border: 1px solid #E7E7E7;
          padding: 10px 15px;
        }
        
        .category-select:focus {
          box-shadow: none;
          border-color: #028643;
        }
        
        .barang-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .barang-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .card-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .barang-id {
          color: #686868;
          font-size: 0.9rem;
        }
        
        .barang-name {
          color: #03081F;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          height: 48px;
        }
        
        .image-container {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #f8f9fa;
          border-radius: 6px;
        }
        
        .barang-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .no-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
        }
        
        .kategori-badge {
          font-size: 0.75rem;
          background-color: #f0f0f0;
          color: #333;
          padding: 5px 10px;
          border-radius: 12px;
        }
        
        .barang-info {
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .fw-medium {
          font-weight: 500;
        }
        
        .action-buttons {
          margin-top: 10px;
        }
        
        .edit-btn, .delete-btn, .print-btn {
          font-size: 0.8rem;
          padding: 4px 8px;
        }
        
        .edit-btn {
          border-color: #028643;
          color: #028643;
        }
        
        .edit-btn:hover {
          background-color: #028643;
          color: white;
        }
        
        .delete-btn {
          border-color: #dc3545;
          color: #dc3545;
        }
        
        .delete-btn:hover {
          background-color: #dc3545;
          color: white;
        }
        
        .print-btn {
          border-color: #007bff;
          color: #007bff;
        }
        
        .print-btn:hover {
          background-color: #007bff;
          color: white;
        }
        
        .form-control-custom {
          border-radius: 6px;
          border-color: #E7E7E7;
          padding: 10px 12px;
        }
        
        .form-control-custom:focus {
          box-shadow: none;
          border-color: #028643;
        }
        
        .modal-content {
          border-radius: 8px;
          border: none;
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
          .image-container {
            height: 140px;
          }
          
          .barang-card {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </Container>
  );
};

export default DaftarBarang;