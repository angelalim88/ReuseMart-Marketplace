import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from 'react-bootstrap';
import { DeleteOrganisasiAmal, GetAllOrganisasiAmal, UpdateOrganisasiAmal } from '../../clients/OrganisasiAmalService';
import DeleteOrganisasiModal from '../../components/modal/DeleteOrganisasiModal';
import UpdateOrganisasiModal from '../../components/modal/UpdateOrganisasiModal';

const ManageOrganisasiPage = () => {
    const [organisasi, setOrganisasi] = useState([]);
    const [filteredOrganisasi, setFilteredOrganisasi] = useState([]);
    const [selectedOrganisasi, setSelectedOrganisasi] = useState(null);
    const [keyword, setKeyword] = useState("");

    const fetchOrganisasi =  async () => {
        const data = await GetAllOrganisasiAmal();
        setOrganisasi(Array.isArray(data.data) ? data.data : [data.data]);
    }

    const updateOrganisasi = async (formData) => {
        try {
            const response = await UpdateOrganisasiAmal(selectedOrganisasi.id_organisasi, formData);
            console.log(response);  // Menampilkan data response dari backend
            if (response) {
                await fetchOrganisasi();
                console.log("changed");
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    };    

    const deleteOrganisasi = async (id) => {
        await DeleteOrganisasiAmal(id);
        await fetchOrganisasi();
    }

    const searchOrganisasi = async (word) => {
        const data = organisasi.filter((org) => {
            word = word.toLowerCase();
            return(
                org.nama_organisasi.toLowerCase().includes(word) ||
                org.alamat.toLowerCase().includes(word) ||
                org.Akun.email.toLowerCase().includes(word) ||
                org.id_organisasi.toLowerCase().includes(word)
            );
        });
        setFilteredOrganisasi(data);
    }

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
    };

    useEffect(() => {
        if (keyword.trim() !== "") {
            const word = keyword.toLowerCase();
            searchOrganisasi(word);
        } else {
            setFilteredOrganisasi([]);
        }
    }, [organisasi, keyword]);
    

    useEffect(() => {
        fetchOrganisasi();
    }, []);

    return(
        <Container fluid className="p-0 bg-white">
            <style jsx>
                {`
                .org-card {
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 20px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .org-profile {
                    display: flex;
                    direction: row;
                    justify-content: justify-between;
                    margin-bottom: 15px;
                }

                .org-info {
                    flex-grow: 1;
                }

                .org-image {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .btn-group {
                    min-width: 25%;
                    align-self: end;
                }

                .search-bar {
                    border-radius: 20px;
                    padding-left: 15px;
                }

                .pagination .page-link {
                    color: black;
                    border: none;
                }

                @media (max-width: 768px) {
                    .org-card {
                        flex-direction: column;
                        align-items: flex-center;
                        gap: 20px;
                    }

                    .btn-group {
                        align-items: center;
                        align-self: center;
                    }

                    .org-profile {
                        flex-direction: column-reverse;
                        align-items: center;
                    }

                    .org-image {
                        margin-top: 10px;
                    }
                }
                `}
            </style>

            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className='fw-bold'>Data Organisasi Amal</h4>
                </div>

                <input type="text" className="form-control search-bar mb-4" placeholder="Cari organisasi..." value={keyword} onChange={(e) => { 
                    const word = e.target.value;
                    setKeyword(word);
                    if(word.length != 0) {
                        searchOrganisasi(word);
                    } else {
                        setFilteredOrganisasi([]);
                    }
                }} onSubmit={(e) => {e.preventDefault();}}/>

                {organisasi.length == 0 && keyword.length == 0 && (<div className="mx-auto my-5 text-center fw-bold">Belum memiliki organisasi</div>)}

                {keyword.length == 0 && organisasi.map((org, index) => (
                    <div className="org-card d-flex flex-column" key={index}>
                        <div className='org-profile w-100'>
                            <div className="org-info">
                                <p className="mb-1 text-muted">{org.id_organisasi}</p>
                                <h5 className="mb-1">{org.nama_organisasi}</h5>
                                <p className="mb-1">Alamat: {org.alamat}</p>  
                                <p className="mb-1">Tanggal Registrasi: {formatDateTime(org.tanggal_registrasi)}</p>
                                <p className="mb-0">Email: {org.Akun.email}</p>
                            </div>
                            <img
                                src={org.Akun.profile_picture == "" ? "http://localhost:3000/uploads/profile_picture/default.jpg" : `http://localhost:3000/uploads/profile_picture/${org.Akun.profile_picture}`}
                                alt="organisasi"
                                className="org-image mb-2 align-self-center"
                            />
                        </div>
                        <div className="btn-group d-flex flex-row justify-end">
                            <button className="btn btn-danger btn-delete me-3 rounded" onClick={() => {setSelectedOrganisasi(org)}} type="button" data-bs-toggle="modal" data-bs-target="#delete-organisasi-modal">Hapus</button>
                            <button className="btn btn-success btn-edit rounded" onClick={() => {setSelectedOrganisasi(org)}} type="button" data-bs-toggle="modal" data-bs-target="#update-organisasi-modal">Edit</button>
                        </div>
                    </div>
                ))}

                {keyword.length > 0 && filteredOrganisasi.length == 0 && (<div className="mx-auto my-5 text-center fw-bold">Tidak dapat menemukan organisasi</div>)}

                {keyword.length > 0 && filteredOrganisasi.map((org, index) => (
                    <div className="org-card d-flex flex-column" key={index}>
                        <div className='org-profile w-100'>
                            <div className="org-info">
                                <p className="mb-1 text-muted">{org.id_organisasi}</p>
                                <h5 className="mb-1">{org.nama_organisasi}</h5>
                                <p className="mb-1">Alamat: {org.alamat}</p>  
                                <p className="mb-1">Tanggal Registrasi: {formatDateTime(org.tanggal_registrasi)}</p>
                                <p className="mb-0">Email: {org.Akun.email}</p>
                            </div>
                            <img
                                src={org.Akun.profile_picture == "" ? "http://localhost:3000/uploads/profile_picture/default.jpg" : `http://localhost:3000/uploads/profile_picture/${org.Akun.profile_picture}`}
                                alt="organisasi"
                                className="org-image mb-2 align-self-center"
                            />
                        </div>
                        <div className="btn-group d-flex flex-row justify-end">
                            <button className="btn btn-danger btn-delete me-3 rounded" onClick={() => {setSelectedOrganisasi(org)}} type="button" data-bs-toggle="modal" data-bs-target="#delete-organisasi-modal">Hapus</button>
                            <button className="btn btn-success btn-edit rounded" onClick={() => {setSelectedOrganisasi(org)}} type="button" data-bs-toggle="modal" data-bs-target="#update-organisasi-modal">Edit</button>
                        </div>
                    </div>
                ))}

                <DeleteOrganisasiModal organisasi={selectedOrganisasi} onDelete={deleteOrganisasi}/>
                <UpdateOrganisasiModal organisasi={selectedOrganisasi} onEdit={updateOrganisasi}/>

                {/* Pagination
                <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                    {[1, 2, 3, 4, 5].map((page) => (
                    <li key={page} className="page-item">
                        <button className="page-link">{page}</button>
                    </li>
                    ))}
                </ul>
                </nav> */}
            </div>
        </Container>
    )
};

export default ManageOrganisasiPage;