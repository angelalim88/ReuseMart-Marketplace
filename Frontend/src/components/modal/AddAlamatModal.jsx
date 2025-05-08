import { useState, useEffect } from "react";

const AddAlamatModal = ({ id_pembeli, onAdd }) => {

    // const [alamat, setAlamat] = useState(null);
    const [namaAlamat, setNamaAlamat] = useState("");
    const [alamatLengkap, setAlamatLengkap] = useState("");
    const [isMainAddress, setIsMainAddress] = useState(false);

    const resetForm = () => {
      setNamaAlamat("");
      setAlamatLengkap("");
      setIsMainAddress(false);
    }

    const handleAdd = async (e) => {
      e.preventDefault();
      const alamat = {
        id_pembeli,
        nama_alamat: namaAlamat,
        alamat_lengkap: alamatLengkap,
        is_main_address: isMainAddress
      }
      
      if(onAdd){
        await onAdd(alamat);
      }

      resetForm();

      const modal = bootstrap.Modal.getInstance(document.getElementById('add-alamat-modal'));
      modal.hide();
    };

    useEffect(() => {
      
    }, []);

    return <form onSubmit={handleAdd}>
      <div className="modal fade" id="add-alamat-modal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">Tambah Alamat</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="nama-alamat" className="form-label fw-semibold">Nama Alamat</label>
                  <input type="text" className="form-control" id="nama-alamat" name="nama_alamat" value={namaAlamat} onChange={(e) => setNamaAlamat(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label htmlFor="alamat-lengkap" className="form-label fw-semibold">Alamat Lengkap</label>
                  <input type="text" className="form-control" id="alamat-lengkap" name="alamat_lengkap" value={alamatLengkap} onChange={(e) => setAlamatLengkap(e.target.value)} />
                </div>

                <div className="mb-3">
                  <input type="checkbox" className="form-check-input" id="is-main-address" name="is_main_address" checked={isMainAddress} onChange={(e) => setIsMainAddress(e.target.checked)}/>
                  <label htmlFor="is-main-address" className="ms-2 form-check-label">Jadikan alamat utama?</label>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Batal</button>
                <button type="submit" className="btn btn-success" >Tambah</button>
              </div>
            </div>
          </div>
      </div>
    </form>
}

export default AddAlamatModal;