import React, { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import { apiPembeli } from "../../clients/PembeliService";
import { decodeToken } from '../../utils/jwtUtils';
import HistoryTransaksi from './HistoryTransaksi';

const PembeliProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const decoded = decodeToken(token);
        const idAkun = decoded.id;

        const dataPembeli = await apiPembeli.getPembeliByIdAkun(idAkun);
        setProfile(dataPembeli);
      } catch (error) {
        console.error("Gagal mengambil data profil pembeli:", error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <p>Memuat profil...</p>;

  const { nama, total_poin, tanggal_registrasi, Akun: akun } = profile;

  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) + `, pukul ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Profil</h2>
      <Card className="d-flex flex-row align-items-center p-3 shadow-sm">
        <img
          src={
            akun?.profile_picture
              ? `http://localhost:3000/uploads/profile_picture/${akun.profile_picture}`
              : "/default-profile.jpg"
          }
          alt="Profile"
          className="rounded-circle"
          width="100"
          height="100"
        />
        <div className="ms-4 flex-grow-1">
          <h5 className="mb-1">{nama}</h5>
          <p className="mb-1 text-warning">{akun?.email}</p>
          <p className="mb-1">Total poin: {total_poin} Poin</p>
          <small className="text-muted">
            Terdaftar sejak {formatTanggal(tanggal_registrasi)}
          </small>
        </div>
        <Button variant="warning" className="ms-auto px-4 py-2 text-white">
          Edit Profil
        </Button>
      </Card>

      <div className="mt-4">
        <h2>History Transaksi</h2>
        <HistoryTransaksi />
      </div>
    </div>
  );
};

export default PembeliProfile;