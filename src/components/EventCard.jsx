// src/components/EventCard.jsx
import React from 'react';

const EventCard = ({ event, onEdit, onViewDetails, onDelete }) => {
  // Funciones locales para detener la propagación al hacer clic en los botones
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(e);
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    onViewDetails(e);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(e);
  };

  return (
    <div 
      className="col-lg-4 col-md-6 col-sm-12" 
      style={{ marginBottom: '20px', cursor: 'pointer' }}
      onClick={onViewDetails} // Al hacer clic en la tarjeta se abre el modal de opciones
    >
      <div className="card h-100 d-flex flex-column">
        {/* Imagen */}
        <div
          className="card-img"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            overflow: 'hidden'
          }}
        >
          {event.image ? (
            <img
              src={event.image}
              alt={event.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              className="img-fluid"
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#ddd',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <span>No image</span>
            </div>
          )}
        </div>

        {/* Cabecera */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="card-title">{event.name}</div>
          {event.status === 1 && <span className="badge bg-warning text-dark">Cancelado</span>}
          {event.status === 2 && <span className="badge bg-danger">Finalizado</span>}
        </div>

        {/* Detalles y Acciones */}
        <div className="card-body d-flex flex-column justify-content-between">
          <div className="card-text">
            <p style={{ margin: 0 }}>
              <strong>Código:</strong> {event.code}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Fechas:</strong> {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Código Postal:</strong> {event.postalCode}
            </p>
          </div>

          <div className="card-actions mt-2">
            <div className="row">
              <div className="col-4 text-start">
                <button type="button" className="btn btn-outline-primary" onClick={handleEditClick}>
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
              <div className="col-4 text-center">
                <button type="button" className="btn btn-outline-success" onClick={handleViewDetailsClick}>
                  <i className="bi bi-eye"></i>
                </button>
              </div>
              <div className="col-4 text-end">
                <button type="button" className="btn btn-outline-danger" onClick={handleDeleteClick}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
