// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { GetBarangById } from "../clients/BarangService";
// import { GetPenitipById } from "../clients/PenitipService";
// import { FaShoppingCart, FaHeart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
// import "bootstrap/dist/css/bootstrap.min.css";

// const DetailBarang = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [barang, setBarang] = useState(null);
//   const [penitip, setPenitip] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);

//   useEffect(() => {
//     const fetchBarang = async () => {
//       try {
//         const response = await GetBarangById(id);
//         setBarang(response.data);
//         if (response.data.id_penitip) {
//           const penitipResponse = await GetPenitipById(response.data.id_penitip);
//           setPenitip(penitipResponse.data);
//         }
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to fetch product details");
//         setLoading(false);
//       }
//     };
    
//     fetchBarang();
//   }, [id]);

//   const handleAddToCart = () => {
//     console.log(`Added ${quantity} of ${barang.nama} to cart`);
//   };

//   const handleBuyNow = () => {
//     console.log(`Buy Now: ${quantity} of ${barang.nama}`);
//   };

//   const renderRatingStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 !== 0;
    
//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<FaStar key={`star-${i}`} className="text-warning" />);
//     }
    
//     if (hasHalfStar) {
//       stars.push(<FaStarHalfAlt key="half-star" className="text-warning" />);
//     }
    
//     const remainingStars = 5 - stars.length;
//     for (let i = 0; i < remainingStars; i++) {
//       stars.push(<FaRegStar key={`empty-star-${i}`} className="text-warning" />);
//     }
    
//     return stars;
//   };

//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//     }).format(price);
//   };

//   const productImages = [
//     barang?.gambar || "../src/assets/images/default-product.jpg",
//     "../src/assets/images/product-example-1.jpg",
//     "../src/assets/images/product-example-2.jpg",
//     "../src/assets/images/product-example-3.jpg",
//     "../src/assets/images/product-example-4.jpg"
//   ];

//   const styles = {
//     container: {
//       backgroundColor: '#F8F9FA',
//       minHeight: '100vh',
//       padding: '30px 0',
//     },
//     breadcrumb: {
//       marginBottom: '20px',
//     },
//     breadcrumbItem: {
//       color: '#6c757d',
//       textDecoration: 'none',
//       cursor: 'pointer',
//     },
//     breadcrumbActive: {
//       color: '#FC8A06',
//       fontWeight: 'bold',
//     },
//     productCard: {
//       borderRadius: '12px',
//       overflow: 'hidden',
//       backgroundColor: '#fff',
//       boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
//       marginBottom: '30px',
//     },
//     mainImageContainer: {
//       height: '400px',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       overflow: 'hidden',
//       borderRadius: '8px',
//     },
//     mainImage: {
//       width: '100%',
//       height: '100%',
//       objectFit: 'contain',
//     },
//     thumbnailContainer: {
//       display: 'flex',
//       gap: '10px',
//       marginTop: '10px',
//     },
//     thumbnail: {
//       width: '60px',
//       height: '60px',
//       borderRadius: '4px',
//       cursor: 'pointer',
//       objectFit: 'cover',
//       border: '1px solid #dee2e6',
//     },
//     thumbnailActive: {
//       border: '2px solid #FC8A06',
//     },
//     productTitle: {
//       fontSize: '28px',
//       fontWeight: 'bold',
//       color: '#333',
//       marginBottom: '15px',
//     },
//     productPrice: {
//       fontSize: '24px',
//       color: '#FC8A06',
//       fontWeight: 'bold',
//       marginBottom: '20px',
//     },
//     quantityControl: {
//       display: 'flex',
//       alignItems: 'center',
//       marginBottom: '25px',
//     },
//     quantityBtn: {
//       width: '36px',
//       height: '36px',
//       border: '1px solid #dee2e6',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#f8f9fa',
//       cursor: 'pointer',
//       userSelect: 'none',
//     },
//     quantityInput: {
//       width: '50px',
//       height: '36px',
//       border: '1px solid #dee2e6',
//       textAlign: 'center',
//       marginLeft: '-1px',
//       marginRight: '-1px',
//     },
//     cartBtn: {
//       backgroundColor: '#fff',
//       color: '#FC8A06',
//       border: '2px solid #FC8A06',
//       borderRadius: '4px',
//       padding: '10px 20px',
//       fontWeight: 'bold',
//       cursor: 'pointer',
//       marginRight: '10px',
//       transition: 'all 0.3s ease',
//     },
//     buyBtn: {
//       backgroundColor: '#FC8A06',
//       color: '#fff',
//       border: 'none',
//       borderRadius: '4px',
//       padding: '10px 20px',
//       fontWeight: 'bold',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//     },
//     productInfoSection: {
//       borderTop: '1px solid #dee2e6',
//       paddingTop: '20px',
//       marginTop: '20px',
//     },
//     infoLabel: {
//       fontWeight: 'bold',
//       color: '#6c757d',
//       marginBottom: '5px',
//     },
//     infoValue: {
//       marginBottom: '15px',
//     },
//     productDesc: {
//       fontSize: '16px',
//       lineHeight: '1.6',
//       color: '#6c757d',
//     },
//     sellerCard: {
//       backgroundColor: '#fff',
//       borderRadius: '12px',
//       padding: '20px',
//       boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
//     },
//     sellerName: {
//       display: 'flex',
//       alignItems: 'center',
//       marginBottom: '15px',
//     },
//     sellerAvatar: {
//       width: '40px',
//       height: '40px',
//       borderRadius: '50%',
//       marginRight: '10px',
//       objectFit: 'cover',
//     },
//     sellerInfo: {
//       flex: 1,
//     },
//     sellerTitle: {
//       fontSize: '16px',
//       fontWeight: 'bold',
//       margin: 0,
//     },
//     sellerRating: {
//       display: 'flex',
//       alignItems: 'center',
//       fontSize: '14px',
//     },
//     sellerButton: {
//       width: '100%',
//       padding: '10px',
//       border: '1px solid #dee2e6',
//       backgroundColor: '#f8f9fa',
//       borderRadius: '4px',
//       marginTop: '10px',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//     },
//     loadingContainer: {
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       height: '300px',
//     },
//   };

