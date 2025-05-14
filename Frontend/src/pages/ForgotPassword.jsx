import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChangePassword } from "../clients/AkunService";
import { decodeToken } from "../utils/jwtUtils";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirm = () => setShowConfirm(!showConfirm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(password == confirmPassword) {
            const decoded = decodeToken(token);
            const data = { newPassword: password }
            let response;
            try {
                response = await ChangePassword(decoded.id, data);
                if(response) {
                    toast.success("Berhasil mengubah password!");
                    navigate("/login");
                }
            } catch (error) {
                const errorMessage = error?.response?.data?.message || "Terjadi kesalahan saat mengirim data.";
                toast.error(errorMessage);
                console.error(errorMessage);
            }
        } else {
            toast.error("Password & Konfirmasi tidak sama!");
        }
    }

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlToken = queryParams.get("token");
        if (urlToken) {
            setToken(urlToken);
            const decoded = decodeToken(urlToken);

            if(!decoded?.id) {
                navigate('/login');
                toast.error('Token tidak valid!');
                console.error('Token tidak valid!');
                
            }
        } else {
            navigate('/login');
            toast.error("Token tidak ditemukan!");
            console.error("Token tidak ditemukan!");
        }
    }, []);

    return (
        <>
            <style>
                {`
                .password-wrapper {
                    position: relative;
                }
                .toggle-icon {
                    position: absolute;
                    right: 10px;
                    top: 75%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    z-index: 2;
                }
                `}
            </style>
            <form onSubmit={handleSubmit}>
                
            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-12 border p-4 rounded shadow-sm">
                        <h4 className="mb-4 text-center">Reset Password</h4>

                        {/* Password Field */}
                        <div className="mb-3 password-wrapper">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="form-control"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => {setPassword(e.target.value)}}
                                required
                                />
                            <span className="toggle-icon" onClick={togglePassword}>
                                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                            </span>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="mb-3 password-wrapper">
                            <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                            <input
                                type={showConfirm ? "text" : "password"}
                                id="confirm-password"
                                className="form-control"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => {setConfirmPassword(e.target.value)}}
                                required
                                />
                            <span className="toggle-icon" onClick={toggleConfirm}>
                                <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                            </span>
                        </div>

                        <button type="submit" className="btn btn-success w-100 mt-3">Submit</button>
                    </div>
                </div>
            </div>
            </form>
        </>
    );
};

export default ForgotPassword;
