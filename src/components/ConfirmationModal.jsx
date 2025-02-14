import React from 'react';

const ConfirmationModal = ({ id, title, message, onConfirm, onCancel, extraContent }) => {
  console.log("Renderizando ConfirmationModal con id:", id);
  return (
    <>
      <style>{`
        .confirmation-modal-overlay {
          position: fixed;
          top: 0; 
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .confirmation-modal-container {
          background: #fff;
          border-radius: 8px;
          padding: 1.5rem;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: fadeIn 0.3s ease;
        }
        .confirmation-modal-header h5 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }
        .confirmation-modal-body {
          margin: 1rem 0;
          color: #555;
          line-height: 1.5;
        }
        .confirmation-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .modal-button {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .cancel-button {
          background: #f0f0f0;
          color: #333;
        }
        .cancel-button:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }
        .confirm-button {
          background: #dc3545;
          color: #fff;
        }
        .confirm-button:hover {
          background: #c82333;
          transform: translateY(-2px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-container">
          <div className="confirmation-modal-header">
            <h5>{title}</h5>
          </div>
          <div className="confirmation-modal-body">
            <p>{message}</p>
            {extraContent}
          </div>
          <div className="confirmation-modal-footer">
            <button 
              onClick={() => { 
                console.log("Botón Cancelar clicado en el modal"); 
                onCancel(); 
              }}
              className="modal-button cancel-button"
            >
              Cancelar
            </button>
            <button 
              onClick={() => { 
                console.log("Botón Confirmar clicado en el modal"); 
                onConfirm(); 
              }}
              className="modal-button confirm-button"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
