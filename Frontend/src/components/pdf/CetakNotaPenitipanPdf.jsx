import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from '../../assets/images/logo.png';

const CetakNotaPenitipanPdf = ({ show, handleClose, penitipan }) => {
  const formatPrice = (angka) => {
    if (!angka || isNaN(angka)) return '0';
    return new Intl.NumberFormat('id-ID').format(parseFloat(angka));
  };

  // Format date to Indonesian format (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return '-';
    }
  };

  const formatDateTime = (dateInput) => {
    if (!dateInput) return '-';
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return '-';
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return '-';
    }
  };

  const extractIdNumber = (id) => {
    if (!id) return 0;
    const match = String(id).match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Updated nota number format: tahunpenitipan.bulanpenitipan.id_penitipan
  const generateNotaNumber = (penitipan) => {
    if (!penitipan?.tanggal_awal_penitipan) return '00.00.000';
    const date = new Date(penitipan.tanggal_awal_penitipan);
    const year = String(date.getFullYear()).slice(-2); // Last 2 digits of year
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const idPenitipan = extractIdNumber(penitipan?.id_penitipan);
    return `${year}.${month}.${String(idPenitipan).padStart(3, '0')}`;
  };

  // Generate PDF
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      let y = 10;

      // Header Company
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ReuseMart", 15, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y += 5;
      doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 15, y);
      y += 5;
      doc.text('"Kualitas Terjamin, QC Terbaik"', 15, y);
      y += 10;

      // Info Transaksi
      const detail = [
        ["No Nota               : ", `${generateNotaNumber(penitipan)}`],
        ["Tanggal Penitipan : ", `${formatDateTime(penitipan?.tanggal_awal_penitipan)}`],
        ["Tanggal Berakhir   : ", `${formatDate(penitipan?.tanggal_akhir_penitipan)}`],
        ["Batas Pengambilan : ", `${formatDate(penitipan?.tanggal_batas_pengambilan)}`],
        ["Status                   : ", `${penitipan?.status_penitipan || '-'}`],
        ["Perpanjangan        : ", `${penitipan?.perpanjangan ? 'Ya' : 'Tidak'}`],
      ];

      detail.forEach((item, index) => {
        doc.text(`${item[0]} ${item[1]}`, 15, y + index * 5);
      });
      y += detail.length * 5 + 5;

      // Info Penitip
      doc.setFont("helvetica", "bold");
      doc.text("Penitip : ", 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${penitipan?.Barang?.Penitip?.id_penitip || '-'} / ${penitipan?.Barang?.Penitip?.nama_penitip || '-'}`, 35, y);
      y += 5;
      doc.text(`Email: ${penitipan?.Barang?.Penitip?.Akun?.email || '-'}`, 15, y);
      y += 5;
      doc.text(`Total Poin: ${penitipan?.Barang?.Penitip?.total_poin || '0'}`, 15, y);
      y += 5;
      doc.text(`Terdaftar sejak: ${formatDate(penitipan?.Barang?.Penitip?.tanggal_registrasi) || '-'}`, 15, y);
      y += 10;

      // Info Hunter (jika ada)
      if (penitipan?.Barang?.hunter) {
        doc.setFont("helvetica", "bold");
        doc.text("Hunter : ", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text(`${penitipan.Barang.hunter.id_pegawai} / ${penitipan.Barang.hunter.nama_pegawai}`, 35, y);
        y += 5;
        doc.text(`Email: ${penitipan?.Barang?.hunter?.Akun?.email || '-'}`, 15, y);
        y += 10;
      }

      // Detail Barang - More comprehensive
      const barangDetails = [
        [`ID Barang: ${penitipan?.Barang?.id_barang || '-'}`, `Harga: Rp ${formatPrice(penitipan?.Barang?.harga || 0)}`],
        [`Nama: ${penitipan?.Barang?.nama || '-'}`, `Berat: ${penitipan?.Barang?.berat || '-'} kg`],
        [`Kategori: ${penitipan?.Barang?.kategori_barang || '-'}`, `Status QC: ${penitipan?.Barang?.status_qc || '-'}`],
        [`Garansi: ${penitipan?.Barang?.garansi_berlaku ? 'Ya' : 'Tidak'}`, 
         penitipan?.Barang?.tanggal_garansi ? `Berlaku hingga: ${formatDate(penitipan.Barang.tanggal_garansi)}` : ''],
        [`Penitip ID: ${penitipan?.Barang?.id_penitip || '-'}`, 
         penitipan?.Barang?.id_hunter ? `Hunter ID: ${penitipan.Barang.id_hunter}` : 'Hunter: -'],
        [`QC oleh ID: ${penitipan?.Barang?.id_pegawai_gudang || '-'}`, '']
      ];

      // Add description if available
      if (penitipan?.Barang?.deskripsi) {
        barangDetails.push([`Deskripsi: ${penitipan.Barang.deskripsi}`, ""]);
      }

      autoTable(doc, {
        startY: y,
        theme: "plain",
        head: [["Detail Barang", ""]],
        body: barangDetails,
        styles: {
          fontSize: 10,
        },
        headStyles: {
          fontStyle: "bold",
          fontSize: 11,
        },
        columnStyles: {
          1: { halign: 'right' }
        }
      });

      y = doc.lastAutoTable.finalY + 15;

      // QC Information dengan nama pegawai
      if (penitipan?.Barang?.pegawaiGudang) {
        doc.setFont("helvetica", "bold");
        doc.text("Quality Control:", 15, y);
        doc.setFont("helvetica", "normal");
        y += 5;
        doc.text(`Petugas QC: ${penitipan.Barang.pegawaiGudang.nama_pegawai} (${penitipan.Barang.pegawaiGudang.id_pegawai_gudang})`, 15, y);
        y += 5;
        doc.text(`Email: ${penitipan?.Barang?.pegawaiGudang?.Akun?.email || '-'}`, 15, y);
        y += 10;
      }

      // Informasi Tambahan
      doc.setFont("helvetica", "bold");
      doc.text("Informasi Penting:", 15, y);
      doc.setFont("helvetica", "normal");
      y += 8;
      doc.text("• Barang dapat diambil sesuai tanggal yang tertera", 15, y);
      y += 5;
      doc.text("• Harap membawa nota ini saat pengambilan barang", 15, y);
      y += 5;
      doc.text("• Hubungi kami jika ada perpanjangan waktu penitipan", 15, y);
      y += 5;
      doc.text("• Barang telah melalui proses Quality Control", 15, y);
      y += 15;

      // Signature section
      doc.text("Diterima dan QC oleh:", 15, y);
      y += 35;
      doc.text("(.................................)", 15, y);
      y += 10;
      doc.text(`Tanggal: ${formatDate(new Date())}`, 15, y);

      // Save PDF
      doc.save(`Nota_Penitipan_${generateNotaNumber(penitipan)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Gagal menghasilkan PDF. Silakan coba lagi.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="shadow-lg">
      <Modal.Header closeButton className="bg-success text-white border-0">
        <Modal.Title className="fw-bold">Cetak Nota Penitipan</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="text-center mb-3">
          <h6 className="fw-bold">No: {generateNotaNumber(penitipan)}</h6>
        </div>
        <div className="card p-3 border-success shadow-sm">
          <p className="mb-2">
            <strong>ID Barang:</strong> {penitipan?.Barang?.id_barang || '-'}
          </p>
          <p className="mb-2">
            <strong>Nama Barang:</strong> {penitipan?.Barang?.nama || '-'}
          </p>
          <p className="mb-2">
            <strong>Penitip:</strong> {penitipan?.Barang?.Penitip?.nama_penitip || '-'}
          </p>
          {penitipan?.Barang?.hunter && (
            <p className="mb-2">
              <strong>Hunter:</strong> {penitipan.Barang.hunter.nama_pegawai || '-'}
            </p>
          )}
          <p className="mb-2">
            <strong>Status:</strong> {penitipan?.status_penitipan || '-'}
          </p>
          <p className="mb-0">
            <strong>Batas Pengambilan:</strong> {formatDate(penitipan?.tanggal_batas_pengambilan) || '-'}
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

export default CetakNotaPenitipanPdf;