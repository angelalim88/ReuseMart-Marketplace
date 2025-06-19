import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CetakLaporanKomisi = ({ filteredData, summaryData, penitipanData, formatCurrency, formatNumber, formatDate }) => {
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Colors
    const primaryColor = [2, 134, 67];
    const secondaryColor = [252, 138, 6];
    const darkColor = [3, 8, 31];
    const grayColor = [128, 128, 128];
    const lightGray = [249, 249, 249];

    // Header
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.text('LAPORAN KOMISI REUSEMART', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    const currentDate = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    doc.text(`Periode: ${currentDate}`, pageWidth / 2, 22, { align: 'center' });

    // Summary Box
    doc.setDrawColor(217, 217, 217);
    doc.setFillColor(...lightGray);
    doc.roundedRect(10, 28, pageWidth - 20, 45, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.text('RINGKASAN KOMISI', 15, 35);
    
    const summaryStartY = 43;
    const col1X = 25;
    const col2X = (pageWidth / 2) + 10;
    
    // Column 1
    doc.setFont('helvetica', 'bold');
    doc.text('Total Transaksi:', col1X, summaryStartY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryColor);
    doc.text(formatNumber(summaryData.totalTransaksi), col1X + 35, summaryStartY);
    
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Komisi Hunter:', col1X, summaryStartY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text(formatCurrency(summaryData.totalKomisiHunter), col1X + 35, summaryStartY + 7);
    
    // Column 2
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Komisi ReUse Mart:', col2X, summaryStartY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryColor);
    doc.text(formatCurrency(summaryData.totalKomisiReusemart), col2X + 40, summaryStartY);
    
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Bonus Penitip:', col2X, summaryStartY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text(formatCurrency(summaryData.totalBonusCepat), col2X + 40, summaryStartY + 7);

    // Detail Table Section
    let yPos = 78;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('DETAIL KOMISI PER PRODUK', 10, yPos);
    
    yPos += 3;

    if (Array.isArray(filteredData) && filteredData.length > 0) {
      // Calculate totals
      const totalHargaJual = filteredData.reduce((sum, item) => sum + parseFloat(item.SubPembelian?.Pembelian?.total_harga || 0), 0);
      const totalKomisiHunter = filteredData.reduce((sum, item) => sum + parseFloat(item.komisi_hunter || 0), 0);
      const totalKomisiReusemart = filteredData.reduce((sum, item) => sum + parseFloat(item.komisi_reusemart || 0), 0);
      const totalBonusCepat = filteredData.reduce((sum, item) => sum + parseFloat(item.bonus_cepat || 0), 0);

      const tableData = filteredData.map((item, index) => [
        (index + 1).toString(),
        item.SubPembelian?.id_barang || '-',
        item.SubPembelian?.Barang?.nama || '-',
        item.SubPembelian?.Barang?.kategori_barang || '-',
        formatCurrency(item.SubPembelian?.Pembelian?.total_harga || 0),
        formatDate(penitipanData[item.SubPembelian?.id_barang]) || '-',
        formatDate(item.SubPembelian?.Pembelian?.tanggal_pelunasan) || '-',
        formatCurrency(item.komisi_hunter || 0),
        formatCurrency(item.komisi_reusemart || 0),
        formatCurrency(item.bonus_cepat || 0)
      ]);

      const tableFoot = [
        [
          '', // No
          '', // Kode
          '', // Nama Produk
          'Total', // Kategori (used as label)
          formatCurrency(totalHargaJual), // Harga Jual
          '', // Tgl Masuk
          '', // Tgl Laku
          formatCurrency(totalKomisiHunter), // Komisi Hunter
          formatCurrency(totalKomisiReusemart), // Komisi ReUse
          formatCurrency(totalBonusCepat) // Bonus Penitip
        ]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['No', 'Kode', 'Nama Produk', 'Kategori', 'Harga Jual', 'Tgl Masuk', 'Tgl Laku', 'Komisi Hunter', 'Komisi ReUse', 'Bonus Penitip']],
        body: tableData,
        foot: tableFoot,
        theme: 'striped',
        headStyles: { 
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        footStyles: {
          fillColor: lightGray,
          textColor: darkColor,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' }, // No
          1: { cellWidth: 18, halign: 'center' }, // Kode
          2: { cellWidth: 50, halign: 'left' },   // Nama Produk
          3: { cellWidth: 30, halign: 'center' }, // Kategori
          4: { cellWidth: 25, halign: 'right' },  // Harga Jual
          5: { cellWidth: 22, halign: 'center' }, // Tgl Masuk
          6: { cellWidth: 22, halign: 'center' }, // Tgl Laku
          7: { cellWidth: 25, halign: 'right' },  // Komisi Hunter
          8: { cellWidth: 25, halign: 'right' },  // Komisi ReUse
          9: { cellWidth: 25, halign: 'right' }   // Bonus Penitip
        },
        styles: {
          overflow: 'linebreak',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        margin: { left: 10, right: 10 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
        didDrawPage: (data) => {
          // Add page number
          doc.setFontSize(8);
          doc.setTextColor(...grayColor);
          doc.text(
            `Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${doc.internal.getNumberOfPages()}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...grayColor);
      doc.text('Tidak ada data transaksi untuk ditampilkan', pageWidth / 2, yPos + 20, { align: 'center' });
    }

    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(`Dibuat: ${new Date().toLocaleDateString('id-ID')} - ReUseMart`, 10, footerY);
    doc.text('www.reusemart.co.id', pageWidth - 10, footerY, { align: 'right' });

    // Save PDF
    const fileName = `Laporan-Komisi-${currentDate.replace(/\s/g, '-')}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button 
      onClick={generatePDF}
      className="view-btn d-flex align-items-center gap-2"
      style={{
        backgroundColor: '#028643',
        borderColor: '#028643',
        fontWeight: '500',
        borderRadius: '6px',
        padding: '8px 16px'
      }}
    >
      <span>📄</span>
      Export PDF
    </Button>
  );
};

export default CetakLaporanKomisi;