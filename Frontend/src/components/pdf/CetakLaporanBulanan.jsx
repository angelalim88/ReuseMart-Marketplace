import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CetakLaporanBulanan = ({ reportData, annualReportData, selectedMonth, selectedYear, months, formatCurrency, formatNumber, setShowModal }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15; // Margin konsisten untuk seluruh dokumen

    // Header
    doc.setFontSize(18);
    doc.setTextColor(2, 134, 67);
    doc.text('LAPORAN PENJUALAN REUSEMART', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(3, 8, 31);
    doc.text(`${months[selectedMonth - 1]} ${selectedYear}`, pageWidth / 2, 22, { align: 'center' });

    // Summary Box
    doc.setDrawColor(217, 217, 217);
    doc.setFillColor(249, 249, 249);
    doc.roundedRect(margin, 28, pageWidth - (margin * 2), 45, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(3, 8, 31);
    doc.text('RINGKASAN KEUANGAN', margin + 5, 35);
    doc.text(`Pendapatan: ${formatCurrency(reportData.totalPendapatan)}`, margin + 5, 43);
    doc.text(`Komisi Reusemart: ${formatCurrency(reportData.totalKomisiReusemart)}`, margin + 5, 50);
    doc.text(`Komisi Hunter: ${formatCurrency(reportData.totalKomisiHunter)}`, margin + 5, 57);
    doc.text(`Bonus Cepat: ${formatCurrency(reportData.totalBonusCepat)}`, margin + 5, 64);
    
    doc.setTextColor(2, 134, 67);
    doc.text(`Keuntungan Bersih: ${formatCurrency(reportData.keuntunganBersih)}`, pageWidth / 2 + 5, 43);
    
    doc.setTextColor(3, 8, 31);
    doc.text(`Transaksi: ${formatNumber(reportData.totalTransaksi)}`, pageWidth / 2 + 5, 53);
    doc.text(`Rata-rata/Transaksi: ${formatCurrency(reportData.rataRataPendapatan)}`, pageWidth / 2 + 5, 63);

    // Daily Performance Table
    let finalY = 78;
    if (Array.isArray(reportData.dailyData) && reportData.dailyData.length > 0) {
      doc.setFontSize(10);
      doc.text('PERFORMA HARIAN', margin, finalY);
      
      const tableData = reportData.dailyData.map(day => [
        day.hari.toString(),
        formatCurrency(day.pendapatan),
        formatCurrency(day.keuntungan),
        day.transaksi.toString()
      ]);
      
      autoTable(doc, {
        startY: finalY + 3,
        head: [['Tanggal', 'Pendapatan', 'Keuntungan', 'Transaksi']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [2, 134, 67],
          textColor: [255, 255, 255],
          fontSize: 9
        },
        bodyStyles: { fontSize: 8, cellPadding: 2 },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { cellWidth: 20 }, 3: { cellWidth: 20 } }
      });
      finalY = doc.lastAutoTable.finalY + 8; // Kurangi spacing
    }
    
    // Weekly Summary
    if (Array.isArray(reportData.weeklyData) && reportData.weeklyData.length > 0) {
      if (finalY + 40 > pageHeight - 20) {
        doc.addPage();
        finalY = 15;
      }
      doc.setFontSize(10);
      doc.text('RINGKASAN MINGGUAN', margin, finalY);
      
      const weeklyTableData = reportData.weeklyData.map(week => [
        week.minggu,
        formatCurrency(week.pendapatan),
        formatCurrency(week.keuntungan),
        week.transaksi.toString()
      ]);
      
      autoTable(doc, {
        startY: finalY + 3,
        head: [['Periode', 'Pendapatan', 'Keuntungan', 'Transaksi']],
        body: weeklyTableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [252, 138, 6],
          textColor: [255, 255, 255],
          fontSize: 9
        },
        bodyStyles: { fontSize: 8, cellPadding: 2 },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { cellWidth: 30 }, 3: { cellWidth: 20 } }
      });
      finalY = doc.lastAutoTable.finalY + 8; // Kurangi spacing
    }

    // Annual Sales Insights
    if (Array.isArray(annualReportData.monthlySummary) && annualReportData.monthlySummary.length > 0) {
      if (finalY + 70 > pageHeight - 20) {
        doc.addPage();
        finalY = 15;
      }
      doc.setFontSize(10);
      doc.text(`INSIGHT TAHUNAN ${selectedYear}`, margin, finalY);
      
      // Monthly Summary Table
      const monthlyTableData = annualReportData.monthlySummary.map(item => [
        item.bulan.substring(0, 3),
        formatNumber(item.itemSold),
        formatCurrency(item.totalPendapatan),
        formatNumber(item.totalTransaksi),
        formatCurrency(item.rataRataPendapatan)
      ]);
      
      autoTable(doc, {
        startY: finalY + 3,
        head: [['Bulan', 'Terjual', 'Pendapatan', 'Transaksi', 'Rata-rata']],
        body: monthlyTableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [2, 134, 67],
          textColor: [255, 255, 255],
          fontSize: 9
        },
        bodyStyles: { fontSize: 8, cellPadding: 2 },
        margin: { left: margin, right: margin },
        columnStyles: { 
          0: { cellWidth: 20 }, 
          1: { cellWidth: 20 }, 
          3: { cellWidth: 20 }, 
          4: { cellWidth: 40 }
        }
      });
      
      finalY = doc.lastAutoTable.finalY + 8; // Kurangi spacing

      // Chart Configuration
      const chartWidth = pageWidth - (margin * 2);
      const chartHeight = 45; // Tinggi chart lebih konsisten
      const barWidth = chartWidth / 12 / 1.3;

      // Bar Chart for Monthly Item Sales
      if (finalY + chartHeight + 20 > pageHeight - 20) {
        doc.addPage();
        finalY = 15;
      }
      
      // Title dengan spacing yang lebih baik
      doc.setFontSize(10);
      doc.setTextColor(3, 8, 31);
      doc.text('BARANG TERJUAL PER BULAN', margin, finalY);
      finalY += 8; // Spacing antara title dan chart

      const maxItems = Math.max(...annualReportData.monthlyItemSales.map(item => item.itemSold), 1);
      const yScaleItems = chartHeight / maxItems;

      // Chart background
      doc.setFillColor(249, 249, 249);
      doc.rect(margin, finalY, chartWidth, chartHeight, 'F');

      // Draw axes
      doc.setDrawColor(3, 8, 31);
      doc.setLineWidth(0.5);
      doc.line(margin, finalY + chartHeight, margin, finalY); // Y-axis
      doc.line(margin, finalY + chartHeight, margin + chartWidth, finalY + chartHeight); // X-axis

      // Draw bars and labels
      annualReportData.monthlyItemSales.forEach((item, index) => {
        const x = margin + index * (barWidth * 1.3) + 8; // Lebih center
        const barHeight = item.itemSold * yScaleItems;
        
        // Bar dengan gradient effect
        doc.setFillColor(2, 134, 67);
        if (barHeight > 0) {
          doc.rect(x, finalY + chartHeight - barHeight, barWidth, barHeight, 'F');
        }
        
        // X-axis labels
        doc.setFontSize(7);
        doc.setTextColor(3, 8, 31);
        doc.text(item.bulan.substring(0, 3), x + barWidth / 2, finalY + chartHeight + 6, { align: 'center' });
        
        // Bar value labels
        if (item.itemSold > 0) {
          doc.setFontSize(6);
          doc.setTextColor(255, 255, 255);
          doc.text(formatNumber(item.itemSold), x + barWidth / 2, finalY + chartHeight - barHeight / 2, { align: 'center' });
        }
      });

      // Y-axis labels dengan format yang lebih baik
      const yTicksItems = [0, Math.ceil(maxItems / 2), maxItems];
      yTicksItems.forEach(tick => {
        const y = finalY + chartHeight - (tick * yScaleItems);
        doc.setFontSize(7);
        doc.setTextColor(3, 8, 31);
        doc.text(formatNumber(tick), margin - 3, y + 1, { align: 'right' });
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, margin + chartWidth, y); // Grid line
      });

      finalY += chartHeight + 12; // Spacing setelah chart

      // Bar Chart for Monthly Revenue
      if (finalY + chartHeight + 20 > pageHeight - 20) {
        doc.addPage();
        finalY = 15;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(3, 8, 31);
      doc.text('PENDAPATAN PER BULAN', margin, finalY);
      finalY += 8;

      const maxRevenue = Math.max(...annualReportData.monthlyItemSales.map(item => item.totalPendapatan), 1);
      const yScaleRevenue = chartHeight / maxRevenue;

      // Chart background
      doc.setFillColor(249, 249, 249);
      doc.rect(margin, finalY, chartWidth, chartHeight, 'F');

      // Draw axes
      doc.setDrawColor(3, 8, 31);
      doc.setLineWidth(0.5);
      doc.line(margin, finalY + chartHeight, margin, finalY); // Y-axis
      doc.line(margin, finalY + chartHeight, margin + chartWidth, finalY + chartHeight); // X-axis

      // Draw bars and labels
      annualReportData.monthlyItemSales.forEach((item, index) => {
        const x = margin + index * (barWidth * 1.3) + 8;
        const barHeight = item.totalPendapatan * yScaleRevenue;
        
        // Bar dengan warna yang lebih menarik
        doc.setFillColor(252, 138, 6);
        if (barHeight > 0) {
          doc.rect(x, finalY + chartHeight - barHeight, barWidth, barHeight, 'F');
        }
        
        // X-axis labels
        doc.setFontSize(7);
        doc.setTextColor(3, 8, 31);
        doc.text(item.bulan.substring(0, 3), x + barWidth / 2, finalY + chartHeight + 6, { align: 'center' });
        
        // Bar value labels
        if (item.totalPendapatan > 0) {
          doc.setFontSize(6);
          doc.setTextColor(255, 255, 255);
          const value = item.totalPendapatan / 1000000; // Convert to millions
          const label = value >= 1 ? `${value.toFixed(1)}M` : `${(value * 1000).toFixed(0)}K`;
          doc.text(label, x + barWidth / 2, finalY + chartHeight - barHeight / 2, { align: 'center' });
        }
      });

      // Y-axis labels dengan format yang lebih baik
      const yTicksRevenue = [0, Math.ceil(maxRevenue / 2), maxRevenue];
      yTicksRevenue.forEach(tick => {
        const y = finalY + chartHeight - (tick * yScaleRevenue);
        doc.setFontSize(7);
        doc.setTextColor(3, 8, 31);
        const tickValue = tick / 1000000;
        const tickLabel = tickValue >= 1 ? `${tickValue.toFixed(1)}M` : `${(tickValue * 1000).toFixed(0)}K`;
        doc.text(tickLabel, margin - 3, y + 1, { align: 'right' });
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, margin + chartWidth, y); // Grid line
      });

      finalY += chartHeight + 8;
    }
    
    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Dibuat: ${new Date().toLocaleDateString('id-ID')}`, margin, footerY);
    doc.text('ReuseMart', pageWidth - margin, footerY, { align: 'right' });

    doc.save(`Laporan-Penjualan-${months[selectedMonth - 1]}-${selectedYear}.pdf`);
    setShowModal(false);
  };

  return (
    <Button 
      onClick={generatePDF}
      className="view-btn"
    >
      📥 Download PDF
    </Button>
  );
};

export default CetakLaporanBulanan;