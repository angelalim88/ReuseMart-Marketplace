import { useEffect, useState } from "react";
import Pagination from "../../components/pagination/Pagination";
import { apiPembeli } from "../../clients/PembeliService";
import { decodeToken } from "../../utils/jwtUtils";
import { apiKeranjang } from "../../clients/KeranjangService";
import { apiAlamatPembeli } from '../../clients/AlamatPembeliServices';
import { toast } from "sonner";
import DeleteKeranjangModal from "../../components/modal/DeleteKeranjangModal";
import { apiPembelian } from "../../clients/PembelianService";
import { CreatePengiriman } from "../../clients/PengirimanService";
import CheckoutModal from "../../components/modal/CheckoutModal";
import { apiSubPembelian } from "../../clients/SubPembelianService";
import { UpdateStatusPenitipan } from "../../clients/PenitipanService";
import { FaSearch } from 'react-icons/fa';

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
  const [sendMethod, setSendMethod] = useState("Dikirim kurir");
  const [poinUsed, setPoinUsed] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const itemsPerPage = 5;

  const extractIdNumber = (id) => {
    const match = id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const filteredByCategory = carts.filter((cart) => {
    if (selectedCategory === "Semua") {
      return cart;
    } else {
      return cart?.Barang?.kategori_barang.toLowerCase().includes(selectedCategory.toLowerCase());
    }
  });

  const filtered = filteredByCategory.filter((cart) => {
    return (
      cart?.Barang?.nama.toLowerCase().includes(keyword.toLowerCase()) ||
      cart?.Barang?.Penitip?.nama_penitip.toLowerCase().includes(keyword.toLowerCase())
    );
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
        return a.Barang.harga - b.Barang.harga;
      case "price-descending":
        return b.Barang.harga - a.Barang.harga;
      case "status-not-available":
        return (
          a.Barang.Penitipan.status_penitipan === "Dalam masa penitipan" ? -1 : 1
        );
      case "status-available":
        return (
          a.Barang.Penitipan.status_penitipan === "Dalam masa penitipan" ? 1 : -1
        );
      default:
        return 0;
    }
  });

  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const fetchUserData = async () => {
    if (localStorage.getItem("authToken")) {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Token tidak ditemukan");

        const decoded = decodeToken(token);
        setAkun(decoded);
        if (!decoded?.id) throw new Error("Invalid token structure");
        if (decoded.role === "Pembeli") {
          const dataPembeli = await apiPembeli.getPembeliByIdAkun(decoded.id);
          setPembeli(dataPembeli);
        } else {
          throw new Error("Role bukan pembeli");
        }
      } catch (error) {
        toast.error("Gagal memuat data user!");
        console.error("Error:", error);
      }
    }
  };

  const fetchAlamat = async () => {
    try {
      if (pembeli) {
        const response = await apiAlamatPembeli.getAlamatPembeliByIdPembeli(
          pembeli.id_pembeli
        );
        if (response) {
          setAlamat(response);
          const mainAddress = response.find(
            (alamat) => alamat.is_main_address === true
          );
          if (mainAddress) {
            setSelectedAlamat(mainAddress);
          }
        }
      }
    } catch (error) {
      toast.error("Gagal mengambil data alamat!");
      console.error("Gagal mengambil data alamat: ", error);
    }
  };

  const fetchProduct = async () => {
    try {
      if (pembeli) {
        const response = await apiKeranjang.getKeranjangByIdPembeli(
          pembeli.id_pembeli
        );
        if (response) {
          setCarts(response);
        }
      }
    } catch (error) {
      toast.error("Gagal mengambil data keranjang!");
      console.error("Gagal mengambil data keranjang: ", error);
    }
  };

  const formatMoney = (nominal) => {
    const formatted = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(nominal));
    return formatted;
  };

  const deleteCart = async (id) => {
    try {
      const response = await apiKeranjang.deleteKeranjang(id);
      if (response) {
        toast.success("Berhasil menghapus produk dari keranjang!");
        await fetchProduct();
      }
    } catch (error) {
      toast.error("Gagal menghapus produk dari keranjang!");
      console.error("Gagal menghapus produk dari keranjang: ", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchAlamat();
  }, [pembeli]);

  useEffect(() => {
    if (selectedProduct.length === 0) {
      setPoinUsed(0);
    }
  }, [selectedProduct]);

  const totalHargaBarang = selectedProduct.reduce((total, item) => {
    const harga = parseFloat(item?.Barang?.harga || 0);
    return total + harga;
  }, 0);
  const ongkosKirim =
    sendMethod === "Ambil di gudang"
      ? 0
      : totalHargaBarang >= 1500000
      ? 0
      : 100000;
  const bonusPoin =
    totalHargaBarang > 500000
      ? Math.floor((totalHargaBarang / 10000) * 1.2)
      : Math.floor(totalHargaBarang / 10000);
  const potonganPoin = (poinUsed / 100) * 10000;
  const totalHarga = totalHargaBarang + ongkosKirim - potonganPoin;

  useEffect(() => {
    const totalHargaMaksimal = totalHargaBarang + ongkosKirim;
    const potonganPoin = (poinUsed / 100) * 10000;

    if (potonganPoin > totalHargaMaksimal) {
      const poinMaksimal = Math.floor((totalHargaMaksimal / 10000) * 100);
      setPoinUsed(poinMaksimal);
    }
  }, [poinUsed, totalHargaBarang, ongkosKirim]);

  const pembelian = {
    id_customer_service: null,
    id_pembeli: pembeli?.id_pembeli,
    id_alamat: selectedAlamat?.id_alamat,
    bukti_transfer: "",
    tanggal_pembelian: new Date().toISOString(),
    total_harga: totalHargaBarang,
    ongkir: ongkosKirim,
    potongan_poin: potonganPoin,
    total_bayar: totalHarga,
    poin_diperoleh: bonusPoin,
    status_pembelian: "Menunggu pembayaran",
  };

  const pengiriman = {
    id_pengkonfirmasi: null,
    tanggal_mulai: null,
    tanggal_berakhir: null,
    status_pengiriman: "Menunggu hasil pembayaran",
    jenis_pengiriman: sendMethod,
  };

  const checkout = async () => {
    try {
      const responsePembelian = await apiPembelian.createPembelian(pembelian);
      if (responsePembelian) {
        for (const produk of selectedProduct) {
          await apiSubPembelian.createSubPembelian({
            id_pembelian: responsePembelian?.id_pembelian,
            id_barang: produk?.Barang?.id_barang,
          });
        }
        pengiriman.id_pembelian = responsePembelian?.id_pembelian;
        const responsePengiriman = await CreatePengiriman(pengiriman);
        if (responsePengiriman) {
          const responseUpdatePoin = await apiPembeli.updatePembeli(
            pembeli?.id_pembeli,
            { total_poin: pembeli?.total_poin - poinUsed }
          );
          if (responseUpdatePoin) {
            for (const produk of selectedProduct) {
              await UpdateStatusPenitipan(
                produk?.Barang?.Penitipan?.id_penitipan,
                "Dibeli"
              );
            }
            for (const produk of selectedProduct) {
              await apiKeranjang.deleteKeranjang(produk.id_keranjang);
            }
            toast.success("Pembelian berhasil!");
          }
        }
      }
    } catch (error) {
      toast.error("Gagal melakukan pembelian!");
      console.error("Gagal melakukan pembelian: ", error);
    } finally {
      await fetchProduct();
      await fetchUserData();
    }
  };

  return (
    <div className="container-fluid p-0" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#FFFFFF' }}>
      <div className="max-width-container mx-auto pt-4 px-3">
        <div className="row">
          {/* Category Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="p-4" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#03081F' }}>
                Kategori Barang
              </h5>
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
                "Peralatan Kantor & Industri",
              ].map((cat, index) => (
                <div
                  key={index}
                  className={`category-item ${selectedCategory === cat ? 'category-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-6">
            <h2 className="fw-bold mb-4" style={{ color: '#03081F' }}>Keranjang Belanja</h2>
            <p className="text-muted mb-4">Kelola barang yang akan Anda beli</p>

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <div className="position-relative" style={{ maxWidth: '400px', width: '100%' }}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Cari nama barang atau penitip..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="dropdown">
                <button
                  className="btn dropdown-toggle category-select"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Urutkan
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={() => setSortMethod('id-descending')}>Terbaru</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSortMethod('id-ascending')}>Terlama</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSortMethod('name-ascending')}>Nama (A-Z)</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSortMethod('name-descending')}>Nama (Z-A)</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSortMethod('price-ascending')}>Harga (Rendah-Tinggi)</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSortMethod('price-descending')}>Harga (Tinggi-Rendah)</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSortMethod('status-available')}>Tersedia</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSortMethod('status-not-available')}>Tidak Tersedia</a></li>
                </ul>
              </div>
            </div>

            {carts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-cart-x" style={{ fontSize: '3rem', color: '#D9D9D9' }}></i>
                <p className="mt-3 text-muted">Keranjang Anda kosong</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#D9D9D9' }}></i>
                <p className="mt-3 text-muted">Tidak ada barang yang cocok dengan pencarian</p>
              </div>
            ) : (
              paginated.map((item, i) => (
                <div key={i} className="product-card mb-4 p-4">
                  <div className="d-flex align-items-start">
                    <div className="d-flex align-items-center me-3">
                      {item?.Barang?.Penitipan?.status_penitipan === "Dalam masa penitipan" ? (
                        <input
                          type="checkbox"
                          style={{ width: '20px', height: '20px' }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProduct((prev) => [...prev, item]);
                            } else {
                              setSelectedProduct((prev) =>
                                prev.filter((p) => p.id_keranjang !== item.id_keranjang)
                              );
                            }
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="flex-grow-1 me-3">
                      <a
                        href={`/barang/${item?.Barang?.id_barang}`}
                        style={{ textDecoration: "none", color: "#03081F" }}
                      >
                        <h6 className="fw-bold fs-5 mb-1">
                          {item?.Barang?.nama}
                          {item?.Barang?.Penitipan?.status_penitipan !== "Dalam masa penitipan" && (
                            <span className="badge bg-danger ms-2">Tidak Tersedia</span>
                          )}
                        </h6>
                      </a>
                      <p style={{ fontSize: '0.9rem' }} className="mb-1 text-muted">
                        {item?.Barang?.Penitip?.nama_penitip} (Rating: {item?.Barang?.Penitip?.rating})
                      </p>
                      <p style={{ fontSize: '0.85rem' }} className="mb-1">
                        Kategori: <span className="kategori-badge">{item?.Barang?.kategori_barang}</span>
                      </p>
                      <p style={{ fontSize: '0.85rem' }} className="mb-2 text-muted">
                        {item?.Barang?.deskripsi}
                      </p>
                      <div className="price-text">Rp {formatMoney(item?.Barang?.harga)}</div>
                    </div>
                    <div className="text-center">
                      <img
                        src={
                          item?.Barang?.gambar
                            ? `http://localhost:3000/uploads/barang/${item.Barang.gambar.split(',')[0].trim()}`
                            : "http://localhost:3000/uploads/foto_produk/placeholder.png"
                        }
                        alt="product"
                        className="rounded mb-2"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#delete-keranjang-modal"
                      className="btn delete-btn"
                      onClick={() => setSelectedCart(item)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}

            {filtered.length > 0 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={(numberPage) => setCurrentPage(numberPage)}
                />
              </div>
            )}
          </div>

          {/* Checkout Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="p-4" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h5 className="fw-bold mb-4" style={{ color: '#03081F' }}>
                Ringkasan Pembelian
              </h5>
              {selectedProduct.length === 0 ? (
                <p className="text-center text-muted">Belum ada barang dipilih</p>
              ) : (
                selectedProduct.map((item, index) => (
                  <div key={index} className="card p-2 mb-2" style={{ borderRadius: '8px', border: '1px solid #E7E7E7' }}>
                    <p className="fw-semibold mb-0">{item?.Barang?.nama}</p>
                    <p className="mb-0 text-muted">Rp {formatMoney(item?.Barang?.harga)}</p>
                  </div>
                ))
              )}

              <hr />

              <div className="mb-3">
                <label className="form-label fw-medium">Metode Pengiriman</label>
                <div className="dropdown">
                  <button
                    className="btn category-select w-100 text-start"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {sendMethod}
                  </button>
                  <ul className="dropdown-menu w-100">
                    <li><a className="dropdown-item" href="#" onClick={() => setSendMethod("Dikirim kurir")}>Dikirim Kurir</a></li>
                    <li><a className="dropdown-item" href="#" onClick={() => setSendMethod("Ambil di gudang")}>Ambil di Gudang</a></li>
                  </ul>
                </div>
              </div>

              {sendMethod === "Dikirim kurir" && (
                <div className="mb-3">
                  <label className="form-label fw-medium">Pilih Alamat</label>
                  <div className="dropdown">
                    <button
                      className="btn category-select w-100 text-start"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {selectedAlamat ? (
                        <div>
                          <p className="mb-0 fw-semibold">
                            {selectedAlamat.nama_alamat}
                            {selectedAlamat.is_main_address && (
                              <i className="bi bi-patch-check-fill ms-2"></i>
                            )}
                          </p>
                          <small className="text-muted">{selectedAlamat.alamat_lengkap}</small>
                        </div>
                      ) : (
                        "Pilih alamat"
                      )}
                    </button>
                    <ul className="dropdown-menu w-100">
                      {alamat.map((data, i) => (
                        <li key={i}>
                          <a className="dropdown-item" href="#" onClick={() => setSelectedAlamat(data)}>
                            <p className="mb-0 fw-semibold">
                              {data.nama_alamat}
                              {data.is_main_address && (
                                <i className="bi bi-patch-check-fill ms-2"></i>
                              )}
                            </p>
                            <small>{data.alamat_lengkap}</small>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="poinRange" className="form-label fw-medium">
                  Gunakan Poin ({poinUsed} poin)
                </label>
                <input
                  type="range"
                  className="form-range"
                  id="poinRange"
                  disabled={selectedProduct.length === 0}
                  min={0}
                  max={pembeli?.total_poin}
                  step={100}
                  value={poinUsed}
                  onChange={(e) => setPoinUsed(e.target.value)}
                />
                <div className="d-flex justify-content-between text-muted">
                  <small>0 poin</small>
                  <small>{pembeli?.total_poin} poin</small>
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span className="fw-medium">Harga Barang:</span>
                  <span>Rp {formatMoney(totalHargaBarang)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="fw-medium">Ongkos Kirim:</span>
                  <span>Rp {formatMoney(ongkosKirim)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="fw-medium">Potongan Poin:</span>
                  <span>Rp {formatMoney(potonganPoin)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="fw-medium">Poin Didapatkan:</span>
                  <span>{bonusPoin}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total Harga:</span>
                  <span>Rp {formatMoney(totalHarga)}</span>
                </div>
              </div>

              <button
                className={`btn w-100 tambah-barang-btn ${selectedProduct.length === 0 ? 'disabled' : ''}`}
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#checkout-modal"
              >
                Lanjutkan Pembelian
              </button>
            </div>
          </div>
        </div>

        <DeleteKeranjangModal keranjang={selectedCart} onDelete={deleteCart} />
        <CheckoutModal pembelian={pembelian} onCheckout={checkout} />
      </div>

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }

        .category-item {
          cursor: pointer;
          font-size: 0.95rem;
          padding: 10px 15px;
          border-radius: 6px;
          margin-bottom: 5px;
          transition: background-color 0.2s, color 0.2s;
        }

        .category-item:hover {
          background-color: #f0f0f0;
        }

        .category-active {
          background-color: #028643;
          color: white;
          font-weight: 600;
        }

        .product-card {
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .price-text {
          font-weight: 700;
          font-size: 1.25rem;
          color: #03081F;
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
          background-color: white;
        }

        .category-select:focus {
          box-shadow: none;
          border-color: #028643;
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

        .delete-btn {
          border-color: #dc3545;
          color: #dc3545;
          font-size: 0.8rem;
          padding: 4px 12px;
          border-radius: 6px;
        }

        .delete-btn:hover {
          background-color: #dc3545;
          color: white;
        }

        .kategori-badge {
          font-size: 0.75rem;
          background-color: #f0f0f0;
          color: #333;
          padding: 5px 10px;
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .product-card {
            margin-bottom: 20px;
          }

          .search-input, .category-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Keranjang;