import React from 'react';

const TogglePanelButton = ({ 
  showPanel,
  togglePanel,
  loading = false,
  colors = { white: '#ffffff', purple: '#6f42c1' } // Default colors if not provided
}) => {
  return (
    <>
      {/* BOTÓN PARA MOSTRAR/OCULTAR PANEL DE DISPOSITIVOS */}
      {!loading && (
        <div className="panel-toggle-button" style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          display: 'flex',
        }}>
          <button 
            className={`btn ${showPanel ? 'btn-primary' : 'btn-outline-light'}`}
            onClick={togglePanel}
            title="Dispositivos"
            style={{
              backgroundColor: showPanel ? '' : colors.white,
              color: showPanel ? '' : colors.purple,
              borderColor: showPanel ? '' : colors.purple,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '150px', 
              justifyContent: 'center'  
            }}
          >
            <i className="bi bi-phone"></i> Dispositivos
          </button>
        </div>
      )}
    </>
  );
};

export default TogglePanelButton;