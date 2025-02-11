// src/components/OptionsModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const OptionsModal = ({ selectedEvent, handleEditLocation, handleEditRoute }) => {
  // Función para ocultar el modal utilizando Bootstrap
  const hideModal = () => {
    const modalEl = document.getElementById("optionsModal");
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  return (
    <>
      {/* Bloque de estilos internos */}
      <style>{`
        .option-button {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .option-button:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
      `}</style>

      <div
        className="modal fade"
        id="optionsModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="optionsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="optionsModalLabel">Opciones del Evento</h5>
              <button
                type="button"
                className="btn btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Rejilla para mostrar los botones */}
              <div className="row g-3">
                <div className="col-6">
                  <Link
                    to={`/events/${selectedEvent?.code}/raw-locations`}
                    className="btn btn-sm w-100 option-button"
                    onClick={hideModal}
                    style={{
                      backgroundColor: '#0d6efd',
                      borderColor: '#0d6efd',
                      color: '#fff'
                    }}
                  >
                    Registro Ubicaciones
                  </Link>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-sm w-100 option-button"
                    onClick={() => {
                      hideModal();
                      handleEditLocation();
                    }}
                    style={{
                      backgroundColor: '#198754',
                      borderColor: '#198754',
                      color: '#fff'
                    }}
                  >
                    Editar Ubicaciones
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-sm w-100 option-button"
                    onClick={() => {
                      hideModal();
                      handleEditRoute();
                    }}
                    style={{
                      backgroundColor: '#ffc107',
                      borderColor: '#ffc107',
                      color: '#000'
                    }}
                  >
                    Editar Ruta
                  </button>
                </div>
                <div className="col-6">
                  <Link
                    to={`/events/${selectedEvent?.code}/service`}
                    className="btn btn-sm w-100 option-button"
                    onClick={hideModal}
                    style={{
                      backgroundColor: '#0dcaf0',
                      borderColor: '#0dcaf0',
                      color: '#fff'
                    }}
                  >
                    Editar Servicios
                  </Link>
                </div>
                {/* Último botón centrado */}
                <div className="col-6 offset-3">
                  <Link
                    to={`/events/${selectedEvent?.code}/devices`}
                    className="btn btn-sm w-100 option-button"
                    onClick={hideModal}
                    style={{
                      backgroundColor: '#212529',
                      borderColor: '#212529',
                      color: '#fff'
                    }}
                  >
                    Editar Dispositivos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OptionsModal;
