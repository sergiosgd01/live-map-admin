import React from 'react';

const PointInfo = ({ selectedPoint, mode, setSelectedPoint, extended = false }) => {
  // Se renderiza solo si hay un punto seleccionado y el modo es el adecuado.
  if (!selectedPoint || mode !== '') return null;

  // Estilos para posicionar el panel justo encima del EditPanel.
  // Se ajusta 'bottom' para desplazarlo verticalmente hacia arriba.
  const containerStyle = {
    position: 'absolute',
    left: '10px',
    bottom: '25px', // Ajusta este valor según la altura del EditPanel
    zIndex: 10000,  // Asegura que esté por encima del EditPanel (z-index: 9999)
    width: '340px',
    maxHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '0.25rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  if (extended) {
    return (
      <div style={containerStyle}>
        <div
          className="card-header text-center"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem 0.25rem 0 0',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <h5 className="mb-0">Información del Punto</h5>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
          }}
        >
          <p><strong>ID:</strong> {selectedPoint.id}</p>
          <p><strong>Latitud:</strong> {selectedPoint.latitude}</p>
          <p><strong>Longitud:</strong> {selectedPoint.longitude}</p>
          <p><strong>Precisión:</strong> {selectedPoint.accuracy || 'N/A'}</p>
          <p>
            <strong>Fecha y Hora:</strong> {new Date(selectedPoint.timestamp).toLocaleString()}
          </p>
        </div>
        <div
          className="card-footer text-center"
          style={{
            padding: '0.5rem 1rem',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <button
            onClick={() => setSelectedPoint(null)}
            className="btn btn-primary btn-sm w-100"
            style={{ fontSize: '0.85rem', borderRadius: '4px' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Versión simple
  return (
    <div style={containerStyle}>
      <div
        className="card-header text-center"
        style={{
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <h4 className="mb-0">Información del Punto</h4>
      </div>
      <div
        className="card-body"
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
        }}
      >
        <p><strong>ID:</strong> {selectedPoint.id}</p>
        <p><strong>Latitud:</strong> {selectedPoint.latitude}</p>
        <p><strong>Longitud:</strong> {selectedPoint.longitude}</p>
      </div>
      <div
        className="card-footer text-center"
        style={{
          padding: '0.5rem 1rem',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <button
          onClick={() => setSelectedPoint(null)}
          className="btn btn-primary btn-sm w-100"
          style={{ fontSize: '0.85rem', borderRadius: '4px' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default PointInfo;
