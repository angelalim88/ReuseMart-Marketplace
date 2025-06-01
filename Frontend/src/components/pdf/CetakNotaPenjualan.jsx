import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { apiPembelian } from "../../clients/PembelianService";

export const generateNotaPenjualan = async (id_pembelian) => {

  const extractIdNumber = (id) => {
    const match = id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const generateNotaNumber = (pembelian) => {
    const date = new Date(pembelian?.tanggal_pembelian);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const idPembelian = extractIdNumber(pembelian?.id_pembelian);

    return `${year}.${month}.${idPembelian}`;
  };

  const formatDateTime = (dateInput) => {
    const date = new Date(dateInput);
    
    const day = date.getDate(); // tanpa leading zero
    const month = date.getMonth() + 1; // bulan dimulai dari 0
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    
    const day = date.getDate(); // tanpa leading zero
    const month = date.getMonth() + 1; // bulan dimulai dari 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const formatMoney = (nominal) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(nominal));
    return formatted;
  }

  try {
    const pembelian = await apiPembelian.getPembelianById(id_pembelian);
    if(pembelian) {
      const doc = new jsPDF();
    
      // Judul
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ReUse Mart", 15, 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 15, 15);
    
      // Info Transaksi
      const detail = [
        ["No Nota             : ", `${generateNotaNumber(pembelian)}`],
        ["Tanggal pesan   : ", `${formatDateTime(pembelian?.tanggal_pembelian)}`],
        ["Lunas pada        : ", `${formatDateTime(pembelian?.tanggal_pelunasan)}`],
        ["Tanggal kirim     : ", `${formatDate(pembelian?.Pengiriman?.tanggal_mulai)}`],
      ];

      detail.forEach((item, index) => {
        doc.text(`${item[0]} ${item[1]}`, 15, 25 + index * 5);
      });
    
      // Info Pembeli
      doc.setFont("helvetica", "bold");
      doc.text("Pembeli : ", 15, 50);
      doc.setFont("helvetica", "normal");
      doc.text(`${pembelian?.Pembeli?.Akun?.email} / ${pembelian?.Pembeli?.nama}`, 35, 50);
      doc.text(`${pembelian?.AlamatPembeli?.alamat_lengkap}`, 15, 55);
      doc.text(`Delivery: Kurir ReUseMart (${pembelian?.Pengiriman?.Pegawai?.nama_pegawai})`, 15, 60);

      let products = [];

      pembelian?.SubPembelians.forEach(data => {
        products.push([data?.Barang?.nama, formatMoney(data?.Barang?.harga)]);
      });
    
      // Daftar Barang
      autoTable(doc, {
        startY: 70,
        theme: "plain",
        head: [["Barang", "Harga"]],
        body: products,
        styles: {
          fontSize: 10,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });
    
      let y = doc.lastAutoTable.finalY + 5;

      autoTable(doc, {
        startY: y,
        theme: "plain",
        head: [["", ""]],
        body: [
          ["Total", `${formatMoney(pembelian?.total_harga)}`],
          ["Ongkos Kirim", `${formatMoney(pembelian?.ongkir)}`],
          ["Total", `${formatMoney(pembelian?.total_harga + pembelian?.ongkir)}`],
          [`Potongan ${pembelian?.potongan_poin} poin`, `-${(pembelian?.potongan_poin/100)*10000}`],
          ["Total", `${pembelian?.total_bayar}`],
        ],
        styles: {
          fontSize: 10,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      y = doc.lastAutoTable.finalY + 15;
    
      // Poin
      doc.text(`Poin dari pesanan ini: ${pembelian?.poin_diperoleh}`, 15, y);
      y += 5;
      doc.text(`Total poin customer: ${pembelian?.Pembeli?.total_poin}`, 15, y);
    
      // QC
      y += 15;

      doc.text(`QC oleh: `, 15, y);
      const pegawaiSudahDitulis = new Set();

      pembelian?.SubPembelians.forEach(data => {
        const pegawai = data?.Barang?.PegawaiGudang;
        if (pegawai && !pegawaiSudahDitulis.has(pegawai.id_pegawai)) {
          pegawaiSudahDitulis.add(pegawai.id_pegawai);
          y += 5;
          doc.text(`${pegawai.nama_pegawai} (${pegawai.id_pegawai})`, 15, y);
        }
      });

      y += 20;
      doc.text("Diterima oleh:", 15, y);
      y += 35;
      doc.text("(.................................)", 15, y);
      y += 10;
      doc.text("Tanggal: ............................", 15, y);
    
      // Simpan PDF
      doc.save("nota-penjualan.pdf");
    }
  } catch (error) {
    toast.error("Gagal membuat pdf!");
    console.error("Gagal membuat pdf: ", error);
  }
};
