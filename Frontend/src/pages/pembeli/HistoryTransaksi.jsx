import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Link } from "react-router-dom";
import TopNavigation from "../../components/navigation/TopNavigation";
import ToastNotification from "../../components/toast/ToastNotification";
import PaginationComponent from "../../components/pagination/Pagination";
import TransactionCard from "../../components/card/CardRiwayatTransaksi";
import DetailModal from "../../components/modal/DetailTransaksiModal";
import RatingModal from "../../components/modal/RatingModal";
import { decodeToken } from '../../utils/jwtUtils';
import { apiPembeli } from "../../clients/PembeliService";
import { apiSubPembelian } from "../../clients/SubPembelianService";
import { apiAlamatPembeli } from "../../clients/AlamatPembeliServices";
import { GetPenitipById } from "../../clients/PenitipService";
import { apiPembelian } from "../../clients/PembelianService";
import { GetAllTransaksi } from "../../clients/TransaksiService";
import { CreateReviewProduk, GetReviewProdukByIdTransaksi, UpdateReviewProduk, GetReviewProdukByIdBarang } from "../../clients/ReviewService";
import { toast } from "sonner";

const HistoryTransaksiPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [pembeli, setPembeli] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (pembeli) {
      fetchTransactionData();
    }
  }, [pembeli]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token tidak ditemukan");
      
      const decoded = decodeToken(token);
      if (!decoded?.id) throw new Error("Invalid token structure");
      
      const dataPembeli = await apiPembeli.getPembeliByIdAkun(decoded.id);
      setPembeli(dataPembeli);
    } catch (err) {
      setError("Gagal memuat data user!");
      showNotification("Gagal memuat data user!", 'danger');
      console.error("Error:", err);
    }
  };

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const getPembeliName = async (idPembeli) => {
    try {
      const response = await apiPembeli.getPembeliById(idPembeli);
      return response.pembeli?.nama || 'Unknown Pembeli';
    } catch (error) {
      console.error(`Error fetching pembeli name for ${idPembeli}:`, error);
      return 'Unknown Pembeli';
    }
  };

  const getAlamatDetails = async (idAlamat) => {
    try {
      const response = await apiAlamatPembeli.getAlamatPembeliById(idAlamat);
      return response.alamat?.alamat_lengkap || 'Unknown Alamat';
    } catch (error) {
      console.error(`Error fetching alamat for ${idAlamat}:`, error);
      return 'Unknown Alamat';
    }
  };

  const getPenitipName = async (idPenitip) => {
    try {
      const response = await GetPenitipById(idPenitip);
      return response.nama_penitip || 'Unknown Penitip';
    } catch (error) {
      console.error(`Error fetching penitip name for ${idPenitip}:`, error);
      return 'Unknown Penitip';
    }
  };

  const getTransaksiId = async (idSubPembelian) => {
    try {
      const allTransaksi = await GetAllTransaksi();
      const transaksi = allTransaksi.data?.find(t => t.id_sub_pembelian === idSubPembelian);
      return transaksi?.id_transaksi || null;
    } catch (error) {
      console.error(`Error fetching transaksi for sub pembelian ${idSubPembelian}:`, error);
      return null;
    }
  };

  const checkExistingReview = async (idTransaksi) => {
    if (!idTransaksi) return null;
    try {
      const response = await GetReviewProdukByIdTransaksi(idTransaksi);
      console.log(`Review check for transaction ${idTransaksi}:`, response);
      
      if (response.data.success) {
        const reviewData = response.data.data[0];
        console.log('review data tes: ', reviewData);
        // Pastikan review memiliki data yang valid
        if (reviewData.id_review && reviewData.rating) {
          return reviewData;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error checking existing review for transaction ${idTransaksi}:`, error);
      return null;
    }
  };

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      console.log('Fetching transaction data for pembeli:', pembeli.id_pembeli);
      
      const subPembelianData = await apiSubPembelian.getSubPembelianByPembeliId(pembeli.id_pembeli);
      console.log('SubPembelian Data:', subPembelianData);

      if (!Array.isArray(subPembelianData)) {
        throw new Error('Invalid response data');
      }

      const transformedData = await Promise.all(
        subPembelianData.map(async (transaction) => {
          const pembeliName = await getPembeliName(transaction.pembelian.id_pembeli);
          const alamatDetails = await getAlamatDetails(transaction.pembelian.id_alamat);
          const transaksiId = await getTransaksiId(transaction.barang?.[0]?.transaksi?.id_sub_pembelian);
          console.log("Transaksi ID buat raing: ", transaksiId);
          let existingReview = null;
          if (transaksiId) {
            existingReview = await checkExistingReview(transaksiId);
            console.log(`Transaction ${transaksiId} existing review:`, existingReview);
          }

          const barangWithPenitip = await Promise.all(
            (transaction.barang || []).map(async (item) => {
              return {
                ...item,
                penitipName: await getPenitipName(item.id_penitip),
              };
            })
          );

          return {
            ...transaction,
            nama_pembeli: pembeliName,
            alamat_pembeli: alamatDetails,
            barang: barangWithPenitip,
            id_transaksi: transaksiId,
            existing_review: existingReview,
          };
        })
      );
      
      console.log('Final transformed data:', transformedData);
      setTransactions(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setError('Failed to load transaction data. Please try again.');
      showNotification('Failed to load transaction data. Please try again.', 'danger');
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(item => {
        const query = searchTerm.toLowerCase();
        return (
          (item.pembelian?.id_pembelian && item.pembelian.id_pembelian.toLowerCase().includes(query)) ||
          (item.barang && item.barang.some(barang => 
            barang.nama && barang.nama.toLowerCase().includes(query)
          ))
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(item => 
        item.pembelian?.status_pembelian === statusFilter
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (transaction) => {
    setCurrentTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleRatingClick = (transaction, isEdit = false) => {
    setCurrentTransaction(transaction);
    setIsEditingReview(isEdit);
    if (transaction.existing_review) {
      console.log(transaction);
      setRating(transaction.existing_review.rating);
    } else {
      setRating(0);
    }
    setReview('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!currentTransaction || !currentTransaction.id_transaksi) {
      showNotification('Data transaksi tidak valid!', 'danger');
      return;
    }

    if (rating === 0) {
      showNotification('Silakan pilih rating terlebih dahulu!', 'warning');
      return;
    }

    try {
      setSubmittingRating(true);
      
      const reviewData = {
        id_transaksi: currentTransaction.id_transaksi,
        rating: rating
      };

      let response;
      if (isEditingReview && currentTransaction.existing_review) {
        response = await UpdateReviewProduk(currentTransaction.existing_review.id_review, { rating });
        console.log(response);
        showNotification(`Rating berhasil diperbarui menjadi ${rating} bintang!`, 'success');
      } else {
        response = await CreateReviewProduk(reviewData);
        showNotification(response.message || `Rating ${rating} bintang berhasil diberikan!`, 'success');
      }
      
      setShowRatingModal(false);
      await fetchTransactionData();
      const penitipId = currentTransaction.barang?.[0]?.id_penitip;
      if (penitipId) {
        const updatedPenitip = await GetPenitipById(penitipId);
        console.log('Updated penitip:', updatedPenitip);
        // Update transactions state with new penitip rating
        setTransactions(prevTransactions =>
          prevTransactions.map(t =>
            t.id_transaksi === currentTransaction.id_transaksi
              ? {
                  ...t,
                  barang: t.barang.map(b =>
                    b.id_penitip === penitipId ? { ...b, penitipRating: updatedPenitip.rating } : b
                  )
                }
              : t
          )
        );
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response?.data?.message) {
        showNotification(error.response.data.message, 'danger');
      } else if (error.response?.status === 400) {
        showNotification('Terjadi kesalahan saat memberikan rating', 'warning');
      } else {
        showNotification('Gagal memberikan rating. Silakan coba lagi.', 'danger');
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  const checkExistingReviewByBarang = async (idBarang) => {
    if (!idBarang) return null;
    try {
      const response = await GetReviewProdukByIdBarang();
      const reviews = await response.json();
      return reviews && reviews.length > 0 ? reviews[0] : null;
    } catch (error) {
      console.error(`Error checking existing review for barang ${idBarang}:`, error);
      return null;
    }
  };

  const generateNotaNumber = (transaction) => {
    const date = new Date(transaction.pembelian?.tanggal_pembelian);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const idPembelian = transaction.pembelian?.id_pembelian?.match(/\d+/)?.[0] || '0';
    return `${year}.${month}.${idPembelian}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return 'danger';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('selesai') || lowerStatus.includes('valid')) {
      return 'success';
    } else if (lowerStatus.includes('proses') || lowerStatus.includes('tidak valid')) {
      return 'warning';
    } else if(lowerStatus.includes('menunggu verifikasi pembayaran')) {
      return 'primary';
    } else {
      return 'danger';
    }
  };

  const canBeRated = (transaction) => {
    const hasTransaksiId = transaction.id_transaksi;
    const isEligibleForRating = transaction.pembelian?.status_pembelian?.toLowerCase().includes('valid') || 
                              transaction.pembelian?.status_pembelian?.toLowerCase().includes('selesai') ||
                              transaction.pengiriman?.status_pengiriman?.toLowerCase().includes('selesai');
    return hasTransaksiId && isEligibleForRating;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const uniqueStatuses = [...new Set(transactions.map(t => t.pembelian?.status_pembelian).filter(Boolean))];

  return (
    <Container fluid className="p-0 bg-white">
      <TopNavigation />
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
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Riwayat Transaksi</h2>
            <p className="text-muted mt-1">Daftar semua transaksi pembelian Anda</p>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div className="position-relative search-container">
                  <i className="bi bi-search search-icon"></i>
                  <Form.Control
                    type="search"
                    placeholder="Cari ID transaksi, nama barang..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
                
                <Form.Select 
                  value={statusFilter} 
                  onChange={handleStatusFilterChange}
                  className="status-filter"
                >
                  <option value="">Semua Status</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: '#028643' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Memuat data transaksi...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-receipt" style={{ fontSize: '3rem', color: '#D9D9D9' }}></i>
                <p className="mt-3 text-muted">Belum ada transaksi yang ditemukan</p>
              </div>
            ) : (
              <>
                {currentItems.map((transaction) => (
                  <TransactionCard 
                    key={transaction.pembelian.id_pembelian}
                    transaction={transaction}
                    handleViewDetails={handleViewDetails}
                    handleRatingClick={handleRatingClick}
                    generateNotaNumber={generateNotaNumber}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    getStatusBadgeColor={getStatusBadgeColor}
                    canBeRated={canBeRated}
                  />
                ))}
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

      <DetailModal 
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        currentTransaction={currentTransaction}
        generateNotaNumber={generateNotaNumber}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        getStatusBadgeColor={getStatusBadgeColor}
      />

      <RatingModal 
        show={showRatingModal}
        onHide={() => setShowRatingModal(false)}
        currentTransaction={currentTransaction}
        rating={rating}
        setRating={setRating}
        submittingRating={submittingRating}
        handleSubmitRating={handleSubmitRating}
        formatCurrency={formatCurrency}
      />

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        .transaction-card {
          border-radius: 8px;
          border-color: #E7E7E7;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        .transaction-card:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .transaction-id {
          color: #686868;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .transaction-total {
          color: #4A4A4A;
          font-size: 1.1rem;
        }
        .action-btn {
          border-radius: 4px;
          font-weight: 500;
        }
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
        .status-filter {
          width: 200px;
          height: 45px;
          border-radius: 25px;
          border: 1px solid #E7E7E7;
        }
        .status-filter:focus {
          box-shadow: none;
          border-color: #028643;
        }
        @media (max-width: 768px) {
          .search-container {
            width: 100%;
          }
          .status-filter {
            width: 100%;
          }
        }
      `}</style>
    </Container>
  );
};

export default HistoryTransaksiPage;