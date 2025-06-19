import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export const CetakLaporanKategori = async (data, tahun = new Date().getFullYear()) => {
    try {
        const formatDateLong = (tgl) => {
            const date = new Date(tgl);
            if (isNaN(date)) return "Tanggal tidak valid";
            
            return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        };

        // Process data by category
        const processDataByCategory = () => {
            const categoryStats = {};
            
            data.forEach(item => {
                if (item.barang && item.barang.length > 0) {
                    item.barang.forEach(barang => {
                        const kategori = barang.kategori_barang;
                        const statusPembelian = item.status_pembelian;
                        
                        if (!categoryStats[kategori]) {
                            categoryStats[kategori] = {
                                terjual: 0,
                                gagalTerjual: 0
                            };
                        }
                        
                        if (statusPembelian === 'Pembayaran valid') {
                            categoryStats[kategori].terjual += 1;
                        } else if (statusPembelian === 'Pembayaran tidak valid') {
                            categoryStats[kategori].gagalTerjual += 1;
                        }
                    });
                }
            });
            
            return categoryStats;
        };

        const categoryData = processDataByCategory();
        
        if (Object.keys(categoryData).length === 0) {
            toast.error("Tidak ada data untuk dicetak");
            return;
        }

        const doc = new jsPDF();

        // Header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("ReUse Mart", 10, 10);
        doc.setFont("helvetica", "normal");
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 10, 16);

        // Title
        doc.setFont("helvetica", "bold");
        const title = "LAPORAN PENJUALAN PER KATEGORI BARANG";
        const pageWidth = doc.internal.pageSize.width;
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, 26);
        
        // Underline title
        doc.setLineWidth(0.5);
        doc.line(titleX, 27, titleX + titleWidth, 27);

        // Year and date
        doc.setFont("helvetica", "normal");
        doc.text(`Tahun : ${tahun}`, 10, 36);
        doc.text(`Tanggal cetak: ${formatDateLong(new Date())}`, 10, 42);

        // Prepare table data
        const tableData = [];
        let totalTerjual = 0;
        let totalGagal = 0;

        // Sort categories alphabetically
        const sortedCategories = Object.keys(categoryData).sort();
        
        sortedCategories.forEach(kategori => {
            const stats = categoryData[kategori];
            tableData.push([
                kategori,
                stats.terjual.toString(),
                stats.gagalTerjual.toString()
            ]);
            totalTerjual += stats.terjual;
            totalGagal += stats.gagalTerjual;
        });

        // Add total row
        tableData.push([
            'Total',
            totalTerjual.toString(),
            totalGagal.toString()
        ]);

        // Create table
        autoTable(doc, {
            startY: 50,
            head: [["Kategori", "Jumlah item terjual", "Jumlah item gagal terjual"]],
            body: tableData,
            theme: 'plain',
            styles: {
                font: "helvetica",
                fontSize: 10,
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                cellPadding: 3
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
                0: { halign: 'left' },   // Kategori - left align
                1: { halign: 'center' }, // Jumlah terjual - center
                2: { halign: 'center' }  // Jumlah gagal - center
            },
            didParseCell: function (data) {
                // Make total row bold
                if (data.row.index === tableData.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        // Save PDF
        const fileName = `LaporanPenjualanKategori_${tahun}.pdf`;
        doc.save(fileName);
        
        toast.success("Laporan PDF berhasil diunduh");

    } catch (error) {
        toast.error("Gagal membuat laporan PDF");
        console.error("Gagal membuat PDF:", error);
    }
};
