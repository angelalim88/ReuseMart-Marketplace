import { useState, useEffect } from "react";

const AddDiskusiModal = ({onSubmit}) => {

    const [pertanyaan, setPertanyaan] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(pertanyaan);
        const modal = bootstrap.Modal.getInstance(document.getElementById('add-diskusi-modal'));
        resetForm();
        modal.hide();
    }

    const resetForm = () => {
        setPertanyaan("");
    }

    return <>
        <form onSubmit={handleSubmit}>
            <div class="modal fade" id="add-diskusi-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Masukan Pertanyaan</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="pertanyaan-diskusi-produk" class="form-label">Pertanyaan</label>
                        <textarea class="form-control" id="pertanyaan-diskusi-produk" name="pertanyaan-diskusi-produk" rows="3" value={pertanyaan} onChange={(e) => setPertanyaan(e.target.value)}></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Batal</button>
                    <button type="submit" class="btn btn-success">Kirim</button>
                </div>
                </div>
            </div>
            </div>
        </form>
    </>
}

export default AddDiskusiModal;