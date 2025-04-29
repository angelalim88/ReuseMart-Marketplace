import React from 'react';

export const CartButton = ({ onClick, text = "Keranjang" }) => {
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    color: '#028643',
    border: '2px solid #028643',
    borderRadius: '30px',
    padding: '12px 20px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '600px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  };

  const iconStyle = {
    backgroundColor: '#028643',
    color: '#FFFFFF',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
  };

  return (
    <button style={buttonStyle} onClick={onClick}>
      <div style={iconStyle}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L20 12L12 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {text}
    </button>
  );
};

export const CheckoutButton = ({ onClick, text = "Checkout!" }) => {
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#028643',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '30px',
    padding: '12px 20px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '600px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  };

  const iconStyle = {
    backgroundColor: '#FFFFFF',
    color: '#028643',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
  };

  return (
    <button style={buttonStyle} onClick={onClick}>
      <div style={iconStyle}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L20 12L12 20" stroke="#028643" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {text}
    </button>
  );
};