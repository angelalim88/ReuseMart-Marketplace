import ConfirmModal from "./ConfirmModal";

const DeleteKeranjangModal = ({ keranjang, onDelete }) => {

    const handleDelete = async () => {
      const currentModalEl = document.getElementById("delete-keranjang-modal");
      const currentModal = bootstrap.Modal.getInstance(currentModalEl);
      currentModal.hide();

      currentModalEl.addEventListener("hidden.bs.modal", async function handler() {
          currentModalEl.removeEventListener("hidden.bs.modal", handler);

          const confirmed = await ConfirmModal.show("Apakah Anda yakin ingin menghapus data?");
          
          if (!confirmed) {
            currentModal.show();
            return;
          }
          
          await onDelete(keranjang?.id_keranjang);
      })
    };

    return <>
      <ConfirmModal />
      <div className="modal fade" id="delete-keranjang-modal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Hapus keranjang</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
                <p className="">Apakah Anda yakin ingin menghapus produk <strong>{keranjang?.Barang?.nama}</strong> dari keranjang ?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} data-bs-dismiss="modal" aria-label="Close">Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </>
}

export default DeleteKeranjangModal;