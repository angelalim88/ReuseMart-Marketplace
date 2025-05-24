import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import MainLayout from "../layouts/MainLayout";
import LoginLayout from "../layouts/LoginLayout";
import ProtectedRoute from "../routes/ProtectedRoute";

import HomePage from "../pages/HomePage";
import ListProdukPage from "../pages/ListProdukPage";

import BarangGaransiPage from "../pages/BarangGaransiPage";
import DetailGaransiPage from "../pages/DetailGaransiBarang";
import LoginPage from "../pages/LoginPage";
import OwnerPage from "../pages/owner/OwnerPage";
import AdminPage from "../pages/admin/AdminPage";
import PegawaiGudangPage from "../pages/pegawai-gudang/PegawaiGudangPage";
import PembeliPage from "../pages/pembeli/PembeliPage";
import DaftarBarang from "../pages/penitip/DaftarBarang";
import CsPage from "../pages/cs/CsPage";
import OrganisasiPage from "../pages/organisasi/OrganisasiPage";
import ManagePegawaiPage from "../pages/admin/ManagePegawaiPage";
import ManageOrganisasiPage from "../pages/admin/ManageOrganisasiPage";
import ManageMerchandisePage from "../pages/admin/ManageMerchandisePage";
import PenitipProfile from "../pages/penitip/PenitipProfile";
import LaporanPenitip from "../pages/penitip/LaporanPenitip";
import PembeliProfile from "../pages/pembeli/PembeliProfile";
import PenitipHistory from "../pages/penitip/PenitipHistory";
import ManageAlamat from "../pages/pembeli/ManageAlamat";
import DetailBarangPage from "../pages/DetailBarang";
import DiskusiProdukPage from "../pages/DiskusiProduk";

import OProduk from "../pages/organisasi/OProduk";
import ODonasi from "../pages/organisasi/ODonasi";
import ORequest from "../pages/organisasi/ORequest";

import ProdukDisumbang from "../pages/owner/ProdukDisumbang";
import LaporanBulanan from "../pages/owner/LaporanBulanan";
import LaporanKomisi from "../pages/owner/LaporanKomisi";
import LaporanStok from "../pages/owner/LaporanStok";
import LaporanKategori from "../pages/owner/LaporanKategori";
import PenitipanHabis from "../pages/owner/PenitipanHabis";
import LaporanDonasi from "../pages/owner/LaporanDonasi";
import RekapRequest from "../pages/owner/RekapRequest";

import ManageBarang from "../pages/pegawai-gudang/ManageBarang";
import DaftarTransaksi from "../pages/pegawai-gudang/DaftarTransaksi";
import Pengambilan from "../pages/pegawai-gudang/Pengambilan";
import Pengiriman from "../pages/pegawai-gudang/Pengiriman";

import DataPenitip from "../pages/cs/DataPenitip";
import BuktiTf from "../pages/cs/BuktiTf";
import Diskusi from "../pages/cs/Diskusi";
import Merchandise from "../pages/cs/Merchandise";
import HistoryMerch from "../pages/cs/HistoryMerch";
import ForgotPassword from "../pages/ForgotPassword";

import { Navigate } from "react-router-dom"; 
import { decodeToken } from "../utils/jwtUtils";
import Keranjang from "../pages/pembeli/Keranjang";

const ProfileRedirect = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/login" replace />;
  const role = decodeToken(token)?.role;

  switch (role) {
    case "Pembeli":
      return <Navigate to="/pembeli/profile" replace />;
    case "Penitip":
      return <Navigate to="/penitip/profile" replace />;
    default:
      return <div>Role not recognized</div>;
  }
};

