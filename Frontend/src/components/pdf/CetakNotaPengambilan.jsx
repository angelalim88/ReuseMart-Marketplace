import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from '../../assets/images/logo.png';

const CetakNotaPengambilan = ({ show, handleClose, transaksi }) => {
  const formatPrice = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDateTime = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) : '-';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }) : '-';
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
        console.warn('Logo failed to load');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('ReUse Mart', logoX, yPosition + 10);
      }
      yPosition += logoHeight + 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(74, 74, 74);
      doc.text('Jl. Green Eco Park No. 456 Yogyakarta', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(2, 134, 67);
      doc.text('NOTA PENGAMBILAN BARANG', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setDrawColor(2, 134, 67);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [['Field', 'Value']],
        body: [
          ['No Nota', transaksi?.no_nota || '-'],
          ['Tanggal Pesan', formatDateTime(transaksi?.tanggal_pembelian) || '-'],
          ['Lunas Pada', formatDateTime(transaksi?.tanggal_pelunasan) || '-'],
          ['Tanggal Kirim', formatDate(transaksi?.pengiriman?.tanggal_mulai) || '-'],
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [2, 134, 67], textColor: [255, 255, 255], fontStyle: 'bold' },
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
          ['Pembeli', `${transaksi?.Pembeli?.Akun?.email || '-'} / ${transaksi?.Pembeli?.nama || '-'}`],
          ['Alamat', transaksi?.Alamat?.alamat_lengkap || '-'],
          ['Delivery', transaksi?.pengiriman?.Pegawai ? `Kurir ReUseMart (${transaksi.pengiriman.Pegawai.nama_pegawai})` : '-'],
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [2, 134, 67], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 252, 248] },
      });
      yPosition = doc.lastAutoTable.finalY + 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(2, 134, 67);
      doc.text('Detail Barang', margin, yPosition);
      yPosition += 5;

      const barangBody = transaksi?.barang?.map(item => [
        item.nama || '-',
        formatPrice(item.harga || 0)
      ]) || [['-', '-']];

      autoTable(doc, {
        startY: yPosition,
        head: [['Nama Barang', 'Harga']],
        body: barangBody,
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [2, 134, 67], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 252, 248] },
      });
      yPosition = doc.lastAutoTable.finalY + 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(2, 134, 67);
      doc.text('Ringkasan Pembayaran', margin, yPosition);
      yPosition += 5;

      const poinValue = transaksi?.potongan_poin ? transaksi.potongan_poin / 10 : 0;
      autoTable(doc, {
        startY: yPosition,
        head: [['Field', 'Value']],
        body: [
          ['Total', formatPrice(transaksi?.total_harga || 0)],
          ['Ongkos Kirim', formatPrice(transaksi?.ongkir || 0)],
          ['Total Bayar', formatPrice((transaksi?.total_bayar || 0))],
          [`Potongan ${transaksi?.potongan_poin || 0} Poin`, `-${formatPrice(poinValue*100)}`],
          ['Total Setelah Potongan', formatPrice(transaksi?.total_bayar - transaksi?.potongan_poin*100 || 0)],
          ['Poin dari Pesanan Ini', transaksi?.poin_diperoleh || 0],
          ['Total Poin Customer', transaksi?.Pembeli?.total_poin || 0],
          ['QC Oleh', `${transaksi?.barang?.[0]?.PegawaiGudang?.nama_pegawai || '-'} (${transaksi?.barang?.[0]?.id_pegawai_gudang || '-'})`],
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [2, 134, 67], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 252, 248] },
      });
      yPosition = doc.lastAutoTable.finalY + 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(74, 74, 74);
      doc.text(`Dibuat pada: ${formatDate(new Date())}`, margin, pageHeight - 10);

      doc.save(`Nota_Pengambilan_${transaksi?.id_pembelian || 'unknown'}.pdf`);
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
          <h6 className="fw-bold">No Nota: {transaksi?.no_nota || '-'}</h6>
        </div>
        <div className="card p-3 border-success shadow-sm">
          <p className="mb-2"><strong>Nama Barang:</strong> {transaksi?.barang?.[0]?.nama || '-'}</p>
          <p className="mb-2"><strong>Pembeli:</strong> {transaksi?.Pembeli?.nama || '-'}</p>
          <p className="mb-0"><strong>Status:</strong> {transaksi?.pengiriman?.status_pengiriman || '-'}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={handleClose} className="rounded-pill">Batal</Button>
        <Button variant="success" onClick={generatePDF} className="rounded-pill">
          <i className="bi bi-file-pdf me-2"></i>Cetak Nota
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CetakNotaPengambilan;