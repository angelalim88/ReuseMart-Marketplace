import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PropTypes from 'prop-types';

const CetakLaporanStokGudang = ({ summaryData, filteredData, formatCurrency, formatNumber, formatWeight, getStatusBadge, statusColors, colors }) => {
  const formatDateShort = (tgl) => {
    if (!tgl) return '-';
    let date;
    try {
      if (typeof tgl === 'string' && tgl.includes('/')) {
        const [day, month, year] = tgl.split('/');
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        date = new Date(tgl);
      }
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  const formatDateLong = (tgl) => {
    if (!tgl) return '-';
    let date;
    try {
      if (typeof tgl === 'string' && tgl.includes('/')) {
        const [day, month, year] = tgl.split('/');
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        date = new Date(tgl);
      }
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ReUse Mart', 14, 10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Green Eco Park No. 456 Yogyakarta', 14, 16);

    // Title with underline
    doc.setFont('helvetica', 'bold');
    const title = 'LAPORAN STOK GUDANG - DALAM MASA PENITIPAN';
    const titleX = 14;
    const titleY = 26;
    doc.text(title, titleX, titleY);
    const textWidth = doc.getTextWidth(title);
    doc.setLineWidth(0.5);
    doc.line(titleX, titleY + 1, titleX + textWidth, titleY + 1);

    // Period and print date
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date();
    doc.text(`Periode: ${formatDateLong(currentDate)}`, 14, 32);
    doc.text(`Tanggal Cetak: ${formatDateLong(currentDate)}`, 14, 38);

    // Summary table
    const summaryTableData = [
      ['Total Barang', `${formatNumber(summaryData.totalPenitipan)} item`],
      ['Total Nilai Stok', formatCurrency(summaryData.totalNilaiStok)],
      ['Total Berat Stok', formatWeight(summaryData.totalBeratStok)],
      ['Penitipan Perpanjangan', `${formatNumber(summaryData.penitipanPerpanjangan)} item`],
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
        fillColor: [2, 134, 67], // Match colors.primary (#028643)
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

    // Detail Barang
    const dalamMasaPenitipanData = filteredData.filter(
      (item) => item.status_penitipan === 'Dalam masa penitipan'
    );

    if (dalamMasaPenitipanData.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('DETAIL BARANG DALAM MASA PENITIPAN', 14, currentY);
      currentY += 5;

      const tableData = dalamMasaPenitipanData.map((item, index) => [
        (index + 1).toString(),
        item.Barang?.id_barang || '-',
        item.Barang?.nama || '-',
        item.Barang?.Penitip?.id_penitip || '-',
        item.Barang?.Penitip?.nama_penitip || '-',
        formatDateShort(item.tanggal_awal_penitipan),
        item.perpanjangan ? 'Ya' : 'Tidak',
        item.Barang?.Hunter?.nama_pegawai || '-',
        formatCurrency(item.Barang?.harga || 0),
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            'No',
            'Kode Produk',
            'Nama Produk',
            'ID Penitip',
            'Nama Penitip',
            'Tanggal Masuk',
            'Perpanjangan',
            'Hunter',
            'Harga',
          ],
        ],
        body: tableData,
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
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 45 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 35 },
          5: { cellWidth: 30, halign: 'center' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 30 },
          8: { cellWidth: 30, halign: 'right' },
        },
      });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Tidak ada barang dengan status "Dalam masa penitipan" untuk periode ini.', 14, currentY);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      doc.text(`Laporan Stok Gudang - Dalam Masa Penitipan`, 14, doc.internal.pageSize.height - 10);
    }

    const fileName = `LaporanStokGudang_DalamMasaPenitipan_${currentDate.toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button
      onClick={generatePDF}
      className="view-btn"
      aria-label="Ekspor laporan stok gudang ke PDF"
    >
      Export PDF
    </Button>
  );
};

CetakLaporanStokGudang.propTypes = {
  summaryData: PropTypes.shape({
    totalPenitipan: PropTypes.number,
    totalNilaiStok: PropTypes.number,
    totalBeratStok: PropTypes.number,
    penitipanPerpanjangan: PropTypes.number,
  }).isRequired,
  filteredData: PropTypes.arrayOf(
    PropTypes.shape({
      Barang: PropTypes.shape({
        id_barang: PropTypes.string,
        nama: PropTypes.string,
        harga: PropTypes.number,
        Penitip: PropTypes.shape({
          id_penitip: PropTypes.string,
          nama_penitip: PropTypes.string,
        }),
        Hunter: PropTypes.shape({
          nama_pegawai: PropTypes.string,
        }),
      }),
      tanggal_awal_penitipan: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      perpanjangan: PropTypes.bool,
      status_penitipan: PropTypes.string,
    })
  ).isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatNumber: PropTypes.func.isRequired,
  formatWeight: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired,
  statusColors: PropTypes.object.isRequired,
  colors: PropTypes.shape({
    primary: PropTypes.string,
    secondary: PropTypes.string,
    white: PropTypes.string,
    dark: PropTypes.string,
    gray: PropTypes.string,
    muted: PropTypes.string,
  }).isRequired,
};

export default CetakLaporanStokGudang;