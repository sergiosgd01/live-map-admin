import React from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../utils/colors';

const OptionsModal = ({ selectedEvent, handleEditLocation, handleEditRoute }) => {
  const navigate = useNavigate();

  // Función mejorada para cerrar el modal completamente
  const hideModal = () => {
    const modalEl = document.getElementById("optionsModal");
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    
    if (modal) {
      modal.hide();
      
      // Esperar a que termine la animación de ocultamiento
      setTimeout(() => {
        // Eliminar backdrop manualmente si sigue existiendo
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          backdrop.classList.remove('show');
          backdrop.remove();
        });
        
        // Restaurar el scroll y quitar la clase modal-open del body
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      }, 300);
    }
  };

  // Define button data with updated icons
  const buttons = [
    {
      text: "Registro Ubicaciones",
      icon: "bi-list-ul",
      action: () => {
        hideModal();
        setTimeout(() => navigate(`/events/${selectedEvent?.code}/raw-locations`), 300);
      }
    },
    {
      text: "Editar Ubicaciones",
      icon: "bi-geo-alt",
      action: () => {
        hideModal();
        setTimeout(() => handleEditLocation(), 300);
      }
    },
    {
      text: "Editar Ruta",
      icon: "bi-map",
      action: () => {
        hideModal();
        setTimeout(() => handleEditRoute(), 300);
      }
    },
    {
      text: "Editar Servicios",
      icon: "bi-gear-wide-connected",
      action: () => {
        hideModal();
        setTimeout(() => navigate(`/events/${selectedEvent?.code}/service`), 300);
      }
    },
    {
      text: "Editar Dispositivos",
      icon: "bi-phone",
      action: () => {
        hideModal();
        setTimeout(() => navigate(`/events/${selectedEvent?.code}/devices`), 300);
      }
    }
  ];

  // Calculate how many buttons to render
  const buttonCount = buttons.length;

  return (
    <>
      {/* Internal styles */}
      <style>{`
      .option-button {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 15px 10px;
        min-height: 120px;
        height: 100%;
        border-radius: 10px;
        transition: all 0.3s ease;
        background-color: white;
        color: ${colors.purple};
        border: 2px solid ${colors.purple};
        font-weight: bold;
        font-size: 0.95rem;
      }
      
      .option-button:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        background-color: ${colors.purple};
        color: white;
      }
      
      .option-button i {
        font-size: 2.2rem;
        margin-bottom: 12px;
      }
      
      .modal-content {
        border-radius: 15px;
        border: none;
      }
      
      .modal-body {
        padding: 30px;
        background-color: #f8f9fa;
      }
      
      .button-container {
        display: flex;
        justify-content: center;
      }
      
      /* Media queries to ensure consistent button sizes */
      @media (min-width: 992px) {
        .button-col {
          min-height: 140px;
        }
      }
      
      @media (min-width: 768px) and (max-width: 991px) {
        .button-col {
          min-height: 140px;
        }
        .option-button {
          padding: 15px 5px;
        }
      }
      
      @media (max-width: 767px) {
        .modal-body {
          padding: 20px 15px;
        }
        .button-col {
          min-height: 120px;
        }
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
              <h5 className="modal-title" id="optionsModalLabel">
                Opciones del Evento: {selectedEvent?.name}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={hideModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row g-3 justify-content-center">
                {buttons.map((button, index) => {
                  // Calculate appropriate column classes for responsiveness
                  // 3 columns on large screens, 2 on medium, 1 on small
                  const colClass = "col-lg-4 col-md-6 col-12 mb-3 button-col";
                  
                  // Center last row buttons when not filling the row
                  const isLastRowWithFewer =
                    Math.floor(index / 3) === Math.floor((buttonCount - 1) / 3) &&
                    buttonCount % 3 !== 0;
                  
                  const containerClass = isLastRowWithFewer ?
                    "d-flex justify-content-center" : "";
                  
                  return (
                    <div className={colClass} key={index}>
                      <div className={containerClass} style={{height: '100%'}}>
                        <button
                          type="button"
                          className="btn option-button w-100"
                          onClick={button.action}
                        >
                          <i className={`bi ${button.icon}`}></i>
                          <span>{button.text}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OptionsModal;