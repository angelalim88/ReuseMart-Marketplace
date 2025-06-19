import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GetAllDonasiBarang } from '../../clients/DonasiBarangService';
import { CetakLaporanDonasi } from '../../components/pdf/CetakLaporanDonasi';
import Pagination from "../../components/pagination/Pagination";

const LaporanDonasi = () => {
  const [donasi, setDonasi] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [tahun, setTahun] = useState("Semua");
  const [tahunList, setTahunList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      const response = await GetAllDonasiBarang();
      if (response) {
        setDonasi(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data: ", error);
      toast.error("Gagal mengambil data!");
    }
  }

  const setTimeDropdown = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const list = ["Semua"];
    for (let t = currentYear; t >= 2024; t--) {
      list.push(t.toString());
    }
    setTahunList(list);
  }

  const handleCetakLaporanDonasi = () => {
    if (tahun == "Semua") {
      CetakLaporanDonasi(null);
    } else {
      CetakLaporanDonasi(tahun);
    }
  }

  const formatDateLong = (tgl) => {
    let date;

    if (typeof tgl === "string" && tgl.includes("/")) {
        const [day, month, year] = tgl.split("/");
        date = new Date(`${year}-${month}-${day}`);
    } else {
        date = new Date(tgl);
    }

    if (isNaN(date)) return "Tanggal tidak valid";

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
  };

  const filtered = tahun === "Semua" ? donasi : donasi.filter((d) => {
    const date = new Date(d?.tanggal_donasi);
    return !isNaN(date) && date.getFullYear().toString() === tahun;
  });

  const searchRessult = keyword.length == 0 ? filtered : filtered.filter((d) => {
    return d?.Barang?.nama.toLowerCase().includes(keyword.toLowerCase()) || d?.RequestDonasi?.OrganisasiAmal?.nama_organisasi.toLowerCase().includes(keyword.toLowerCase());
  });

  useEffect(() => {
    setTimeDropdown();
  }, [donasi]);

  useEffect(() => {
    fetchData();
  }, []);

  const paginated = searchRessult.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(searchRessult.length / itemsPerPage);

  return (
    <div className="container">
      <h3 className="fw-bold">Laporan Donasi</h3>
      <div className="d-flex flex-row gap-1 w-100 justify-content-start align-items-start flex-wrap">
        <div className="flex-grow-1">
          <div class="input-group mb-3 ">
            <input type="text" class="form-control" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
        </div>

        <div className="d-flex flex-row gap-1">
          <div className="input-group mb-3">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              {tahun || "Pilih Tahun"}
            </button>
            <ul className="dropdown-menu">
              {tahunList.map((t) => (
                <li key={t}>
                  <a className="dropdown-item" href="#" onClick={() => setTahun(t)}>
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button className="btn btn-success" onClick={handleCetakLaporanDonasi}>Cetak Laporan Donasi</button>
      </div>

      <div className="d-flex flex-column">
        {
          donasi.length == 0 ? <>
            <h5 className="text-center">Belum donasi barang yang dilakukan</h5>
          </>
            :
            <>
              {
                paginated.map((d) => {
                  return <div class="card mb-2">
                    <div class="card-body">
                      <h5 class="card-title">{d?.id_donasi_barang}</h5>
                      <p class="card-text">Organisasi: {d?.RequestDonasi?.OrganisasiAmal?.nama_organisasi}</p>
                      <p className="card-text">Request: {d?.RequestDonasi?.deskripsi_request}</p>
                      <p className="card-text">Tanggal donasi: {formatDateLong(d?.tanggal_donasi)}</p>
                      <p className="card-text">Barang donasi: <a href={`http://localhost:5173/barang/${d?.Barang?.id_barang}`}>{d?.Barang?.nama}</a></p>
                    </div>
                  </div>
                })
              }
            </>
        }

        {
          donasi.length != 0 && searchRessult.length == 0 ? <h5 className="text-center">Donasi barang tidak ditemukan</h5> : <></>
        }
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={(numberPage) => setCurrentPage(numberPage)}
      />
    </div>
  );
};

export default LaporanDonasi;