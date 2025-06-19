import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { apiPembelian } from "../../clients/PembelianService";
import { GetPenitipById } from "../../clients/PenitipService";

export const CetakLaporanTransaksi = async (bulan, tahun, id_penitip) => {
    try {
        const pembelian = await apiPembelian.getPembelianByPenitipId(id_penitip);
        const penitipResponse = await GetPenitipById(id_penitip);
        const penitip = penitipResponse.data;

        // Fungsi bantu konversi tanggal dan nama bulan
        const formatDate = (tgl) =>
            new Date(tgl).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });

        const formatDateShort = (tgl) => {
            let date;

            if (typeof tgl === "string" && tgl.includes("/")) {
                const [day, month, year] = tgl.split("/");
                date = new Date(`${year}-${month}-${day}`);
            } else {
                date = new Date(tgl);
            }

            if (isNaN(date)) return "Tanggal tidak valid";

            const day = String(date.getDate());
            const month = String(date.getMonth() + 1);
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        };
        
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

        const getNamaBulan = (n) =>
            new Date(2000, n - 1).toLocaleString("id-ID", { month: "long" });

        // Filter berdasarkan bulan & tahun
        const filtered = (tahun != null && bulan != null) ? 
        pembelian.filter((pbl) => {
            const tgl = new Date(pbl.tanggal_pembelian);
            const matchBulan = bulan ? tgl.getMonth() + 1 === parseInt(bulan) : true;
            const matchTahun = tahun ? tgl.getFullYear() === parseInt(tahun) : true;
            return matchBulan && matchTahun;
        }) : pembelian;

        const doc = new jsPDF();

        // Informasi umum penitip
        const namaPenitip = penitip?.nama_penitip
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("ReUse Mart", 10, 10);
        doc.setFont("helvetica", "normal");
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 10, 16);

        doc.setFont("helvetica", "bold");
        const title = "LAPORAN TRANSAKSI PENITIP";
        const x = 10;
        const y = 26;
        doc.text(title, x, y);
        const textWidth = doc.getTextWidth(title);
        doc.setLineWidth(0.5);
        doc.line(x, y + 1, x + textWidth, y + 1);

        doc.setFont("helvetica", "normal");
        doc.text(`ID Penitip : ${id_penitip}`, 10, 32);
        doc.text(`Nama Penitip : ${namaPenitip}`, 10, 38);
        if (bulan && tahun) {
            doc.text(`Bulan : ${getNamaBulan(bulan)}`, 10, 44);
            doc.text(`Tahun : ${tahun}`, 10, 50);
        } else {
            doc.text("Bulan : -", 10, 44);
            doc.text("Tahun : -", 10, 50);
        }
        doc.text(`Tanggal cetak: ${formatDateLong(new Date())}`, 10, 56);

        // Buat tabel transaksi
        const tableBody = filtered.map((pbl) => {
            let data = [];
            pbl.SubPembelians.forEach(spbl => {
                if(spbl?.Barang?.id_penitip == id_penitip) {
                    const barang = spbl?.Barang;
                    const pembelian = pbl;
                    const hargaBersih =
                        parseFloat(spbl?.Barang?.harga || 0) -
                        parseFloat(spbl?.Transaksi?.komisi_reusemart || 0) -
                        parseFloat(spbl?.Transaksi?.komisi_hunter || 0);
                    const bonus = parseFloat(spbl?.Transaksi?.bonus_cepat || 0);
                    const pendapatan = hargaBersih + bonus;
                    
                    data = [
                        barang?.id_barang || "-",
                        barang?.nama || "-",
                        formatDateShort(spbl?.Barang?.Penitipan?.tanggal_awal_penitipan),
                        formatDateShort(pbl?.tanggal_pembelian),
                        hargaBersih.toLocaleString("id-ID"),
                        bonus.toLocaleString("id-ID"),
                        pendapatan.toLocaleString("id-ID"),
                    ];
                }
            });
            
            return data;
        });

        // Hitung total
        const totalHargaBersih = tableBody.reduce(
            (sum, row) => sum + parseInt(row[4].replace(/\./g, "")), 0
        );
        const totalBonus = tableBody.reduce(
            (sum, row) => sum + parseInt(row[5].replace(/\./g, "")), 0
        );
        const totalPendapatan = tableBody.reduce(
            (sum, row) => sum + parseInt(row[6].replace(/\./g, "")), 0
        );

        tableBody.push([
            { content: "TOTAL", colSpan: 4, styles: { halign: "center", fontStyle: "bold" } },
            totalHargaBersih.toLocaleString("id-ID"),
            totalBonus.toLocaleString("id-ID"),
            totalPendapatan.toLocaleString("id-ID"),
        ]);

        autoTable(doc, {
            startY: 64,
            head: [[
                "Kode Produk",
                "Nama Produk",
                "Tanggal Masuk",
                "Tanggal Laku",
                "Harga Jual Bersih (sudah dipotong Komisi)",
                "Bonus terjual cepat",
                "Pendapatan"
            ]],
            theme: 'plain',
            styles: {
                font: "helvetica",
                fontSize: 10,
                lineColor: [0, 0, 0],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [255, 255, 255], // hindari warna latar belakang header
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            bodyStyles: {
                textColor: [0, 0, 0]
            },
            body: tableBody,
        });

        doc.save(`Laporan_Transaksi_Penitip_${id_penitip}.pdf`);
    } catch (error) {
        toast.error("Gagal membuat laporan PDF.");
        console.error("Gagal membuat PDF:", error);
    }
};
