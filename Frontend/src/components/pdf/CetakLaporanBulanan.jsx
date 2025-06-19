import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CetakLaporanBulanan = ({ reportData, annualReportData, selectedMonth, selectedYear, months, formatCurrency, formatNumber, setShowModal }) => {
  
  const formatDateLong = (date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    // Header Company Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ReUse Mart", margin, 10);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", margin, 16);

    // Main Title
    doc.setFont("helvetica", "bold");
    const title = "LAPORAN PENJUALAN BULANAN";
    const titleY = 26;
    doc.text(title, margin, titleY);
    const textWidth = doc.getTextWidth(title);
    doc.setLineWidth(0.5);
    doc.line(margin, titleY + 1, margin + textWidth, titleY + 1);

    // Report Info
    doc.setFont("helvetica", "normal");
    doc.text(`Periode: ${months[selectedMonth - 1]} ${selectedYear}`, margin, 32);
    doc.text(`Tanggal cetak: ${formatDateLong(new Date())}`, margin, 38);

    let currentY = 48;

    // Summary Section
    doc.setFont("helvetica", "bold");
    doc.text("RINGKASAN KEUANGAN", margin, currentY);
    currentY += 2;

    // Draw underline for section title
    const summaryWidth = doc.getTextWidth("RINGKASAN KEUANGAN");
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, margin + summaryWidth, currentY);
    currentY += 8;

    // Summary Table
    const summaryData = [
      ["Total Pendapatan", formatCurrency(reportData.totalPendapatan)],
      ["Komisi Reusemart", formatCurrency(reportData.totalKomisiReusemart)],
      ["Komisi Hunter", formatCurrency(reportData.totalKomisiHunter)],
      ["Bonus Cepat", formatCurrency(reportData.totalBonusCepat)],
      ["Keuntungan Bersih", formatCurrency(reportData.keuntunganBersih)],
      ["Total Transaksi", formatNumber(reportData.totalTransaksi)],
      ["Rata-rata per Transaksi", formatCurrency(reportData.rataRataPendapatan)]
    ];

    autoTable(doc, {
      startY: currentY,
      body: summaryData,
      theme: 'plain',
      styles: {
        font: "helvetica",
        fontSize: 10,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'right', cellWidth: 50 }
      },
      margin: { left: margin, right: margin }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Daily Performance Section
    if (Array.isArray(reportData.dailyData) && reportData.dailyData.length > 0) {
      // Check if we need a new page
      if (currentY + 60 > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text("PERFORMA HARIAN", margin, currentY);
      currentY += 2;
      
      const dailyWidth = doc.getTextWidth("PERFORMA HARIAN");
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, margin + dailyWidth, currentY);
      currentY += 8;
      
      const dailyTableData = reportData.dailyData.map(day => [
        day.hari.toString(),
        formatCurrency(day.pendapatan),
        formatCurrency(day.keuntungan),
        formatNumber(day.transaksi),
        day.transaksi > 0 ? formatCurrency(day.pendapatan / day.transaksi) : formatCurrency(0)
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Tanggal', 'Pendapatan', 'Keuntungan', 'Transaksi', 'Rata-rata']],
        body: dailyTableData,
        theme: 'plain',
        styles: {
          font: "helvetica",
          fontSize: 9,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { halign: 'right', cellWidth: 35 },
          2: { halign: 'right', cellWidth: 35 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 35 }
        },
        margin: { left: margin, right: margin }
      });
      
      currentY = doc.lastAutoTable.finalY + 15;
    }
    
    // Weekly Summary Section
    if (Array.isArray(reportData.weeklyData) && reportData.weeklyData.length > 0) {
      if (currentY + 40 > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text("RINGKASAN MINGGUAN", margin, currentY);
      currentY += 2;
      
      const weeklyWidth = doc.getTextWidth("RINGKASAN MINGGUAN");
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, margin + weeklyWidth, currentY);
      currentY += 8;
      
      const weeklyTableData = reportData.weeklyData.map(week => [
        week.minggu,
        formatCurrency(week.pendapatan),
        formatCurrency(week.keuntungan),
        formatNumber(week.transaksi),
        week.transaksi > 0 ? formatCurrency(week.pendapatan / week.transaksi) : formatCurrency(0)
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Periode', 'Pendapatan', 'Keuntungan', 'Transaksi', 'Rata-rata']],
        body: weeklyTableData,
        theme: 'plain',
        styles: {
          font: "helvetica",
          fontSize: 9,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 40 },
          1: { halign: 'right', cellWidth: 35 },
          2: { halign: 'right', cellWidth: 35 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 35 }
        },
        margin: { left: margin, right: margin }
      });
      
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Annual Insights Section
    if (Array.isArray(annualReportData.monthlySummary) && annualReportData.monthlySummary.length > 0) {
      if (currentY + 70 > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text(`INSIGHT TAHUNAN ${selectedYear}`, margin, currentY);
      currentY += 2;
      
      const insightWidth = doc.getTextWidth(`INSIGHT TAHUNAN ${selectedYear}`);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, margin + insightWidth, currentY);
      currentY += 8;
      
      // Monthly Summary Table
      const monthlyTableData = annualReportData.monthlySummary.map(item => [
        item.bulan.substring(0, 3),
        formatNumber(item.itemSold),
        formatCurrency(item.totalPendapatan),
        formatNumber(item.totalTransaksi),
        formatCurrency(item.rataRataPendapatan)
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Bulan', 'Jumlah Barang Terjual', 'Jumlah Penjualan Kotor', 'Jumlah Transaksi', 'Rata-rata']],
        body: monthlyTableData,
        theme: 'plain',
        styles: {
          font: "helvetica",
          fontSize: 9,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { halign: 'right', cellWidth: 25 },
          2: { halign: 'right', cellWidth: 40 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 40 }
        },
        margin: { left: margin, right: margin }
      });
      
      currentY = doc.lastAutoTable.finalY + 15;

      // Charts Section
      const chartWidth = pageWidth - (margin * 2);
      const chartHeight = 50;
      const barWidth = (chartWidth - 20) / 12;

      // Bar Chart for Monthly Item Sales
      if (currentY + chartHeight + 30 > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text("GRAFIK BARANG TERJUAL PER BULAN", margin, currentY);
      currentY += 2;
      
      const chartTitleWidth = doc.getTextWidth("GRAFIK BARANG TERJUAL PER BULAN");
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, margin + chartTitleWidth, currentY);
      currentY += 10;

      const maxItems = Math.max(...annualReportData.monthlyItemSales.map(item => item.itemSold), 1);
      const yScaleItems = chartHeight / maxItems;
      const chartStartY = currentY;

      // Chart border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(margin, chartStartY, chartWidth, chartHeight);

      // Draw bars and labels
      annualReportData.monthlyItemSales.forEach((item, index) => {
        const x = margin + 10 + index * barWidth;
        const barHeight = item.itemSold * yScaleItems;
        
        // Bar
        doc.setFillColor(100, 100, 100);
        if (barHeight > 0) {
          doc.rect(x, chartStartY + chartHeight - barHeight, barWidth * 0.8, barHeight, 'F');
        }
        
        // X-axis labels
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.text(item.bulan.substring(0, 3), x + (barWidth * 0.4), chartStartY + chartHeight + 6, { align: 'center' });
        
        // Bar value labels
        if (item.itemSold > 0) {
          doc.setFontSize(6);
          doc.text(formatNumber(item.itemSold), x + (barWidth * 0.4), chartStartY + chartHeight - barHeight - 2, { align: 'center' });
        }
      });

      // Y-axis labels
      const yTicks = [0, Math.ceil(maxItems / 2), maxItems];
      yTicks.forEach(tick => {
        const y = chartStartY + chartHeight - (tick * yScaleItems);
        doc.setFontSize(7);
        doc.text(formatNumber(tick), margin - 2, y + 1, { align: 'right' });
        // Grid lines
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, y, margin + chartWidth, y);
      });

      currentY = chartStartY + chartHeight + 20;

      // Bar Chart for Monthly Revenue
      if (currentY + chartHeight + 30 > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text("GRAFIK PENDAPATAN PER BULAN", margin, currentY);
      currentY += 2;
      
      const revChartTitleWidth = doc.getTextWidth("GRAFIK PENDAPATAN PER BULAN");
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, margin + revChartTitleWidth, currentY);
      currentY += 10;

      const maxRevenue = Math.max(...annualReportData.monthlyItemSales.map(item => item.totalPendapatan), 1);
      const yScaleRevenue = chartHeight / maxRevenue;
      const revenueChartStartY = currentY;

      // Chart border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(margin, revenueChartStartY, chartWidth, chartHeight);

      // Draw bars and labels
      annualReportData.monthlyItemSales.forEach((item, index) => {
        const x = margin + 10 + index * barWidth;
        const barHeight = item.totalPendapatan * yScaleRevenue;
        
        // Bar
        doc.setFillColor(150, 150, 150);
        if (barHeight > 0) {
          doc.rect(x, revenueChartStartY + chartHeight - barHeight, barWidth * 0.8, barHeight, 'F');
        }
        
        // X-axis labels
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.text(item.bulan.substring(0, 3), x + (barWidth * 0.4), revenueChartStartY + chartHeight + 6, { align: 'center' });
        
        // Bar value labels
        if (item.totalPendapatan > 0) {
          doc.setFontSize(6);
          const value = item.totalPendapatan / 1000000;
          const label = value >= 1 ? `${value.toFixed(1)}M` : `${(value * 1000).toFixed(0)}K`;
          doc.text(label, x + (barWidth * 0.4), revenueChartStartY + chartHeight - barHeight - 2, { align: 'center' });
        }
      });

      // Y-axis labels
      const yTicksRevenue = [0, Math.ceil(maxRevenue / 2), maxRevenue];
      yTicksRevenue.forEach(tick => {
        const y = revenueChartStartY + chartHeight - (tick * yScaleRevenue);
        doc.setFontSize(7);
        const tickValue = tick / 1000000;
        const tickLabel = tickValue >= 1 ? `${tickValue.toFixed(1)}M` : `${(tickValue * 1000).toFixed(0)}K`;
        doc.text(tickLabel, margin - 2, y + 1, { align: 'right' });
        // Grid lines
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, y, margin + chartWidth, y);
      });

      currentY = revenueChartStartY + chartHeight + 15;
    }
    
    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Dicetak pada: ${formatDateLong(new Date())}`, margin, footerY);
    doc.text('ReuseMart - Sistem Laporan', pageWidth - margin, footerY, { align: 'right' });

    // Save PDF
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