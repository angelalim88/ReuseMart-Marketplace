import React from 'react';
import { useState, useEffect } from 'react';
import DefaultProfilePicture from '../../assets/images/profile_picture/default.jpg';
import { GetAkunById, updateAkun } from "../../clients/AkunService";
import { GetPenitipByIdAkun, UpdatePenitip } from '../../clients/PenitipService';
import { apiSubPembelian } from '../../clients/SubPembelianService';
import { decodeToken } from '../../utils/jwtUtils';
import DetailTransaksiPenitipModal from '../../components/modal/DetailTransaksiPenitipModal';
import { toast } from "sonner";
import EditProfilePenitipModal from '../../components/modal/EditProfilePenitipModal';
import CetakLaporanPenitipModal from '../../components/modal/CetakLaporanPenitipModal';
import { CetakLaporanTransaksi } from '../../components/pdf/CetakLaporanTransaksi';

const PenitipProfile = () => {

    const [penitip, setPenitip] = useState(null);
    const [akun, setAkun] = useState(null);
    const [histori, setHistori] = useState([]);
    const [selectedHistori, setSelectedHistori] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [filteredHistori, setFilteredHistori] = useState([]);
    const [sortMethod, setSortMethod] = useState("waktu-descending");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItems, setCurrentItems] = useState([]);
    const itemsPerPage = 10;

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

    const formatMoney = (nominal) => {
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(parseFloat(nominal));
      return formatted;
    }

    const fetchUserData = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Gagal mendapatkan token login!");
          return; 
        }

        const idAkun = decodeToken(token).id;
        if (!idAkun) {
            toast.error("Gagal mendapatkan id akun!");
            return;
        }

        try {
            const response = await GetAkunById(idAkun);
            setAkun(response);

            const dataPenitip = await GetPenitipByIdAkun(idAkun);
            setPenitip(dataPenitip);
            console.log('data penitip', dataPenitip);
            
        } catch (error) {
            toast.error('Gagal mendapatkan data user!');
            console.error('Gagal mendapatkan data user! ', error);
        }
    };

    useEffect(() => {
      fetchUserData();
    }, []);
    
    const fetchHistori = async (id_penitip) => {
      try {
        const response = await apiSubPembelian.getSubPembelianByPenitipId(id_penitip);
        // response[0].pembelian.tanggal_pembelian = new Date('2025-01-10T13:00:00.000Z');
        // response[0].barang.push(response[1].barang[0]);
        // console.log(response);
        // const dummy = [...response, ...response, ...response, ...response, ...response, ...response];
        
        setHistori(response);
      } catch (error) {
        toast.error('Gagal mendapatkan data histori transaksi!');
        console.error('Gagal mendapatkan data histori transaksi! ', error);
      }
    }

    const updateProfile = async (nama, formData) => {
      try {
        let updateNamaResponse = null;
        if(nama) {
          updateNamaResponse = await UpdatePenitip(penitip.id_penitip, {nama_penitip: nama});
        }
  
        let updateProfilePictureResponse = null;
        if(formData) {
          updateProfilePictureResponse = await updateAkun(penitip.id_akun, formData);
        }
  
        if(updateNamaResponse && updateProfilePictureResponse) {
          await fetchUserData();
          toast.success("Berhasil mengupdate profile!");
        } else {
          toast.error("Gagal mengupdate profile!");
        }
      } catch (error) {
        console.error("Gagal mengupdate profile! ",error);
        toast.error("Gagal mengupdate profile!");
      }
    }

    useEffect(() => {
        if(penitip) {
          fetchHistori(penitip.id_penitip);
        }
    }, [penitip]);

    const filtering = () => {
      let result = [];

      if (keyword.length === 0) {
        result = [...histori];
      } else {
        result = histori.filter((h) =>
          h.barang.some((b) =>
            b.nama.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }

      if (sortMethod === 'waktu-ascending') {
        result.sort((a, b) => {
          const dateA = new Date(a.pembelian?.tanggal_pembelian);
          const dateB = new Date(b.pembelian?.tanggal_pembelian);
          return dateA - dateB;
        });
      } else if (sortMethod === 'waktu-descending') {
        result.sort((a, b) => {
          const dateA = new Date(a.pembelian?.tanggal_pembelian);
          const dateB = new Date(b.pembelian?.tanggal_pembelian);
          return dateB - dateA;
        });
      }

      setFilteredHistori(result);
      setCurrentItems(result.slice(((currentPage * itemsPerPage) - itemsPerPage), (currentPage * itemsPerPage)));
    };

    useEffect(() => {
      filtering();
    }, [keyword, histori, sortMethod, currentPage]);

    const handleCetakLaporanTransaksiPenitip = (id_penitip, tahun, bulan) => {
      CetakLaporanTransaksi(bulan, tahun, id_penitip);
    }
    
    return <>
    <div className="container mt-5 mb-5">
      <div className="d-flex flex-row justify-between align-items-center">
        <h4 className="fw-bold mb-4">Halaman Profil Penitip</h4> 
        <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#edit-profile-penitip-modal">Edit Profile</button>
      </div>
  
      <div className="card shadow border-0 p-4 d-flex flex-column flex-md-row align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center mb-3 mb-md-0">
          <div className="position-relative me-3">
            <img
              src={akun && akun.profile_picture !== '' ? `http://localhost:3000/uploads/profile_picture/${akun.profile_picture}` : 'http://localhost:3000/uploads/profile_picture/default.jpg'}
              alt="Foto Profil"
              className="rounded-circle w-100"
              style={{
                maxWidth:'80px',
                minWidth: '40px',
                aspectRatio: '1/1'
              }}
            />
            {penitip && penitip.badge == 1 ? <span
              className="badge bg-warning text-dark position-absolute top-0 start-50 translate-middle p-1 px-2"
              style={{ fontSize: '0.7rem', borderRadius: '1rem' }}
            >
               <i className="bi bi-fire"></i> Top Seller
            </span> : <></>}
            
          </div>
          <div>
            <h5 className="mb-1 fw-bold">{penitip && penitip.nama_penitip ? penitip.nama_penitip : ""}</h5>
            <p className="mb-1 text-muted">{akun && akun.email !== '' ? akun.email : ""}</p>
            <p className="mb-0 text-muted">
              Rating: <strong>{penitip && penitip.rating ? penitip.rating : ""}</strong>
            </p>
          </div>
        </div>
  
        <div className="text-md-end text-center">
          <p className="mb-0 text-muted">
            Terdaftar sejak <strong>{penitip && penitip.tanggal_registrasi ? formatDate(penitip.tanggal_registrasi) : ""}</strong>, pukul <strong>{penitip && penitip.tanggal_registrasi ? formatTime(penitip.tanggal_registrasi) : ""}</strong>
          </p>
        </div>
      </div>

      <h4 className="fw-bold mb-4">Keuntungan</h4>

      <div className="card shadow border-0 p-4 d-flex flex-column flex-md-row align-items-start justify-content-between mb-4">
        <div className="d-flex align-items-center mb-3 mb-md-0">
          <div>
            <h5 className="mb-1 fw-bold">Saldo: {penitip && penitip.keuntungan ? <>Rp. {formatMoney(penitip.keuntungan)}</> : ""}</h5>
            <p className="mb-1 text-muted">Total poin: {penitip && penitip.total_poin != null ? penitip.total_poin : ""}</p>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-between align-items-center mb-2">
        <h4 className="fw-bold mb-4" id='histori'>Histori Penjualan</h4>
        <button className='btn btn-success' type='button' data-bs-toggle="modal" data-bs-target="#cetak-laporan-penitip-modal">Cetak Laporan Transaksi Penitip</button>
      </div>

      <div className="d-flex flex-column flex-md-row">
        <div class="mb-3 w-100">
          <input type="text" class="form-control" id="keyword" placeholder="Masukan nama barang" value={keyword} onChange={(e) => setKeyword(e.target.value)} onSubmit={(e) => e.preventDefault()}/>
        </div>

        <div class="dropdown">
          <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Urutkan berdasarkan
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#" onClick={(e) => {
              e.preventDefault();
              setSortMethod("waktu-ascending");
            }}>{ sortMethod === 'waktu-ascending' ? <b>waktu (menaik)</b> : <>waktu (menaik)</>}</a></li>

            <li><a class="dropdown-item" href="#" onClick={(e) => {
              e.preventDefault();
              setSortMethod("waktu-descending");
            }}>{ sortMethod === 'waktu-descending' ? <b>waktu (menurun)</b> : <>waktu (menurun)</>}</a></li>
          </ul>
        </div>
      </div>

      <div className="row">
        <div className="col">
          {
            histori.length == 0 ? <div className='mt-3 text-center fw-bold'>Belum ada transaksi penjualan.</div> : <></>
          }
          {
            filteredHistori.length == 0 ? <></> : currentItems.map((h, i) => (
              <div className="card shadow border-0 p-4 d-flex flex-column align-items-start justify-content-center mb-4">
                {h.barang.map((b, i) => (
                  <div className='w-100 d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start align-items-center mb-2'>
                    <a href={`http://localhost:5173/barang/${b.id_barang}`}>
                      <img src={`http://localhost:3000/uploads/barang/${b.gambar.split(',')[0]}`} alt="gambar-produk" className='rounded-circle' style={{
                        minWidth: '50px',
                        maxWidth: '150px',
                        aspectRatio: '1/1'
                      }}/>
                    </a>
                    <div className='d-flex flex-column justify-content-center justify-content-md-start align-items-center align-items-md-start'>
                      <p className="text-secondary mb-1" style={{ fontSize: '0.8rem'}}>{h.pembelian.id_pembelian}</p>
                      <p className='fw-bold'>{b.nama}</p>
                      <p className='text-secondary'>{formatDate(h.pembelian.tanggal_pembelian)}, {formatTime(h.pembelian.tanggal_pembelian)} WIB</p>
                      {
                        b.transaksi == null ? <p className='badge text-bg-danger'>Transaksi dibatalkan</p> : <p className='badge text-bg-success'>Pendapatan: Rp. {formatMoney(b.transaksi.pendapatan)}</p>
                      }
                    </div>
                  </div>
                ) )}
                <div className='w-100 d-flex align-items-center justify-content-md-end justify-content-center'>
                  <button type="button" class="btn btn-success" onClick={() => {setSelectedHistori(h); console.log(selectedHistori);
                  }} data-bs-toggle="modal" data-bs-target="#detail-transaksi-penitip-modal">Lihat Detail</button>
                </div>
              </div>
            ))
          }
          {
            filteredHistori.length == 0 && histori.length != 0 ? <div className='mt-3 text-center fw-bold'>Transaksi penjualan tidak ditemukan.</div> : <></>
          }
        </div>
      </div>

      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className={`page-link ${currentPage === 1 ? '' : 'text-success'}`} onClick={() => setCurrentPage(currentPage - 1)} href="#histori">Previous</button>
          </li>
          {[...Array(Math.ceil(filteredHistori.length / itemsPerPage))].map((_, index) => (
            <li className={`page-item ${currentPage === index + 1 ? 'active' : ''}`} key={index}>
              <button className={`page-link ${currentPage === index + 1 ? 'bg-success text-white border-success' : 'text-success'}`} onClick={() => setCurrentPage(index + 1)} href="#histori">{index + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === (Math.ceil(filteredHistori.length/itemsPerPage)) ? 'disabled' : ''}`}>
            <button className={`page-link ${currentPage === (Math.ceil(filteredHistori.length/itemsPerPage)) ? '' : 'text-success'}`} onClick={() => setCurrentPage(currentPage + 1)} href="#histori">Next</button>
          </li>
        </ul>
      </nav>

    </div>
    
    <CetakLaporanPenitipModal penitip={penitip} onCetak={handleCetakLaporanTransaksiPenitip}/>
    <DetailTransaksiPenitipModal data={selectedHistori}/>
    <EditProfilePenitipModal data={{penitip, akun}} onUpdate={updateProfile}/>
  </>
}

export default PenitipProfile;