//   if (loading) {
//     return (
//       <div style={styles.container}>
//         <div className="container">
//           <div style={styles.loadingContainer}>
//             <div className="spinner-border text-success" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !barang) {
//     return (
//       <div style={styles.container}>
//         <div className="container">
//           <div className="alert alert-danger mt-4" role="alert">
//             {error || "Product not found"}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       <div className="container">
//         {/* Breadcrumb Navigation */}
//         <nav style={styles.breadcrumb}>
//           <ol className="breadcrumb">
//             <li className="breadcrumb-item">
//               <span style={styles.breadcrumbItem} onClick={() => navigate('/')}>Home</span>
//             </li>
//             <li className="breadcrumb-item">
//               <span style={styles.breadcrumbItem} onClick={() => navigate(`/kategori/${barang.kategori_barang}`)}>
//                 {barang.kategori_barang}
//               </span>
//             </li>
//             <li className="breadcrumb-item active" aria-current="page">
//               <span style={styles.breadcrumbActive}>{barang.nama}</span>
//             </li>
//           </ol>
//         </nav>

//         <div className="row">
//           {/* Product Images Section */}
//           <div className="col-md-6">
//             <div style={styles.productCard}>
//               <div className="p-3">
//                 <div style={styles.mainImageContainer}>
//                   <img 
//                     src={productImages[selectedImage]} 
//                     alt={barang.nama} 
//                     style={styles.mainImage} 
//                   />
//                 </div>
//                 <div style={styles.thumbnailContainer}>
//                   {productImages.map((img, index) => (
//                     <img
//                       key={index}
//                       src={img}
//                       alt={`${barang.nama} thumbnail ${index + 1}`}
//                       style={{
//                         ...styles.thumbnail,
//                         ...(selectedImage === index ? styles.thumbnailActive : {})
//                       }}
//                       onClick={() => setSelectedImage(index)}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Product Info Section */}
//           <div className="col-md-6">
//             <div style={styles.productCard}>
//               <div className="p-4">
//                 <h1 style={styles.productTitle}>{barang.nama}</h1>
//                 <p style={styles.productPrice}>{formatPrice(barang.harga)}</p>
                
