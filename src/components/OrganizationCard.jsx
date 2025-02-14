// src/components/OrganizationCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const OrganizationCard = ({ org, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/organizations/${org.code}/events`);
  };

  return (
    <div
      className="col-sm-4 col-12"
      style={{ marginBottom: '20px', cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      <div className="card h-100 d-flex flex-column">
        <div
          className="card-img"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            overflow: 'hidden'
          }}
        >
          {org.image ? (
            <img
              src={org.image}
              alt={org.name}
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

        {/* Cabecera con el nombre de la organización */}
        <div className="card-header">
          <div className="card-title">{org.name}</div>
        </div>

        {/* Cuerpo de la tarjeta que muestra datos y botones */}
        <div className="card-body d-flex flex-column">
          <p className="mb-4">Código: {org.code}</p>
          <div className="mt-auto">
            <div className="row">
              <div className="col-4 text-start">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#editOrganization"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(org);
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
              <div className="col-4 text-center">
                <Link to={`/organizations/${org.code}/events`} onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-outline-success">
                    <i className="bi bi-calendar-event"></i>
                  </button>
                </Link>
              </div>
              <div className="col-4 text-end">
                <button
                  className="btn btn-outline-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(org);
                  }}
                >
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

export default OrganizationCard;
