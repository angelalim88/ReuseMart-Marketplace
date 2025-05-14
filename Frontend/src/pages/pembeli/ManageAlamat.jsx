import React, { useState, useEffect } from 'react';
import { decodeToken } from "../../utils/jwtUtils";
import { apiAlamatPembeli } from '../../clients/AlamatPembeliServices';
import { apiPembeli } from '../../clients/PembeliService';
import DeleteAlamatModal from '../../components/modal/DeleteAlamatModal';
import AddAlamatModal from '../../components/modal/AddAlamatModal';
import UpdateAlamatModal from '../../components/modal/UpdateAlamatModal';
import { toast } from 'sonner';

const ManageAlamat = () => {
    const [dataAkun, setDataAkun] = useState(null);
    const [dataPembeli, setDataPembeli] = useState(null);
    const [dataAlamat, setDataAlamat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAlamat, setSelectedAlamat] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filteredAlamat, setFilteredAlamat] = useState([]);

    const deleteAlamat = async (id_alamat) => {
        try {
            // hapus alamat
            const response = await apiAlamatPembeli.deleteAlamatPembeli(id_alamat);
    
            // refresh list alamat
            const alamat = await apiAlamatPembeli.getAlamatPembeliByIdPembeli(dataPembeli.id_pembeli);
            setDataAlamat(alamat);
            if(response) toast.success("Berhasil menghapus alamat!");
            return response;
        } catch (error) {
            console.error("Gagal menghapus alamat: ", error);
            toast.error("Gagal menghapus alamat!");
        }
    }

    const addAlamat = async (newAlamat) => {
        try {
            //  tambah alamat
            const response = await apiAlamatPembeli.createAlamatPembeli(newAlamat);
    
            // ganti alamat utama
            if(newAlamat.is_main_address) {
                const alamatUtama = dataAlamat.find((alamat) => alamat.is_main_address === true);
              
                if (alamatUtama) {
                  alamatUtama.is_main_address = 0;
                  await apiAlamatPembeli.updateAlamatPembeli(alamatUtama.id_alamat, alamatUtama);
                }
            }
              
            // refresh list alamat
            const alamat = await apiAlamatPembeli.getAlamatPembeliByIdPembeli(dataPembeli.id_pembeli);
            setDataAlamat(alamat);
            if(response) toast.success("Berhasil menambahkan alamat!");
            return response;
        } catch (error) {
            console.error('Gagal menambahkan alamat: ', error);
            toast.error("Gagal menambahkan alamat!");
        }
    }

    const editAlamat = async (newAlamat) => {
        try {
            // ganti alamat utama
            if(newAlamat.is_main_address) {
                const alamatUtama = dataAlamat.find((alamat) => alamat.is_main_address === true);
              
                if (alamatUtama) {
                  alamatUtama.is_main_address = 0;
                  await apiAlamatPembeli.updateAlamatPembeli(alamatUtama.id_alamat, alamatUtama);
                }
            }
    
            // edit alamat
            const response = await apiAlamatPembeli.updateAlamatPembeli(newAlamat.id_alamat, newAlamat);
    
            // refresh list alamat
            const alamat = await apiAlamatPembeli.getAlamatPembeliByIdPembeli(dataPembeli.id_pembeli);
            setDataAlamat(alamat);
            if(response) toast.success("Berhasil mengubah alamat!");
            return response;
        } catch (error) {
            console.error("Gagal mengubah alamat: ", error);
            toast.error("Gagal menghapus alamat!");
        }
    }

    const handleShowModal = (alamat) => {
        setSelectedAlamat(alamat);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // 1. Decode token
                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("Token tidak ditemukan");
                
                const decoded = decodeToken(token);
                setDataAkun(decoded);
                if (!decoded?.id) throw new Error("Invalid token structure");

                // 2. Get pembeli data
                const pembeli = await apiPembeli.getPembeliByIdAkun(decoded.id);
                setDataPembeli(pembeli);
                
                if (!pembeli?.id_pembeli) throw new Error("Data pembeli tidak valid");

                // 3. Get alamat data
                const alamat = await apiAlamatPembeli.getAlamatPembeliByIdPembeli(pembeli.id_pembeli);
                // Pastikan response adalah array, jika tidak convert ke array
                setDataAlamat(Array.isArray(alamat) ? alamat : [alamat]);
            } catch (err) {
                setError(err.message);
                console.error("Error:", err);
                toast.error("Gagal mengambil data!");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 1. Urutkan nama_alamat dari A ke Z
    const sortByNamaAlamatAsc = () => {
        const sorted = [...dataAlamat].sort((a, b) => 
        a.nama_alamat.localeCompare(b.nama_alamat)
        );
        setDataAlamat(sorted);
    };
    
    // 2. Urutkan nama_alamat dari Z ke A
    const sortByNamaAlamatDesc = () => {
        const sorted = [...dataAlamat].sort((a, b) => 
        b.nama_alamat.localeCompare(a.nama_alamat)
        );
        setDataAlamat(sorted);
    };
    
    // 3. Tampilkan alamat utama (is_main_address === 1 atau true) paling atas
    const sortByMainAddressFirst = () => {
        const sorted = [...dataAlamat].sort((a, b) => 
        (b.is_main_address === true) - (a.is_main_address === true)
        );
        setDataAlamat(sorted);
    };

    // search
    const searchAlamat = () => {
        setFilteredAlamat(dataAlamat.filter((alamat) => {
            const keyword = searchKeyword.toLowerCase();
            return (
                alamat.nama_alamat.toLowerCase().includes(keyword) ||
                alamat.alamat_lengkap.toLowerCase().includes(keyword)
            );
        }));
    }    

    useEffect(() => {
        searchAlamat();
    }, [dataAlamat]);

    return (
        <main className="w-75 mx-auto mb-5 mt-8 px-4">
            <h1 className="fs-2 fw-bold mb-6">Halaman Kelola Alamat</h1>

            {/* Search and Filter */}
            <div className="flex justify-between items-center mb-6">
                <form action="" className='w-full'>
                    <input
                        type="text"
                        placeholder="Cari alamat..."
                        className="w-full max-w-md px-4 py-2 border rounded-full shadow-sm"
                        value={searchKeyword}
                        onChange={(e) => {
                            const keyword = e.target.value;
                            setSearchKeyword(keyword);
                            if (keyword.length !== 0) {
                              setFilteredAlamat(
                                dataAlamat.filter((alamat) =>
                                  alamat.nama_alamat.toLowerCase().includes(keyword.toLowerCase()) ||
                                  alamat.alamat_lengkap.toLowerCase().includes(keyword.toLowerCase())
                                )
                              );
                            } else {
                              setFilteredAlamat([]);
                            }
                        }}

                        onSubmit={(e) => {e.preventDefault();}}
                    />
                </form>
                <div className="dropdown">
                    <button className="btn dropdown-toggle rounded-pill" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Urutkan berdasarkan
                    </button>
                    <ul className="dropdown-menu">
                        <li><a className="dropdown-item" href="#" onClick={() => sortByNamaAlamatAsc()}>Nama alamat (A-Z)</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => sortByNamaAlamatDesc()}>Nama alamat (Z-A)</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => sortByMainAddressFirst()}>Alamat Utama</a></li>
                    </ul>
                </div>
            </div>

            {/* Tambah Alamat */}
            <div className="flex justify-end mb-6">
                <button className="bg-green-600 text-white px-6 py-2 rounded shadow" type="button" data-bs-toggle="modal" data-bs-target="#add-alamat-modal">
                    Tambah Alamat
                </button>
            </div>

            {/* Alamat Cards */}
            <div className="space-y-4 mb-4">
                {dataAlamat.length === 0 && searchKeyword.length === 0 && (
                    <div className="mx-auto my-5 text-center fw-bold">Belum memiliki alamat</div>
                )}

                {searchKeyword.length === 0 && dataAlamat.map((alamat, index) => (
                    <div key={alamat.id || index} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-lg">
                        {alamat.nama_alamat} {alamat.is_main_address && <i className="bi bi-patch-check-fill"></i>}
                        </h2>
                        <p className="text-gray-600 text-sm">{alamat.alamat_lengkap}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="button" data-bs-toggle="modal" data-bs-target="#update-alamat-modal" onClick={() => handleShowModal(alamat)}>
                        Edit
                        </button>
                        <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" data-bs-toggle="modal" data-bs-target="#delete-alamat-modal" onClick={() => handleShowModal(alamat)}>
                        Hapus
                        </button>
                    </div>
                    </div>
                ))}

                {searchKeyword.length > 0 && filteredAlamat.length === 0 && (
                    <div className="mx-auto my-5 text-center fw-bold">Tidak dapat menemukan alamat</div>
                )}

                {searchKeyword.length > 0 && filteredAlamat.map((alamat, index) => (
                    <div key={alamat.id || index} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-lg">
                        {alamat.nama_alamat} {alamat.is_main_address && <i className="bi bi-patch-check-fill"></i>}
                        </h2>
                        <p className="text-gray-600 text-sm">{alamat.alamat_lengkap}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="button" data-bs-toggle="modal" data-bs-target="#update-alamat-modal" onClick={() => handleShowModal(alamat)}>
                        Edit
                        </button>
                        <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" data-bs-toggle="modal" data-bs-target="#delete-alamat-modal" onClick={() => handleShowModal(alamat)}>
                        Hapus
                        </button>
                    </div>
                    </div>
                ))}
            </div>


            {/* Pagination */}
            {/* <div className="flex justify-center mt-8 space-x-2 text-sm">
                <button className="text-gray-500">&lt;</button>
                <button className="text-orange-500 font-semibold">1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>5</button>
                <button className="text-gray-500">&gt;</button>
            </div> */}
            
            <AddAlamatModal id_pembeli={dataPembeli?.id_pembeli} onAdd={addAlamat}/>
            <UpdateAlamatModal alamat={selectedAlamat} onEdit={editAlamat}/>
            <DeleteAlamatModal alamat={selectedAlamat} onDelete={deleteAlamat}/>
        </main>
    );
};

export default ManageAlamat;