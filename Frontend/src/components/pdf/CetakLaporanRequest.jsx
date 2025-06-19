import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { GetAllRequestDonasi } from "../../clients/RequestDonasiService";

export const CetakLaporanRequest = async () => {
    try {

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

        const request = await GetAllRequestDonasi();

        if (request.data && Array.isArray(request.data)) {
            const filtered = request.data.filter(
                (r) =>
                    r.status_request === "Diterima" &&
                    (!r.DonasiBarang)
            );

            const doc = new jsPDF();

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("ReUse Mart", 10, 10);
            doc.setFont("helvetica", "normal");
            doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 10, 16);

            doc.setFont("helvetica", "bold");
            doc.setFont("helvetica", "bold");
            const title = "LAPORAN REQUEST DONASI";
            const x = 10;
            const y = 26;
            doc.text(title, x, y);
            const textWidth = doc.getTextWidth(title);
            doc.setLineWidth(0.5);
            doc.line(x, y + 1, x + textWidth, y + 1);

            doc.setFont("helvetica", "normal");
            doc.text(`Tanggal cetak: ${formatDateLong(new Date())}`, 10, 32);

            const tableData = filtered.map((item) => [
                item?.OrganisasiAmal?.id_organisasi,
                item?.OrganisasiAmal?.nama_organisasi || "-",
                item?.OrganisasiAmal?.alamat,
                item?.deskripsi_request,
            ]);

            autoTable(doc, {
                startY: 40,
                head: [["ID Organisasi", "Nama", "Alamat", "Request"]],
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
                },
            });

            doc.save("LaporanRequestBelumTerpenuhi.pdf");
        }
    } catch (error) {
        toast.error("Gagal membuat laporan PDF.");
        console.error("Gagal membuat PDF:", error);
    }
};
