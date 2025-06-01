import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CardProduk from '../components/card/CardProduk';
import { GetAllBarang } from "../clients/BarangService";
import { FaFilter, FaSearch, FaSortAmountDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSearch } from '../utils/searchContext';
import PaginationComponent from "../components/pagination/Pagination";

const ListProdukPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = useParams();
  const { searchQuery } = useSearch();
  
  const [barangList, setBarangList] = useState([]);
  const [filteredBarangList, setFilteredBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState('default');
  const [filterCategory, setFilterCategory] = useState(category || 'all');
  const [showFilters, setShowFilters] = useState(false);
  
  const productsPerPage = 24;
  const pageTitle = location.state?.title || "Semua Produk";
  const isFromSearch = location.state?.fromSearch || false;
  
  // Categories list
  const categories = [
    { id: 'all', name: 'Semua Kategori' },
    { id: 'Elektronik & Gadget', name: 'Elektronik & Gadget' },
    { id: 'Pakaian & Aksesoris', name: 'Pakaian & Aksesoris' },
    { id: 'Perabot Rumah Tangga', name: 'Perabot Rumah Tangga' },
    { id: 'Buku, Alat Tulis, & Peralatan Sekolah', name: 'Buku, Alat Tulis, & Peralatan Sekolah' },
    { id: 'Hobi, Mainan, & Koleksi', name: 'Hobi, Mainan, & Koleksi' },
    { id: 'Perlengkapan Bayi & Anak', name: 'Perlengkapan Bayi & Anak' },
    { id: 'Otomotif & Aksesori', name: 'Otomotif & Aksesori' },
    { id: 'Perlengkapan Taman & Outdoor', name: 'Perlengkapan Taman & Outdoor' },
    { id: 'Peralatan Kantor & Industri', name: 'Peralatan Kantor & Industri' },
    { id: 'Kosmetik & Perawatan diri', name: 'Kosmetik & Perawatan diri' },
  ];

  // Price range filter options
  const priceRanges = [
    { id: 'all', name: 'Semua Harga' },
    { id: 'under100k', name: 'Di bawah Rp 100.000' },
    { id: '100k-500k', name: 'Rp 100.000 - Rp 500.000' },
    { id: '500k-1m', name: 'Rp 500.000 - Rp 1.000.000' },
    { id: 'above1m', name: 'Di atas Rp 1.000.000' }
  ];

  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  // Fetch semua barang
  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const response = await GetAllBarang();
        const filteredBarang = response.data.filter(item => item.status_qc !== "Tidak lulus");
        setBarangList(filteredBarang);
        setFilteredBarangList(filteredBarang);
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat produk");
        setLoading(false);
      }
    };
    
    fetchBarang();
  }, []);

  // Apply all filters and sort
  useEffect(() => {
    let filtered = [...barangList];
    
    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.nama.toLowerCase().includes(lowercaseQuery) || 
        (item.deskripsi && item.deskripsi.toLowerCase().includes(lowercaseQuery)) ||
        (item.kategori && item.kategori.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => {
        if (!item.kategori) return false;
        return item.kategori.toLowerCase().includes(filterCategory.toLowerCase());
      });
    }
    
    // Apply price range filter
    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(item => {
        const price = parseFloat(item.harga);
        switch (selectedPriceRange) {
          case 'under100k':
            return price < 100000;
          case '100k-500k':
            return price >= 100000 && price <= 500000;
          case '500k-1m':
            return price > 500000 && price <= 1000000;
          case 'above1m':
            return price > 1000000;
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    if (sortType === 'priceLowToHigh') {
      filtered.sort((a, b) => parseFloat(a.harga) - parseFloat(b.harga));
    } else if (sortType === 'priceHighToLow') {
      filtered.sort((a, b) => parseFloat(b.harga) - parseFloat(a.harga));
    } else if (sortType === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    setFilteredBarangList(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [barangList, searchQuery, filterCategory, sortType, selectedPriceRange]);

  // Get current page products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredBarangList.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredBarangList.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Styling konsisten dengan HomePage
  const styles = {
    container: {
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      paddingTop: '30px',
      paddingBottom: '50px',
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
      paddingBottom: '15px',
      borderBottom: '1px solid #dee2e6',
    },
    pageTitle: {
      fontWeight: 'bold',
      fontSize: '28px',
      color: '#03081F',
      margin: 0,
    },
    filterBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: '15px 20px',
      borderRadius: '10px',
      marginBottom: '25px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    filterButton: {
      backgroundColor: '#028643',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 15px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500',
      cursor: 'pointer',
    },
    sortDropdown: {
      padding: '8px 15px',
      borderRadius: '8px',
      border: '1px solid #dee2e6',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    filtersContainer: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '25px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    filterGroup: {
      marginBottom: '15px',
    },
    filterTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#03081F',
    },
    filterOptions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
    },
    filterOption: {
      padding: '6px 12px',
      borderRadius: '20px',
      border: '1px solid #dee2e6',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease',
    },
    filterOptionActive: {
      backgroundColor: '#FC8A06',
      color: 'white',
      border: '1px solid #FC8A06',
    },
    productColumn: {
      marginBottom: '25px',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '20px',
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '30px',
    },
    paginationItem: {
      margin: '0 5px',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      cursor: 'pointer',
      border: '1px solid #dee2e6',
      backgroundColor: 'white',
      transition: 'all 0.2s ease',
    },
    paginationItemActive: {
      backgroundColor: '#028643',
      color: 'white',
      border: '1px solid #028643',
    },
    pageIndicator: {
      margin: '0 15px',
      display: 'flex',
      alignItems: 'center',
    },
    resultsCount: {
      backgroundColor: '#f1f1f1',
      padding: '8px 15px',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#666',
      marginRight: '15px',
    },
    noResultsMessage: {
      textAlign: 'center',
      padding: '50px 0',
      color: '#6c757d',
    }
  };

  // If-Loading
  if (loading) {
    return (
      <div style={styles.container}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If-error -> tampil ini
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

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return (
      <div style={styles.paginationContainer}>
        <button 
          style={styles.paginationItem} 
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
        
        {pageNumbers.map((number, index) => (
          number === '...' ? (
            <span key={`ellipsis-${index}`} style={{ margin: '0 5px' }}>...</span>
          ) : (
            <button
              key={number}
              onClick={() => paginate(number)}
              style={{
                ...styles.paginationItem,
                ...(currentPage === number ? styles.paginationItemActive : {})
              }}
            >
              {number}
            </button>
          )
        ))}
        
        <button 
          style={styles.paginationItem} 
          onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div className="container">
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>{pageTitle}</h1>
          <span style={styles.resultsCount}>
            {filteredBarangList.length} produk ditemukan
          </span>
        </div>
        
        {/* Filter & Sort Bar */}
        <div style={styles.filterBar}>
          <button 
            style={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filter
          </button>
          
          <div>
            <select 
              style={styles.sortDropdown}
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="default">Urutkan: Default</option>
              <option value="priceLowToHigh">Harga: Terendah ke Tertinggi</option>
              <option value="priceHighToLow">Harga: Tertinggi ke Terendah</option>
              <option value="newest">Terbaru</option>
            </select>
          </div>
        </div>
        
        {/* Filter Options */}
        {showFilters && (
          <div style={styles.filtersContainer}>
            {/* Category Filter */}
            <div style={styles.filterGroup}>
              <h5 style={styles.filterTitle}>Kategori</h5>
              <div style={styles.filterOptions}>
                {categories.map(cat => (
                  <div 
                    key={cat.id} 
                    style={{
                      ...styles.filterOption,
                      ...(filterCategory === cat.id ? styles.filterOptionActive : {})
                    }}
                    onClick={() => setFilterCategory(cat.id)}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div style={styles.filterGroup}>
              <h5 style={styles.filterTitle}>Rentang Harga</h5>
              <div style={styles.filterOptions}>
                {priceRanges.map(range => (
                  <div 
                    key={range.id} 
                    style={{
                      ...styles.filterOption,
                      ...(selectedPriceRange === range.id ? styles.filterOptionActive : {})
                    }}
                    onClick={() => setSelectedPriceRange(range.id)}
                  >
                    {range.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Product Grid */}
        {currentProducts.length > 0 ? (
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6">
            {currentProducts.map((product, index) => (
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
        ) : (
          <div style={styles.noResultsMessage}>
            <h4>Tidak ada produk yang ditemukan</h4>
            <p>Coba ubah filter atau kata kunci pencarian Anda</p>
          </div>
        )}
        
        {/* Logika buat Pagination */}
        {totalPages > 1 && (
            <PaginationComponent 
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
            />
        )}
      </div>
    </div>
  );
};

export default ListProdukPage;