import React from 'react';

const ImagePreviewComponent = ({ imagePreview }) => {
  if (imagePreview.length === 0) {
    return <p className="text-muted">Tidak ada gambar yang dipilih</p>;
  }
  
  return (
    <div className="d-flex flex-wrap gap-2 mt-2">
      {imagePreview.map((src, index) => (
        <div key={index} className="position-relative" style={{ width: '150px', height: '150px' }}>
          <img
            src={src}
            alt={`Preview ${index + 1}`}
            className="img-thumbnail"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ))}
    </div>
  );
};

export default ImagePreviewComponent;