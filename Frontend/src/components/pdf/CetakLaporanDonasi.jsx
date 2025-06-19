import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { GetAllDonasiBarang } from "../../clients/DonasiBarangService";

export const CetakLaporanDonasi = async (tahun) => {

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

    try {
        const response = await GetAllDonasiBarang();
        const donasi = response.data;

        if (donasi) {
            const donasiFiltered = tahun
            ? donasi.filter((item) => {
                const indoYear = new Date(item.tanggal_donasi).toLocaleDateString(
                    "id-ID",
                    {
                        timeZone: "Asia/Jakarta",
                        year: "numeric",
                    }
                );
                return parseInt(indoYear) === parseInt(tahun);
            })
            : donasi;

            const doc = new jsPDF();
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("ReUse Mart", 10, 10);
            doc.setFont("helvetica", "normal");
            doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 10, 16);

            doc.setFont("helvetica", "bold");
            const title = "LAPORAN DONASI BARANG";
            const x = 10;
            const y = 26;
            doc.text(title, x, y);
            const textWidth = doc.getTextWidth(title);
            doc.setLineWidth(0.5);
            doc.line(x, y + 1, x + textWidth, y + 1);

            doc.setFont("helvetica", "normal");
            doc.text(`Tahun : ${tahun || "-"}`, 10, 32);
            doc.text(`Tanggal cetak: ${formatDateLong(new Date())}`, 10, 38);

            console.log(donasiFiltered);
            

            const tableData = donasiFiltered.map((item) => {
                const barang = item.Barang;
                const penitip = barang?.Penitip;

                return [
                    item?.Barang?.id_barang || "-",
                    item?.Barang?.nama || "-",
                    item?.Barang?.Penitip?.id_penitip || "-",
                    item?.Barang?.Penitip?.nama_penitip || "-",
                    formatDateShort(item.tanggal_donasi),
                    item?.RequestDonasi?.OrganisasiAmal?.nama_organisasi || "-",
                    item?.nama_penerima || "-",
                ];
            });

            autoTable(doc, {
                startY: 45,
                head: [
                    [
                        "Kode Produk",
                        "Nama Produk",
                        "Id Penitip",
                        "Nama Penitip",
                        "Tanggal Donasi",
                        "Organisasi",
                        "Nama Penerima",
                    ],
                ],
                body: tableData,
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
                }
            });

            doc.save(`LaporanDonasiBarang_${tahun || "Semua"}.pdf`);
        }
    } catch (error) {
        toast.error("Gagal membuat pdf!");
        console.error("Gagal membuat pdf: ", error);
    }
};
