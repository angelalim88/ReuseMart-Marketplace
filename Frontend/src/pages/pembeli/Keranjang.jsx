import { useEffect, useState } from "react";
import Pagination from "../../components/pagination/Pagination";
import { apiPembeli } from "../../clients/PembeliService";
import { decodeToken } from "../../utils/jwtUtils";
import { apiKeranjang } from "../../clients/KeranjangService";
import { apiAlamatPembeli } from '../../clients/AlamatPembeliServices';
import { toast } from "sonner";
import DeleteKeranjangModal from "../../components/modal/DeleteKeranjangModal";

const Keranjang = () => {

  const [akun, setAkun] = useState(null);
  const [pembeli, setPembeli] = useState(null);
  const [alamat, setAlamat] = useState([]);
  const [selectedAlamat, setSelectedAlamat] = useState(null);
  const [carts, setCarts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedCart, setSelectedCart] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortMethod, setSortMethod] = useState("id-descending");
  const [sendMethod, setSendMethod] = useState("Dikirim Kurir");
  const [poinUsed, setPoinUsed] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const itemsPerPage = 5;
  
  const extractIdNumber = (id) => {
      const match = id.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
  };

  const filteredByCategory = carts.filter((cart) => {
    if(selectedCategory == "Semua") {
      return cart;
    } else {
      return cart?.Barang?.kategori_barang.toLowerCase().includes(selectedCategory.toLowerCase());
    } 
  })

  const filtered = filteredByCategory.filter((cart) => {
    return cart?.Barang?.nama.toLowerCase().includes(keyword.toLowerCase()) || cart?.Barang?.Penitip?.nama_penitip.toLowerCase().includes(keyword.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortMethod) {
      case "id-ascending":
        return extractIdNumber(a.id_keranjang) - extractIdNumber(b.id_keranjang);
      case "id-descending":
        return extractIdNumber(b.id_keranjang) - extractIdNumber(a.id_keranjang);
      case "name-ascending":
        return a.Barang.nama.localeCompare(b.Barang.nama);
      case "name-descending":
        return b.Barang.nama.localeCompare(a.Barang.nama);
      case "price-ascending":
        return (a.Barang.harga) - (b.Barang.harga);
      case "price-descending":
        return (b.Barang.harga) - (a.Barang.harga);
      case "status-not-available":
        return (a.Barang.Penitipan.status_penitipan == "Dalam masa penitipan") - (b.Barang.Penitipan.status_penitipan == "Dalam masa penitipan");
      case "status-available":
        return (b.Barang.Penitipan.status_penitipan == "Dalam masa penitipan") - (a.Barang.Penitipan.status_penitipan == "Dalam masa penitipan");
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
          if(decoded.role == "Pembeli") {
            const dataPembeli = await apiPembeli.getPembeliByIdAkun(decoded.id);
            setPembeli(dataPembeli);
            console.log('data pembeli', dataPembeli);
            
          } else {
            throw new Error("Role bukan pembeli");
          }
        } catch (error) {
          toast.error("Gagal memuat data user!");
          console.error("Error:", err);
        }
      }
  }

  const fetchAlamat = async () => {
    try {
      if(pembeli) {
        const response = await apiAlamatPembeli.getAlamatPembeliByIdPembeli(pembeli.id_pembeli);
        if(response) {
          setAlamat(response);

          const mainAddress = response.find(alamat => alamat.is_main_address === true);
          if (mainAddress) {
            setSelectedAlamat(mainAddress);
          }
        }
      }
    } catch (error) {
      toast.error("Gagal mengambil data alamat!");
      console.error("Gagal mengambil data alamat: ", error);
    }
  }

  const fetchProduct = async () => {
    try {
      if(pembeli) {
        const response = await apiKeranjang.getKeranjangByIdPembeli(pembeli.id_pembeli);
        if(response) {
          setCarts(response);
          console.log('data produk', response);
        }
      }
    } catch (error) {
      toast.error("Gagal mengambil data keranjang!");
      console.error("Gagal mengambil data keranjang: ", error);
    }
  }

  const formatMoney = (nominal) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(nominal));
    return formatted;
  }

  const deleteCart = async (id) => {
    try {
      const response = await apiKeranjang.deleteKeranjang(id);
      if(response) {
        toast.success('Berhasil menghapus produk dari keranjang!');
        await fetchProduct();
      }
    } catch (error) {
      toast.error("Gagal menghapus produk dari keranjang!");
      console.error("Gagal menghapus produk dari keranjang: ", error);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchAlamat();
  }, [pembeli])

  useEffect(() => {
    if(selectedProduct.length == 0) {
      setPoinUsed(0);
    }
  }, [selectedProduct]);

  const totalHargaBarang = selectedProduct.reduce((total, item) => {
    const harga = parseFloat(item?.Barang?.harga || 0);
    return total + harga;
  }, 0);
  const ongkosKirim = sendMethod == "Ambil di Gudang" ? 0 : (
    totalHargaBarang >= 1500000 ? 0 : 100000
  );
  const bonusPoin = totalHargaBarang > 500000 ? (Math.floor(Math.floor(totalHargaBarang/10000) * 1.2)) : (Math.floor(totalHargaBarang/10000));
  const potonganPoin = ((poinUsed/100) * 10000);
  const totalHarga = (totalHargaBarang + ongkosKirim) - potonganPoin;

  useEffect(() => {
    const totalHargaMaksimal = totalHargaBarang + ongkosKirim;
    const potonganPoin = (poinUsed / 100) * 10000;

    if (potonganPoin > totalHargaMaksimal) {
      const poinMaksimal = Math.floor((totalHargaMaksimal / 10000) * 100);
      setPoinUsed(poinMaksimal);
    }
  }, [poinUsed, totalHargaBarang, ongkosKirim]);

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
              {isOpen ? <i class="bi bi-x-lg me-2"></i> : <i className="bi bi-list me-2"></i>}Kategori
            </h5>
          </button>
          <div style={{ height: `${isOpen ? "100%" : "0px" }`, overflow: "hidden"}}>
            {[
              "Semua",
              "Perabotan Rumah Tangga",
              "Elektronik & Gadget",
              "Pakaian & Aksesori",
              "Kosmetik & Perawatan Diri",
              "Buku, Alat Tulis, & Peralatan Sekolah",
              "Hobi, Mainan, & Koleksi",
              "Perlengkapan Bayi & Anak",
              "Otomotif & Aksesori",
              "Perlengkapan Taman & Outdoor",
              "Peralatan Kantor & Industri"
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
      <div className="col-lg-6 order-lg-2 order-3">
        <h4 className="fw-bold mb-4">Halaman Keranjang</h4>

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
              <li><a class="dropdown-item" href="#" onClick={() => setSortMethod('name-ascending')}>Nama Produk (A - Z)</a></li>
              <li><a class="dropdown-item" href="#" onClick={() => setSortMethod('name-descending')}>Nama Produk (Z- A)</a></li>
              <li><a class="dropdown-item" href="#" onClick={() => setSortMethod('price-ascending')}>Harga Produk (Menaik)</a></li>
              <li><a class="dropdown-item" href="#" onClick={() => setSortMethod('price-descending')}>Harga Produk (Menurun)</a></li>
              <li><a class="dropdown-item" href="#" onClick={() => setSortMethod('status-available')}>Status (Tersedia)</a></li>
              <li><a class="dropdown-item" href="#" onClick={() => setSortMethod('status-not-available')}>Status (Tidak Tersedia)</a></li>
            </ul>
          </div>
        </div>
        {
          carts.length == 0 && <><p className="text-center fw-bold mt-5">Belum ada produk di keranjang</p></> 
        }
        {
          filtered.length == 0 ? 
          <><p className="text-center fw-bold mt-5">Produk tidak ditemukan</p></> 
          : 
          paginated.map((item, i) => <div key={i} className="product-card flex-column mb-4 p-4 d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex flex-row w-100">
              <div className="d-flex align-items-center me-3">
                {
                  item?.Barang?.Penitipan?.status_penitipan == "Dalam masa penitipan" ? 
                  <><input type="checkbox" style={{ width: '20px', height: '20px' }} onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProduct((prev) => [...prev, item]);
                    } else {
                      setSelectedProduct((prev) =>
                        prev.filter((p) => p.id_keranjang !== item.id_keranjang)
                      );
                    }
                  }}/></> 
                  : 
                  <></>
                }
              </div>
              <div className="flex-grow-1 me-3">
                <a href={`/barang/${item?.Barang?.id_barang}`} style={{ textDecoration: "none", color: "black"}}>
                  <h6 className="fw-bold fs-5">{item?.Barang?.nama} {item?.Barang?.Penitipan?.status_penitipan == "Dalam masa penitipan" ? <></> : <span class="badge text-bg-danger">Tidak tersedia</span>}</h6> 
                </a>
                <p style={{ fontSize: '0.9rem' }} className="mb-1 fw-semibold">{item?.Barang?.Penitip?.nama_penitip} ({item?.Barang?.Penitip?.rating})</p>
                <p style={{ fontSize: '0.85rem' }} className="mb-2">
                  Kategori: {item?.Barang?.kategori_barang}
                </p>
                <p style={{ fontSize: '0.85rem' }} className="mb-2">
                  Deskripsi: {item?.Barang?.deskripsi}
                </p>
                <div className="price-text">Rp {formatMoney(item?.Barang?.harga)}</div>
              </div>
              <div className="text-center">
                <img
                  src={"http://localhost:3000/uploads/foto_produk/placeholder.png"}
                  alt="product"
                  className="rounded-circle mb-2"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              </div>
            </div>
            
            <div className="d-flex flex-row w-100 justify-content-end">
              <button type="button" data-bs-toggle="modal" data-bs-target="#delete-keranjang-modal" className={`btn btn-danger me-2`} onClick={() => setSelectedCart(item)}>Hapus dari keranjang</button>
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

      {/* Sidebar Pembelian */}
      <div className="col-lg-3 mb-3 order-lg-3 order-1">
        <div className="p-3" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h5 className="fw-bold mb-3">
            Daftar Barang Dipilih
          </h5>
          {selectedProduct.length == 0 ? <>
            <p className="text-center fw-semibold">Belum ada produk yang dipilih</p>
          </> : <></>}
          {selectedProduct.map((item, index) => (
            <div
              key={index}
              className="card p-2 mb-2"
            >
              <p className="fw-semibold mb-0">{item?.Barang?.nama}</p>
              <p className="mb-0">Rp {formatMoney(item?.Barang?.harga)}</p>
            </div>
          ))}

          <hr />

          <p className="mb-0">Metode pengiriman:</p>
          <div class="dropdown w-100 border border-2 rounded">
            <button class="btn dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              {sendMethod}
            </button>
            <ul class="dropdown-menu w-100 text-center">
              <li><a class="dropdown-item" href="#" onClick={() => setSendMethod("Dikirim Kurir")}>Dikirim Kurir</a></li>
              <li><a class="dropdown-item" href="#" onClick={() => setSendMethod("Ambil di Gudang")}>Ambil di Gudang</a></li>
            </ul>
          </div>

          {
            sendMethod == "Dikirim Kurir" ? 
            <>
              <p className="mb-0">Pilih Alamat</p>
              <div class="dropdown w-100 border border-2 rounded">
                <button class="btn dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {selectedAlamat ? 
                  <>
                    <p className="mb-0 fw-semibold">{selectedAlamat.nama_alamat} {selectedAlamat.is_main_address && <i className="bi bi-patch-check-fill"></i>}</p>
                    <small>{selectedAlamat.alamat_lengkap}</small>
                  </> 
                  : 
                  "Pilih alamat"}
                </button>
                <ul class="dropdown-menu w-100 text-center">
                  {
                    alamat.map((data, i) => <li><a class="dropdown-item" href="#" onClick={() => setSelectedAlamat(data)}>
                      <p className="mb-0 fw-semibold">{data.nama_alamat} {data.is_main_address && <i className="bi bi-patch-check-fill"></i>}</p>
                      <small>{data.alamat_lengkap}</small>
                    </a></li>)
                  }
                </ul>
              </div>
            </> 
            : 
            <></>
          }

          <label for="poinRange" class="form-label">Gunakan poin ({poinUsed} poin)</label>
          <input type="range" class="form-range" id="poinRange" disabled={selectedProduct.length === 0} min={0} max={pembeli?.total_poin} step={100} value={poinUsed} onChange={(e) => setPoinUsed(e.target.value)}/>
          <div className="d-flex flex-row justify-content-between">
            <div>0 poin</div> <div>{pembeli?.total_poin} poin</div>
          </div>

          <hr />

          <p className="fs-5 mb-1"><strong>Harga Barang:</strong> Rp {formatMoney(totalHargaBarang)}</p>
          <p className="fs-5 mb-1"><strong>Ongkos Kirim:</strong> Rp {formatMoney(ongkosKirim)}</p>
          <p className="fs-5 mb-1"><strong>Potongan Poin:</strong> Rp {formatMoney(potonganPoin)}</p>
          <p className="fs-5 mb-1"><strong>Poin Didapatkan:</strong> {bonusPoin}</p>
          <p className="fs-5 mb-2"><strong>Total Harga:</strong> Rp {formatMoney(totalHarga)}</p>
          <button className={`btn btn-success w-100 ${selectedProduct.length == 0 ? 'disabled' : ''}`}>Beli</button>
        </div>
      </div>

      <DeleteKeranjangModal keranjang={selectedCart} onDelete={deleteCart} />
    </div>

  </div>
);

}

export default Keranjang;