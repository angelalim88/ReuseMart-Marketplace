import React, { useState } from "react";
import maskot1 from "../../assets/images/maskot1.png"; 
import maskot2 from "../../assets/images/maskot2.png"; 
import { authService } from "../../api/authService";

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

      if(!response) onRegisterSuccess({ email, password });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registrasi gagal. Silakan coba lagi.");
      }
    }
  };

  return (
    <div className="login-register-component">
      
      <div className="container py-5">
        <div className={`auth-container ${isRightPanelActive ? "right-panel-active" : ""}`}>
          {/* Sign Up Form */}
          <div className="auth-form sign-up">
            <form onSubmit={handleSignUp}>
              <h1 className="mb-4">Daftar</h1>
              <div className="mb-3">
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
              {role === "Organisasi Amal" && (
                <div className="mb-3">
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
              )}
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="mb-3 role-selection">
                <label className="me-3">
                  <input
                    type="radio"
                    name="role"
                    value="Pembeli"
                    checked={role === "Pembeli"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  Pembeli
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="Organisasi Amal"
                    checked={role === "Organisasi Amal"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  Organisasi Amal
                </label>
              </div>
              {error && <p className="error-message">{error}</p>}
              <button className="btn custom-btn" type="submit">Daftar</button>
            </form>
          </div>

          {/* Log In Form */}
          <div className="auth-form log-in">
            <form onSubmit={handleLogin}>
              <h1 className="mb-4">Log In</h1>
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="mb-4">
                <button className="btn forgot-password" data-bs-toggle="modal" data-bs-target="#forgot-password-modal" type="button">Forgot your password?</button>
              </div>
              <button className="btn custom-btn" type="submit">Masuk</button>
            </form>
          </div>

          {/* Overlay */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h4>Sudah Punya Akun? Yuk Masuk!</h4>
                <img className="maskot" src={maskot2} alt="Login maskot" />
                <button className="btn ghost" onClick={() => setIsRightPanelActive(false)}>Masuk</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h4>Belom Punya Akun? Yuk Daftar!</h4>
                <img className="maskot" src={maskot1} alt="Regis maskot" />
                <button className="btn ghost" onClick={() => setIsRightPanelActive(true)}>Daftar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-register-component {
          background-color: #FCFBF0;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          background-image: linear-gradient(135deg, rgba(147, 165, 136, 0.2) 0%, rgba(252, 251, 240, 0.8) 100%);
        }

        .auth-container {
          position: relative;
          width: 100%;
          max-width: 850px;
          min-height: 550px;
          background: #FCFBF0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 14px 28px rgba(57, 117, 75, 0.18),
                      0 10px 10px rgba(57, 117, 75, 0.12);
          margin: 0 auto;
        }

        .auth-form {
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          transition: all 0.6s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 50px;
          text-align: center;
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

        h1 {
          color: #39754B;
          font-weight: 700;
          font-size: 32px;
          letter-spacing: 1px;
          position: relative;
        }

        h1:after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -10px;
          transform: translateX(-50%);
          height: 3px;
          width: 50px;
          background: #39754B;
          border-radius: 2px;
        }

        .form-control {
          width: 250px;
          background: #FCFBF0;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #93A588;
          color: #1A1816;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .form-control:focus {
          border-color: #39754B;
          box-shadow: 0 0 0 2px rgba(57, 117, 75, 0.2);
        }

        .form-control::placeholder {
          color: #93A588;
          opacity: 0.7;
        }

        .forgot-password {
          color: #39754B;
          font-size: 14px;
          text-decoration: none;
          align-self: flex-start;
          transition: color 0.3s ease;
        }

        .forgot-password:hover {
          color: #1A1816;
          text-decoration: underline;
        }

        .custom-btn {
          color: #FCFBF0;
          background: #39754B;
          font-size: 14px;
          font-weight: 600;
          padding: 14px 60px;
          border-radius: 30px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(57, 117, 75, 0.2);
        }

        .custom-btn:hover {
          background: #2a5437;
          transform: translateY(-2px);
          box-shadow: 0 6px 10px rgba(57, 117, 75, 0.3);
        }

        .custom-btn:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 5px rgba(57, 117, 75, 0.2);
        }

        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          z-index: 100;
          transition: transform 0.6s ease-in-out;
        }

        .right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        .overlay {
          position: relative;
          background: linear-gradient(135deg, #39754B 0%, #93A588 100%);
          left: -100%;
          height: 100%;
          width: 200%;
          transition: transform 0.6s ease-in-out;
          z-index: 2;
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

        .maskot {
          width: 100%;
          max-width: 300px;
          height: auto;
          object-fit: contain;
        }

        .overlay-panel h1, h4, .overlay-panel p {
          color: #FCFBF0;
        }

        .overlay-panel p {
          font-size: 16px;
          font-weight: 400;
          line-height: 1.5;
          letter-spacing: 0.5px;
          margin: 20px 0;
          max-width: 80%;
          text-align: center;
        }

        .overlay-left {
          transform: translateX(0);
          background: linear-gradient(rgba(57, 117, 75, 0.8), rgba(26, 24, 22, 0.7)), url('https://via.placeholder.com/800x600');
          background-size: cover;
          background-position: center;
        }

        .overlay-right {
          right: 0;
          transform: translateX(0);
          background: linear-gradient(rgba(57, 117, 75, 0.8), rgba(26, 24, 22, 0.7)), url('https://via.placeholder.com/800x600');
          background-size: cover;
          background-position: center;
        }

        .right-panel-active .overlay-left {
          transform: translateX(0);
        }

        .right-panel-active .overlay-right {
          transform: translateX(200%);
        }

        .ghost {
          background: transparent;
          border: 2px solid #FCFBF0;
          color: #FCFBF0;
          padding: 14px 45px;
          border-radius: 30px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        .ghost:hover {
          background: rgba(252, 251, 240, 0.2);
          color: #FCFBF0;
        }

        .role-selection {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .role-selection label {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #1A1816;
          cursor: pointer;
        }

        .role-selection input[type="radio"] {
          margin-right: 5px;
        }

        .error-message {
          color: red;
          font-size: 14px;
          text-align: center;
          margin-bottom: 10px;
        }

        @media (max-width: 768px) {
          .auth-container {
            min-height: 500px;
            max-width: 90%;
          }

          .auth-form {
            padding: 0 30px;
          }

          .maskot {
            max-width: 200px;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginRegister;