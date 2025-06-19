import { useEffect, useState } from "react";

const CetakLaporanPenitipModal = ({ penitip, onCetak }) => {
    const [tahun, setTahun] = useState("");
    const [bulan, setBulan] = useState("");
    const [mode, setMode] = useState("Semua");

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

    useEffect(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
        setTahun(currentYear.toString());
        setBulan(currentMonth);

        // Ekstrak tahun dari tanggal registrasi penitip
        if (penitip?.tanggal_registrasi) {
            const tahunRegistrasi = new Date(penitip.tanggal_registrasi).getFullYear();
            const list = [];
            for (let t = tahunRegistrasi; t <= currentYear; t++) {
                list.push(t.toString());
            }
            setTahunList(list);
        }
    }, [penitip]);

    const handleCetak = () => {
        if(mode == "Sebagian") {
            onCetak(penitip?.id_penitip, tahun, bulan);
        } else {
            onCetak(penitip?.id_penitip, null, null);
        }
    }

    return (
        <>
            <div className="modal fade" id="cetak-laporan-penitip-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">Cetak Laporan Transaksi Penitip</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex flex-row justify-content-around">


                                {/* Dropdown Mode */}
                                <div>
                                    <p className="mb-0 me-3 fw-semibold">Tipe Laporan: </p>
                                    <div className="input-group mb-3">
                                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            {mode || "Pilih Jenis Laporan"}
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li><a className="dropdown-item" href="#" onClick={() => setMode("Semua")}>Semua</a></li>
                                            <li><a className="dropdown-item" href="#" onClick={() => setMode("Sebagian")}>Sebagian</a></li>
                                        </ul>
                                    </div>
                                </div>

                                {
                                    mode == "Semua" ? <></> : 
                                    <>

                                        {/* Dropdown Tahun */}
                                        <div>
                                            <p className="mb-0 me-3 fw-semibold">Tahun: </p>
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

                                        {/* Dropdown Bulan */}
                                        <div>
                                            <p className="mb-0 me-3 fw-semibold">Bulan: </p>
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
                                        </div>
                                    </>
                                }

                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                            <button type="button" className="btn btn-success" onClick={() => {handleCetak()}}>Cetak</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CetakLaporanPenitipModal;
