import React from 'react';
import { useState, useEffect } from 'react';
import DefaultProfilePicture from '../../assets/images/profile_picture/default.jpg';
import { GetAkunById } from "../../clients/AkunService";
import { GetPenitipByIdAkun } from '../../clients/PenitipService';
import { decodeToken } from '../../utils/jwtUtils';

const PenitipProfile = () => {

    const [penitip, setPenitip] = useState(null);
    const [akun, setAkun] = useState(null);

    const fetchUserData = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return; // Jika tidak ada token, tidak bisa ambil data

        const idAkun = decodeToken(token).id;
        if (!idAkun) {
            console.error("ID Akun tidak ditemukan di token");
            return;
        }

        try {
            const response = await GetAkunById(idAkun);
            setAkun(response); // Menyimpan data akun pengguna ke state
            // console.log('response data', response);

            const dataPenitip = await GetPenitipByIdAkun(idAkun);
            setPenitip(dataPenitip);
            console.log('data penitip', dataPenitip);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    // Memanggil fetchUserData saat komponen dimuat
    useEffect(() => {
        fetchUserData();
    }, []);

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
    
    return <>
    <div className="container mt-5 mb-5">
      <h4 className="fw-bold mb-4">Halaman Profil Penitip</h4>
  
      <div className="card shadow border-0 p-4 d-flex flex-column flex-md-row align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center mb-3 mb-md-0">
          <div className="position-relative me-3">
            <img
              src={akun && akun.profile_picture !== '' ? akun.profile_picture : DefaultProfilePicture}
              alt="Foto Profil"
              className="rounded-circle"
              width="80"
              height="80"
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

      <div className="card shadow border-0 p-4 d-flex flex-column flex-md-row align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center mb-3 mb-md-0">
          <div>
            <h5 className="mb-1 fw-bold">Saldo: {penitip && penitip.keuntungan ? penitip.keuntungan : ""}</h5>
            <p className="mb-1 text-muted">Total poin: {penitip && penitip.total_poin != null ? penitip.total_poin : ""}</p>
          </div>
        </div>
      </div>

    </div>
  </>
  
}

export default PenitipProfile;