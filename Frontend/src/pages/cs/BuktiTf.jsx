import { useEffect, useState } from 'react';
import Pagination from '../../components/pagination/Pagination';
import { GetPegawaiByAkunId } from '../../clients/PegawaiService';
import { toast } from 'sonner';
import { decodeToken } from '../../utils/jwtUtils';
import { apiPembelian } from '../../clients/PembelianService';
import BuktiBayarModal from '../../components/modal/BuktiBayarModal';
import VerifikasiBuktiBayarModal from '../../components/modal/VerifikasiBuktiBayarModal';
import { UpdatePengirimanStatus } from '../../clients/PengirimanService';
import { UpdatePenitipan } from '../../clients/PenitipanService';
import { generateNotaPenjualan } from "../../components/pdf/CetakNotaPenjualan";
import { apiPembeli } from '../../clients/PembeliService';
import { SendNotification } from '../../clients/NotificationServices';

const CekBuktiTf = () => {
  
  const [akun, setAkun] = useState(null);
  const [customerService, setCustomerService] = useState(null);
  const [selectedPembelian, setSelectedPembelian] = useState(null);
  const [pembelian, setPembelian] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortMethod, setSortMethod] = useState("id-descending");
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const itemsPerPage = 5;
  
  const extractIdNumber = (id) => {
    if (typeof id !== "string") return 0;
    const match = id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const filteredByCategory = pembelian.filter((pbl) => {
    if(selectedCategory == "Semua") {
      return pbl;
    } else {
      return pbl?.status_pembelian.toLowerCase().includes(selectedCategory.toLowerCase());
    } 
  });

  const filtered = filteredByCategory.filter((pbl) => {
    return pbl?.SubPembelians?.some(sb => 
      sb?.Barang?.nama.toLowerCase().includes(keyword.toLowerCase())
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortMethod) {
      case "id-ascending":
        return extractIdNumber(a.id_pembelian) - extractIdNumber(b.id_pembelian);
      case "id-descending":
        return extractIdNumber(b.id_pembelian) - extractIdNumber(a.id_pembelian);
      default:
        return [];
        break;
    }
  });

  const paginated = sorted.slice( (currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const fetchUserData = async () => {
    if(localStorage.getItem("authToken")){
        try {
          const token = localStorage.getItem("authToken");
          if (!token) throw new Error("Token tidak ditemukan");

          const decoded = decodeToken(token);
          setAkun(decoded);
          if (!decoded?.id) throw new Error("Invalid token structure");

          if(decoded.role == "Customer Service") {
            const dataCS = await GetPegawaiByAkunId(decoded?.id);
            setCustomerService(dataCS.data);
          } else {
            throw new Error("Role bukan customer service");
          }
        } catch (error) {
          toast.error("Gagal memuat data user!");
          console.error("Error:", err);
        }
      }
  }

  const formatMoney = (nominal) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(nominal));
    return formatted;
  }

  const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
  };

  const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
  };

  const fetchPembelian = async () => {
    const dataPembelian = await apiPembelian.getAllPembelian();
    console.log('data pembelian', dataPembelian);
    setPembelian(dataPembelian);
  }

  useEffect(() => {
    fetchUserData();
    fetchPembelian();
  }, []);

  const handleVerification = async (val) => {
    try {
      if(val) {
        const responsePembelian = await apiPembelian.updatePembelian(selectedPembelian?.id_pembelian, { status_pembelian: "Pembayaran valid", id_customer_service: customerService?.id_pegawai });
        if(responsePembelian) {
          const responsePengiriman = await UpdatePengirimanStatus(selectedPembelian?.Pengiriman?.id_pengiriman, { status_pengiriman: "Diproses", jenis_pengiriman: selectedPembelian?.Pengiriman?.jenis_pengiriman });
          if(responsePengiriman) {
            console.log(responsePengiriman);
            selectedPembelian?.SubPembelians.forEach(async (sb) => {
              await UpdatePenitipan(sb?.Barang?.Penitipan?.id_penitipan, { status_penitipan: "Terjual"});
              const notification = { 
                fcmToken: sb?.Barang?.Penitip?.Akun?.fcm_token, 
                title: "Barang terjual", 
                body: `Barang ${sb?.Barang?.nama} dengan id ${sb?.Barang?.id_barang} telah terjual!`
              }
              await SendNotification(notification);           
            });
          }
        }
      } else {
        const responsePembelian = await apiPembelian.updatePembelian(selectedPembelian?.id_pembelian, { status_pembelian: "Pembayaran tidak valid", id_customer_service: customerService?.id_pegawai });
        if(responsePembelian) {
          const responsePengiriman = await UpdatePengirimanStatus(selectedPembelian?.Pengiriman?.id_pengiriman, { status_pengiriman: "Tidak diproses", jenis_pengiriman: selectedPembelian?.Pengiriman?.jenis_pengiriman });
          if(responsePengiriman) {
            selectedPembelian?.SubPembelians.forEach(async (sb) => {
              await UpdatePenitipan(sb?.Barang?.Penitipan?.id_penitipan, { status_penitipan: "Dalam masa penitipan"});           
            });
            await apiPembeli.updatePembeli(selectedPembelian?.Pembeli?.id_pembeli, {total_poin: selectedPembelian?.Pembeli?.total_poin + ((selectedPembelian?.potongan_poin/10000)*100)});
          }
        }
      }
      toast.success("Berhasil melakukan verifikasi bukti bayar!");
    } catch (error) {
      console.error("Gagal melakukan verifikasi bukti bayar: ", error);
      toast.error("Gagal melakukan verifikasi bukti bayar!");
    } finally {
      await fetchPembelian();
    }
  }

  return (
    <div className="container-fluid mt-4 px-5" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9f9f9' }}>
      <style>
        {`
          .category-active {
            background-color:rgb(0, 145, 12);
            color: white;
            font-weight: 600;
          }
          .category-item {
            cursor: pointer;
            font-size: 0.95rem;
            padding: 10px 15px;
            border-radius: 6px;
            margin-bottom: 5px;
          }
          .product-card {
            border-radius: 12px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          .price-text {
            font-weight: 700;
            font-size: 1.25rem;
          }
        `}
      </style>

      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-3 order-lg-1 order-2">
          
          <div className="p-3" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <button className="btn w-100 text-start" onClick={() => setIsOpen(!isOpen)}>
              <h5 className="fw-bold" >
                {isOpen ? <i class="bi bi-x-lg me-2"></i> : <i className="bi bi-list me-2"></i>}Status Pembelian
              </h5>
            </button>
            <div style={{ height: `${isOpen ? "100%" : "0px" }`, overflow: "hidden"}}>
              {[
                "Semua",
                "Pembayaran valid",
                "Pembayaran tidak valid",
                "Tidak mengirimkan bukti pembayaran",
                "Menunggu pembayaran",
                "Menunggu verifikasi pembayaran"
              ].map((cat, index) => (
                <div
                  key={index}
                  className={`category-item ${selectedCategory === cat ? 'category-active' : ''}` }
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9 order-lg-2 order-3">
          <h4 className="fw-bold mb-4">Halaman Cek Bukti Transfer</h4>

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Ketik 'Kursi Estetik' ✨"
              style={{ maxWidth: '400px', borderRadius: '8px' }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div class="dropdown">
              <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Urutkan berdasarkan
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" onClick={() => setSortMethod('id-descending')}>Urut</a></li>
                <li><a class="dropdown-item" href="#" onClick={() => setSortMethod('id-ascending')}>Terbalik</a></li>
              </ul>
            </div>
          </div>
          {
            pembelian.length == 0 && <><p className="text-center fw-bold mt-5">Belum ada pembelian</p></> 
          }
          {
            filtered.length == 0 ? 
            <><p className="text-center fw-bold mt-5">Produk tidak ditemukan</p></> 
            : 
            paginated.map((item, i) => <div key={i} className="product-card flex-column mb-4 p-4 d-flex justify-content-between align-items-center flex-wrap">
              <div className="d-flex flex-row w-100">
                <div className="flex-grow-1 me-3">
                  <h6 className="fw-bold fs-5">{item?.id_pembelian}</h6> 

                  <span style={{ fontSize: '0.9rem' }}>Status:</span>
                  {item?.status_pembelian == "Pembayaran valid" ? <span class="badge text-bg-success">Pembayaran valid</span> : <></>}
                  {item?.status_pembelian == "Tidak mengirimkan bukti pembayaran" ? <span class="badge text-bg-danger">Tidak mengirimkan bukti pembayaran</span> : <></>}
                  {item?.status_pembelian == "Pembayaran tidak valid" ? <span class="badge text-bg-danger">Pembayaran tidak valid</span> : <></>}
                  {item?.status_pembelian == "Menunggu pembayaran" ? <span class="badge text-bg-warning">Menunggu pembayaran</span> : <></>}
                  {item?.status_pembelian == "Menunggu verifikasi pembayaran" ? <span class="badge text-bg-warning">Menunggu verifikasi pembayaran</span> : <></>}

                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Tanggal Pembelian: {formatDate(item?.tanggal_pembelian)}, {formatTime(item?.tanggal_pembelian)}</p>
                  {item?.tanggal_pelunasan ? <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Tanggal Pelunasan: {formatDate(item?.tanggal_pelunasan)}, {formatTime(item?.tanggal_pelunasan)}</p> : <></>}
                  
                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Customer Service: {item?.CustomerService ? `${item?.CustomerService?.nama_pegawai} (${item?.CustomerService?.id_pegawai})` : "-"}</p>
                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Pembeli: {item?.Pembeli?.nama}</p>
                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Metode Pengiriman: {item?.Pengiriman?.jenis_pengiriman}</p>
                  { item?.Pengiriman?.jenis_pengiriman == "Dikirim kurir" ? <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Alamat: {item?.AlamatPembeli?.alamat_lengkap}</p> : <></>}
                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Barang: 
                    {
                      item?.SubPembelians.map((sb, i) => {
                        if(i == item?.SubPembelians.length - 1) return <a key={i} href={`/barang/${sb?.Barang?.id_barang}`} style={{ color: "black", textDecoration: "none"}}>{sb?.Barang?.nama}</a>
                        return <a key={i} href={`/barang/${sb?.Barang?.id_barang}`} style={{ color: "black", textDecoration: "none"}}>{sb?.Barang?.nama}, </a>
                      })
                    }
                  </p>
                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Total Harga Barang: Rp {formatMoney(item?.total_harga)}</p>
                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Ongkos Kirim: Rp {formatMoney(item?.ongkir)}</p>
                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Potongan Poin: Rp {formatMoney(item?.potongan_poin)}</p>
                  <p style={{ fontSize: '0.85rem' }} className="mt-2 mb-2">Poin Diperoleh: {item?.poin_diperoleh}</p>
                  <div className="price-text">Rp {formatMoney(item?.total_bayar)}</div>
                </div>
              </div>
              
              <div className="d-flex flex-row w-100 justify-content-end mt-3">
                <button type='button' className='btn btn-secondary me-2' onClick={() => generateNotaPenjualan(item?.id_pembelian)}>Cetak Nota</button>
                {
                  item?.bukti_transfer ? 
                  <button type="button" data-bs-toggle="modal" data-bs-target="#cek-bukti-bayar-modal" className={`btn btn-primary me-2`} onClick={() => setSelectedPembelian(item)}>Cek Bukti Bayar</button>
                  :
                  <></>
                }
                
                {
                  item?.status_pembelian == "Menunggu verifikasi pembayaran" && ( (new Date()) > (new Date( (new Date(item?.tanggal_pembelian).getTime() + 15 * 60 * 1000) )) ) ?
                  <button type="button" data-bs-toggle="modal" data-bs-target="#verifikasi-bukti-bayar-modal" className={`btn btn-success me-2`} onClick={() => setSelectedPembelian(item)}>Verifikasi Bukti Bayar</button>
                  :
                  <></>
                }
              </div>
            </div>)
          }

          <div className="d-flex justify-content-center">
            {filtered.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={(numberPage) => setCurrentPage(numberPage)}
                />
            )}
          </div>
        </div>

      </div>
      <BuktiBayarModal img={selectedPembelian?.bukti_transfer} />
      <VerifikasiBuktiBayarModal pembelian={selectedPembelian} onVerification={handleVerification} />
    </div>
  );

};

export default CekBuktiTf;