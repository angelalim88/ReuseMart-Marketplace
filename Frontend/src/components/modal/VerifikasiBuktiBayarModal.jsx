import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const VerifikasiBuktiBayarModal = ({pembelian, onVerification}) => {

    const [ressult, setRessult] = useState(null);

    const formatMoney = (nominal) => {
        const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
        }).format(parseFloat(nominal));
        return formatted;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentModalEl = document.getElementById("verifikasi-bukti-bayar-modal");
        const currentModal = bootstrap.Modal.getInstance(currentModalEl);
        currentModal.hide();

        currentModalEl.addEventListener("hidden.bs.modal", async function handler() {
            currentModalEl.removeEventListener("hidden.bs.modal", handler);

            const confirmed = await ConfirmModal.show("Apakah Anda yakin dengan pilihan anda?");
            
            if (!confirmed) {
                currentModal.show();
                return;
            }
            
            await onVerification(ressult);
        })
    }

    return <>
        <ConfirmModal />
        <form onSubmit={handleSubmit}>
            <div class="modal fade" id="verifikasi-bukti-bayar-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="staticBackdropLabel">Verifikasi bukti bayar</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Apakah bukti bayar untuk pembelian {pembelian?.id_pembelian} sebesar Rp {formatMoney(pembelian?.total_bayar)} valid?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-danger" onClick={() => setRessult(false)}>Tidak valid</button>
                        <button type="submit" class="btn btn-success" onClick={() => setRessult(true)}>Valid</button>
                    </div>
                    </div>
                </div>
            </div>
        </form>
    </>
}

export default VerifikasiBuktiBayarModal;