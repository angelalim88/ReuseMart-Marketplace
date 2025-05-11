import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { apiSubPembelian } from '../../clients/SubPembelianService';

const styles = {
  container: {
    backgroundColor: '',
    minHeight: '100vh',
    paddingTop: '2%',
    paddingLeft: '8%',
    paddingRight: '8%',
  },
  card: {
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
    padding: '15px',
  },
  cardImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '15px',
  },
  searchContainerStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: "2% 0% 2% 0%",
  },
  searchIconStyle: {
    transform: 'translateY(-10%)',
    transform: 'translateX(200%)',
    color: '#D9D9D9',
  },
  searchInputStyle: {
    padding: '10px 15px 10px 40px',
    borderRadius: '25px',
    border: '1px solid #D9D9D9',
    width: '100%',
    marginRight: '2%',
    backgroundColor: '#F8F9FA',
  },
  buttonStyle: {
    padding: '10px 20px',
    backgroundColor: '#028643',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    display: 'inline-block', 
    alignItems: 'center',
    gap: '5px',
  },
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#028643',
    border: '1px solid #028643',
    borderRadius: '50px',
    cursor: 'pointer',
    display: 'inline-block', 
    marginLeft: '10px'
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    marginTop: '10px',
  },
};

const HistoryTransaksi = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subPembelianData = await apiSubPembelian.getAllSubPembelian();
        // Transform data to ensure single array of transactions
        const transformedData = subPembelianData.length > 0 ? subPembelianData : [];
        setTransactions(transformedData);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTransactions = transactions.map((transaction) => ({
  ...transaction,
  barang: Array.isArray(transaction.barang) ? transaction.barang : []
  })).filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      (transaction.id_pembelian && transaction.id_pembelian.toLowerCase().includes(query)) ||
      (transaction.status_pembelian && transaction.status_pembelian.toLowerCase().includes(query)) ||
      (transaction.barang && transaction.barang.some(
        (item) =>
          (item.nama && item.nama.toLowerCase().includes(query)) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(query))
      ))
    );
  });

  return (
    <div style={styles.container}>
      <div className="col mb-5">
        <div style={styles.searchContainerStyle}>
          <FaSearch style={styles.searchIconStyle} />
          <input
            type="text"
            placeholder="Cari Transaksi (ID, Status, Nama Barang)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInputStyle}
          />
        </div>
      </div>

      <div className="row">
        {filteredTransactions.map((transaction) => (
          <div key={transaction.id_pembelian} className="card" style={styles.card}>
            <div className="d-flex flex-row align-items-center">
              <div className="flex-grow-1">
                <p style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 'bold' }}>
                  {transaction.id_pembelian || 'N/A'}
                </p>
                <p style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#6c757d' }}>
                  {transaction.tanggal_pembelian ? formatDate(transaction.tanggal_pembelian) : 'N/A'}
                </p>
                <p style={{ margin: '2px 0', color: transaction.status_pembelian === 'Pembayaran valid' ? 'green' : 'red' }}>
                  {transaction.status_pembelian || 'N/A'}
                </p>
              </div>
            </div>

            {expanded[transaction.id_pembelian] && transaction.barang && (
              <div className="mt-3">
                {transaction.barang.map((item, index) => (
                  <div key={index} className="d-flex flex-row align-items-center mt-2">
                    <img
                      src={`http://localhost:3000/uploads/barang/${item.gambar?.split(',')[0] || 'default.jpg'}`}
                      alt={item.nama || 'No Name'}
                      style={styles.cardImage}
                      onError={(e) => { e.target.src = 'default.jpg'; }}
                    />
                    <div>
                      <h6 style={{ fontWeight: 'bold' }}>{item.nama || 'No Name'}</h6>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{item.deskripsi || 'No Description'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mt-3">
              <p style={styles.totalText}>
                Total {transaction.barang?.length || 0} Produk: Rp {transaction.total_bayar ? parseFloat(transaction.total_bayar).toLocaleString('id-ID') : '0'}
              </p>
              <div>
                <button
                  style={styles.buttonStyle} 
                  onClick={() => toggleExpand(transaction.id_pembelian)}
                >
                  {expanded[transaction.id_pembelian] ? (
                    <>
                      Tutup <i class="fa-solid fa-chevron-up"></i>
                    </>
                  ) : (
                    <>
                      Lihat <i class="fa-solid fa-chevron-down"></i>
                    </>
                  )}
                </button>
                {transaction.status_pembelian === 'Pembayaran valid' && (
                  <button
                    style={styles.buttonSecondary}
                    onClick={() => alert('Fitur ulas belum diimplementasikan')}
                  >
                    Ulas
                  </button>
                )}
                <button
                  style={{ ...styles.buttonStyle, marginLeft: '10px' }}
                  onClick={() => alert('Detail transaksi belum diimplementasikan')}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTransaksi;