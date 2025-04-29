import React from 'react';
import { Pagination } from 'react-bootstrap';

const PaginationComponent = ({ 
  currentPage, 
  totalPages, 
  paginate 
}) => {
  return (
    <div className="d-flex justify-content-center mt-4 pagination-container">
      <Pagination className="custom-pagination">
        <Pagination.Prev 
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="bi bi-chevron-left"></i>
        </Pagination.Prev>
        
        {[...Array(totalPages).keys()].map(number => (
          <Pagination.Item
            key={number + 1}
            active={number + 1 === currentPage}
            onClick={() => paginate(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
        
        <Pagination.Next
          onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className="bi bi-chevron-right"></i>
        </Pagination.Next>
      </Pagination>

      <style jsx>{`
        .custom-pagination .page-item.active .page-link {
          background-color: #028643;
          border-color: #028643;
          color: white;
        }
        
        .custom-pagination .page-link {
          color: #028643;
          border-color: #E7E7E7;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .custom-pagination .page-link:focus {
          box-shadow: none;
        }
        
        .custom-pagination .page-item:first-child .page-link,
        .custom-pagination .page-item:last-child .page-link {
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default PaginationComponent;