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
    fontWeight: '500',
    fontSize: '1.1rem',
    marginTop: '10px',
  },
};

const HistoryTransaksi = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Fetch pembeli name
  const getPembeliName = async (idPembeli) => {
    try {
      const response = await fetch(`http://localhost:3000/api/pembeli/${idPembeli}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log(`Pembeli data for ${idPembeli}:`, data); // Debug log
      return data.pembeli?.nama || 'Unknown Pembeli';
    } catch (error) {
      console.error(`Error fetching pembeli name for ${idPembeli}:`, error);
      return 'Unknown Pembeli';
    }
  };

  // Fetch alamat details
  const getAlamatDetails = async (idAlamat) => {
    try {
      const response = await fetch(`http://localhost:3000/api/alamat-pembeli/${idAlamat}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log(`Alamat data for ${idAlamat}:`, data); // Debug log
      return data.alamat?.alamat_lengkap || 'Unknown Alamat';
    } catch (error) {
      console.error(`Error fetching alamat for ${idAlamat}:`, error);
      return 'Unknown Alamat';
    }
  };

  // Fetch penitip name
  const getPenitipName = async (idPenitip) => {
    try {
      const response = await fetch(`http://localhost:3000/api/penitip/${idPenitip}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log(`Penitip data for ${idPenitip}:`, data); // Debug log
      return data.nama_penitip || 'Unknown Penitip';
    } catch (error) {
      console.error(`Error fetching penitip name for ${idPenitip}:`, error);
      return 'Unknown Penitip';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const subPembelianData = await apiSubPembelian.getAllSubPembelian();
        console.log('SubPembelian Data:', subPembelianData); // Debug log

        const transformedData = await Promise.all(
          subPembelianData.map(async (transaction) => {
            const pembeliName = await getPembeliName(transaction.id_pembeli);
            const alamatDetails = await getAlamatDetails(transaction.id_alamat);
            const barangWithPenitip = await Promise.all(
              (transaction.barang || []).map(async (item) => ({
                ...item,
                penitipName: await getPenitipName(item.id_penitip),
              }))
            );
            return {
              ...transaction,
              nama_pembeli: pembeliName,
              alamat_pembeli: alamatDetails,
              barang: barangWithPenitip,
            };
          })
        );
        console.log('Transformed Data:', transformedData); // Debug log
        setTransactions(transformedData);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTransactions = transactions.map((transaction) => ({
    ...transaction,
    barang: Array.isArray(transaction.barang) ? transaction.barang : [],
  })).filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      (transaction.id_pembelian && transaction.id_pembelian.toLowerCase().includes(query)) ||
      (transaction.status_pembelian && transaction.status_pembelian.toLowerCase().includes(query)) ||
      (transaction.barang && transaction.barang.some(
        (item) =>
          (item.nama && item.nama.toLowerCase().includes(query)) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(query)) ||
          (item.penitipName && item.penitipName.toLowerCase().includes(query))
      ))
    );
  });

  return (
    <div style={styles.container}>
      {loading && <p>Loading transactions...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
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
                    <p
                      style={{
                        margin: '2px 0',
                        color:
                          transaction.status_pembelian === 'Pembayaran valid'
                            ? 'green'
                            : transaction.status_pembelian === 'Menunggu pembayaran' ||
                              transaction.status_pembelian === 'Menunggu verifikasi pembayaran'
                            ? '#ff9800' // Yellow/Orange
                            : 'red',
                      }}
                    >
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                          <div>
                            <h6 style={{ fontWeight: 'bold' }}>
                              {item.nama || 'No Name'}
                            </h6>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{item.deskripsi || 'No Description'}</p>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Penjual: {item.penitipName || 'N/A'}</p>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', marginLeft: '10px' , marginRight: '25px'}}>
                            Rp {item.harga ? parseFloat(item.harga).toLocaleString('id-ID') : '0'}
                          </p>
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
                      onClick={() => {
                        setSelectedTransaction(transaction); // Use the already fetched data
                        setShowModal(true);
                      }}
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showModal && selectedTransaction && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '10px',
                width: '80%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              }}>
                <h3>Detail Pengiriman</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <p><strong>id_pembelian:</strong> {selectedTransaction.id_pembelian || 'N/A'}</p>
                    <p><strong>Total {selectedTransaction.barang.length} Produk:</strong> Rp {selectedTransaction.total_bayar ? parseFloat(selectedTransaction.total_bayar).toLocaleString('id-ID') : '0'}</p>
                    <p>
                      <strong>Status Pembelian:</strong>{' '}
                      <span
                        style={{
                          color:
                            selectedTransaction.status_pembelian === 'Pembayaran valid'
                              ? 'green'
                              : selectedTransaction.status_pembelian === 'Menunggu verifikasi pembayaran'
                              ? '#ff9800' // Kuning/keorenan
                              : 'red',
                        }}
                      >
                        {selectedTransaction.status_pembelian || 'N/A'}
                      </span>
                    </p>
                    <p>Pembeli: {selectedTransaction.nama_pembeli || 'N/A'}</p>
                    <p>Alamat: {selectedTransaction.alamat_pembeli || 'N/A'}</p>
                    <p>Tanggal Pembelian: {selectedTransaction.tanggal_pembelian ? formatDate(selectedTransaction.tanggal_pembelian) : 'N/A'}</p>
                    <p>Tanggal Pelunasan: {selectedTransaction.tanggal_pelunasan ? formatDate(selectedTransaction.tanggal_pelunasan) : 'N/A'}</p>
                    <p>Point Diperoleh: {selectedTransaction.poin_diperoleh || '0'}</p>
                  </div>
                  <div style={{ flex: 3 }}>
                    <p><strong>Jenis Pengiriman:</strong> {selectedTransaction.pengiriman?.jenis_pengiriman || 'N/A'}</p>
                    <p>
                      <strong>Status Pengiriman:</strong>{' '}
                      <span
                        style={{
                          color:
                            selectedTransaction.pengiriman?.status_pengiriman === 'Selesai'
                              ? 'green'
                              : selectedTransaction.pengiriman?.status_pengiriman === 'Menunggu hasil pembayaran' || 'Dalam pengiriman' 
                              ? '#ff9800' // Kuning/keorenan
                              : 'red',
                        }}
                      >
                        {selectedTransaction.pengiriman?.status_pengiriman || 'N/A'}
                      </span>
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                      <span>Dikemas <br /> {selectedTransaction.tanggal_pelunasan ? formatDate(selectedTransaction.tanggal_pelunasan) : 'N/A'}</span>
                      <span>Pengiriman <br /> {selectedTransaction.pengiriman?.tanggal_mulai ? formatDate(selectedTransaction.pengiriman.tanggal_mulai) : 'N/A'}</span>
                      <span>Sampai <br /> {selectedTransaction.pengiriman?.tanggal_berakhir ? formatDate(selectedTransaction.pengiriman.tanggal_berakhir) : 'N/A'}</span>
                    </div>
                    {selectedTransaction.barang.map((item, index) => (
                      <div key={index} style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={`http://localhost:3000/uploads/barang/${item.gambar?.split(',')[0] || 'default.jpg'}`}
                            alt={item.nama || 'No Name'}
                            style={styles.cardImage}
                            onError={(e) => { e.target.src = 'default.jpg'; }}
                          />
                          <div>
                            <p style={{ lineHeight: '1.2', margin: '2px 0' }}><strong>{item.nama || 'N/A'} | Rp {item.harga ? parseFloat(item.harga).toLocaleString('id-ID') : '0'}</strong></p>
                            <p style={{ lineHeight: '1.2', margin: '2px 0' }}>{item.deskripsi || 'N/A'}</p>
                            <p style={{ lineHeight: '1.2', margin: '2px 0' }}>Penjual: {item.penitipName || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  style={{ ...styles.buttonStyle, marginTop: '20px', backgroundColor: '#028643', color: 'white', width: '100%' }}
                  onClick={() => setShowModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryTransaksi;