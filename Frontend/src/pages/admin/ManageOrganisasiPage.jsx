import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from 'react-bootstrap';
import { DeleteOrganisasiAmal, GetAllOrganisasiAmal, UpdateOrganisasiAmal } from '../../clients/OrganisasiAmalService';
import DeleteOrganisasiModal from '../../components/modal/DeleteOrganisasiModal';
import UpdateOrganisasiModal from '../../components/modal/UpdateOrganisasiModal';
import Pagination from "../../components/pagination/Pagination";
import { toast } from 'sonner';

const ManageOrganisasiPage = () => {
    const [organisasi, setOrganisasi] = useState([]);
    const [selectedOrganisasi, setSelectedOrganisasi] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortMethod, setSortMethod] = useState("id-ascending");
    const itemsPerPage = 5;

    const fetchOrganisasi = async () => {
        try {
            const data = await GetAllOrganisasiAmal();
            setOrganisasi(Array.isArray(data.data) ? data.data : [data.data]);
        } catch (error) {
            toast.error("Gagal menampilkan data organisasi!");
            console.error("Gagal menampilkan data organisasi: ", error);
        }
    };

    const updateOrganisasi = async (formData) => {
        try {
            const response = await UpdateOrganisasiAmal(selectedOrganisasi.id_organisasi, formData);
            if (response) {
                await fetchOrganisasi();
                toast.success("Berhasil mengubah data organisasi!");
            }
        } catch (error) {
            toast.error("Gagal mengubah data organisasi!");
            console.error("Gagal mengubah data organisasi: ", error);
        }
    };

    const deleteOrganisasi = async (id) => {
        try {
            const response = await DeleteOrganisasiAmal(id);
            if (response) {
                await fetchOrganisasi();
                toast.success("Berhasil menghapus data organisasi!");
            }
        } catch (error) {
            toast.error("Gagal menghapus data organisasi!");
            console.error("Gagal menghapus data organisasi: ", error);
        }
    };

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

    const extractIdNumber = (id) => {
        const match = id.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    };

    useEffect(() => {
        fetchOrganisasi();
    }, []);

    // Filter data berdasarkan keyword
    const filtered = organisasi.filter((org) => {
        return (
            org.nama_organisasi.toLowerCase().includes(keyword.toLowerCase()) ||
            org.alamat.toLowerCase().includes(keyword.toLowerCase()) ||
            org.Akun.email.toLowerCase().includes(keyword.toLowerCase()) ||
            org.id_organisasi.toLowerCase().includes(keyword.toLowerCase())
        );
    });

    const sortedOrganisasi = [...filtered].sort((a, b) => {
        switch (sortMethod) {
            case "nama-ascending":
                return a.nama_organisasi.localeCompare(b.nama_organisasi);
            case "nama-descending":
                return b.nama_organisasi.localeCompare(a.nama_organisasi);
            case "date-ascending":
                return new Date(a.tanggal_registrasi) - new Date(b.tanggal_registrasi);
            case "date-descending":
                return new Date(b.tanggal_registrasi) - new Date(a.tanggal_registrasi);
            case "id-ascending":
                return extractIdNumber(a.id_organisasi) - extractIdNumber(b.id_organisasi);
            case "id-descending":
                return extractIdNumber(b.id_organisasi) - extractIdNumber(a.id_organisasi);
            default:
                return 0;
        }
    });

    const paginatedOrganisasi = sortedOrganisasi.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
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

                <div className="d-flex flex-column flex-md-row">

                    <input
                        type="text"
                        className="form-control search-bar mb-4"
                        placeholder="Cari organisasi..."
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setCurrentPage(1); // Reset ke halaman 1 setiap kali search berubah
                        }}
                    />

                    <div class="dropdown ">
                        <button class="btn dropdown-toggle rounded-pill" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Urutkan berdasarkan
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class={`dropdown-item ${sortMethod == 'nama-ascending' ? 'fw-bold' : ''}`} href="#" onClick={() => {setSortMethod('nama-ascending')}}>nama (menaik)</a></li>
                            <li><a class={`dropdown-item ${sortMethod == 'nama-descending' ? 'fw-bold' : ''}`} href="#" onClick={() => {setSortMethod('nama-descending')}}>nama (menurun)</a></li>
                            <li><a class={`dropdown-item ${sortMethod == 'date-ascending' ? 'fw-bold' : ''}`} href="#" onClick={() => {setSortMethod('date-ascending')}}>tanggal registrasi (menaik)</a></li>
                            <li><a class={`dropdown-item ${sortMethod == 'date-descending' ? 'fw-bold' : ''}`} href="#" onClick={() => {setSortMethod('date-descending')}}>tanggal registrasi (menurun)</a></li>
                            <li><a class={`dropdown-item ${sortMethod == 'id-ascending' ? 'fw-bold' : ''}`} href="#" onClick={() => {setSortMethod('id-ascending')}}>id organisasi (menaik)</a></li>
                            <li><a class={`dropdown-item ${sortMethod == 'id-descending' ? 'fw-bold' : ''}`} href="#" onClick={() => {setSortMethod('id-descending')}}>id organisasi (menurun)</a></li>
                        </ul>
                    </div>
                </div>

                {organisasi.length === 0 && (
                    <div className="mx-auto my-5 text-center fw-bold">Belum memiliki organisasi</div>
                )}

                {keyword.length > 0 && filtered.length === 0 && (
                    <div className="mx-auto my-5 text-center fw-bold">Tidak dapat menemukan organisasi</div>
                )}

                {paginatedOrganisasi.map((org, index) => (
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
                                src={org.Akun.profile_picture === "" ? "http://localhost:3000/uploads/profile_picture/default.jpg" : `http://localhost:3000/uploads/profile_picture/${org.Akun.profile_picture}`}
                                alt="organisasi"
                                className="org-image mb-2 align-self-center"
                            />
                        </div>
                        <div className="btn-group d-flex flex-row justify-end">
                            <button className="btn btn-danger btn-delete me-3 rounded" onClick={() => setSelectedOrganisasi(org)} type="button" data-bs-toggle="modal" data-bs-target="#delete-organisasi-modal">Hapus</button>
                            <button className="btn btn-success btn-edit rounded" onClick={() => setSelectedOrganisasi(org)} type="button" data-bs-toggle="modal" data-bs-target="#update-organisasi-modal">Edit</button>
                        </div>
                    </div>
                ))}

                <DeleteOrganisasiModal organisasi={selectedOrganisasi} onDelete={deleteOrganisasi} />
                <UpdateOrganisasiModal organisasi={selectedOrganisasi} onEdit={updateOrganisasi} />

                {filtered.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        paginate={(numberPage) => setCurrentPage(numberPage)}
                    />
                )}
            </div>
        </Container>
    );
};

export default ManageOrganisasiPage;
