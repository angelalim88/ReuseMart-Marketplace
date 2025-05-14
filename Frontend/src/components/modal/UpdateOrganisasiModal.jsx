import { useEffect, useRef, useState } from "react";

const UpdateOrganisasiModal = ({ organisasi, onEdit }) => {

    const [namaOrganisasi, setNamaOrganisasi] = useState("");
    const [alamat, setAlamat]  = useState("");
    const [previewImage, setPreviewImage] = useState("");
    const fileInputRef = useRef(null);

    const handleEdit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("nama_organisasi", namaOrganisasi);
      formData.append("alamat", alamat);
    
      const fileInput = document.getElementById("profile-picture");
      const file = fileInput.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("File yang diunggah harus berupa gambar!");
          return;
        }
        formData.append("profile_picture", fileInput.files[0]);
      }
    
      if (onEdit) {
        await onEdit(formData); // Kirim ke parent
      }
    
      const modal = bootstrap.Modal.getInstance(document.getElementById('update-organisasi-modal'));
      modal.hide();
      resetForm();
    };    

    const handleImageChange = (e) => {
      const file = e.target.files[0];

      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);
      }
    };

    const resetForm = () => {
      setNamaOrganisasi(organisasi.nama_organisasi ?? "");
      setAlamat(organisasi.alamat ?? "");
      setPreviewImage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }

    useEffect(() => {
      if(organisasi) {
        setNamaOrganisasi(organisasi.nama_organisasi ?? "");
        setAlamat(organisasi.alamat ?? "");
      }
    }, [organisasi]);

    return <form onSubmit={handleEdit}>
      <div className="modal fade" id="update-organisasi-modal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">Update Organisasi Amal</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="profile-picture" className="form-label fw-semibold w-100 text-center">Profile Picture</label>
                  <div
                    className="circle mb-2 mx-auto mt-1 mb-3"
                    style={{
                      backgroundImage: `url(${previewImage || (organisasi?.Akun?.profile_picture ? `http://localhost:3000/uploads/profile_picture/${organisasi.Akun.profile_picture}` : 'http://localhost:3000/uploads/profile_picture/default.jpg')})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                    }}
                  ></div>
                  <input type="file" className="form-control" id="profile-picture" name="profile_picture" onChange={handleImageChange} ref={fileInputRef} />
                </div>

                <div className="mb-3">
                  <label htmlFor="nama-organisasi" className="form-label fw-semibold">Nama Organisasi</label>
                  <input required type="text" className="form-control" id="nama-organisasi" name="nama_organisasi" value={namaOrganisasi} onChange={(e) => setNamaOrganisasi(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label htmlFor="alamat" className="form-label fw-semibold">Alamat</label>
                  <input required type="text" className="form-control" id="alamat" name="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Batal</button>
                <button type="submit" className="btn btn-success">Edit</button>
              </div>
            </div>
          </div>
      </div>
    </form>
}

export default UpdateOrganisasiModal;