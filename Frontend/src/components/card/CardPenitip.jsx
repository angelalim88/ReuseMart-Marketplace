import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CardPenitip = ({ 
  name = "Budi Yuno", 
  username = "WaroengJaya88", 
  rating = 4.9, 
  description = "semua data masukin", 
  profileImage, 
  onEdit, 
  onDelete 
}) => {
  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '10px',
    width: '100%',
    maxWidth: '260px',
  };

  const imageContainerStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    marginBottom: '12px',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const nameStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 2px 0',
    textAlign: 'center',
    color: '#03081F',
  };

  const usernameStyle = {
    fontSize: '14px',
    margin: '0 0 12px 0',
    color: '#666666',
    textAlign: 'center',
  };

  const descriptionLabelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 2px 0',
    width: '100%',
    color: '#03081F',
  };

  const descriptionStyle = {
    fontSize: '13px',
    margin: '0 0 15px 0',
    width: '100%',
    color: '#666666',
  };

  const editButtonStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#FFFFFF',
    color: '#028643',
    border: '1px solid #028643',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const deleteButtonStyle = {
    width: '100%',
    padding: '8px',
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const handleEdit = () => {
    if (onEdit) onEdit();
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  return (
    <div style={cardStyle}>
      <div style={imageContainerStyle}>
        <img 
          src={profileImage || "https://via.placeholder.com/100"} 
          alt={`${name}'s profile`} 
          style={imageStyle} 
        />
      </div>
      
      <h3 style={nameStyle}>{name}</h3>
      <p style={usernameStyle}>{username} ({rating} stars)</p>
      
      <div style={{ width: '100%' }}>
        <p style={descriptionLabelStyle}>Nama penitip:</p>
        <p style={descriptionStyle}>{description}</p>
      </div>
      
      <button 
        style={editButtonStyle} 
        onClick={handleEdit}
        onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#F0FFF6'}}
        onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#FFFFFF'}}
      >
        Edit
      </button>
      
      <button 
        style={deleteButtonStyle} 
        onClick={handleDelete}
        onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#E60000'}}
        onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#FF0000'}}
      >
        Hapus
      </button>
    </div>
  );
};

export default CardPenitip;