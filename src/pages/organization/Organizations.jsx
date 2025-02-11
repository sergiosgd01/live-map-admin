// src/pages/Org.jsx
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  fetchOrganizations, 
  fetchOrganizationById,
  deleteOrganization, 
  updateOrganization, 
  addOrganization 
} from '../../services/organizationService';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await fetchOrganizations();
        setOrganizations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  // Función para abrir el modal de confirmación de eliminación
  const confirmDelete = (org) => {
    setOrganizationToDelete(org);
    const modalEl = document.getElementById("deleteConfirmModal");
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  };

  // Función para ejecutar la eliminación cuando se confirma en el modal
  const handleDeleteConfirmed = async () => {
    if (organizationToDelete) {
      try {
        await deleteOrganization(organizationToDelete._id);
        setOrganizations(organizations.filter(org => org._id !== organizationToDelete._id));
        const modalEl = document.getElementById("deleteConfirmModal");
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        setOrganizationToDelete(null);
      } catch (err) {
        console.error('Error al eliminar la organización:', err);
        alert('Error al eliminar la organización: ' + err.message);
      }
    }
  };

  const validateForm = async () => {
    const newErrors = {};
    if (!selectedOrganization.name || selectedOrganization.name.trim() === '') {
      newErrors.name = 'El nombre no puede estar vacío';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }
    const modalEl = document.getElementById("editOrganization");
    const modal = window.bootstrap.Modal.getInstance(modalEl);

    if (selectedOrganization._id) {
      try {
        await updateOrganization(selectedOrganization._id, selectedOrganization);
        setOrganizations(
          organizations.map(org => 
            org._id === selectedOrganization._id ? selectedOrganization : org
          )
        );
        if (modal) modal.hide();
      } catch (err) {
        console.error("Error al actualizar la organización:", err.message);
      }
    } else {
      try {
        await addOrganization(selectedOrganization);
        const data = await fetchOrganizations();
        setOrganizations(data);
        if (modal) modal.hide();
      } catch (err) {
        console.error("Error al crear la organización:", err.message);
      }
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Layout>
        <div className="content-wrapper" style={{ padding: '20px' }}>
          <div className="row gx-3 justify-content-center align-items-stretch">
            {organizations.map(org => (
              // Al hacer clic en la tarjeta, se navega a la pantalla de eventos
              <div
                key={org._id}
                className="col-sm-4 col-12"
                style={{ marginBottom: '20px', cursor: 'pointer' }}
                onClick={() => navigate(`/organizations/${org.code}/events`)}
              >
                <div className="card h-100 d-flex flex-column">
                  {/* Imagen con aspect ratio fijo */}
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

                  {/* Cuerpo de la tarjeta que muestra todos los datos */}
                  <div className="card-body d-flex flex-column">
                    <p className="mb-4">Código: {org.code}</p>

                    {/* Sección de botones se posiciona al final */}
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
                              setErrors({});
                              setSelectedOrganization(org);
                              const modalEl = document.getElementById("editOrganization");
                              if (modalEl) {
                                const formEl = modalEl.querySelector("form");
                                if (formEl) {
                                  formEl.classList.remove("was-validated");
                                }
                              }
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
                              confirmDelete(org);
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
            ))}
          </div>

          {/* Botón “+” para agregar una nueva organización */}
          <button
            onClick={() => {
              setErrors({});
              setSelectedOrganization({ name: '', code: '', image: '' });
              const modalEl = document.getElementById("editOrganization");
              if (modalEl) {
                const formEl = modalEl.querySelector("form");
                if (formEl) {
                  formEl.classList.remove("was-validated");
                }
                const modal = new window.bootstrap.Modal(modalEl);
                modal.show();
              } else {
                console.error("No se encontró el modal 'editOrganization'");
              }
            }}
            className="btn btn-primary rounded-circle"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            +
          </button>
        </div>

        {/* Modal para editar / agregar organización */}
        <div
          className="modal fade"
          id="editOrganization"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex="-1"
          aria-labelledby="editOrganizationLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="modal-header">
                  <h5 className="modal-title" id="editOrganizationLabel">
                    {selectedOrganization && selectedOrganization._id
                      ? "Editar Organización"
                      : "Agregar Organización"}
                  </h5>
                  <button
                    type="button"
                    className="btn btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {selectedOrganization && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="orgName" className="form-label">
                          Nombre
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          id="orgName"
                          value={selectedOrganization.name}
                          onChange={(e) =>
                            setSelectedOrganization({
                              ...selectedOrganization,
                              name: e.target.value,
                            })
                          }
                          placeholder="Nombre de la organización"
                          required
                        />
                        {errors.name && (
                          <div className="invalid-feedback">
                            {errors.name}
                          </div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="orgImage" className="form-label">
                          Imagen (URL)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="orgImage"
                          value={selectedOrganization.image}
                          onChange={(e) =>
                            setSelectedOrganization({
                              ...selectedOrganization,
                              image: e.target.value,
                            })
                          }
                          placeholder="URL de la imagen"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    {selectedOrganization && selectedOrganization._id
                      ? "Guardar Cambios"
                      : "Crear Organización"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        <div
          className="modal fade"
          id="deleteConfirmModal"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex="-1"
          aria-labelledby="deleteConfirmModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="deleteConfirmModalLabel">Confirmar Eliminación</h5>
                <button type="button" className="btn btn-close" data-bs-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true"></span>
                </button>
              </div>
              <div className="modal-body">
                {organizationToDelete && (
                  <p>
                    ¿Estás seguro de que deseas eliminar la organización <strong>{organizationToDelete.name}</strong>?
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteConfirmed}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Organizations;
