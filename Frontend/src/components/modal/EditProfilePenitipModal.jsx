import { useState, useEffect, useRef } from "react";

const EditProfilePenitipModal = ({data, onUpdate}) => {
    const [nama, setNama] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const [fotoFile, setFotoFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        if (fotoFile) {
            formData.append("profile_picture", fotoFile);
        }

        await onUpdate(nama, formData);
        
        const modalEl = document.getElementById('edit-profile-penitip-modal');
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    }

    const resetForm = () => {
        if(data) {
            setNama(data?.penitip?.nama_penitip);
            setFotoPreview(`http://localhost:3000/uploads/profile_picture/${data?.akun?.profile_picture}`);
            setFotoFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    }

    useEffect(() => {
        if (data) {
            console.log(data);
            
            setNama(data?.penitip?.nama_penitip);
            setFotoPreview(`http://localhost:3000/uploads/profile_picture/${data?.akun?.profile_picture}`);
        }
    }, [data]);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Hanya file gambar yang diperbolehkan!");
                e.target.value = "";
                return;
            }

            setFotoFile(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };


    return <>
        <form onSubmit={(e) => handleSubmit(e)}>
            <div class="modal fade" id="edit-profile-penitip-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Edit Profile</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
                </div>
                <div class="modal-body">
                    <img
                        src={fotoPreview || 'http://localhost:3000/uploads/profile_picture/default.jpg'}
                        alt="Foto Profil"
                        className="rounded-circle mx-auto w-100"
                        style={{
                            maxWidth:'80px',
                            minWidth: '40px',
                            aspectRatio: '1/1'
                        }}
                    />
                    <div class="mb-3">
                        <label for="foto-profil" class="form-label">Foto profil</label>
                        <input class="form-control" type="file" id="foto-profil" onChange={handleFotoChange} accept="image/*" ref={fileInputRef}/>
                    </div>
                    <div class="mb-3">
                        <label for="nama" class="form-label">Nama</label>
                        <input type="text" class="form-control" id="nama" placeholder="nama" value={nama} onChange={(e) =>  {setNama(e.target.value)}} required />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Close</button>
                    <button type="submit" class="btn btn-success">Simpan</button>
                </div>
                </div>
            </div>
            </div>
        </form>
    </>
}

export default EditProfilePenitipModal;