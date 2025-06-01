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
        throw new Error("Token tidak ditemukan setelah login.");
      }

      const role = decodeToken(storedToken).role;
      
      if (!role) {
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
    <>
      <ForgotPasswordModal />
      <LoginRegister onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess} />
      {error && (
        <div className="error-overlay">
          <div className="error-message">{error}</div>
        </div>
      )}

      <style jsx>{`
        .error-overlay {
          position: fixed;
          top: 100px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          pointer-events: none;
        }

        .error-message {
          background: rgba(220, 53, 69, 0.95);
          color: white;
          padding: 15px 25px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(220, 53, 69, 0.2);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default LoginPage;