//                 <div style={styles.quantityControl}>
//                   <div 
//                     style={styles.quantityBtn}
//                     onClick={() => quantity > 1 && setQuantity(quantity - 1)}
//                   >-</div>
//                   <input 
//                     type="text" 
//                     value={quantity}
//                     readOnly
//                     style={styles.quantityInput}
//                   />
//                   <div 
//                     style={styles.quantityBtn}
//                     onClick={() => setQuantity(quantity + 1)}
//                   >+</div>
//                 </div>
                
//                 <div className="d-flex mb-4">
//                   <button 
//                     style={styles.cartBtn}
//                     onClick={handleAddToCart}
//                     className="d-flex align-items-center justify-content-center"
//                   >
//                     <FaShoppingCart className="me-2" /> Keranjang
//                   </button>
//                   <button 
//                     style={styles.buyBtn}
//                     onClick={handleBuyNow}
//                     className="flex-grow-1 d-flex align-items-center justify-content-center"
//                   >
//                     Checkout!
//                   </button>
//                 </div>

//                 <div style={styles.productInfoSection}>
//                   <p style={styles.productDesc}>{barang.deskripsi}</p>
                  
//                   <div className="row mt-4">
//                     <div className="col-6">
//                       <p style={styles.infoLabel}>Kategori:</p>
//                       <p style={styles.infoValue}>{barang.kategori_barang}</p>
//                     </div>
//                     <div className="col-6">
//                       <p style={styles.infoLabel}>Berat:</p>
//                       <p style={styles.infoValue}>{barang.berat} gram</p>
//                     </div>
//                     <div className="col-6">
//                       <p style={styles.infoLabel}>Status QC:</p>
//                       <p style={styles.infoValue}>{barang.status_qc}</p>
//                     </div>
//                     <div className="col-6">
//                       <p style={styles.infoLabel}>Garansi:</p>
//                       <p style={styles.infoValue}>
//                         {barang.garansi_berlaku 
//                           ? `Berlaku hingga ${new Date(barang.tanggal_garansi).toLocaleDateString()}` 
//                           : 'Tidak berlaku'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Seller Info */}
//         <div className="row mt-4">
//           <div className="col-md-6">
//             <div style={styles.sellerCard}>
//               <div style={styles.sellerName}>
//                 <img 
//                   src={penitip?.foto_ktp || "../src/assets/images/default-avatar.jpg"} 
//                   alt={penitip?.nama_penitip || "Penitip"} 
//                   style={styles.sellerAvatar} 
//                 />
//                 <div style={styles.sellerInfo}>
//                   <h5 style={styles.sellerTitle}>{penitip?.nama_penitip || "Nama Penitip"}</h5>
//                   <div style={styles.sellerRating}>
//                     {penitip?.rating && renderRatingStars(penitip.rating)}
//                     <span className="ms-1">({penitip?.rating || "4.9"})</span>
//                   </div>
//                 </div>
//               </div>
//               <button style={styles.sellerButton}>Lihat Toko</button>
//             </div>
//           </div>
//         </div>

//         {/* Review Section */}
//         <div className="row mt-4">
//           <div className="col-12">
//             <div style={styles.productCard}>
//               <div className="p-4">
//                 <h4 className="mb-4">Review</h4>
//                 <div className="row">
//                   <div className="col-md-2">
//                     <img 
//                       src="../src/assets/images/default-avatar.jpg" 
//                       alt="User" 
//                       className="rounded-circle" 
//                       width="50" 
//                       height="50" 
//                     />
//                   </div>
//                   <div className="col-md-10">
//                     <div className="d-flex align-items-center mb-2">
//                       <h5 className="mb-0 me-2">Si Gix</h5>
//                       <div className="text-warning d-flex">
//                         <FaStar />
//                         <FaStar />
//                         <FaStar />
//                         <FaStar />
//                         <FaStar />
//                       </div>
//                     </div>
//                     <p className="text-muted small">24th September 2023</p>
//                     <p>The positive aspect was undoubtedly the efficiency of the service. The queue moved quickly, the staff was friendly, and the food lived up to the usual McDonald's standard! - Not one sad fry.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DetailBarang;