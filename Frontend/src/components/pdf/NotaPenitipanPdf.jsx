import React from 'react';
import { Modal, Button } from 'react-bootstrap';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

const NotaPenitipanPdf = ({ show, handleClose, penitipan }) => {
//   // Format price as Rupiah
//   const formatPrice = (angka) => {
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//     }).format(angka);
//   };

//   // Format date to Indonesian format (DD MMMM YYYY)
//   const formatDate = (dateString) => {
//     const options = { day: '2-digit', month: 'long', year: 'numeric' };
//     return new Date(dateString).toLocaleDateString('id-ID', options);
//   };

//   // Generate PDF
//   const generatePDF = () => {
//     const doc = new jsPDF();
//     if (typeof doc.autoTable !== 'function') {
//       console.error('autoTable is not available on jsPDF instance');
//       alert('Error: Unable to generate PDF. Please ensure jspdf-autotable is properly installed.');
//       return;
//     }

//     const pageWidth = doc.internal.pageSize.getWidth();
//     const margin = 15;
//     const lineHeight = 10;
//     let yPosition = 20;

//     // Helper function to add text with wrapping
//     const addText = (text, x, y, maxWidth, fontSize = 12) => {
//       doc.setFontSize(fontSize);
//       doc.text(text, x, y, { maxWidth });
//       return y + lineHeight;
//     };

//     // Header
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(16);
//     doc.text('Nota Penitipan Barang', pageWidth / 2, yPosition, { align: 'center' });
//     yPosition += 10;

//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'normal');
//     doc.text('Gudang Penitipan', pageWidth / 2, yPosition, { align: 'center' });
//     yPosition += 15;

//     // Penitipan Details
//     doc.setFont('helvetica', 'bold');
//     yPosition = addText('Detail Penitipan', margin, yPosition, pageWidth - 2 * margin, 14);
//     doc.setFont('helvetica', 'normal');

//     const penitipanDetails = [
//       ['ID Penitipan', penitipan?.id_penitipan || '-'],
//       ['Tanggal Awal', formatDate(penitipan?.tanggal_awal_penitipan) || '-'],
//       ['Tanggal Akhir', formatDate(penitipan?.tanggal_akhir_penitipan) || '-'],
//       ['Batas Pengambilan', formatDate(penitipan?.tanggal_batas_pengambilan) || '-'],
//       ['Status', penitipan?.status_penitipan || '-'],
//       ['Perpanjangan', penitipan?.perpanjangan ? 'Ya' : 'Tidak'],
//     ];

//     doc.autoTable({
//       startY: yPosition,
//       head: [['Field', 'Value']],
//       body: penitipanDetails,
//       theme: 'striped',
//       margin: { left: margin, right: margin },
//       styles: { fontSize: 10, cellPadding: 3 },
//       headStyles: { fillColor: [2, 134, 67] },
//     });
//     yPosition = doc.lastAutoTable.finalY + 15;

//     // Barang Details
//     doc.setFont('helvetica', 'bold');
//     yPosition = addText('Detail Barang', margin, yPosition, pageWidth - 2 * margin, 14);
//     doc.setFont('helvetica', 'normal');

//     const barangDetails = [
//       ['ID Barang', penitipan?.Barang?.id_barang || '-'],
//       ['Nama', penitipan?.Barang?.nama || '-'],
//       ['Deskripsi', penitipan?.Barang?.deskripsi || '-'],
//       ['Harga', formatPrice(penitipan?.Barang?.harga || 0)],
//       ['Berat', `${penitipan?.Barang?.berat || '-'} kg`],
//       ['Kategori', penitipan?.Barang?.kategori_barang || '-'],
//       ['Status QC', penitipan?.Barang?.status_qc || '-'],
//       ['Garansi Berlaku', penitipan?.Barang?.garansi_berlaku ? 'Ya' : 'Tidak'],
//       ['Tanggal Garansi', formatDate(penitipan?.Barang?.tanggal_garansi) || '-'],
//     ];

//     doc.autoTable({
//       startY: yPosition,
//       head: [['Field', 'Value']],
//       body: barangDetails,
//       theme: 'striped',
//       margin: { left: margin, right: margin },
//       styles: { fontSize: 10, cellPadding: 3 },
//       headStyles: { fillColor: [2, 134, 67] },
//     });
//     yPosition = doc.lastAutoTable.finalY + 15;

//     // Penitip Details
//     doc.setFont('helvetica', 'bold');
//     yPosition = addText('Detail Penitip', margin, yPosition, pageWidth - 2 * margin, 14);
//     doc.setFont('helvetica', 'normal');

//     const penitipDetails = [
//       ['Nama', penitipan?.Barang?.Penitip?.nama_penitip || '-'],
//       ['Nomor KTP', penitipan?.Barang?.Penitip?.nomor_ktp || '-'],
//       ['Email', penitipan?.Barang?.Penitip?.Akun?.email || '-'],
//       ['Tanggal Registrasi', formatDate(penitipan?.Barang?.Penitip?.tanggal_registrasi) || '-'],
//     ];

//     doc.autoTable({
//       startY: yPosition,
//       head: [['Field', 'Value']],
//       body: penitipDetails,
//       theme: 'striped',
//       margin: { left: margin, right: margin },
//       styles: { fontSize: 10, cellPadding: 3 },
//       headStyles: { fillColor: [2, 134, 67] },
//     });
//     yPosition = doc.lastAutoTable.finalY + 15;

//     // Footer
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'italic');
//     doc.text(
//       `Dibuat pada: ${formatDate(new Date())}`,
//       margin,
//       doc.internal.pageSize.getHeight() - 10
//     );

//     // Save PDF
//     doc.save(`Nota_Penitipan_${penitipan?.id_penitipan || 'unknown'}.pdf`);
//   };

//   return (
//     <Modal show={show} onHide={handleClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>Cetak Nota Penitipan</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <p>
//           Apakah Anda ingin mencetak nota untuk penitipan dengan ID:{' '}
//           <strong>{penitipan?.id_penitipan || '-'}</strong>?
//         </p>
//         <p>
//           Nama Barang: <strong>{penitipan?.Barang?.nama || '-'}</strong>
//         </p>
//         <p>
//           Penitip: <strong>{penitipan?.Barang?.Penitip?.nama_penitip || '-'}</strong>
//         </p>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>
//           Batal
//         </Button>
//         <Button variant="primary" onClick={generatePDF}>
//           Cetak Nota
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
 };

export default NotaPenitipanPdf;