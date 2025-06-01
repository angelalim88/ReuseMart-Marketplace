import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

const KirimBuktiBayarModal = ({ pembelian, onSend }) => {
  const [fotoPreview, setFotoPreview] = useState("");
  const fileInputRef = useRef(null);

  const isEnd = () => {
    const now = new Date().getTime();
    const end = new Date(pembelian?.tanggal_pembelian).getTime() + (15 * 60 * 1000);
    return now > end;
  };

  const resetForm = () => {
    if (pembelian?.bukti_bayar) {
      setFotoPreview(`http://localhost:3000/uploads/bukti_bayar/${pembelian?.bukti_bayar}`);
    } else {
      setFotoPreview("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    const currentModalEl = document.getElementById("kirim-bukti-bayar-modal");
    const currentModal = bootstrap.Modal.getInstance(currentModalEl);
    currentModal.hide();

    const confirmed = await ConfirmModal.show("Apakah Anda yakin ingin mengirim bukti bayar?");
    if (!confirmed) {
      currentModal.show();
      return;
    }

    if (isEnd()) {
      toast.error("Waktu pembayaran sudah habis!");
      resetForm();
      return;
    }

    const formData = new FormData();
    formData.append("tanggal_pelunasan", new Date());
    formData.append("status_pembelian", "Menunggu verifikasi pembayaran");

    const fileInput = document.getElementById("bukti-transfer");
    const file = fileInput.files[0];
    if(file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diperbolehkan!");
        return;
      }
      formData.append("bukti_transfer", file);
    }

    if (onSend) {
      await onSend(pembelian?.id_pembelian, formData);
    }

    resetForm();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diperbolehkan!");
        e.target.value = "";
        return;
      }
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSend}>
      <ConfirmModal />
      <div
        className="modal fade"
        id="kirim-bukti-bayar-modal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">Kirim Bukti Bayar</h1>
              <button type="button" className="btn-close" aria-label="Close" data-bs-dismiss="modal" onClick={resetForm}></button>
            </div>
            <div className="modal-body">
              <input
                type="file"
                className="form-control mb-3"
                onChange={handleFotoChange}
                accept="image/*"
                id="bukti-transfer"
                name="bukti_transfer"
                ref={fileInputRef}
                required
              />
              <p>Preview:</p>
              {fotoPreview || pembelian?.bukti_transfer != "" ? (
                <img src={fotoPreview || (pembelian?.bukti_transfer ? `http://localhost:3000/uploads/bukti_bayar/${pembelian?.bukti_transfer}` : '')} alt="Preview" className="img-fluid border w-100" />
              ) : (
                <div className="border p-5 text-center text-muted">
                  Tidak ada bukti bayar
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Tutup</button>
              <button type="submit" className="btn btn-success">Kirim</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default KirimBuktiBayarModal;