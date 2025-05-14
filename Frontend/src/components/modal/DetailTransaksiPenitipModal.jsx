import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GetAllPegawai } from '../../clients/PegawaiService';

const DetailTransaksiPenitipModal = ({data}) => {
    const [dataTransaksi, setDataTransaksi] = useState(null);
    const [dataPegawai, setDataPegawai] = useState([]);
    // const [pegawaiGudang, setPegawaiGudang] = useState(null);
    // const [hunter, setHunter] = useState(null);
    // const [customerService, setCustomerService] = useState(null);
    // const [kurir, setKurir] = useState(null);

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

    const getAllPegawai = async () => {
        try {
            const response = await GetAllPegawai();
            setDataPegawai(response.data);
        } catch (error) {
            console.error("Gagal mengambil data pegawai!", error);
            toast.error("Gagal mengambil data pegawai!");
        }
    }

    const getNamaPegawaiById = (idPegawai) => {
        if(dataPegawai.length != 0) {
            const pegawai = dataPegawai.find(p => p.id_pegawai === idPegawai);
            return pegawai ? pegawai.nama_pegawai : null;
        } else {
            return;
        }
    };

    useEffect(() => {
        if(data) setDataTransaksi(data);
    }, [data]);

    useEffect(() => {
        getAllPegawai();
    }, [])

    return <>
        <div class="modal fade" id="detail-transaksi-penitip-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Detail Transaksi</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                        {dataTransaksi?.barang.map((b, i) => (
                    <div className="card border p-4 d-flex flex-column align-items-start justify-content-center mb-4">
                            <div className='w-100 d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start align-items-center'>
                            <a href={`http://localhost:5173/barang/${b.id_barang}`} className="align-self-center align-self-md-start">
                                <img src={`http://localhost:3000/uploads/barang/${b.gambar.split(',')[0]}`} alt="gambar-produk" className='rounded-circle ' style={{
                                minWidth: '50px',
                                maxWidth: '150px',
                                aspectRatio: '1/1',
                                }}/>
                            </a>
                            <div>

                            <p className='fw-bold fs-5'>{b.nama}</p>

                            <p className="fw-bold">Detail barang:</p>
                            <ul>
                                <li>ID Barang: {b.id_barang}</li>
                                <li>Kategori: {b.kategori_barang}</li>
                                <li>Deskripsi: {b.deskripsi}</li>
                                {b.tanggal_garansi ? <li>Tanggal Garansi: {formatDate(b.tanggal_garansi)}</li> : <></>}
                                <li>Harga: Rp. {formatMoney(b.harga)}</li>
                                <li>Berat: {b.berat} kg</li>
                                <li>Status QC: {b.status_qc.toLowerCase() == 'lulus' ? <p className="badge text-bg-success mb-0">{b.status_qc}</p> : <p className="badge text-bg-danger mb-0">{b.status_qc}</p>}</li>
                                <li>Penanggung Jawab QC: {getNamaPegawaiById(b.id_pegawai_gudang)}</li>
                                {b.id_hunter ? <li>Hunter Penanggung Jawab: {getNamaPegawaiById(b.id_hunter)}</li> : <></>}
                                
                            </ul>

                            <p className="fw-bold">Detail Pembelian:</p>
                            <ul>
                                <li>ID Pembelian: {dataTransaksi.pembelian.id_pembelian}</li>
                                <li>Tanggal Pembelian: {formatDate(dataTransaksi.pembelian.tanggal_pembelian)}, {formatTime(dataTransaksi.pembelian.tanggal_pembelian)}</li>
                                <li>Pembeli: {dataTransaksi.pembelian.Pembeli.nama}</li>
                                <li>Alamat: {dataTransaksi.pembelian.AlamatPembeli.alamat_lengkap}</li>
                                <li>Status Pembayaran: {dataTransaksi.pembelian.status_pembelian}</li>
                                <li>Penanggung Jawab: {getNamaPegawaiById(dataTransaksi.pembelian.id_customer_service)}</li>
                            </ul>

                            <p className="fw-bold">Detail Pengiriman:</p>
                            <ul>
                                <li>ID Pengiriman: {dataTransaksi.pengiriman.id_pengiriman}</li>
                                {dataTransaksi.pengiriman.tanggal_mulai ? <li>Tanggal Mulai: {formatDate(dataTransaksi.pengiriman.tanggal_mulai)}</li> : <></>}
                                {dataTransaksi.pengiriman.tanggal_berakhir ? <li>Tanggal Berakhir: {formatDate(dataTransaksi.pengiriman.tanggal_berakhir)}</li> : <></>}
                                <li>Status Pengiriman: {dataTransaksi.pengiriman.status_pengiriman}</li>
                                <li>Jenis Pengiriman: {dataTransaksi.pengiriman.jenis_pengiriman}</li>
                                <li>Penanggung Jawab: {getNamaPegawaiById(dataTransaksi.pengiriman.id_pengkonfirmasi)}</li>
                            </ul>

                            <p className="fw-bold">Detail transaksi:</p>
                            {
                                b.transaksi == null ? 
                                <ul>
                                    <li>Transaksi dibatalkan</li>
                                </ul> 
                                : 
                                <>
                                    <ul>
                                        <li>ID Transaksi: {b.transaksi.id_transaksi}</li>
                                        <li>Pendapatan: Rp. {formatMoney(b.transaksi.pendapatan)}</li>
                                        <li>Komisi Reusemart: Rp. {formatMoney(b.transaksi.komisi_reusemart)}</li>
                                        <li>Komisi Hunter: Rp. {formatMoney(b.transaksi.komisi_hunter)}</li>
                                        <li>Bonus Terjual Cepat: Rp. {formatMoney(b.transaksi.bonus_cepat)}</li>
                                    </ul>
                                </>
                            }
                            </div>
                        </div>
                    </div>
                        ) )}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
                </div>
            </div>
        </div>
    </>
}

export default DetailTransaksiPenitipModal;