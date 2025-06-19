// src/components/pdf/CetakLaporanPenitipanHabis.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export const CetakLaporanPenitipanHabis = async (data) => {
  try {
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Filter: Masa penitipan habis (tanggal_akhir_penitipan < hari ini)
    const today = new Date();
    const filtered = data.filter(item => {
      const tglAkhir = new Date(item.tanggal_akhir_penitipan);
      return tglAkhir < today;
    });

    if (filtered.length === 0) {
      toast.error("Tidak ada data penitipan habis untuk dicetak.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ReUse Mart", 10, 10);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 10, 16);

    doc.setFont("helvetica", "bold");
    const title = "LAPORAN Barang yang Masa Penitipannya Sudah Habis";
    doc.text(title, 10, 26);
    doc.setLineWidth(0.5);
    doc.line(10, 27, 10 + doc.getTextWidth(title), 27);

    doc.setFont("helvetica", "normal");
    const now = new Date();
    const tglCetak = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    doc.text(`Tanggal cetak: ${tglCetak}`, 10, 34);

    const tableData = filtered.map(item => [
      item.Barang?.id_barang || '-',
      item.Barang?.nama || '-',
      item.Barang?.Penitip?.id_penitip || '-',
      item.Barang?.Penitip?.nama_penitip || '-',
      formatDate(item.tanggal_awal_penitipan),
      formatDate(item.tanggal_akhir_penitipan),
      formatDate(item.tanggal_batas_pengambilan),
    ]);

    autoTable(doc, {
      startY: 42,
      head: [[
        "Kode Produk",
        "Nama Produk",
        "Id Penitip",
        "Nama Penitip",
        "Tanggal Masuk",
        "Tanggal Akhir",
        "Batas Ambil"
      ]],
      body: tableData,
      theme: 'plain',
      styles: {
        font: "helvetica",
        fontSize: 10,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'left' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
      }
    });

    doc.save("LaporanPenitipanHabis.pdf");
    toast.success("Laporan PDF berhasil diunduh");
  } catch (error) {
    toast.error("Gagal membuat laporan PDF");
    console.error("Gagal membuat PDF:", error);
  }
};
