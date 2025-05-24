import ConfirmModal from "./ConfirmModal";

const AddKeranjangModal = ({ barang, onAdd }) => {

    const handleAdd = async () => {
      const currentModalEl = document.getElementById("add-keranjang-modal");
      const currentModal = bootstrap.Modal.getInstance(currentModalEl);
      currentModal.hide();

      currentModalEl.addEventListener("hidden.bs.modal", async function handler() {
          currentModalEl.removeEventListener("hidden.bs.modal", handler);

          const confirmed = await ConfirmModal.show("Apakah Anda yakin ingin menambahkan barang ke keranjang?");
          
          if (!confirmed) {
            currentModal.show();
            return;
          }
          
          await onAdd(barang?.id_barang);
      })
    };

    return <>
      <ConfirmModal />
      <div className="modal fade" id="add-keranjang-modal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Tambah Barang ke Keranjang</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
                <p className="">Apakah Anda yakin ingin memasukan produk <strong>{barang?.nama}</strong> ke keranjang ?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="button" className="btn btn-success" onClick={handleAdd} data-bs-dismiss="modal" aria-label="Close">Tambah</button>
            </div>
          </div>
        </div>
      </div>
    </>
}

export default AddKeranjangModal;