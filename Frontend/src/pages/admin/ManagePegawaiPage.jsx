import React, { useState, useEffect } from 'react';
import { 
  GetAllPegawai, 
  CreatePegawai, 
  UpdatePegawai, 
  DeletePegawai,
  GetPegawaiById,
  GetAkunByPegawaiId
} from '../../clients/PegawaiService';
import { Container, Row, Col, Form, Button, Card, Modal, Pagination, Nav } from 'react-bootstrap';
import defaultAvatar from '../../assets/images/profile_picture/default.jpg';
import { Link } from "react-router-dom";
import TopNavigation from "../../components/navigation/TopNavigation";
import ToastNotification from "../../components/toast/ToastNotification";
import RoleSidebar from "../../components/navigation/Sidebar";
import EmployeeCard from "../../components/card/CardPegawai";
import PaginationComponent from "../../components/pagination/Pagination";
import ResetEmployeePassModal from '../../components/modal/ResetEmployeePassModal';
import ConfirmationModalUniversal from "../../components/modal/ConfirmationModalUniversal";

const ManagePegawaiPage = () => {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentPegawai, setCurrentPegawai] = useState({
    nama_pegawai: '',
    tanggal_lahir: '',
    akun: {
      profile_picture: '',
      email: '',
      password: '',
      role: ''
    }
  });
  const [resetPassword, setResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [error, setError] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Confirmation modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationType, setConfirmationType] = useState('warning');

  const roles = [
    { id: 'Pegawai Gudang', name: 'Pegawai Gudang' },
    { id: 'Kurir', name: 'Kurir' },
    { id: 'Admin', name: 'Admin' },
    { id: 'Customer Service', name: 'Customer Service' },
    { id: 'Hunter', name: 'Hunter' },
  ];

  useEffect(() => {
    fetchPegawai();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const fetchPegawai = async () => {
    try {
      setLoading(true);
      console.log('Fetching all employees data...');
      const response = await GetAllPegawai();
      console.log('Employees data fetched successfully:', response.data);
      setPegawaiList(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pegawai data:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError('Failed to load employee data. Please try again.');
      showNotification('Failed to load employee data. Please try again.', 'danger');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role === selectedRole ? '' : role);
  };

  const handleAddPegawai = () => {
    setModalType('add');
    setCurrentPegawai({
      nama_pegawai: '',
      tanggal_lahir: '',
      akun: {
        profile_picture: defaultAvatar,
        email: '',
        password: '',
        role: ''
      }
    });
    setImagePreview(null);
    setProfilePicture(null);
    setError('');
    setShowModal(true);
  };

  const handleEditPegawai = async (id) => {
    try {
      console.log(`Fetching employee details for ID: ${id}`);
      const response = await GetPegawaiById(id);
      const pegawaiData = response.data;
      console.log('Employee details fetched successfully:', pegawaiData);
      
      setCurrentPegawai({
        id_pegawai: pegawaiData.id_pegawai,
        nama_pegawai: pegawaiData.nama_pegawai,
        tanggal_lahir: pegawaiData.tanggal_lahir,
        akun: pegawaiData.Akun || pegawaiData.akun || {
          id_akun: pegawaiData.id_akun,
          email: '',
          role: '',
        }
      });
      
      setResetPassword(false);
      setNewPassword('');
      setImagePreview(null);
      setProfilePicture(null);
      setModalType('edit');
      setError('');
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching pegawai details:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        employee_id: id
      });
      setError('Failed to load employee details. Please try again.');
      showNotification('Failed to load employee details. Please try again.', 'danger');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('akun.')) {
      const akunField = name.split('.')[1];
      setCurrentPegawai({
        ...currentPegawai,
        akun: {
          ...currentPegawai.akun,
          [akunField]: value
        }
      });
    } else {
      setCurrentPegawai({
        ...currentPegawai,
        [name]: value
      });
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      console.log(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPasswordChange = (e) => {
    setResetPassword(e.target.checked);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (modalType === 'add') {
        if(currentPegawai.tanggal_lahir > Date.now()){
          showNotification("Tanggal Lebih dari waktu saat ini!", 'danger');
        } else {
          console.log('Creating new employee with data:', {
            nama_pegawai: currentPegawai.nama_pegawai,
            tanggal_lahir: currentPegawai.tanggal_lahir,
            email: currentPegawai.akun.email,
            role: currentPegawai.akun.role,
            has_profile_picture: !!profilePicture
          });
  
          const formData = new FormData();
          formData.append('nama_pegawai', currentPegawai.nama_pegawai);
          formData.append('tanggal_lahir', currentPegawai.tanggal_lahir);
          formData.append('email', currentPegawai.akun.email);
          formData.append('password', currentPegawai.akun.password || 'defaultPassword');
          formData.append('role', currentPegawai.akun.role);
          
          if (profilePicture) {
            formData.append('profile_picture', profilePicture);
          }
          
          const response = await CreatePegawai(formData);
          console.log('Employee created successfully:', response.data);
          showNotification('Pegawai berhasil ditambahkan!', 'success');
          setShowModal(false);
          fetchPegawai(); 
        }
      } else {
        setConfirmationTitle('Konfirmasi Update Pegawai');
        setConfirmationMessage('Apakah Anda yakin ingin memperbarui data pegawai ini?');
        setConfirmationAction(() => updatePegawai);
        setConfirmationType('warning');
        setShowConfirmationModal(true);
      }
    } catch (error) {
      console.error('Error saving pegawai data:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        operation: modalType === 'add' ? 'create' : 'update',
        employee_data: currentPegawai
      });
      
      const errorMessage = error.response?.data?.error || 'Failed to save employee data. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'danger');
    }
  };

  const updatePegawai = async () => {
    try {
      console.log('Updating employee with ID:', currentPegawai.id_pegawai, {
        nama_pegawai: currentPegawai.nama_pegawai,
        tanggal_lahir: currentPegawai.tanggal_lahir,
        email: currentPegawai.akun.email,
        role: currentPegawai.akun.role,
        reset_password: resetPassword,
        has_new_profile_picture: !!profilePicture
      });
      
      const formData = new FormData();
      
      formData.append('nama_pegawai', currentPegawai.nama_pegawai);
      formData.append('tanggal_lahir', currentPegawai.tanggal_lahir);
      
      formData.append('email', currentPegawai.akun.email);
      formData.append('role', currentPegawai.akun.role);
      
      if (resetPassword && newPassword) {
        formData.append('password', newPassword);
      }
      
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }
      
      const response = await UpdatePegawai(currentPegawai.id_pegawai, formData);
      console.log('Employee updated successfully:', response.data);
      showNotification('Data pegawai berhasil diperbarui!', 'success');
      setShowModal(false);
      fetchPegawai();
    } catch (error) {
      console.error('Error updating pegawai:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update employee data.';
      setError(errorMessage);
      showNotification(errorMessage, 'danger');
    }
  };

  const handleDelete = (id) => {
    setCurrentPegawai(prev => ({ ...prev, id_pegawai: id }));
    setConfirmationTitle('Konfirmasi Hapus Pegawai');
    setConfirmationMessage('Apakah Anda yakin ingin menghapus pegawai ini? Tindakan ini tidak dapat dibatalkan.');
    setConfirmationAction(() => deletePegawai);
    setConfirmationType('danger');
    setShowConfirmationModal(true);
  };

  const deletePegawai = async () => {
    try {
      console.log(`Deleting employee with ID: ${currentPegawai.id_pegawai}`);
      const response = await DeletePegawai(currentPegawai.id_pegawai);
      console.log('Employee deleted successfully:', response.data);
      showNotification('Pegawai berhasil dihapus!', 'success');
      fetchPegawai();
    } catch (error) {
      console.error('Error deleting pegawai:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        employee_id: currentPegawai.id_pegawai
      });
      setError('Failed to delete employee. Please try again.');
      showNotification('Gagal menghapus pegawai. Silakan coba lagi.', 'danger');
    }
  };

  const filteredPegawai = pegawaiList.filter(pegawai => {
    const matchesSearch = pegawai.nama_pegawai?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pegawai.id_pegawai?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pegawai.Akun.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const pegawaiRole = pegawai.Akun?.role || pegawai.akun?.role;
    const matchesRole = selectedRole === '' || pegawaiRole === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPegawai.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPegawai.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getProfilePicture = (pegawai) => {
    if (pegawai.Akun?.profile_picture) return pegawai.Akun.profile_picture;
    if (pegawai.akun?.profile_picture) return pegawai.akun.profile_picture;
    return defaultAvatar;
  };

  return (
    <Container fluid className="p-0 bg-white">
      <ToastNotification 
        show={showToast} 
        setShow={setShowToast} 
        message={toastMessage} 
        type={toastType} 
      />

      <div className="max-width-container mx-auto pt-4 px-3">
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 fw-bold" style={{ color: '#03081F' }}>Data Pegawai</h2>
          </Col>
          <Col xs="auto">
            <Button 
              className="input-pegawai-btn"
              onClick={handleAddPegawai}
            >
              Input Pegawai
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md={3}>
            <RoleSidebar 
              namaSidebar={'Role'}
              roles={roles} 
              selectedRole={selectedRole} 
              handleRoleChange={handleRoleChange} 
            />
          </Col>

          <Col md={9}>
            <div className="mb-4">
              <div className="position-relative">
                <i className="bi bi-search search-icon"></i>
                <Form.Control
                  type="search"
                  placeholder="Cari id, nama pegawai..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: '#028643' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Memuat data pegawai...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-person-x" style={{ fontSize: '3rem', color: '#D9D9D9' }}></i>
                <p className="mt-3 text-muted">Tidak ada data pegawai yang sesuai dengan pencarian</p>
              </div>
            ) : (
              <>
               {currentItems.map((pegawai, index) => (
                  <EmployeeCard 
                    key={pegawai.id_pegawai}
                    employee={pegawai}
                    onEdit={handleEditPegawai}
                    onDelete={handleDelete}
                    getRoleName={getRoleName}
                    setSelectedEmployee={setCurrentPegawai}
                  />
                ))}

                {totalPages > 1 && (
                 <PaginationComponent 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                  />
                )}
              </>
            )}
          </Col>
        </Row>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#028643', color: 'white' }}>
          <Modal.Title>{modalType === 'add' ? 'Tambah Pegawai Baru' : 'Edit Data Pegawai'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4 text-center">
              <div className="profile-pic-container">
                <img 
                  src={imagePreview || (currentPegawai.akun?.profile_picture || defaultAvatar)} 
                  alt="Profile Preview" 
                  className="profile-preview mb-3 center"
                />
                <Form.Label className="d-block profile-upload-label">Foto Profil</Form.Label>
                <div className="d-flex justify-content-center">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="form-control-file"
                    style={{ width: '220px' }}
                  />
                </div>
              </div>
            </Form.Group>

            {modalType === 'add' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="akun.email"
                    value={currentPegawai.akun?.email || ''}
                    onChange={handleInputChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="akun.password"
                    value={currentPegawai.akun?.password || ''}
                    onChange={handleInputChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="akun.role"
                    value={currentPegawai.akun?.role || ''}
                    onChange={handleInputChange}
                    required
                    className="form-control-custom"
                  >
                    <option value="">Pilih Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </>
            )}

            {modalType === 'edit' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="akun.email"
                    value={currentPegawai.akun?.email || ''}
                    onChange={handleInputChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="akun.role"
                    value={currentPegawai.akun?.role || ''}
                    onChange={handleInputChange}
                    className="form-control-custom"
                  >
                    <option value="">Pilih Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="reset-password"
                    label="Reset Password"
                    checked={resetPassword}
                    onChange={handleResetPasswordChange}
                    className="mb-2"
                  />
                  {resetPassword && (
                    <Form.Control
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      required={resetPassword}
                      className="form-control-custom"
                    />
                  )}
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Nama Pegawai</Form.Label>
              <Form.Control
                type="text"
                name="nama_pegawai"
                value={currentPegawai.nama_pegawai || ''}
                onChange={handleInputChange}
                required
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tanggal Lahir</Form.Label>
              <Form.Control
                type="date"
                name="tanggal_lahir"
                value={currentPegawai.tanggal_lahir ? currentPegawai.tanggal_lahir.split('T')[0] : ''}
                onChange={handleInputChange}
                required
                className="form-control-custom"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                className="me-2" 
                onClick={() => setShowModal(false)}
              >
                Batal
              </Button>
              <Button variant="success" type="submit">
                {modalType === 'add' ? 'Simpan' : 'Update'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      <ConfirmationModalUniversal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
        onConfirm={confirmationAction}
        title={confirmationTitle}
        message={confirmationMessage}
        confirmButtonText={confirmationTitle.includes('Update') ? 'Update' : 'Hapus'}
        type={confirmationType}
      />

      <ResetEmployeePassModal pegawai={currentPegawai}/>

      <style jsx>{`
        .max-width-container {
          max-width: 1200px;
        }
        
        .profile-pic-container {
          margin-bottom: 15px;
        }
        
        .profile-preview {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #E7E7E7;
        }
        
        .profile-upload-label {
          font-weight: 500;
          color: #03081F;
          margin-bottom: 10px;
        }
        
        .nav-tabs-custom {
          display: flex;
          border-bottom: 1px solid #E7E7E7;
        }
        
        .nav-tabs-custom .nav-link {
          color: #686868;
          border: none;
          margin-right: 20px;
          padding-bottom: 10px;
          font-weight: 500;
        }
        
        .nav-tabs-custom .nav-link.active {
          color: #03081F;
          font-weight: 600;
          border-bottom: 2px solid #028643;
        }
        
        .input-pegawai-btn {
          background-color: #028643;
          border-color: #028643;
          color: white;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 6px;
        }
        
        .input-pegawai-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
        }
        
        .position-relative {
          position: relative;
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #686868;
          z-index: 10;
        }
        
        .search-input {
          height: 45px;
          padding-left: 45px;
          border-radius: 25px;
          border: 1px solid #E7E7E7;
        }
        
        .search-input:focus {
          boxcopy
            box-shadow: none;
          border-color: #E7E7E7;
        }
        
        .delete-btn {
          background-color: #FF1700;
          border-color: #FF1700;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .delete-btn:hover {
          background-color: #e61500;
          border-color: #e61500;
        }

        .reset-btn {
          border-radius: 4px;
          font-weight: 500;
        }
        
        .edit-btn {
          background-color: #028643;
          border-color: #028643;
          font-weight: 500;
          border-radius: 4px;
        }
        
        .edit-btn:hover {
          background-color: #026d36;
          border-color: #026d36;
        }
        
        .form-control-custom:focus {
          border-color: #028643;
          box-shadow: 0 0 0 0.25rem rgba(2, 134, 67, 0.25);
        }
        
        @media (max-width: 768px) {
          .nav-tabs-custom .nav-link {
            padding: 10px;
            margin-right: 5px;
          }
          
          .employee-avatar {
            width: 60px;
            height: 60px;
            margin-top: 10px;
          }
          
          .profile-preview {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </Container>
  );
};

export default ManagePegawaiPage;