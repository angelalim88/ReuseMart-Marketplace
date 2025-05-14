import React, { useEffect, useState } from 'react';
import { decodeToken } from '../utils/jwtUtils';
import { useParams, useNavigate } from 'react-router-dom';
import { GetBarangById } from "../clients/BarangService";
import { GetPenitipById } from "../clients/PenitipService";
import { GetReviewProdukByIdBarang } from "../clients/ReviewService";
import { CreateDiskusiProduk, GetDiskusiProdukById, GetDiskusiProdukByIdBarang, UpdateDiskusiProduk } from "../clients/DiskusiProdukService";
import { FaStar, FaShoppingCart, FaPlus, FaMinus, FaArrowRight, FaComment } from 'react-icons/fa';
import "bootstrap/dist/css/bootstrap.min.css";
import AddDiskusiModal from "../components/modal/AddDiskusiModal";
import AnswerDiskusiModal from '../components/modal/AnswerDiskusiModal';
import { apiPembeli } from "../clients/PembeliService";
import { GetAllPegawai, GetPegawaiByAkunId, GetPegawaiById } from "../clients/PegawaiService";
import { toast } from 'sonner';

const DetailBarang = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barang, setBarang] = useState(null);
  const [penitip, setPenitip] = useState(null);
  const [diskusi, setDiskusi] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    penitipRating: 0,
    penitipBadge: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [productImages, setProductImages] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState('Pengiriman');
  const [akun, setAkun] = useState(null);
  const [pembeli, setPembeli] = useState(null);
  const [customerService, setCustomerService] = useState(null);
  const [toggleDiskusi, setToggleDiskusi] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [currentDiscussion, setCurrentDiscussion] = useState([]);
  const discussionPerPage = 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const barangResponse = await GetBarangById(id);
        const barangData = barangResponse.data;

        if (barangData) {
          const imageUrls = barangData.gambar.split(',').map(img => img.trim());
          setProductImages(imageUrls);
          setBarang(barangData);

          if (barangData.id_penitip) {
            try {
              const penitipResponse = await GetPenitipById(barangData.id_penitip);
              // console.log(penitipResponse.data.Akun.profile_picture);
              setPenitip(penitipResponse.data);
            } catch (penitipError) {
              console.error("Error fetching penitip data:", penitipError);
            }
          }

          try {
            const diskusiResponse = await GetDiskusiProdukByIdBarang(id);
            const sortedDiskusi = diskusiResponse.data ? 
              diskusiResponse.data.slice(0, 2) : 
              [];
            setDiskusi(sortedDiskusi);
          } catch (diskusiError) {
            console.error("Error fetching diskusi produk:", diskusiError);
            toast.error("Gagal menampilkan diskusi produk!");
            setDiskusi([]);
          }

          try {
            const reviewsResponse = await GetReviewProdukByIdBarang(id);
            if (reviewsResponse.data) {
              setReviews(reviewsResponse.data.reviews || []);
              setReviewStats({
                averageRating: reviewsResponse.data.averageRating || 0,
                totalReviews: reviewsResponse.data.totalReviews || 0,
                penitipRating: reviewsResponse.data.penitipRating || 0,
                penitipBadge: reviewsResponse.data.penitipBadge || 0
              });
            }
          } catch (reviewsError) {
            console.error("Error fetching reviews:", reviewsError);
            setReviews([]);
          }
        }
      } catch (err) {
        setError("Gagal memuat detail produk");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }

      await fetchUserData();

    };

    fetchData();
  }, [id]);

  const fetchUserData = async () => {
    if(localStorage.getItem("authToken")){
        try {
          const token = localStorage.getItem("authToken");
          if (!token) throw new Error("Token tidak ditemukan");
          
          const decoded = decodeToken(token);
          setAkun(decoded);
          if (!decoded?.id) throw new Error("Invalid token structure");
          if(decoded.role == "Pembeli") {
            const dataPembeli = await apiPembeli.getPembeliByIdAkun(decoded.id);
            setPembeli(dataPembeli);
          } else if(decoded.role == "Customer Service") {
            const dataPegawai = await GetPegawaiByAkunId(decoded.id);
            setCustomerService(dataPegawai.data);
          }
        } catch (error) {
          setError("Gagal memuat data user!");
          toast.error("Gagal memuat data user!");
          console.error("Error:", err);
        }
      }
  }

  const handleGoToDiskusi = () => {
    navigate(`/diskusi-produk/${id}`);
  };

  const handleAddToCart = () => {
    console.log(`Added ${quantity} of ${barang.nama} to cart`);
  };

  const handleBuyNow = () => {
    console.log(`Buy Now: ${quantity} of ${barang.nama}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i < Math.floor(rating) ? "text-warning" : "text-muted"} 
        />
      );
    }
    return stars;
  };

  const fetchDiskusi = async () => {
    try {
      const diskusiResponse = await GetDiskusiProdukByIdBarang(id);
      const diskusiData = diskusiResponse.data ? diskusiResponse.data : [];
      setDiskusi(diskusiData);
    } catch (diskusiError) {
      console.error("Error fetching diskusi produk:", diskusiError);
      toast.error("Gagal menampilkan diskusi produk!");
      setDiskusi([]);
    }
  }

  const paginationDiscussion = () => {
    if(diskusi.length > 0) {
      if(toggleDiskusi) {
        setCurrentDiscussion(diskusi)
      } else {
        setCurrentDiscussion(diskusi.slice(((currentSection-1)*discussionPerPage), (currentSection*discussionPerPage)));
      }
    }
  }

  useEffect(() => {
    fetchDiskusi();
    paginationDiscussion();
  }, [diskusi])
  
  const onSubmitPertanyaan = async (pertanyaan) => {
    try {
      const id_barang = barang.id_barang;
      const id_pembeli = pembeli.id_pembeli;
  
      const dataPegawai = await GetAllPegawai();
      const customerService = dataPegawai.data.find(p => p.Akun.role === "Customer Service");
      const id_customer_service = customerService.id_pegawai;
      
      const diskusiProduk = {
        id_barang: id_barang,
        id_customer_service: id_customer_service,
        id_pembeli: id_pembeli,
        pertanyaan: pertanyaan
      }
  
      await CreateDiskusiProduk(diskusiProduk);
  
      fetchDiskusi();
    } catch (error) {
      console.error("Gagal menambahkan pertanyaan: ", error);
      toast.error("Gagal menambahkan pertanyaan!");
    }
  }

  const onSubmitjawaban = async (jawaban) => {
    try {
      const id_diskusi_produk = selectedDiscussion;
      const id_customer_service = customerService.id_pegawai;
      const data = {
        jawaban: jawaban,
        id_customer_service: id_customer_service
      }
      
      try {
        const diskusiResponse = await GetDiskusiProdukByIdBarang(id);
        const sortedDiskusi = diskusiResponse.data ? 
          diskusiResponse.data.slice(0, 2) : 
          [];
        setDiskusi(sortedDiskusi);
      } catch (diskusiError) {
        console.error("Error fetching diskusi produk:", diskusiError);
        setDiskusi([]);
      }
  
      await UpdateDiskusiProduk(id_diskusi_produk, data);
  
      fetchDiskusi();
    } catch (error) {
      console.error("Gagal menambahkan jawaban: ", error);
      toast.error("Gagal menambahkan jawaban!");
    }
  }

  const showAllDiskusi = async () => {
    try {
      const diskusiResponse = await GetDiskusiProdukByIdBarang(id);
      const sortedDiskusi = diskusiResponse.data ? 
        diskusiResponse.data : 
        [];
      setDiskusi(sortedDiskusi);
      setToggleDiskusi(!toggleDiskusi);
    } catch (diskusiError) {
      console.error("Error fetching diskusi produk:", diskusiError);
      setDiskusi([]);
    }
  }

  const unshowAllDiskusi = async () => {
    try {
      const diskusiResponse = await GetDiskusiProdukByIdBarang(id);
      const sortedDiskusi = diskusiResponse.data ? 
        diskusiResponse.data.slice(0, 2) : 
        [];
      setDiskusi(sortedDiskusi);
      setToggleDiskusi(!toggleDiskusi);
    } catch (diskusiError) {
      console.error("Error fetching diskusi produk:", diskusiError);
      setDiskusi([]);
    }
  }

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border" style={{ color: '#028643' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !barang) {
    return (
      <div className="container mt-5">
        <div className="alert mt-4" role="alert" style={{ backgroundColor: '#FC8A06', color: '#FFFFFF' }}>
          {error || "Produk tidak ditemukan"}
        </div>
      </div>
    );
  }

  return (
    <div className="py-5" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container">
        <div className="row">
          {/* Left Column - Product Images & Details */}
          <div className="col-lg-8">
            <div className="row">
              {/* Product Images */}
              <div className="col-md-6 mb-4">
                <div 
                  className="shadow-sm rounded"
                  style={{ 
                    height: '400px', 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #E9ECEF'
                  }}
                >
                  <img 
                    src={productImages[selectedImage]} 
                    alt={barang.nama} 
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div className="d-flex mt-3 gap-2 overflow-auto">
                  {productImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${barang.nama} thumbnail ${index + 1}`}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: selectedImage === index ? '3px solid #FC8A06' : '1px solid #D9D9D9',
                        cursor:'pointer',
                        transition: 'border 0.2s ease'
                      }}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="col-md-6 mb-4">
                <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#03081F', marginBottom: '12px' }}>
                  {barang.nama}
                </h1>
                <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#FC8A06', marginBottom: '16px' }}>
                  {formatPrice(barang.harga)}
                </p>
                <div className="mb-3">
                  <span style={{ color: '#03081F', fontSize: '14px', fontWeight: '500' }}>Kategori: </span>
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: '#E9ECEF', 
                      color: '#03081F', 
                      fontSize: '12px', 
                      padding: '6px 12px',
                      borderRadius: '12px'
                    }}
                  >
                    {barang.kategori_barang || 'Tidak ada kategori'}
                  </span>
                </div>
                <div className="mb-3">
                  <span style={{ color: '#03081F', fontSize: '14px', fontWeight: '500' }}>Deskripsi: </span>
                  <p style={{ color: '#03081F', fontSize: '14px', lineHeight: '1.6', margin: '8px 0 0 0' }}>
                    {barang.deskripsi || 'Tidak ada deskripsi tersedia.'}
                  </p>
                </div>
                <div className="mb-3">
                  <span style={{ color: '#03081F', fontSize: '14px', fontWeight: '500' }}>Berat: </span>
                  <span style={{ color: '#03081F', fontSize: '14px' }}>
                    {barang.berat} kg
                  </span>
                </div>
                <div className="mb-3">
                  <span style={{ color: '#03081F', fontSize: '14px', fontWeight: '500' }}>Status QC: </span>
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: barang.status_qc === 'Lolos' ? '#028643' : '#FC8A06', 
                      color: '#FFFFFF', 
                      fontSize: '12px', 
                      padding: '6px 12px',
                      borderRadius: '12px'
                    }}
                  >
                    {barang.status_qc}
                  </span>
                </div>
                {barang.garansi_berlaku && (
                  <div className="mb-3">
                    <span style={{ color: '#03081F', fontSize: '14px', fontWeight: '500' }}>Garansi: </span>
                    <span style={{ color: '#03081F', fontSize: '14px' }}>
                      Berlaku hingga {new Date(barang.tanggal_garansi).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Information */}
            {penitip && (
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div className="d-flex align-items-center">
                    <img 
                      src={penitip.Akun.profile_picture || "/assets/images/default-avatar.jpg"} 
                      alt={penitip.nama_penitip} 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        marginRight: '16px',
                        objectFit: 'cover',
                        border: '2px solid #028643'
                      }}
                    />
                    <div>
                      <div className="d-flex align-items-center">
                        <h5 style={{ color: '#03081F', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                          {penitip.nama_penitip}
                        </h5>
                        {reviewStats.penitipBadge === 1 && (
                          <span 
                            className="badge ms-2" 
                            style={{ 
                              backgroundColor: '#FC8A06', 
                              color: '#FFFFFF', 
                              fontSize: '10px', 
                              padding: '4px 8px',
                              borderRadius: '12px'
                            }}
                          >
                            Top Seller
                          </span>
                        )}
                      </div>
                      <div className="d-flex align-items-center mt-1">
                        <div className="d-flex text-warning me-2">
                          {renderRatingStars(penitip.rating || 0)}
                        </div>
                        <span style={{ color: '#6C757D', fontSize: '12px' }}>
                          ({penitip.total_poin || 100} Poin)
                        </span>
                      </div>
                      <p style={{ color: '#6C757D', fontSize: '12px', margin: '4px 0 0 0' }}>
                        Bergabung sejak {new Date(penitip.tanggal_registrasi).toLocaleDateString('id-ID', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Discussion */}
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div 
                className="card-header d-flex justify-content-between align-items-center" 
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderBottom: '1px solid #E9ECEF', 
                  padding: '16px 24px' 
                }}
              >
                <h5 id="diskusi-produk" style={{ fontWeight: 'bold', color: '#03081F', fontSize: '18px', margin: 0 }}>
                  Diskusi Produk
                </h5>
                <button 
                  className="btn" 
                  style={{ 
                    backgroundColor: '#028643', 
                    color: '#FFFFFF', 
                    borderRadius: '20px', 
                    padding: '8px 24px', 
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease',
                    fontSize: '14px'
                  }}
                  onClick={toggleDiskusi ? unshowAllDiskusi : showAllDiskusi}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#026c38'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#028643'}
                >
                  {toggleDiskusi ? "Tutup" : "Lihat Semua Diskusi"}
                </button>
              </div>
              <div className="card-body p-4">
                {diskusi.length > 0 ? (
                  currentDiscussion.map((item) => (
                    <div key={item.id_diskusi_produk} className="border-bottom pb-3 mb-3">
                      {/* Pembeli's Question */}
                      <div className="d-flex align-items-center mb-2">
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#E9ECEF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#03081F'
                          }}
                        >
                          {item.Pembeli.nama.charAt(0)}
                        </div>
                        <div>
                          <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#03081F' }}>
                            {item.Pembeli.nama}
                          </h6>
                          <small style={{ color: '#6C757D', fontSize: '12px' }}>
                            {formatDateTime(item.tanggal_pertanyaan)}
                          </small>
                        </div>
                      </div>
                      <p style={{ color: '#03081F', fontSize: '14px', marginBottom: '16px', marginLeft: '52px' }}>
                        {item.pertanyaan}
                      </p>
                      { akun && akun.role == "Customer Service" && (item.jawaban == "" || item.jawaban == null) ? <div className="d-flex w-100 justify-content-end">
                        <button className='btn btn-success rounded-pill px-5' onClick={() => {setSelectedDiscussion(item.id_diskusi_produk)}} type="button" data-bs-toggle="modal" data-bs-target="#answer-diskusi-modal">Jawab</button>
                      </div> : <></>}

                      {/* Admin's Response */}
                      {item.jawaban && (
                        <div className="ms-5 mt-3">
                          <div className="d-flex align-items-center mb-2">
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#028643',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#FFFFFF'
                              }}
                            >
                              {item.Pegawai.nama_pegawai.charAt(0)}
                            </div>
                            <div>
                              <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#03081F' }}>
                                {item.Pegawai.nama_pegawai}
                                <span className="ms-2 badge bg-info text-white" style={{ fontSize: '10px' }}>
                                Customer Service
                                </span>
                              </h6>
                              <small style={{ color: '#6C757D', fontSize: '12px' }}>
                                {formatDateTime(item.tanggal_jawaban)}
                              </small>
                            </div>
                          </div>
                          <p style={{ color: '#03081F', fontSize: '14px', marginBottom: '0', marginLeft: '52px' }}>
                            {item.jawaban}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p style={{ color: '#6C757D', fontSize: '14px', margin: 0 }}>
                      Belum ada diskusi untuk produk ini.
                    </p>
                  </div>
                )}

                { diskusi.length == 0 ? <></> 
                : 
                <>
                  <nav aria-label="Page navigation example" className='my-4'>
                    <ul class="pagination justify-content-center">
                      <li className={`page-item ${currentSection === 1 ? 'disabled' : ''}`}>
                        <button className={`page-link ${currentSection === 1 ? '' : 'text-success'}`} onClick={() => setCurrentSection(currentSection - 1)} href="#diskusi-produk">Previous</button>
                      </li>
                      {[...Array(Math.ceil(diskusi.length / discussionPerPage))].map((_, index) => (
                        <li className={`page-item ${currentSection === index + 1 ? 'active' : ''}`} key={index}>
                          <button className={`page-link ${currentSection === index + 1 ? 'bg-success text-white border-success' : 'text-success'}`} onClick={() => setCurrentSection(index + 1)} href="#diskusi-produk">{index + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentSection === (Math.ceil(diskusi.length/discussionPerPage)) ? 'disabled' : ''}`}>
                        <button className={`page-link ${currentSection === (Math.ceil(diskusi.length/discussionPerPage)) ? '' : 'text-success'}`} onClick={() => setCurrentSection(currentSection + 1)} href="#diskusi-produk">Next</button>
                      </li>
                    </ul>
                  </nav>
                </>}


                <div className="text-center mt-4">
                  {
                    akun && akun.role == "Pembeli" ? 
                    <button 
                    className="btn" 
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #028643',
                      color: '#028643', 
                      borderRadius: '20px', 
                      padding: '8px 24px', 
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                    // onClick={handleGoToDiskusi}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#028643';
                      e.target.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.color = '#028643';
                    }}
                    data-bs-toggle="modal" data-bs-target="#add-diskusi-modal"
                  >
                    Mulai Diskusi Baru
                  </button>
                  : 
                  <></>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary & Checkout */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '80px', zIndex: 100, paddingBottom: '20px' }}>
              <div className="card shadow-sm border-0 rounded-3">
                {penitip && penitip.badge === 1 && (
                  <div 
                    className="text-center py-2" 
                    style={{ 
                      backgroundColor: '#FC8A06', 
                      color: '#FFFFFF', 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      borderRadius: '12px 12px 0 0'
                    }}
                  >
                    TOP PENITIP BULAN INI
                  </div>
                )}
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <FaShoppingCart style={{ color: '#028643', marginRight: '12px', fontSize: '20px' }} />
                    <h6 style={{ color: '#03081F', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                      PEMBELIAN
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: '#03081F', fontSize: '14px' }}>Sub Total:</span>
                    <span style={{ color: '#03081F', fontSize: '14px', fontWeight: 'bold' }}>
                      {formatPrice(barang.harga * 1)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: '#03081F', fontSize: '14px' }}>Diskon:</span>
                    <span style={{ color: '#03081F', fontSize: '14px', fontWeight: 'bold' }}>
                      Rp 0
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-4">
                    <span style={{ color: '#03081F', fontSize: '14px' }}>Biaya Pengiriman:</span>
                    <span style={{ color: '#03081F', fontSize: '14px', fontWeight: 'bold' }}>
                      Rp 100,000
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-4">
                    <button
                      className="btn d-flex align-items-center"
                      style={{
                        backgroundColor: selectedShipping === 'Pengiriman' ? '#E9ECEF' : '#FFFFFF',
                        border: '1px solid #E9ECEF',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        flex: 1,
                        marginRight: '8px',
                        justifyContent: 'center',
                        transition: 'background-color 0.3s ease'
                      }}
                      onClick={() => setSelectedShipping('Pengiriman')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-truck me-2" viewBox="0 0 16 16">
                        <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-4 0H1.5A1.5 1.5 0 0 1 0 10.5V3.5zM2 4.5v6h1.02a3 3 0 0 0 5.96 0H11v-6H2zm10 1h1.02L11.541 7.35A.5.5 0 0 0 11.83 8H13v2h-1V6.5zM5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                      </svg>
                      Pengiriman <br /> 10:00-16:00
                    </button>
                    <button
                      className="btn d-flex align-items-center"
                      style={{
                        backgroundColor: selectedShipping === 'Pick Up' ? '#E9ECEF' : '#FFFFFF',
                        border: '1px solid #E9ECEF',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        flex: 1,
                        justifyContent: 'center',
                        transition: 'background-color 0.3s ease'
                      }}
                      onClick={() => setSelectedShipping('Pick Up')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-shop me-2" viewBox="0 0 16 16">
                        <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/>
                      </svg>
                      Pick Up <br /> 10:00-16:00
                    </button>
                  </div>
                  <button 
                    className="btn w-100 mb-2" 
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '2px solid #028643', 
                      color: '#028643', 
                      borderRadius: '20px', 
                      padding: '10px', 
                      fontWeight: 'bold',
                      transition: 'background-color 0.3s ease, color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#028643';
                      e.target.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.color = '#028643';
                    }}
                    onClick={handleAddToCart}
                  >
                    Keranjang
                  </button>
                  <button 
                    className="btn w-100" 
                    style={{ 
                      backgroundColor: '#028643', 
                      color: '#FFFFFF', 
                      border: 'none', 
                      borderRadius: '20px', 
                      padding: '10px', 
                      fontWeight: 'bold',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#026c38'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#028643'}
                    onClick={handleBuyNow}
                  >
                    Checkout!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddDiskusiModal onSubmit={onSubmitPertanyaan} />
      <AnswerDiskusiModal onSubmit={onSubmitjawaban} />
    </div>
  );
};

export default DetailBarang;