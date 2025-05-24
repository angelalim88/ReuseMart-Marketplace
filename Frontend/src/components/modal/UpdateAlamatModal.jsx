import { useEffect, useState } from "react";
import ConfirmModal from "./ConfirmModal";

const UpdateAlamatModal = ({ alamat, onEdit }) => {

    const [idPembeli, setIdPembeli] = useState("");
    const [idAlamat, setIdAlamat] = useState("");
    const [namaAlamat, setNamaAlamat] = useState("");
    const [alamatLengkap, setAlamatLengkap] = useState("");
    const [isMainAddress, setIsMainAddress] = useState(false);

    const resetForm = () => {
      if (alamat) {
        setIdPembeli(alamat.id_pembeli ?? "");
        setIdAlamat(alamat.id_alamat ?? "");
        setNamaAlamat(alamat.nama_alamat ?? "");
        setAlamatLengkap(alamat.alamat_lengkap ?? "");
        setIsMainAddress(Boolean(alamat.is_main_address) ?? false);
      }
    }

    const handleEdit = async (e) => {
      e.preventDefault();

      const currentModalEl = document.getElementById("update-alamat-modal");
      const currentModal = bootstrap.Modal.getInstance(currentModalEl);
      currentModal.hide();
      
      currentModalEl.addEventListener("hidden.bs.modal", async function handler() {
        currentModalEl.removeEventListener("hidden.bs.modal", handler);

        const confirmed = await ConfirmModal.show("Apakah Anda yakin ingin menyimpan perubahan?");
        
        if (!confirmed) {
          currentModal.show();
          return;
        }

        const newAlamat = {
          id_pembeli: idPembeli,
          id_alamat: idAlamat,
          nama_alamat: namaAlamat,
          alamat_lengkap: alamatLengkap,
          is_main_address: isMainAddress
        }
        
        if(onEdit){
          await onEdit(newAlamat);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('update-alamat-modal'));
        modal.hide();
        resetForm();
      });
    };

    useEffect(() => {
        if (alamat) {
            setIdPembeli(alamat.id_pembeli ?? "");
            setIdAlamat(alamat.id_alamat ?? "");
            setNamaAlamat(alamat.nama_alamat ?? "");
            setAlamatLengkap(alamat.alamat_lengkap ?? "");
            setIsMainAddress(Boolean(alamat.is_main_address) ?? false);
        }
    }, [alamat]);

    return <>
      <ConfirmModal />
      <form onSubmit={handleEdit}>
        <div className="modal fade" id="update-alamat-modal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">Edit Alamat</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="nama-alamat" className="form-label fw-semibold">Nama Alamat</label>
                    <input required type="text" className="form-control" id="nama-alamat" name="nama_alamat" value={namaAlamat} onChange={(e) => setNamaAlamat(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="alamat-lengkap" className="form-label fw-semibold">Alamat Lengkap</label>
                    <input required type="text" className="form-control" id="alamat-lengkap" name="alamat_lengkap" value={alamatLengkap} onChange={(e) => setAlamatLengkap(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <input type="checkbox" className="form-check-input" id="is-main-address" name="is_main_address" checked={isMainAddress} onChange={(e) => setIsMainAddress(e.target.checked)}/>
                    <label htmlFor="is-main-address" className="ms-2 form-check-label">Jadikan alamat utama?</label>
                  </div>

                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Batal</button>
                  <button type="submit" className="btn btn-success">Edit</button>
                </div>
              </div>
            </div>
        </div>
      </form>
    </>
}

export default UpdateAlamatModal;