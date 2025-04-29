import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTimes } from 'react-icons/fa';

const ModalOrganisasi = ({ 
  show, 
  onClose, 
  onSave, 
  initialData = {
    nama: '',
    email: '',
    label1: 'Jabatan',
    label2: '',
    label3: '',
    noTelpon: '',
    desc: ''
  }
}) => {
  const [formData, setFormData] = useState(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    if (show) {
      setFormData(initialData);
      setHasChanges(false);
    }
  }, [show, initialData]);

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(isChanged);
    const isValid = formData.nama.trim() !== '' && formData.email.trim() !== '';
    setFormValid(isValid);
  }, [formData, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formValid) {
      onSave(formData);
    }
  };

  if (!show) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1050,
  };

  const modalContentStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '800px',
    position: 'relative',
    padding: '20px',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  };

  const closeButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  };

  const inputStyle = {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #D9D9D9',
    width: '100%',
    marginBottom: '20px',
  };

  const labelStyle = {
    marginBottom: '5px',
    fontWeight: '500',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '150px',
  };

  const saveButtonStyle = {
    backgroundColor: '#8AC9B0',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 25px',
    fontWeight: 'bold',
    cursor: 'pointer',
    float: 'right',
  };

  const noChangesMessageStyle = {
    color: '#FF0000',
    fontSize: '12px',
    fontStyle: 'italic',
    textAlign: 'right',
    marginTop: '10px',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Data Organisasi</h2>
          <button style={closeButtonStyle} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div>
                <label style={labelStyle}>Nama</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Value"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Label</label>
                <input
                  type="text"
                  name="label1"
                  value={formData.label1}
                  onChange={handleChange}
                  placeholder="Jabatan"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>No Telpon</label>
                <input
                  type="text"
                  name="noTelpon"
                  value={formData.noTelpon}
                  onChange={handleChange}
                  placeholder="Value"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Value"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Label</label>
                <input
                  type="text"
                  name="label2"
                  value={formData.label2}
                  onChange={handleChange}
                  placeholder="Value"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Label</label>
                <input
                  type="text"
                  name="label3"
                  value={formData.label3}
                  onChange={handleChange}
                  placeholder="Value"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="col-12">
              <div>
                <label style={labelStyle}>Desc</label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  style={textareaStyle}
                ></textarea>
              </div>
            </div>

            <div className="col-12 mt-3">
              <button 
                type="submit" 
                style={{
                  ...saveButtonStyle,
                  backgroundColor: formValid ? '#8AC9B0' : '#D9D9D9',
                  cursor: formValid ? 'pointer' : 'not-allowed'
                }} 
                disabled={!formValid || !hasChanges}
              >
                Simpan
              </button>
              
              {!hasChanges && (
                <p style={noChangesMessageStyle}>*tidak ada perubahan data</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalOrganisasi;