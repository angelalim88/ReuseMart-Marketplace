import { useState, useEffect } from "react";

const AnswerDiskusiModal = ({onSubmit}) => {

    const [jawaban, setJawaban] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(jawaban);
        const modal = bootstrap.Modal.getInstance(document.getElementById('answer-diskusi-modal'));
        resetForm();
        modal.hide();
    }

    const resetForm = () => {
        setJawaban("");
    }

    return <>
        <form onSubmit={handleSubmit}>
            <div class="modal fade" id="answer-diskusi-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Masukan Jawaban</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="jawaban-diskusi-produk" class="form-label">Jawaban</label>
                        <textarea class="form-control" id="jawaban-diskusi-produk" name="jawaban-diskusi-produk" rows="3" value={jawaban} onChange={(e) => setJawaban(e.target.value)}></textarea>
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

export default AnswerDiskusiModal;