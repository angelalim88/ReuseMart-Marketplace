import { useState } from "react"
import { SendVerificationEmail } from "../../clients/AkunService";
import { toast } from "sonner";

const ForgotPasswordModal = () => {

    const [email, setEmail] = useState("");

    const resetForm = () => {
        setEmail("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            email
        };

        let response;

        try {
            response = await SendVerificationEmail(data);

            if (response) {
                toast.success(response.data.message);
            }
        } catch (error) {
            // Menangani error jika API gagal
            const errorMessage = error?.response?.data?.message || "Terjadi kesalahan saat mengirim data."; // Dapatkan pesan error dari respons API jika ada
            toast.error(errorMessage);
        } finally {
            resetForm();
    
            // Menutup modal setelah proses selesai (baik sukses atau error)
            const modal = bootstrap.Modal.getInstance(document.getElementById('forgot-password-modal'));
            modal.hide();
        }

    };

    return <>
        <form onSubmit={handleSubmit}>
        <div className="modal fade" id="forgot-password-modal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5" id="exampleModalLabel">Forgot Password</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
                </div>
                <div className="modal-body">
                    <div className="mb-3 w-100">
                        <label for="email-input" className="form-label">Email:</label>
                        <input required className="w-100 p-2 border-2 rounded form-control" type="email" id="email-input" placeholder="name@example.com" value={email} onChange={(e) => {setEmail(e.target.value);}} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Batal</button>
                    <button type="submit" className="btn btn-success">Kirim</button>
                </div>
                </div>
            </div>
        </div>
        </form>
    </>
}

export default ForgotPasswordModal