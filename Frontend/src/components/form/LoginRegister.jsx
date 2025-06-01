import React, { useState } from "react";
import maskot1 from "../../assets/images/maskot1.png"; 
import maskot2 from "../../assets/images/maskot2.png"; 
import { authService } from "../../api/authService";
import { toast } from "sonner";

const LoginRegister = ({ onLoginSuccess, onRegisterSuccess }) => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Pembeli");
  const [alamat, setAlamat] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      await onLoginSuccess({ email, password });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Password dan Confirm Password tidak cocok.");
      return;
    }

    const signUpData = {
      username,
      email,
      password,
      role,
      ...(role === "Organisasi Amal" && { alamat }),
    };

    try {
      const response = await authService.register(signUpData);
      setIsRightPanelActive(false);

      if(response) { 
        onRegisterSuccess({ email, password });
        toast.success('Registrasi berhasil!');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        console.error(err.response.data.message);
      } else {
        setError("Registrasi gagal. Silakan coba lagi.");
      }
      toast.error("Registrasi gagal!");
      console.error(err);
    }
  };

  return (
    <div className="login-register-component">
      {/* Decorative Background Elements */}
      <div className="decorative-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="circle circle-4"></div>
      </div>

      <div className="main-container">
        <div className={`auth-container ${isRightPanelActive ? "right-panel-active" : ""}`}>
          {/* Sign Up Form */}
          <div className="auth-form sign-up">
            <div className="form-wrapper">
              <div className="form-header">
                <h1>✨ Bergabung Bersama Kami</h1>
                <p className="form-subtitle">Daftarkan akun Anda dan mulai perjalanan baru</p>
              </div>
              
              <form onSubmit={handleSignUp} className="auth-form-content">
                <div className="input-group">
                  <div className="input-wrapper">
                    <i className="input-icon">👤</i>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {role === "Organisasi Amal" && (
                  <div className="input-group">
                    <div className="input-wrapper">
                      <i className="input-icon">📍</i>
                      <input
                        type="text"
                        className="form-control"
                        name="alamat"
                        placeholder="Alamat"
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <div className="input-wrapper">
                    <i className="input-icon">✉️</i>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-wrapper">
                    <i className="input-icon">🔒</i>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-wrapper">
                    <i className="input-icon">🔐</i>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="role-selection">
                  <p className="role-title">Pilih Role Anda:</p>
                  <div className="role-options">
                    <label className={`role-option ${role === "Pembeli" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="role"
                        value="Pembeli"
                        checked={role === "Pembeli"}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <div className="role-content">
                        <span className="role-emoji">🛒</span>
                        <span className="role-text">Pembeli</span>
                      </div>
                    </label>
                    <label className={`role-option ${role === "Organisasi Amal" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="role"
                        value="Organisasi Amal"
                        checked={role === "Organisasi Amal"}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <div className="role-content">
                        <span className="role-emoji">🤝</span>
                        <span className="role-text">Organisasi Amal</span>
                      </div>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <i className="error-icon">⚠️</i>
                    {error}
                  </div>
                )}

                <button className="btn custom-btn" type="submit">
                  <span className="btn-text">Daftar Sekarang</span>
                  <span className="btn-icon">🚀</span>
                </button>
              </form>
            </div>
          </div>

          {/* Log In Form */}
          <div className="auth-form log-in">
            <div className="form-wrapper">
              <div className="form-header">
                <h1>🌟 Selamat Datang Kembali</h1>
                <p className="form-subtitle">Masuk ke akun Anda dan lanjutkan aktivitas</p>
              </div>
              
              <form onSubmit={handleLogin} className="auth-form-content">
                <div className="input-group">
                  <div className="input-wrapper">
                    <i className="input-icon">✉️</i>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-wrapper">
                    <i className="input-icon">🔒</i>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="forgot-password-wrapper">
                  <button 
                    className="btn forgot-password" 
                    data-bs-toggle="modal" 
                    data-bs-target="#forgot-password-modal" 
                    type="button"
                  >
                    🔐 Lupa Password?
                  </button>
                </div>

                <button className="btn custom-btn" type="submit">
                  <span className="btn-text">Masuk</span>
                  <span className="btn-icon">✨</span>
                </button>
              </form>
            </div>
          </div>

          {/* Enhanced Overlay */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <div className="overlay-content">
                  <h2>Sudah Punya Akun?</h2>
                  <p>Masuk dan nikmati kemudahan berbelanja bersama kami!</p>
                  <img className="maskot" src={maskot2} alt="Login maskot" />
                  <button className="btn ghost" onClick={() => setIsRightPanelActive(false)}>
                    <span>Masuk Sekarang</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
              <div className="overlay-panel overlay-right">
                <div className="overlay-content">
                  <h2>Belum Punya Akun?</h2>
                  <p>Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan kami!</p>
                  <img className="maskot" src={maskot1} alt="Register maskot" />
                  <button className="btn ghost" onClick={() => setIsRightPanelActive(true)}>
                    <span>Daftar Sekarang</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <style jsx>{`
      .login-register-component {
        background: linear-gradient(135deg, #f8fffe 0%, #e8f5f0 50%, #d4f4dd 100%);
        min-height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        padding: 20px;
      }

      .login-register-component::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23028643' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
        z-index: 0;
      }

      .main-container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 1000px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .decorative-circles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      }

      .circle {
        position: absolute;
        border-radius: 50%;
        opacity: 0.1;
        animation: float 6s ease-in-out infinite;
      }

      .circle-1 {
        width: 80px;
        height: 80px;
        background: #028643;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }

      .circle-2 {
        width: 60px;
        height: 60px;
        background: #FC8A06;
        top: 20%;
        right: 15%;
        animation-delay: 1s;
      }

      .circle-3 {
        width: 100px;
        height: 100px;
        background: #028643;
        bottom: 15%;
        left: 20%;
        animation-delay: 2s;
      }

      .circle-4 {
        width: 40px;
        height: 40px;
        background: #FC8A06;
        bottom: 30%;
        right: 10%;
        animation-delay: 3s;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }

      .auth-container {
        position: relative;
        width: 100%;
        max-width: 950px;
        min-height: 650px;
        background: #FFFFFF;
        border-radius: 25px;
        overflow: hidden;
        box-shadow: 
          0 25px 50px rgba(2, 134, 67, 0.15),
          0 0 0 1px rgba(2, 134, 67, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .auth-form {
        position: absolute;
        top: 0;
        height: 100%;
        width: 50%;
        transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 0;
        text-align: center;
        z-index: 10;
      }

      .form-wrapper {
        width: 100%;
        max-width: 400px;
        padding: 40px 30px;
      }

      .sign-up {
        left: 0;
        opacity: 0;
        z-index: 1;
      }

      .log-in {
        left: 0;
        z-index: 2;
      }

      .right-panel-active .sign-up {
        transform: translateX(100%);
        opacity: 1;
        z-index: 5;
      }

      .right-panel-active .log-in {
        transform: translateX(100%);
        opacity: 0;
        z-index: 1;
      }

      .form-header {
        margin-bottom: 30px;
        text-align: center;
      }

      .form-header h1 {
        color: #03081F;
        font-weight: 700;
        font-size: 26px;
        letter-spacing: 0.3px;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #028643, #39754B);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .form-subtitle {
        color: #6C757D;
        font-size: 13px;
        font-weight: 400;
        margin: 0;
        line-height: 1.6;
        max-width: 80%;
        margin-left: auto;
        margin-right: auto;
      }

      .auth-form-content {
        width: 100%;
      }

      .input-group {
        margin-bottom: 18px;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon {
        position: absolute;
        left: 15px;
        font-size: 16px;
        z-index: 2;
        opacity: 0.7;
      }

      .form-control {
        width: 100%;
        background: rgba(248, 255, 254, 0.8);
        padding: 14px 15px 14px 45px;
        border-radius: 12px;
        border: 2px solid transparent;
        color: #03081F;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
      }

      .form-control:focus {
        border-color: #028643;
        box-shadow: 0 0 0 4px rgba(2, 134, 67, 0.1);
        outline: none;
        background: #FFFFFF;
        transform: translateY(-2px);
      }

      .form-control::placeholder {
        color: #6C757D;
        opacity: 0.8;
        font-weight: 400;
      }

      .forgot-password-wrapper {
        margin-bottom: 20px;
        text-align: right;
      }

      .forgot-password {
        color: #FC8A06;
        font-size: 12px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.3s ease;
        background: none;
        border: none;
        padding: 5px 10px;
        border-radius: 8px;
      }

      .forgot-password:hover {
        color: #03081F;
        background: rgba(252, 138, 6, 0.1);
        transform: translateY(-1px);
      }

      .custom-btn {
        color: #FFFFFF;
        background: linear-gradient(135deg, #028643 0%, #39754B 100%);
        font-size: 14px;
        font-weight: 600;
        padding: 14px 40px;
        border-radius: 25px;
        letter-spacing: 0.3px;
        text-transform: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 
          0 8px 25px rgba(2, 134, 67, 0.3),
          0 3px 10px rgba(0, 0, 0, 0.1);
        border: none;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        position: relative;
        overflow: hidden;
      }

      .custom-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }

      .custom-btn:hover::before {
        left: 100%;
      }

      .custom-btn:hover {
        background: linear-gradient(135deg, #016d38 0%, #2d5a37 100%);
        transform: translateY(-3px);
        box-shadow: 
          0 12px 35px rgba(2, 134, 67, 0.4),
          0 5px 15px rgba(0, 0, 0, 0.15);
      }

      .custom-btn:active {
        transform: translateY(-1px);
        box-shadow: 
          0 5px 15px rgba(2, 134, 67, 0.3),
          0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .btn-text, .btn-icon {
        position: relative;
        z-index: 2;
      }

      .role-selection {
        margin-bottom: 20px;
        text-align: left;
      }

      .role-title {
        color: #03081F;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 12px;
      }

      .role-options {
        display: flex;
        gap: 12px;
      }

      .role-option {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        border: 2px solid #D9D9D9;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(248, 255, 254, 0.5);
        position: relative;
      }

      .role-option:hover {
        border-color: #028643;
        background: rgba(2, 134, 67, 0.05);
        transform: translateY(-2px);
      }

      .role-option.active {
        border-color: #028643;
        background: linear-gradient(135deg, rgba(2, 134, 67, 0.1) 0%, rgba(57, 117, 75, 0.05) 100%);
        box-shadow: 0 4px 15px rgba(2, 134, 67, 0.15);
      }

      .role-option input[type="radio"] {
        display: none;
      }

      .role-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .role-emoji {
        font-size: 18px;
      }

      .role-text {
        font-size: 11px;
        font-weight: 600;
        color: #03081F;
      }

      .error-message {
        color: #DC3545;
        font-size: 13px;
        font-weight: 500;
        text-align: center;
        margin-bottom: 18px;
        padding: 10px;
        background: rgba(220, 53, 69, 0.1);
        border-radius: 8px;
        border-left: 4px solid #DC3545;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .overlay-container {
        position: absolute;
        top: 0;
        left: 50%;
        width: 50%;
        height: 100%;
        overflow: hidden;
        z-index: 100;
        transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .right-panel-active .overlay-container {
        transform: translateX(-100%);
      }

      .overlay {
        position: relative;
        background: linear-gradient(135deg, #028643 0%, #39754B 50%, #016d38 100%);
        left: -100%;
        height: 100%;
        width: 200%;
        transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        z-index: 2;
        background-attachment: fixed;
      }

      .overlay::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
      }

      .right-panel-active .overlay {
        transform: translateX(50%);
      }

      .overlay-panel {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 0 40px;
        text-align: center;
        top: 0;
        height: 100%;
        width: 50%;
        z-index: 2;
      }

      .overlay-content {
        position: relative;
        z-index: 3;
        max-width: 80%;
      }

      .overlay-content h2 {
        color: #FFFFFF;
        font-weight: 700;
        font-size: 22px;
        letter-spacing: 0.3px;
        margin-bottom: 12px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .overlay-content p {
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.6;
        margin-bottom: 25px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }

      .maskot {
        width: 100%;
        max-width: 260px;
        height: auto;
        object-fit: contain;
        margin: 20px 0;
        filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
        animation: gentle-bounce 3s ease-in-out infinite;
      }

      @keyframes gentle-bounce {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      .overlay-left {
        transform: translateX(0);
      }

      .overlay-right {
        right: 0;
        transform: translateX(0);
      }

      .right-panel-active .overlay-left {
        transform: translateX(0);
      }

      .right-panel-active .overlay-right {
        transform: translateX(200%);
      }

      .ghost {
        background: transparent;
        border: 2px solid rgba(255, 255, 255, 0.8);
        color: #FFFFFF;
        padding: 14px 35px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.3px;
        text-transform: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
      }

      .ghost::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        transition: left 0.5s;
      }

      .ghost:hover::before {
        left: 100%;
      }

      .ghost:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #FFFFFF;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        border-color: #FFFFFF;
      }

      .btn-arrow {
        transition: transform 0.3s ease;
      }

      .ghost:hover .btn-arrow {
        transform: translateX(5px);
      }

      @media (max-width: 768px) {
        .auth-container {
          min-height: 600px;
          max-width: 95%;
          margin: 20px auto;
        }

        .form-wrapper {
          padding: 30px 20px;
        }

        .form-header h1 {
          font-size: 22px;
        }

        .form-subtitle {
          font-size: 12px;
          max-width: 90%;
        }

        .maskot {
          max-width: 200px;
        }

        .overlay-panel {
          padding: 0 25px;
        }

        .overlay-content h2 {
          font-size: 20px;
        }

        .overlay-content p {
          font-size: 12px;
        }

        .role-options {
          flex-direction: column;
          gap: 10px;
        }

        .role-option {
          padding: 10px;
        }

        .decorative-circles {
          display: none;
        }
      }

      @media (max-width: 480px) {
        .auth-container {
          min-height: 550px;
        }

        .form-wrapper {
          padding: 25px 15px;
        }

        .form-header h1 {
          font-size: 20px;
        }

        .form-subtitle {
          font-size: 11px;
        }

        .overlay-content h2 {
          font-size: 18px;
        }

        .overlay-content p {
          font-size: 11px;
        }

        .maskot {
          max-width: 160px;
        }

        .custom-btn, .ghost {
          padding: 12px 30px;
          font-size: 13px;
        }
      }
    `}</style>
    </div>
  );
};

export default LoginRegister;