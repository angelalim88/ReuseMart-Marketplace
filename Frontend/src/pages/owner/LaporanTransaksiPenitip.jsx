import { useCallback, useEffect, useMemo, useState } from "react";
import { apiPembelian } from "../../clients/PembelianService";
import { toast } from "sonner";
import CetakLaporanPenitipModal from "../../components/modal/CetakLaporanPenitipModal";
import { CetakLaporanTransaksi } from "../../components/pdf/CetakLaporanTransaksi";
import Pagination from "../../components/pagination/Pagination";

const LaporanTransaksiPenitip = () => {
    const [pembelian, setPembelian] = useState([]);
    const [selectedPenitip, setSelectedPenitip] = useState(null);
    const [penitip, setPenitip] = useState([]);
    const [tahun, setTahun] = useState("");
    const [bulan, setBulan] = useState("");
    const [mode, setMode] = useState("Semua");
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const bulanList = [
        { nama: "Januari", value: "01" },
        { nama: "Februari", value: "02" },
        { nama: "Maret", value: "03" },
        { nama: "April", value: "04" },
        { nama: "Mei", value: "05" },
        { nama: "Juni", value: "06" },
        { nama: "Juli", value: "07" },
        { nama: "Agustus", value: "08" },
        { nama: "September", value: "09" },
        { nama: "Oktober", value: "10" },
        { nama: "November", value: "11" },
        { nama: "Desember", value: "12" },
    ];

    const [tahunList, setTahunList] = useState([]);
    
    const filtered = useMemo(() => {
        return mode == "Semua" ? pembelian : pembelian.filter((pbl) => {
            const tgl = new Date(pbl.tanggal_pembelian);
            const matchBulan = bulan ? tgl.getMonth() + 1 === parseInt(bulan) : true;
            const matchTahun = tahun ? tgl.getFullYear() === parseInt(tahun) : true;
            const valid = pbl?.status_pembelian == "Pembayaran valid" && 
                        (pbl?.Pengiriman?.status_pengiriman == "Selesai" || 
                        pbl?.Pengiriman?.status_pengiriman == "Tidak diambil");
            return matchBulan && matchTahun && valid;
        });
    }, [pembelian, mode, bulan, tahun]);

    const getUniquePenitip = () => {
        const penitipMap = new Map();

        if(filtered) {
            filtered.forEach((pbl) => {
                pbl.SubPembelians?.forEach((sub) => {
                    const penitip = sub?.Barang?.Penitip;
                    if (penitip && !penitipMap.has(penitip.id_penitip)) {
                        penitipMap.set(penitip.id_penitip, penitip);
                    }
                });
            });
        }

        return Array.from(penitipMap.values());
    };

    const filterPenitip = useCallback(() => {
        const unique = getUniquePenitip();
        setPenitip(unique);
    }, [filtered]);

    useEffect(() => {
        filterPenitip();
    }, [filtered]);

    const filteredPenitip = keyword == "" ? penitip : penitip.filter((p) => {
        return (p?.id_penitip.toLowerCase().includes(keyword.toLowerCase())) || (p?.nama_penitip.toLowerCase().includes(keyword.toLowerCase()));
    });

    const setTimeDropdown = () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
        setTahun(currentYear.toString());
        setBulan(currentMonth);
    
        // Ekstrak tahun dari tanggal registrasi penitip
        const list = [];
        for (let t = 2024; t <= currentYear; t++) {
            list.push(t.toString());
        }
        setTahunList(list);
    }

    useEffect(() => {
        setTimeDropdown();
    }, [pembelian]);

    useEffect(() => {
        console.log("Ganti mode");
    }, [mode]);

    const fetchPembelian = async () => {
        try {
            const response = await apiPembelian.getAllPembelian();
            if(response) {
                setPembelian(response);
                console.log('hasil catch', response);
            }
        } catch (error) {
            console.error("Gagal mengambil data, ", error);
            toast.error("Gagal mengambil data!");
        }
    }

    useEffect(() => {
        fetchPembelian();
    }, []);

    const handleCetakLaporanTransaksiPenitip = (id_penitip, tahun, bulan) => {
        CetakLaporanTransaksi(bulan, tahun, id_penitip);
    }

    const paginatedPenitip = filteredPenitip.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredPenitip.length / itemsPerPage);

    return <>
        <div className="container mt-3">
            <h3 className="fw-bold">Laporan Transaksi Penitip</h3>
            <div className="d-flex flex-row gap-1 w-100 justify-content-start align-items-start flex-wrap">
                <div className="flex-grow-1">
                    <div class="input-group mb-3 ">
                        <input type="text" class="form-control" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                    </div>
                </div>

                <div className="d-flex flex-row gap-1">
                    <div className="input-group mb-3">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {mode || "Pilih Jenis Laporan"}
                        </button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" onClick={() => setMode("Semua")}>Semua</a></li>
                            <li><a className="dropdown-item" onClick={() => setMode("Sebagian")}>Sebagian</a></li>
                        </ul>
                    </div>

                    {
                        mode == "Semua" ? <></> :
                            <>
                                {/* Dropdown Tahun */}
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
                                {/* Dropdown Bulan */}
                                <div className="input-group mb-3">
                                    <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {bulanList.find((b) => b.value === bulan)?.nama || "Pilih Bulan"}
                                    </button>
                                    <ul className="dropdown-menu">
                                        {bulanList.map((b) => (
                                            <li key={b.value}>
                                                <a className="dropdown-item" href="#" onClick={() => setBulan(b.value)}>
                                                    {b.nama}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                    }
                </div>
            </div>

            <div className="d-flex flex-column">
                {
                    penitip.length == 0 ? <>
                    <h5 className="text-center">Belum ada penitip yang memiliki transaksi</h5>
                    </> 
                    : 
                    <>
                        {
                            paginatedPenitip.map((p) => {
                                return <div class="card mb-2">
                                    <div class="card-body">
                                        <div className="d-flex flex-row justify-content-between align-items-center">
                                            <div>
                                                <h5 class="card-title">{p?.nama_penitip}</h5>
                                                <p class="card-text">ID Penitip: {p?.id_penitip}</p>
                                            </div>
                                            <div>
                                                <button className='btn btn-success' type='button' data-bs-toggle="modal" data-bs-target="#cetak-laporan-penitip-modal" onClick={() => setSelectedPenitip(p)}>Cetak Laporan Transaksi Penitip</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                    </>
                }

                {
                    penitip.length != 0 && filteredPenitip.length == 0 ? <h5 className="text-center">Penitip tidak ditemukan</h5> : <></>
                }
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={(numberPage) => setCurrentPage(numberPage)}
            />
        </div>
        <CetakLaporanPenitipModal penitip={selectedPenitip} onCetak={handleCetakLaporanTransaksiPenitip}/>
    </>
}

export default LaporanTransaksiPenitip;