// src/components/ConfirmationModal.jsx
import React from 'react';

const ConfirmationModal = ({ id, title, message, onConfirm, onCancel, extraContent }) => {
  return (
    <div
      className="modal fade"
      id={id}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby={`${id}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ border: '2px solid #333', boxShadow: '0 0 15px rgba(0,0,0,0.9)' }}>
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>{title}</h5>
            <button type="button" className="btn btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
            {extraContent}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal" onClick={onCancel}>Cancelar</button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
