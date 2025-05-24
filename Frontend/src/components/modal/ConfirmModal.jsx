import { useEffect, useRef, useState } from "react";

let resolver;

export function ConfirmModal() {
  const [message, setMessage] = useState("");
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  useEffect(() => {
    if (!window.bootstrap) return;
    bsModalRef.current = new window.bootstrap.Modal(modalRef.current, {
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.current.addEventListener("hidden.bs.modal", () => {
      const backdrops = document.querySelectorAll(".modal-backdrop");
      if (backdrops.length > 1) {
        for (let i = 0; i < backdrops.length - 1; i++) {
          backdrops[i].remove();
        }
      }
    });
  }, []);

  const handleResult = (answer) => {
    bsModalRef.current.hide();
    resolver(answer);
  };

  ConfirmModal.show = (msg) => {
    setMessage(msg);
    return new Promise((resolve) => {
      resolver = resolve;
      bsModalRef.current.show();
    });
  };

  return (
    <div className="modal fade" tabIndex="-1" ref={modalRef}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Konfirmasi</h5>
            <button type="button" className="btn-close" onClick={() => handleResult(false)}></button>
          </div>
          <div className="modal-body">{message}</div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => handleResult(false)}>Batal</button>
            <button className="btn btn-success" onClick={() => handleResult(true)}>Ok</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;