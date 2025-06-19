import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';

const CetakLaporanKomisi = ({ filteredData, summaryData, penitipanData, formatCurrency, formatNumber, formatDate, period }) => {
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ReUse Mart', 14, 10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Green Eco Park No. 456 Yogyakarta', 14, 16);

    // Title
    doc.setFont('helvetica', 'bold');
    const title = 'LAPORAN KOMISI BULANAN';
    const titleX = 14;
    const titleY = 26;
    doc.text(title, titleX, titleY);
    const textWidth = doc.getTextWidth(title);
    doc.setLineWidth(0.5);
    doc.line(titleX, titleY + 1, titleX + textWidth, titleY + 1);

    // Period and Print Date
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${period}`, 14, 32);
    doc.text(`Tanggal Cetak: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`, 14, 38);

    // Summary Table
    const summaryTableData = [
      ['Total Transaksi', formatNumber(summaryData.totalTransaksi)],
      ['Komisi Hunter', formatCurrency(summaryData.totalKomisiHunter)],
      ['Komisi ReUse Mart', formatCurrency(summaryData.totalKomisiReusemart)],
      ['Bonus Penitip', formatCurrency(summaryData.totalBonusCepat)],
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Keterangan', 'Nilai']],
      body: summaryTableData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [2, 134, 67],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 100, halign: 'right' },
      },
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // Detail Table
    if (Array.isArray(filteredData) && filteredData.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('DETAIL KOMISI PER PRODUK', 14, currentY);
      currentY += 5;

      const totalHargaJual = filteredData.reduce((sum, item) => sum + (parseFloat(item.SubPembelian?.Pembelian?.total_harga) || 0), 0);
      const totalKomisiHunter = filteredData.reduce((sum, item) => sum + (parseFloat(item.komisi_hunter) || 0), 0);
      const totalKomisiReusemart = filteredData.reduce((sum, item) => sum + (parseFloat(item.komisi_reusemart) || 0), 0);
      const totalBonusCepat = filteredData.reduce((sum, item) => sum + (parseFloat(item.bonus_cepat) || 0), 0);

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
        formatCurrency(item.bonus_cepat || 0),
      ]);

      const footerData = [
        ['', '', '', 'TOTAL',
          formatCurrency(totalHargaJual),
          '', '',
          formatCurrency(totalKomisiHunter),
          formatCurrency(totalKomisiReusemart),
          formatCurrency(totalBonusCepat)],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Kode', 'Nama Produk', 'Kategori', 'Harga Jual', 'Tgl Masuk', 'Tgl Laku', 'Komisi Hunter', 'Komisi ReUse', 'Bonus Penitip']],
        body: [...tableData, ...footerData],
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 9,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [2, 134, 67],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: {
          textColor: [0, 0, 0],
        },
        didParseCell: (data) => {
          if (data.row.index === tableData.length && data.section === 'body') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 50 },
          3: { cellWidth: 30, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 22, halign: 'center' },
          6: { cellWidth: 22, halign: 'center' },
          7: { cellWidth: 25, halign: 'right' },
          8: { cellWidth: 25, halign: 'right' },
          9: { cellWidth: 25, halign: 'right' },
        },
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      doc.text(`Laporan Komisi - ${period}`, 14, doc.internal.pageSize.height - 10);
    }

    const fileName = `LaporanKomisi_${period.replace(/\s/g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button
      onClick={generatePDF}
      className="view-btn d-flex align-items-center gap-2"
      aria-label="Ekspor laporan ke PDF"
    >
      <span>📄</span>
      Export PDF
    </Button>
  );
};

CetakLaporanKomisi.propTypes = {
  filteredData: PropTypes.array.isRequired,
  summaryData: PropTypes.shape({
    totalTransaksi: PropTypes.number,
    totalKomisiHunter: PropTypes.number,
    totalKomisiReusemart: PropTypes.number,
    totalBonusCepat: PropTypes.number,
    kategoriDistribusi: PropTypes.array,
    statusDistribusi: PropTypes.array,
  }).isRequired,
  penitipanData: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatNumber: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  period: PropTypes.string.isRequired,
};

export default CetakLaporanKomisi;