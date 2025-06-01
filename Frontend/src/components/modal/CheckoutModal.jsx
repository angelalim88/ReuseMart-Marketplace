import ConfirmModal from "./ConfirmModal";

const CheckoutModal = ({ pembelian, onCheckout }) => {

    const formatMoney = (nominal) => {
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(parseFloat(nominal));
      return formatted;
    }

    const handleCheckout = async () => {
      const currentModalEl = document.getElementById("checkout-modal");
      const currentModal = bootstrap.Modal.getInstance(currentModalEl);
      currentModal.hide();

      currentModalEl.addEventListener("hidden.bs.modal", async function handler() {
          currentModalEl.removeEventListener("hidden.bs.modal", handler);

          const confirmed = await ConfirmModal.show("Apakah Anda yakin ingin melakukan pembelian?");
          
          if (!confirmed) {
            currentModal.show();
            return;
          }
          
          await onCheckout(pembelian);
      })
    };

    return <>
      <ConfirmModal />
      <div className="modal fade" id="checkout-modal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Pembelian</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
                <p className="">Apakah Anda ingin melakukan pembelian sebesar <strong>Rp {formatMoney(pembelian?.total_bayar)}</strong> ?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="button" className="btn btn-success" onClick={handleCheckout} data-bs-dismiss="modal" aria-label="Close">Ya</button>
            </div>
          </div>
        </div>
      </div>
    </>
}

export default CheckoutModal;