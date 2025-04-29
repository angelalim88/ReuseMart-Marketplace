import React from 'react';

const CardProduk = ({ 
  image, 
  title, 
  price, 
  onClick 
}) => {
  const cardStyle = {
    width: '100%',
    height: '310px', // Fixed height for consistency
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  };

  const imageContainerStyle = {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  };

  const contentStyle = {
    padding: '15px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    margin: '0 0 8px 0',
    fontSize: '15px',
    fontWeight: '600',
    color: '#03081F',
    lineHeight: '1.3',
    height: '40px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
  };

  const priceStyle = {
    margin: '0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FC8A06',
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price).replace('IDR', 'Rp');
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleMouseOver = (e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
    const image = e.currentTarget.querySelector('img');
    if (image) image.style.transform = 'scale(1.05)';
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.08)';
    const image = e.currentTarget.querySelector('img');
    if (image) image.style.transform = 'scale(1)';
  };
  
  const truncateTitle = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      style={cardStyle} 
      onClick={handleClick} 
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div style={imageContainerStyle}>
        <img 
          src={image} 
          alt={title} 
          style={imageStyle} 
          onError={(e) => {
            e.target.src = '../src/assets/images/default-product.jpg';
          }}
        />
      </div>
      <div style={contentStyle}>
        <h3 style={titleStyle}>{truncateTitle(title)}</h3>
        <p style={priceStyle}>{formatPrice(price)}</p>
      </div>
    </div>
  );
};

export default CardProduk;