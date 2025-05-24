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
  BsExclamationTriangle, 
} from 'react-icons/bs';
import { GetAllBarang, CreateBarang, UpdateBarang, DeleteBarang } from '../../clients/BarangService';
import { CreatePenitipan, GetPenitipanByIdBarang, GetAllPenitipan } from '../../clients/PenitipanService';
import { GetAllPenitip } from '../../clients/PenitipService';
import { GetAllPegawai, GetPegawaiByAkunId } from '../../clients/PegawaiService';
import { decodeToken } from '../../utils/jwtUtils';
import RoleSidebar from '../../components/navigation/Sidebar';
import ToastNotification from '../../components/toast/ToastNotification';
import PaginationComponent from '../../components/pagination/Pagination';
import AddEditBarangModal from '../../components/modal/AddEditBarangModal';
import BarangCard from '../../components/card/CardListBarang';
import ConfirmationModalUniversal from '../../components/modal/ConfirmationModalUniversal';
import NotaPenitipanPdf from '../../components/pdf/NotaPenitipanPdf';

const ManageBarang = () => {
  const [barangList, setBarangList] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [penitipList, setPenitipList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [penitipanList, setPenitipanList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [selectedPenitipan, setSelectedPenitipan] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmType, setConfirmType] = useState('warning');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [selectedView, setSelectedView] = useState('all');
  const [currentBarang, setCurrentBarang] = useState(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [akun, setAkun] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [loggedInPegawaiId, setLoggedInPegawaiId] = useState('');

  const [formData, setFormData] = useState({
    id_penitip: '',
    id_hunter: '',
    id_pegawai_gudang: '',
    nama: '',
    deskripsi: '',
    harga: '',
    garansi_berlaku: false,
    tanggal_garansi: null,
    berat: '',
    status_qc: 'Tidak Lulus',
    kategori_barang: ''
  });

  const kategoriOptions = [
    'Elektronik & Gadget', 'Pakaian & Aksesori', 'Perabotan Rumah Tangga', 
    'Buku, Alat Tulis, & Peralatan Sekolah', 'Hobi, Mainan, & Koleksi', 
    'Perlengkapan Bayi & Anak', 'Otomotif & Aksesori', 'Perlengkapan Taman & Outdoor', 
    'Peralatan Kantor & Industri', 'Kosmetik & Perawatan diri' 
  ];
  const statusQCOptions = ['Lulus', 'Tidak lulus'];
  const barangViews = [
    { id: 'all', name: 'Semua Barang' },
    { id: 'Lulus', name: 'Lulus Quality Check' },
    { id: 'Tidak lulus', name: 'Tidak Lulus Quality Check' }
  ];

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Function to calculate remaining days
  const calculateRemainingDays = (barangId) => {
    const penitipan = penitipanList.find(p => p.id_barang === barangId);
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
          setLoggedInPegawaiId(dataPegawai.id_pegawai);
          setFormData(prevData => ({
            ...prevData,
            id_pegawai_gudang: dataPegawai.id_pegawai
          }));
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
    filterBarangData();
  }, [selectedView, barangList, searchTerm, selectedCategory]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarang.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [barangResponse, penitipResponse, pegawaiResponse, penitipanResponse] = await Promise.all([
        GetAllBarang(),
        GetAllPenitip(),
        GetAllPegawai(),
        GetAllPenitipan()
      ]);

      setBarangList(barangResponse.data);
      setPenitipList(penitipResponse.data);
      setPegawaiList(pegawaiResponse.data);
      setPenitipanList(penitipanResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi nanti.');
      showNotification('Gagal memuat data. Silakan coba lagi nanti.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filterBarangData = () => {
    let filtered = [...barangList];
    
    if (selectedView === 'Lulus') {
      filtered = filtered.filter(barang => barang.status_qc === 'Lulus');
    } else if (selectedView === 'Tidak lulus') {
      filtered = filtered.filter(barang => barang.status_qc === 'Tidak lulus');
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(barang => barang.kategori_barang === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(barang => 
        barang.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barang.id_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barang.kategori_barang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBarang(filtered);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value === '' ? null : value
    });
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      tanggal_garansi: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 2) {
      showNotification('Maksimal 2 gambar yang dapat diunggah.', 'warning');
      return;
    }

    setSelectedImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const resetForm = () => {
    setFormData({
      id_penitip: '',
      id_hunter: '',
      id_pegawai_gudang: loggedInPegawaiId,
      nama: '',
      deskripsi: '',
      harga: '',
      garansi_berlaku: false,
      tanggal_garansi: null,
      berat: '',
      status_qc: 'Tidak Lulus',
      kategori_barang: ''
    });
    setSelectedImages([]);
    setImagePreview([]);
    setCurrentBarang(null);
    setError('');
  };

  const openModal = (barang = null) => {
    if (barang) {
      setConfirmAction(() => () => {
        setFormData({
          id_penitip: barang.id_penitip,
          id_hunter: barang.id_hunter || null,
          id_pegawai_gudang: loggedInPegawaiId,
          nama: barang.nama,
          deskripsi: barang.deskripsi,
          harga: barang.harga,
          garansi_berlaku: barang.garansi_berlaku,
          tanggal_garansi: barang.tanggal_garansi ? barang.tanggal_garansi.split('T')[0] : null,
          berat: barang.berat,
          status_qc: barang.status_qc,
          kategori_barang: barang.kategori_barang
        });
        setCurrentBarang(barang);
        if (barang.gambar) {
          const imageUrls = barang.gambar.split(',').map(img => img.trim());
          setImagePreview(imageUrls);
        } else {
          setImagePreview([]);
        }
        setShowModal(true);
      });
      setConfirmType('warning');
      setConfirmMessage(`Apakah Anda yakin ingin mengedit barang "${barang.nama}"?`);
      setShowConfirmModal(true);
    } else {
      resetForm();
      setShowModal(true);
    }
  };

  const createPenitipanForBarang = async (barangId) => {
    try {
      const currentDate = new Date();
      const tanggalAwal = currentDate.toISOString();
      const tanggalAkhir = new Date(currentDate);
      tanggalAkhir.setDate(tanggalAkhir.getDate() + 30);
      const tanggalBatas = new Date(tanggalAkhir);
      tanggalBatas.setDate(tanggalBatas.getDate() + 7);
      
      const penitipanData = {
        id_barang: barangId,
        tanggal_awal_penitipan: tanggalAwal,
        tanggal_akhir_penitipan: tanggalAkhir.toISOString(),
        tanggal_batas_pengambilan: tanggalBatas.toISOString(),
        perpanjangan: 0,
        status_penitipan: 'Dalam masa penitipan'
      };
      
      const response = await CreatePenitipan(penitipanData);
      console.log('Penitipan created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating penitipan:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.id_penitip || !formData.nama || 
        !formData.deskripsi || !formData.harga || !formData.berat || !formData.kategori_barang) {
      setError('Harap isi semua field yang diperlukan!');
      showNotification('Harap isi semua field yang diperlukan!', 'danger');
      return;
    }

    if (formData.garansi_berlaku && !formData.tanggal_garansi) {
      setError('Tanggal garansi harus diisi jika garansi berlaku!');
      showNotification('Tanggal garansi harus diisi jika garansi berlaku!', 'danger');
      return;
    }

    try {
      const formDataObj = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'id_hunter') {
          if (formData[key] !== '' && formData[key] !== 'null' && formData[key] !== null) {
            formDataObj.append(key, formData[key]);
          }
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataObj.append(key, formData[key]);
        }
      });
      
      if (selectedImages.length > 0) {
        selectedImages.forEach(image => {
          formDataObj.append('gambar', image);
        });
      }
      
      console.log('Form data keys:', [...formDataObj.keys()]);
      console.log('Form data entries:', [...formDataObj.entries()].map(entry => `${entry[0]}: ${entry[1]}`));
      
      let response;
      if (currentBarang) {
        response = await UpdateBarang(currentBarang.id_barang, formDataObj);
        showNotification('Data barang berhasil diperbarui!', 'success');
      } else {
        response = await CreateBarang(formDataObj);
        try {
          const barangId = response.data.id_barang;
          await createPenitipanForBarang(barangId);
          showNotification('Data barang dan penitipan berhasil ditambahkan!', 'success');
        } catch (penitipanError) {
          console.error('Error creating penitipan:', penitipanError);
          showNotification('Barang berhasil ditambahkan, tetapi gagal membuat data penitipan!', 'warning');
        }
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Terjadi kesalahan saat menyimpan data. Silakan coba lagi nanti.');
      showNotification('Terjadi kesalahan saat menyimpan data. Silakan coba lagi nanti.', 'danger');
    }
  };

  const handleDeleteBarang = async (id, nama) => {
    setConfirmAction(() => async () => {
      try {
        await DeleteBarang(id);
        showNotification('Barang berhasil dihapus.', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting barang:', error);
        showNotification('Gagal menghapus barang. Barang mungkin digunakan di data lain.', 'danger');
      }
    });
    setConfirmType('danger');
    setConfirmMessage(`Apakah Anda yakin ingin menghapus barang "${nama}"?`);
    setShowConfirmModal(true);
  };

  const handlePrintNota = async (barangId) => {
    try {
      const response = await GetPenitipanByIdBarang(barangId);
      if (response.data) {
        setSelectedPenitipan(response.data);
        setShowNotaModal(true);
      } else {
        showNotification('Data penitipan tidak ditemukan untuk barang ini.', 'warning');
      }
    } catch (error) {
      console.error('Error fetching penitipan data:', error);
      showNotification('Gagal memuat data penitipan. Silakan coba lagi.', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Lulus':
        return <Badge bg="success">Lulus</Badge>;
      case 'Tidak lulus':
        return <Badge bg="danger">Tidak Lulus</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPenitipName = (id) => {
    const penitip = penitipList.find(p => p.id_penitip === id);
    return penitip ? penitip.nama_penitip : '-';
  };

  const getPegawaiName = (id) => {
    const pegawai = pegawaiList.find(p => p.id_pegawai === id);
    return pegawai ? pegawai.nama_pegawai : '-';
  };

  const renderImagePreview = () => {
    if (imagePreview.length === 0) {
      return <p className="text-muted">Tidak ada gambar yang dipilih</p>;
    }
    
    return (
      <div className="d-flex flex-wrap gap-2 mt-2">
        {imagePreview.map((src, index) => (
          <div key={index} className="position-relative" style={{ width: '150px', height: '150px' }}>
            <img
              src={src}
              alt={`Preview ${index + 1}`}
              className="img-thumbnail"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderBarangCard = (barang) => {
    return (
      <Col xs={12} md={6} lg={4} key={barang.id_barang} className="mb-4">
        <BarangCard 
          barang={barang}
          getPenitipName={getPenitipName}
          onEdit={openModal}
          onDelete={handleDeleteBarang}
          onPrintNota={handlePrintNota}
          getStatusBadge={getStatusBadge}
          remainingDays={calculateRemainingDays(barang.id_barang)}
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

      <NotaPenitipanPdf
        show={showNotaModal}
        handleClose={() => setShowNotaModal(false)}
        penitipan={selectedPenitipan}
      />

      <div className="max-width-container mx-auto pt-4 px-3">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Kelola Data Barang</h2>
            <p className="text-muted mt-1">Daftar barang yang dikelola Pegawai Gudang</p>
          </Col>
          <Col xs="auto">
            <Button 
              className="tambah-barang-btn"
              onClick={() => openModal()}
            >
              Tambah Barang
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md={3}>
            <RoleSidebar 
              namaSidebar={'Status QC Barang'}
              roles={barangViews} 
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
            ) : filteredBarang.length === 0 ? (
              <div className="text-center py-5">
                <BsExclamationTriangle style={{ fontSize: '3rem', color: '#D9D9D9' }} />
                <p className="mt-3 text-muted">Tidak ada data barang yang ditemukan</p>
              </div>
            ) : (
              <>
                <Row>
                  {currentItems.map(barang => renderBarangCard(barang))}
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

      <AddEditBarangModal 
        showModal={showModal}
        setShowModal={setShowModal}
        formData={formData}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleImageChange={handleImageChange}
        imagePreview={imagePreview}
        handleSubmit={handleSubmit}
        currentBarang={currentBarang}
        penitipList={penitipList}
        pegawaiList={pegawaiList}
        kategoriOptions={kategoriOptions}
        statusQCOptions={statusQCOptions}
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

export default ManageBarang;