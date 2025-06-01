import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from '../../assets/images/logo.png';

const CetakNotaPengambilan = ({ show, handleClose, penitipan }) => {
  const formatPrice = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let yPosition = 15;

      const logoWidth = 35;
      const logoHeight = logoWidth * 0.6;
      const logoX = (pageWidth - logoWidth) / 2;
      try {
        doc.addImage(Logo, 'PNG', logoX, yPosition, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Logo failed to load, using placeholder text');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Your Company Name', logoX, yPosition + 10);
      }
      yPosition += logoHeight + 10;

      doc.setFillColor(2, 134, 67);
      doc.rect(0, 0, pageWidth, 4, 'F');
      doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(2, 134, 67);
      doc.text('NOTA PENGAMBILAN BARANG', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(74, 74, 74);
      doc.text('"Kualitas Terjamin, QC Terbaik"', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setDrawColor(2, 134, 67);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(2, 134, 67);
      doc.text('Detail Pengambilan', margin, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Field', 'Value']],
        body: [
          ['ID Penitipan', penitipan?.id_penitipan || '-'],
          ['Tanggal Awal Penitipan', formatDate(penitipan?.tanggal_awal_penitipan) || '-'],
          ['Tanggal Akhir Penitipan', formatDate(penitipan?.tanggal_akhir_penitipan) || '-'],
          ['Batas Pengambilan', formatDate(penitipan?.tanggal_batas_pengambilan) || '-'],
          ['Status Penitipan', penitipan?.status_penitipan || '-'],
          ['ID Pengiriman', penitipan?.pengiriman?.id_pengiriman || '-'],
          ['Jenis Pengiriman', penitipan?.pengiriman?.jenis_pengiriman || '-'],
          ['Status Pengiriman', penitipan?.pengiriman?.status_pengiriman || '-'],
          ['Tanggal Mulai Pengiriman', formatDate(penitipan?.pengiriman?.tanggal_mulai) || '-'],
          ['Tanggal Berakhir Pengiriman', formatDate(penitipan?.pengiriman?.tanggal_berakhir) || '-'],
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
        headStyles: {
          fillColor: [2, 134, 67],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: { fillColor: [245, 252, 248] },
      });
      yPosition = doc.lastAutoTable.finalY + 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(2, 134, 67);
      doc.text('Detail Barang', margin, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Field', 'Value']],
        body: [
          ['ID Barang', penitipan?.Barang?.id_barang || '-'],
          ['Nama', penitipan?.Barang?.nama || '-'],
          ['Harga', formatPrice(penitipan?.Barang?.harga || 0)],
          ['Berat', `${penitipan?.Barang?.berat || '-'} kg`],
          ['Kategori', penitipan?.Barang?.kategori_barang || '-'],
          ['Status QC', penitipan?.Barang?.status_qc || '-'],
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
        headStyles: {
          fillColor: [2, 134, 67],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: { fillColor: [245, 252, 248] },
      });
      yPosition = doc.lastAutoTable.finalY + 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(2, 134, 67);
      doc.text('Detail Penitip', margin, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Field', 'Value']],
        body: [
          ['Nama', penitipan?.Barang?.Penitip?.nama_penitip || '-'],
          ['Nomor KTP', penitipan?.Barang?.Penitip?.nomor_ktp || '-'],
          ['Email', penitipan?.Barang?.Penitip?.Akun?.email || '-'],
          ['Tanggal Registrasi', formatDate(penitipan?.Barang?.Penitip?.tanggal_registrasi) || '-'],
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
        headStyles: {
          fillColor: [2, 134, 67],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: { fillColor: [245, 252, 248] },
      });
      yPosition = doc.lastAutoTable.finalY + 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(2, 134, 67);
      doc.text('Detail Pembeli', margin, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Field', 'Value']],
        body: [
          ['Nama Pembeli', penitipan?.pembelian?.pembeli?.nama || '-'],
          ['Alamat Pengiriman', penitipan?.pembelian?.alamat?.alamat_lengkap || '-'],
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
        headStyles: {
          fillColor: [2, 134, 67],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: { fillColor: [245, 252, 248] },
      });
      yPosition = doc.lastAutoTable.finalY + 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(74, 74, 74);
      doc.text(
        `Dibuat pada: ${formatDate(new Date())}`,
        margin,
        pageHeight - 10
      );

      doc.save(`Nota_Pengambilan_${penitipan?.id_penitipan || 'unknown'}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Gagal menghasilkan PDF. Silakan coba lagi.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="shadow-lg">
      <Modal.Header closeButton className="bg-success text-white border-0">
        <Modal.Title className="fw-bold">Cetak Nota Pengambilan</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="text-center mb-3">
          <h6 className="fw-bold">ID: {penitipan?.id_penitipan || '-'}</h6>
        </div>
        <div className="card p-3 border-success shadow-sm">
          <p className="mb-2">
            <strong>Nama Barang:</strong> {penitipan?.Barang?.nama || '-'}
          </p>
          <p className="mb-2">
            <strong>Penitip:</strong> {penitipan?.Barang?.Penitip?.nama_penitip || '-'}
          </p>
          <p className="mb-2">
            <strong>Pembeli:</strong> {penitipan?.pembelian?.pembeli?.nama || '-'}
          </p>
          <p className="mb-0">
            <strong>Status:</strong> {penitipan?.status_penitipan || '-'}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={handleClose} className="rounded-pill">
          Batal
        </Button>
        <Button variant="success" onClick={generatePDF} className="rounded-pill">
          <i className="bi bi-file-pdf me-2"></i>Cetak Nota
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CetakNotaPengambilan;