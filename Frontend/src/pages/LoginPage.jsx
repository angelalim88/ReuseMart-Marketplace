import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import { decodeToken } from "../utils/jwtUtils";
import LoginRegister from '../components/form/LoginRegister';
import ForgotPasswordModal from '../components/modal/ForgotPasswordModal';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLoginSuccess = async ({ email, password }) => {
    try {
      const token = await authService.login({ email, password });

      const storedToken = localStorage.getItem("authToken");
      console.log("Token di localStorage:", storedToken);

      if (!storedToken) {
        // console.log("Token tidak ditemukan setelah login.");
        throw new Error("Token tidak ditemukan setelah login.");
      }

      const role = decodeToken(storedToken).role;
      
      if (!role) {
        // console.log("Role tidak ditemukan di token.");
        throw new Error("Role tidak ditemukan di token.");
      }

      switch (role) {
        case "Owner":
          navigate("/owner");
          break;
        case "Admin":
          navigate("/admin");
          break;
        case "Pegawai Gudang":
          navigate("/pegawai-gudang");
          break;
        case "Pembeli":
          navigate("/pembeli");
          break;
        case "Penitip":
          navigate("/penitip");
          break;
        case "Customer Service":
          navigate("/cs");
          break;
        case "Organisasi Amal":
          navigate("/organisasi");
          break;
        default:
          throw new Error("Role tidak valid.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login gagal. Silakan periksa kredensial Anda.");
      }
    }
  };

  const handleRegisterSuccess = async ({ email, password }) => {
    try {
      const token = await authService.login({ email, password });

      const storedToken = localStorage.getItem("authToken");

      if (!storedToken) {
        throw new Error("Token tidak ditemukan setelah login.");
      }

      const role = decodeToken(storedToken).role;

      switch (role) {
        case "Pembeli":
          navigate("/pembeli");
          break;
        case "Organisasi Amal":
          navigate("/organisasi");
          break;
        default:
          throw new Error("Role tidak valid.");
      }
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Gagal masuk ke dalam halaman akun!");
      }
      toast.error("Gagal masuk ke dalam halaman akun!");
      console.error(err);
    }
  }

  return (
    <div className="login-page">
      <ForgotPasswordModal />
      
      <div className="container py-5">
        <LoginRegister onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess} />
      </div>
      {error && <p className="error-message">{error}</p>}

      <style jsx>{`
        .login-page {
          background-color: #fff;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-message {
          color: red;
          font-size: 14px;
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;