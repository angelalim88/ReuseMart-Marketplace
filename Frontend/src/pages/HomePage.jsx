import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import CardProduk from '../components/card/CardProduk';
import { GetAllBarang } from "../clients/BarangService";
import { FaFire, FaRegThumbsUp, FaTag, FaArrowRight } from 'react-icons/fa';
import { Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const response = await GetAllBarang();
        console.log(response.data);
        const filteredBarang = response.data.filter(item => item.status_qc !== "Tidak lulus");
        setBarangList(filteredBarang);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products");
        setLoading(false);
      }
    };
    
    fetchBarang();
  }, []);

  const carouselImages = [
    {
      id: 1,
      image: "../src/assets/images/hero-home.png",
      alt: "Shopping made easy",
      title: "Belanja Barang Bekas Berkualitas",
      subtitle: "Hemat uang, hemat bumi"
    },
    {
      id: 2,
      image: "../src/assets/images/hero-banner2.png",
      alt: "Quality second hand products",
      title: "Kualitas Terjamin",
      subtitle: "Semua produk telah melalui pemeriksaan ketat"
    },
    {
      id: 3,
      image: "../src/assets/images/hero-banner3.png", 
      alt: "Affordable prices",
      title: "Harga Terjangkau",
      subtitle: "Temukan barang impianmu dengan harga menarik"
    }
  ];

  const kategorisBarang = [
    {
      id: 1,
      name: "Elektronik & Gadget",
      image: "../src/assets/images/electronic-category.png",
      discount: "30%"
    },
    {
      id: 2,
      name: "Pakaian & Aksesoris",
      image: "../src/assets/images/fashion-category.png",
      discount: "25%"
    },
    {
      id: 3,
      name: "Perabot Rumah Tangga",
      image: "../src/assets/images/furniture-category.png",
      discount: "40%"
    }
  ];

  const getRandomProducts = (count) => {
    if (!barangList.length) return [];
    const shuffled = [...barangList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const styles = {
    container: {
      backgroundColor: '#F8F9FA',
      minHeight: '100vh',
    },
    carouselContainer: {
      marginBottom: '40px',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
    },
    carouselImage: {
      width: '100%',
      height: '500px',
      objectFit: 'cover',
    },
    carouselCaption: {
      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '30px',
      textAlign: 'left',
    },
    carouselTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '10px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    },
    carouselSubtitle: {
      fontSize: '18px',
      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
    },
    productColumn: {
      marginBottom: '25px',
    },
    sectionContainer: {
      marginBottom: '50px',
      padding: '0 15px',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
    },
    sectionTitle: {
      fontWeight: 'bold',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      color: '#03081F',
      margin: 0,
    },
    seeAllLink: {
      color: '#FC8A06',
      textDecoration: 'none',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
    },
    iconBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FC8A06',
      color: 'white',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      marginLeft: '12px',
      fontSize: '14px',
    },
    categoryCard: {
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      height: '200px',
      color: 'white',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'flex-end',
      transition: 'transform 0.3s ease',
    },
    categoryImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: 1,
      transition: 'transform 0.3s ease',
    },
    categoryOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
      zIndex: 2,
    },
    categoryContent: {
      padding: '25px',
      position: 'relative',
      zIndex: 3,
      width: '100%',
    },
    categoryTitle: {
      fontWeight: 'bold',
      marginBottom: '0',
      fontSize: '20px',
    },
    discountBadge: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      backgroundColor: '#FC8A06',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontWeight: 'bold',
      zIndex: 3,
      fontSize: '14px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '300px',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '20px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div className="container">
          <div style={styles.loadingContainer}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div className="container">
          <div className="alert alert-danger mt-4" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="container pt-4 pb-5">
        {/* Hero Carousel */}
        <div style={styles.carouselContainer}>
          <Carousel fade interval={5000} indicators={true}>
            {carouselImages.map(item => (
              <Carousel.Item key={item.id}>
                <img
                  className="d-block w-100"
                  src={item.image}
                  alt={item.alt}
                  style={styles.carouselImage}
                />
                <Carousel.Caption style={styles.carouselCaption}>
                  <h2 style={styles.carouselTitle}>{item.title}</h2>
                  <p style={styles.carouselSubtitle}>{item.subtitle}</p>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      
        {/* Kategori Produk */}
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Kategori Produk
              <span style={styles.iconBadge}>
                <FaTag size={14} />
              </span>
            </h2>
          </div>
          
          <div className="row">
            {kategorisBarang.map(category => (
              <div className="col-md-4" key={category.id} style={styles.productColumn}>
                <div 
                  style={styles.categoryCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                  }}
                >
                  <img src={category.image} alt={category.name} style={styles.categoryImage} />
                  <div style={styles.categoryOverlay}></div>
                  <div style={styles.categoryContent}>
                    <h5 style={styles.categoryTitle}>{category.name}</h5>
                  </div>
                  <div style={styles.discountBadge}>
                    Diskon {category.discount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      
        {/* Berdasarkan Pencarianmu */}
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Berdasarkan Pencarianmu
              <span style={styles.iconBadge}>
                <FaRegThumbsUp size={14} />
              </span>
            </h2>
            <a href="#" style={styles.seeAllLink}>
              Lihat Semua <FaArrowRight size={12} className="ms-2" />
            </a>
          </div>
          
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6">
            {getRandomProducts(6).map((product, index) => (
              <div className="col" key={index} style={styles.productColumn}>
               <CardProduk 
                  image={
                    product.gambar 
                      ? product.gambar.split(',')[0].trim() 
                      : '../src/assets/images/default-product.jpg'
                  }
                  title={product.nama}
                  price={product.harga}
                  onClick={() => navigate(`/barang/${product.id_barang}`)}
                />
              </div>
            ))}
          </div>
        </div>
      
        {/* Produk Terhype */}
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Produk Terhype
              <span style={styles.iconBadge}>
                <FaFire size={14} />
              </span>
            </h2>
            <a href="#" style={styles.seeAllLink}>
              Lihat Semua <FaArrowRight size={12} className="ms-2" />
            </a>
          </div>
          
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6">
            {barangList.slice(0, 12).map((product, index) => (
              <div className="col" key={index} style={styles.productColumn}>
                <CardProduk 
                  image={
                    product.gambar 
                      ? product.gambar.split(',')[0].trim() 
                      : '../src/assets/images/default-product.jpg'
                  }
                  title={product.nama}
                  price={product.harga}
                  onClick={() => navigate(`/barang/${product.id_barang}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;