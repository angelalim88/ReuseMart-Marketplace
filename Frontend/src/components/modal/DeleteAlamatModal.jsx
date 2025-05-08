const DeleteAlamatModal = ({ alamat, onDelete }) => {

    const handleDelete = async () => {
        await onDelete(alamat?.id_alamat);
    };

    return <div className="modal fade" id="delete-alamat-modal" tabIndex="-1" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="modal-title fs-5" id="exampleModalLabel">Hapus Alamat</h1>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div className="modal-body">
            <p className="">Apakah Anda yakin ingin menghapus alamat <strong>{alamat?.nama_alamat}</strong> ({alamat?.alamat_lengkap}) ?</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} data-bs-dismiss="modal" aria-label="Close">Hapus</button>
        </div>
      </div>
    </div>
  </div>
}

export default DeleteAlamatModal;