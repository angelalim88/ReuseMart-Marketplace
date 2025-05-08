import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from 'react-icons/fa';
import { GetOrganisasiAmalByAkun } from "../../clients/OrganisasiAmalService";
import { GetAllRequestDonasi, DeleteRequestDonasi, GetRequestDonasiByOrganisasi } from "../../clients/RequestDonasiService";
import { decodeToken } from "../../utils/jwtUtils";
import { Badge } from 'react-bootstrap';
import RequestDonasiModal from "../../components/modal/RequestDonasiModal";
import UpdateRequestDonasiModal from "../../components/modal/UpdateRequestDonasiModal";

const styles = {
  container: {
    backgroundColor: '#F8F9FA',
    minHeight: '100vh',
    paddingTop: '2%',
    paddingLeft: '8%',
    paddingRight: '8%',
  },
  card: {
    width: '25rem',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
    marginBottom: '30px',
  },
  cardImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  cardBody: {
    padding: '15px',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: '1rem',
    color: '#555',
  },
  buttonPrimary: {
    marginRight: '10px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '30px',
  },
  searchContainerStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: "2% 0% 2% 0%",
  },
  searchIconStyle: {
    transform: 'translateY(-10%)',
    transform: 'translateX(200%)',
    color: '#D9D9D9',
  },
  searchInputStyle: {
    padding: '10px 15px 10px 40px',
    borderRadius: '25px',
    border: '1px solid #D9D9D9',
    width: '100%',
    marginRight: '2%',
    backgroundColor: '#F8F9FA',
  },
  buttonStyle: {
    padding: '10px 2px',
    width: '200px',
    backgroundColor: '#028643',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
  },
};

const ORequest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [requestList, setRequestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idOrganisasi, setIdOrganisasi] = useState(null);
  const [akun, setAkun] = useState(null);
  const [organisasi, setOrganisasi] = useState(null);
  //state modal create
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  //state modal update
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setShowUpdateModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Token tidak ditemukan");
  
        const decoded = decodeToken(token);
        setAkun(decoded);
  
        if (!decoded?.id) throw new Error("Struktur token tidak valid");
  
        if (decoded.role === "Organisasi Amal") {
          const resOrganisasi = await GetOrganisasiAmalByAkun(decoded.id);
          const organisasiData = resOrganisasi.data;
          setOrganisasi(organisasiData);
  
          const orgId = organisasiData.id_organisasi;
          setIdOrganisasi(orgId);
  
          const resRequest = await GetRequestDonasiByOrganisasi(orgId);
          console.log(resRequest.data);
          setRequestList(resRequest.data);
        }
  
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError("Terjadi kesalahan saat memuat data");
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  const refreshData = async () => {
    if (idOrganisasi) {
      try {
        const response = await GetRequestDonasiByOrganisasi(idOrganisasi);
        console.log('Data Request', response.data);
        setRequestList(response.data || []);
      } catch (err) {
        console.error('Refresh error:', err);
        if (err.response) {
          if (err.response.status === 404) {
            setRequestList([]);
          } else if (err.response.status === 500) {
            setError('Server error: Unable to refresh request data. Please try again later.');
            setRequestList([]);
          } else {
            setError(`Failed to refresh request data: ${err.message}`);
          }
        } else {
          setError(`Failed to refresh request data: ${err.message}`);
        }
      }
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus request ini?")) {
      try {
        await DeleteRequestDonasi(id);
        alert("Request berhasil dihapus!");
        await refreshData();
      } catch (error) {
        console.error("Gagal menghapus request:", error);
        alert("Gagal menghapus request. Cek kembali koneksi atau server.");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('id-ID');
    const formattedTime = date.toLocaleTimeString('id-ID', { hour12: false });
    return `${formattedDate} | ${formattedTime}`;
  };

  const filteredRequestList = requestList.filter((request) => {
    const query = searchQuery.toLowerCase();
    return (
      request.id_request_donasi.toLowerCase().includes(query) ||
      request.deskripsi_request.toLowerCase().includes(query) ||
      request.status_request.toLowerCase().includes(query) ||
      request.OrganisasiAmal?.nama_organisasi?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={styles.container}>
      <h2>Data Request Donasi</h2>

      <div className="col">
        <div style={styles.searchContainerStyle}>
          <FaSearch style={styles.searchIconStyle} />
          <input
            type="text"
            placeholder="Cari Request (ID, Deskripsi, atau Status)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInputStyle}
          />
          <button style={styles.buttonStyle} onClick={handleOpen}>
            Tambah Request
          </button>
        </div>
      </div>

      <div className="row">
        {filteredRequestList.map((request) => (
          <div className="card d-flex flex-row align-items-center p-3 mb-4" style={{ borderRadius: '15px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex-grow-1">
              <p style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#6c757d' }}>#{request.id_request_donasi}</p>
              <h5 style={{ fontWeight: 'bold' }}>{request.nama_barang}</h5>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Tanggal Request: {formatDate(request.tanggal_request)}</p>
              <p style={{ margin: '2px 0' }}>
                Status:{" "}
                <span style={{ color: request.status_request === "Menunggu Konfirmasi" ? '#F0A500' : request.status_request === "Diterima" ? 'green' : 'red' }}>
                  {request.status_request === "Menunggu Konfirmasi"
                    ? "belum ada tanggapan"
                    : request.status_request.toLowerCase()}
                </span>
              </p>
              <p style={{ margin: 0 }}>Desc: {request.deskripsi_request}</p>
              <div className="d-flex mt-3">
                <button className="btn btn-danger me-2" onClick={() => handleDelete(request.id_request_donasi)}>Hapus</button>
                <button className="btn btn-success" onClick={() => handleEdit(request)}>Edit</button>
              </div>
            </div>
            <div>
              <img
                src={`http://localhost:3000/uploads/profile_picture/${request.OrganisasiAmal.Akun.profile_picture}`}
                alt="Foto Barang"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginLeft: '20px' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={styles.pagination}>
        <ul className="pagination">
          <li className="page-item"><a className="page-link" href="#">1</a></li>
          <li className="page-item"><a className="page-link" href="#">2</a></li>
          <li className="page-item"><a className="page-link" href="#">3</a></li>
          <li className="page-item"><a className="page-link" href="#">4</a></li>
          <li className="page-item"><a className="page-link" href="#">5</a></li>
        </ul>
      </div>

      <RequestDonasiModal
        show={showModal}
        handleClose={handleClose}
        onSuccess={refreshData}
        idOrganisasi={idOrganisasi}
      />

      <UpdateRequestDonasiModal
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        requestData={selectedRequest}
        onSuccess={refreshData}
      />
    </div>
  );
};

export default ORequest;