const mainRoutes = [
  { path: "/", element: <HomePage /> },
  { path: "/produk", element: <ListProdukPage /> },
  { path: "/garansi", element: <BarangGaransiPage /> },
  { path: "/garansi/:id", element: <DetailGaransiPage /> },

  // Halaman Reset Password 
  { path: "/forgot-password", element: <ForgotPassword /> },

  //universal profile route
  {
    path: "/profile",
    element: (
      <ProtectedRoute allowedRoles={["Pembeli", "Penitip"]}>
        <ProfileRedirect />
      </ProtectedRoute>
    ),
  },

  // Protected Routes for Owner
  {
    path: "/owner",
    element: (
      <ProtectedRoute allowedRoles={["Owner"]}>
        <ProdukDisumbang />
      </ProtectedRoute>
    ),
  },
  { path: "/owner/produk", element: <ProdukDisumbang /> },
  { path: "/owner/bulanan", element: <LaporanBulanan /> },
  { path: "/owner/komisi", element: <LaporanKomisi /> },
  { path: "/owner/stok", element: <LaporanStok /> },
  { path: "/owner/kategori", element: <LaporanKategori /> },
  { path: "/owner/penitipan", element: <PenitipanHabis /> },
  { path: "/owner/donasi", element: <LaporanDonasi /> },
  { path: "/owner/rekap", element: <RekapRequest /> },

  // Protected Routes for Admin
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["Admin"]}>
        <ManagePegawaiPage /> 
      </ProtectedRoute>
    ),
  },
  { path: "/admin/pegawai", element: <ManagePegawaiPage /> },
  { path: "/admin/organisasi", element: <ManageOrganisasiPage /> },
  { path: "/admin/merchandise", element: <ManageMerchandisePage /> },

  // Protected Route for Pegawai Gudang
  {
    path: "/pegawai-gudang",
    element: (
      <ProtectedRoute allowedRoles={["Pegawai Gudang"]}>
        <ManageBarang />
      </ProtectedRoute>
    ),
  },
  { path: "/pegawai-gudang/barang", element: <ManageBarang /> },
  { path: "/pegawai-gudang/transaksi", element: <DaftarTransaksi /> },
  { path: "/pegawai-gudang/pengambilan", element: <Pengambilan /> },
  { path: "/pegawai-gudang/pengiriman", element: <Pengiriman /> },

  // Protected Route for Pembeli
  {
    path: "/pembeli",
    element: (
      <ProtectedRoute allowedRoles={["Pembeli"]}>
        <PembeliPage />
      </ProtectedRoute>
    ),
  },
  { path: "/pembeli/profile", element: <PembeliProfile /> },
  { path: "/pembeli/alamat", element: <ManageAlamat /> },
  { path: "/pembeli/keranjang", element: <Keranjang /> },

  // Protected Route for Penitip
  {
    path: "/penitip",
    element: (
      <ProtectedRoute allowedRoles={["Penitip"]}>
        <DaftarBarang />
      </ProtectedRoute>
    ),
  },
  { path: "/penitip/profile", element: <PenitipProfile /> },
  { path: "/penitip/barang", element: <DaftarBarang /> },
  { path: "/penitip/history", element: <PenitipHistory /> },

  { path: "/penitip/laporan", element: <LaporanPenitip /> },

  // Protected Route for Customer Service
  {
    path: "/cs",
    element: (
      <ProtectedRoute allowedRoles={["Customer Service"]}>
        <DataPenitip />
      </ProtectedRoute>
    ),
  },
  { path: "/cs/penitip", element: <DataPenitip /> },
  { path: "/cs/bukti", element: <BuktiTf /> },
  { path: "/cs/diskusi", element: <Diskusi /> },
  { path: "/cs/merch", element: <Merchandise /> },
  { path: "/cs/history", element: <HistoryMerch /> },

  // Protected Route for Organisasi Amal
  {
    path: "/organisasi",
    element: (
      <ProtectedRoute allowedRoles={["Organisasi Amal"]}>
        <OProduk />
      </ProtectedRoute>
    ),
  },
  { path: "/organisasi/produk", element: <OProduk /> },
  { path: "/organisasi/request", element: <ORequest /> },
  { path: "/organisasi/history", element: <ODonasi /> },

  // Detail Barang
  { path: "/barang/:id", element: <DetailBarangPage /> },

  // Diskusi Produk
  { path: "/diskusi-produk/:id", element: <DiskusiProdukPage /> },
];

const loginRoutes = [
  { path: "/login", element: <LoginPage /> },
];

const router = createBrowserRouter([
  {
    path: "*",
    element: <div>Routes Tidak Ditemukan!</div>,
  },
  {
    element: <MainLayout />,
    children: mainRoutes,
  },
  {
    element: <LoginLayout />,
    children: loginRoutes,
  },
]);

const AppRouter = () => (
  <>
    <Toaster position="top-center" richColors />
    <RouterProvider router={router} />
  </>
);

export default AppRouter;
