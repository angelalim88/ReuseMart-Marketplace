import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CetakLaporanStokGudang = ({ summaryData, filteredData, formatCurrency, formatNumber, formatWeight, getStatusBadge, statusColors, colors }) => {
  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : '-';
  };

  const generatePDF = () => {
    const doc = new jsPDF({ 
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // Brand Colors
    const primaryColor = [2, 134, 67];
    const secondaryColor = [3, 8, 31];
    const lightGray = [245, 245, 245];
    const borderColor = [200, 200, 200];

    // Header Section
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('LAPORAN STOK GUDANG REUSEMART', pageWidth / 2, 25, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    doc.text(`Periode: ${new Date().toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })}`, pageWidth / 2, 35, { align: 'center' });

    // Divider line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(margin, 40, pageWidth - margin, 40);

    // Summary Section dengan design yang lebih modern
    const summaryY = 50;
    const summaryHeight = 45;
    
    // Background untuk summary
    doc.setFillColor(...lightGray);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, summaryY, pageWidth - (margin * 2), summaryHeight, 3, 3, 'FD');
    
    // Title summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('RINGKASAN BARANG', margin + 10, summaryY + 12);
    
    // Summary content dalam 2 kolom
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    
    const col1X = margin + 10;
    const col2X = pageWidth / 2 + 10;
    const summaryLineHeight = 8;
    
    // Kolom 1
    doc.text(`Total Barang: ${formatNumber(summaryData.totalPenitipan)} item`, col1X, summaryY + 25);
    doc.text(`Total Nilai Stok: ${formatCurrency(summaryData.totalNilaiStok)}`, col1X, summaryY + 25 + summaryLineHeight);
    
    // Kolom 2
    doc.text(`Total Berat Stok: ${formatWeight(summaryData.totalBeratStok)}`, col2X, summaryY + 25);
    doc.text(`Penitipan Perpanjangan: ${formatNumber(summaryData.penitipanPerpanjangan)} item`, col2X, summaryY + 25 + summaryLineHeight);

    // Detail Table Section
    if (Array.isArray(filteredData) && filteredData.length > 0) {
      const tableStartY = summaryY + summaryHeight + 20;
      
      // Table title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('DETAIL BARANG', margin, tableStartY - 5);
      
      const tableData = filteredData.map((item, index) => [
        (index + 1).toString(), // No urut
        item.Barang?.id_barang || '-',
        item.Barang?.nama || '-',
        item.Barang?.Penitip?.id_penitip || '-',
        item.Barang?.Penitip?.nama_penitip || '-',
        formatDate(item.tanggal_awal_penitipan),
        item.perpanjangan ? 'Ya' : 'Tidak',
        item.Barang?.Hunter?.nama_pegawai || '-',
        formatCurrency(item.Barang?.harga || 0)
      ]);
      
      autoTable(doc, {
        startY: tableStartY,
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
            'Harga (Rp)'
          ]
        ],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: { top: 6, right: 4, bottom: 6, left: 4 }
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
          valign: 'middle',
          textColor: secondaryColor
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { 
          left: margin, 
          right: margin,
          top: 10,
          bottom: 30
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' }, // No
          1: { cellWidth: 25, halign: 'center' }, // Kode Produk
          2: { cellWidth: 45, halign: 'left' },   // Nama Produk
          3: { cellWidth: 20, halign: 'center' }, // ID Penitip
          4: { cellWidth: 35, halign: 'left' },   // Nama Penitip
          5: { cellWidth: 30, halign: 'center' }, // Tanggal
          6: { cellWidth: 20, halign: 'center' }, // Perpanjangan
          7: { cellWidth: 30, halign: 'left' },   // Hunter
          8: { cellWidth: 30, halign: 'right' }   // Harga
        },
        tableLineColor: borderColor,
        tableLineWidth: 0.3,
        didDrawCell: (data) => {
          // Highlight perpanjangan "Ya"
          if (data.column.index === 6 && data.cell.text[0] === 'Ya') {
            doc.setFillColor(255, 235, 59);
            doc.setDrawColor(...borderColor);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(...secondaryColor);
            doc.setFontSize(9);
            doc.text('Ya', data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2 + 2, { align: 'center' });
          }
        }
      });
    }

    // Footer dengan design yang lebih baik
    const footerY = pageHeight - 15;
    
    // Footer background
    doc.setFillColor(...lightGray);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(margin, footerY - 8, pageWidth - (margin * 2), 12, 'FD');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.text(`Laporan dibuat pada: ${currentDate}`, margin + 5, footerY - 2);
    doc.text('ReuseMart - Sistem Manajemen Penitipan Gudang', pageWidth - margin - 5, footerY - 2, { align: 'right' });
    
    // Page number
    doc.text(`Halaman 1`, pageWidth / 2, footerY - 2, { align: 'center' });
    
    // Save PDF dengan nama yang lebih descriptive
    const fileName = `Laporan-Penitipan-Gudang-${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button 
      onClick={generatePDF}
      className="view-btn"
    >
      Export PDF
    </Button>
  );
};

export default CetakLaporanStokGudang;