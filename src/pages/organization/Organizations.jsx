import React, { useEffect, useState, useRef } from 'react';

// Services
import { 
  fetchOrganizations, 
  deleteOrganization, 
  updateOrganization, 
  addOrganization 
} from '../../services/organizationService';

// Components
import Alert from '../../components/Alert';
import LocalHeaderLayout from '../../components/LocalHeaderLayout';
import OrganizationCard from '../../components/OrganizationCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import Spinner from '../../components/Spinner';
import FloatingAddButton from '../../components/FloatingAddButton'; 

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);
  const [errors, setErrors] = useState({});

  // Estado para las alertas
  const [alert, setAlert] = useState(null);
  // Estado para mostrar el modal de confirmación de eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Ref para el final de la lista de organizaciones
  const bottomRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const breadcrumbs = [
    { label: "Organizaciones", path: "" }
  ];

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await fetchOrganizations();
        
        // Asegurarnos de que tenemos los datos correctos
        if (!currentUser) {
          console.error('No hay usuario en el localStorage');
          setError('No se pudo cargar la información del usuario');
          return;
        }
  
        // Filtrar las organizaciones
        let filteredOrganizations;
        console.log({ currentUser });
        if (currentUser.isSuperAdmin) {
          filteredOrganizations = data;
        } else {
          filteredOrganizations = data.filter(org => 
            currentUser.adminOf?.some(adminOrg => 
              String(adminOrg.id) === String(org._id) || 
              String(adminOrg._id) === String(org._id)
            )
          );
        }
  
        console.log({
          user: currentUser,
          originalData: data,
          filtered: filteredOrganizations
        });
  
        setOrganizations(filteredOrganizations);
      } catch (err) {
        console.error('Error al cargar organizaciones:', err);
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
    setShowDeleteConfirmModal(true);
  };

  // Función para ejecutar la eliminación cuando se confirma en el modal
  const handleDeleteConfirmed = async () => {
    if (organizationToDelete) {
      try {
        await deleteOrganization(organizationToDelete._id);
        setOrganizations(organizations.filter(org => org._id !== organizationToDelete._id));
        setShowDeleteConfirmModal(false);
        setOrganizationToDelete(null);
        setAlert({ type: 'success', message: 'Organización eliminada correctamente' });
      } catch (err) {
        console.error('Error al eliminar la organización:', err);
        setAlert({ type: 'danger', message: 'Error al eliminar la organización: ' + err.message });
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
        const updatedData = {
          name: selectedOrganization.name,
          image: selectedOrganization.image,
          code: selectedOrganization.code,
        };
        await updateOrganization(selectedOrganization._id, updatedData);
        setOrganizations(
          organizations.map(org =>
            org._id === selectedOrganization._id ? { ...selectedOrganization, ...updatedData } : org
          )
        );
        if (modal) modal.hide();
        setAlert({ type: 'success', message: 'Organización actualizada correctamente' });
      } catch (err) {
        console.error("Error al actualizar la organización:", err.message);
        setAlert({ type: 'danger', message: 'Error al procesar la organización: ' + err.message });
      }
    } else {
      try {
        await addOrganization(selectedOrganization);
        const data = await fetchOrganizations();
        setOrganizations(data);
        if (modal) modal.hide();
        setAlert({ type: 'success', message: 'Organización creada correctamente' });
        setTimeout(() => {
          if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 200);
      } catch (err) {
        console.error("Error al crear la organización:", err.message);
        setAlert({ type: 'danger', message: 'Error al procesar la organización: ' + err.message });
      }
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <LocalHeaderLayout breadcrumbs={breadcrumbs}>
        <div className="content-wrapper" style={{ paddingBottom: '50px' }}>
          {alert && (
            <Alert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert(null)} 
            />
          )}
          {organizations.length > 0 ? (
            <div className="row gx-3 justify-content-center align-items-stretch" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '20px' }}>
              {organizations.map(org => (
                <OrganizationCard
                  key={org._id}
                  org={org}
                  onEdit={(org) => {
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
                  onDelete={(org) => confirmDelete(org)}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          ) : (
            !loading && (
              <div className="d-flex flex-column align-items-center justify-content-center my-5">
                <i className="bi bi-exclamation-circle text-muted fs-1 mb-3"></i>
                <p className="text-muted fs-5 m-0">
                  No hay organizaciones registradas.
                </p>
              </div>
            )
          )}

          {/* Uso del FloatingAddButton para agregar una nueva organización */}
          {currentUser.isSuperAdmin && (
            <FloatingAddButton
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
                }
              }}
            />
          )}
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
        {showDeleteConfirmModal && (
          <ConfirmationModal
            id="deleteConfirmModal"
            title="Confirmar Eliminación"
            message={
              organizationToDelete
                ? `¿Estás seguro de que deseas eliminar la organización ${organizationToDelete.name}?`
                : ''
            }
            onConfirm={handleDeleteConfirmed}
            onCancel={() => setShowDeleteConfirmModal(false)}
            extraContent={null}
          />
        )}
      </LocalHeaderLayout>
    </>
  );
};

export default Organizations;
