import React, { useState } from 'react';
import { useEffect } from 'react';
import { GetPegawaiByAkunId } from '../../clients/PegawaiService';
import { toast } from "sonner";
import { decodeToken } from '../../utils/jwtUtils';
import { GetAllDiskusiProduk, UpdateDiskusiProduk } from '../../clients/DiskusiProdukService';
import AnswerDiskusiModal from '../../components/modal/AnswerDiskusiModal';
import Pagination from "../../components/pagination/Pagination";

const OwnerPage = () => {
  const [customerService, setCustomerService] = useState(null);
  const [akun, setAkun] = useState(null);
  const [filter, setFilter] = useState("Semua");
  const [keyword, setKeyword] = useState("");
  const [diskusi, setDiskusi] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }
      
      const decoded = decodeToken(token);
      setAkun(decoded);
      
      if (!decoded?.id) {
        throw new Error("Invalid token structure");
      }

      const response = await GetPegawaiByAkunId(decoded?.id);
      if(response) {
        console.log(response.data);
        setCustomerService(response.data);
      }
      else {
        throw new Error("Failed fetch pegawai data");
      }
    } catch (err) {
      toast.error("Gagal memuat data user!");
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [])

  const fetchDiskusiProduk = async () => {
    try {
      const response = await GetAllDiskusiProduk();
      if(response) {
        setDiskusi(response.data);
        console.log(response.data);
      } else {
        throw new Error("Gagal fetch data diskusi!");
      }
    } catch (error) {
      toast.error("Gagal memuat data diskusi!");
      console.error("Error:", err);
    }
  }

  useEffect(() => {
    fetchDiskusiProduk();
  }, [customerService])

  const onSubmitjawaban = async (jawaban) => {
    try {
      const id_diskusi_produk = selectedDiscussion?.id_diskusi_produk;
      const id_customer_service = customerService.id_pegawai;
      
      const data = {
        jawaban: jawaban,
        id_customer_service: id_customer_service,
      }
      await UpdateDiskusiProduk(id_diskusi_produk, data);
      await fetchDiskusiProduk();
    } catch (error) {
      console.error("Gagal menambahkan jawaban: ", error);
      toast.error("Gagal menambahkan jawaban!");
    }
  }

  const filtered = diskusi.filter((d) => {
    if(filter == "Semua") {
      return d;
    } else if(filter == "Sudah Dijawab") {
      return d?.jawaban != null && d?.jawaban != "";
    } else if(filter == "Belum Dijawab") {
      return d?.jawaban == null || d?.jawaban == "";
    } else {
      return;
    }
  });

  const searched = filtered.filter((d) => {
    if(keyword == "") {
      return d;
    } else {
      return d?.Barang?.nama.toLowerCase().includes(keyword.toLowerCase());
    }
  });

  const paginated = searched.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const totalPages =  Math.ceil(searched.length / itemsPerPage);

  const formatDateTime = (dateTimeString) => {
      const date = new Date(dateTimeString);
      return new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      }).format(date);
  };

  return <>
    <div className="max-width-container mx-auto pt-4 px-3" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9f9f9' }}>
      <h4 className="fw-bold mb-4">Halaman Diskusi Produk</h4>

      <div class="input-group mb-3">
        <input type="text" class="form-control" aria-label="Text input with dropdown button" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">{filter}</button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class={`dropdown-item ${filter == "Semua" ? "fw-bold" : ""}`} href="#" onClick={() => {setFilter("Semua"); setCurrentPage(1);}}>Semua</a></li>
          <li><a class={`dropdown-item ${filter == "Sudah Dijawab" ? "fw-bold" : ""}`} href="#" onClick={() => {setFilter("Sudah Dijawab"); setCurrentPage(1);}}>Sudah Dijawab</a></li>
          <li><a class={`dropdown-item ${filter == "Belum Dijawab" ? "fw-bold" : ""}`} href="#" onClick={() => {setFilter("Belum Dijawab"); setCurrentPage(1);}}>Belum Dijawab</a></li>
        </ul>
      </div>

      <div className="d-flex flex-column w-100">
        {
          diskusi ? 
          paginated.map((data) => {
            return <div class="card my-1">
              <div class="card-body">
                <a href={`http://localhost:5173/barang/${data?.Barang?.id_barang}`} style={{color: "black", textDecoration: "none"}}>
                  <h5 class="card-title fw-bold" >{data?.Barang?.nama}</h5>
                </a>

                <div className='mb-2'>
                  <p class="card-text mb-0">{data?.Pembeli?.nama}: {data?.pertanyaan}</p>
                  <span className='text-secondary' style={{ fontSize: "0.8rem"}}>{formatDateTime(data?.tanggal_pertanyaan)}</span>
                </div>
                {data?.jawaban ? 
                <div className='mb-2'>
                  <p class="card-text mb-0">{data?.Pegawai?.nama_pegawai} (CS) : {data?.jawaban}</p> 
                  <span className='text-secondary' style={{ fontSize: "0.8rem"}}>{formatDateTime(data?.tanggal_jawaban)}</span>
                </div>
                : 
                <></>}
                
                <div className="d-flex w-100 flex-row justify-content-end">
                  {data?.jawaban == "" || data?.jawaban == null ? 
                    <button className='btn btn-success' onClick={() => setSelectedDiscussion(data)} type="button" data-bs-toggle="modal" data-bs-target="#answer-diskusi-modal">Jawab</button>
                    :
                    <></>
                  }
                </div>
              </div>
            </div>
          })
          : 
          <h5 className='fw-bold text-center my-3'>Belum ada diskusi produk</h5>
        }
      </div>
      
      {filtered.length > 0 && (
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={(numberPage) => setCurrentPage(numberPage)}
        />
      )}
    </div>

    <AnswerDiskusiModal onSubmit={onSubmitjawaban} />
  </>
};

export default OwnerPage;