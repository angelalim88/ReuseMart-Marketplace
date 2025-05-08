import { useEffect, useState } from "react";
import { ChangePassword } from "../../clients/AkunService";

const ResetEmployeePassModal = ({ pegawai }) => {

    const [dataPegawai, setDataPegawai] = useState(null);

    const resetPassword = async () => {
      const newPass = new Date(dataPegawai.tanggal_lahir).toLocaleDateString('id-ID');
      const newData = {
        newPassword: newPass,
      }
      
      const response = await ChangePassword(dataPegawai.id_akun, newData);
      
      if(response) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('reset-emmployee-pass-modal'));
        modal.hide();
      }
    };

    useEffect(() => {
      if(pegawai) {
        setDataPegawai(pegawai);
      }
    }, [pegawai]);

    return <div className="modal fade" id="reset-emmployee-pass-modal" tabIndex="-1" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="modal-title fs-5" id="exampleModalLabel">Reset Password</h1>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div className="modal-body">
            <p className="">Apakah Anda yakin ingin mereset password <strong>{pegawai?.nama_pegawai}</strong> ?</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
          <button type="button" className="btn btn-primary" onClick={resetPassword}>Reset</button>
        </div>
      </div>
    </div>
  </div>
}

export default ResetEmployeePassModal;