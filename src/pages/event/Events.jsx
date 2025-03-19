import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DateTime } from 'luxon';

// Components
import LocalHeaderLayout from '../../components/LocalHeaderLayout';
import EventCard from '../../components/EventCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import OptionsModal from '../../components/OptionsModal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import FloatingAddButton from '../../components/FloatingAddButton';

// Services
import { 
  fetchEventsByOrganization, 
  deleteEvent, 
  updateEvent, 
  changeEventStatus, 
  fetchEventByCode,
  addEvent  
} from '../../services/eventService';
import { fetchOrganizationByCode, fetchOrganizations } from '../../services/organizationService';

const Events = () => {
  const { organizationCode } = useParams();
  const [events, setEvents] = useState([]);
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados para edición de evento
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventErrors, setEventErrors] = useState({});
  const [eventOrganizations, setEventOrganizations] = useState([]);
  const [cancelInfo, setCancelInfo] = useState('');
  const [eventToDelete, setEventToDelete] = useState(null);

  // Estados para el modal de confirmación de acción
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(''); // "resume", "suspend" o "finish"

  // Estados para controlar la visibilidad de los modales personalizados
  const [showActionConfirmModal, setShowActionConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Estado para las alertas
  const [alert, setAlert] = useState(null);

  // Ref para el final de la lista de eventos
  const bottomRef = useRef(null);
  
  // Obtener usuario actual del localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const breadcrumbs = [
    { label: "Organizaciones", path: "/organizations" },
    { label: `Eventos del ${organizationName}`, path: "" }
  ];

  useEffect(() => {
    console.log("Alert actualizado:", alert);
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Funciones que realizan la acción sin confirmación
  const performResumeEvent = async () => {
    try {
      console.log("Reanudando el evento:", selectedEvent.code);
      await changeEventStatus(selectedEvent.code, 0);
      const updatedEvent = await fetchEventByCode(selectedEvent.code);
      setSelectedEvent(updatedEvent);
    } catch (err) {
      console.error('Error al reanudar el evento:', err);
      setAlert({ type: 'danger', message: 'Error al reanudar el evento: ' + err.message });
    }
  };

  const performSuspendEvent = async () => {
    try {
      console.log("Suspendiendo el evento:", selectedEvent.code);
      await changeEventStatus(selectedEvent.code, 1, cancelInfo);
      const updatedEvent = await fetchEventByCode(selectedEvent.code);
      setSelectedEvent(updatedEvent);
    } catch (err) {
      console.error('Error al suspender el evento:', err);
      setAlert({ type: 'danger', message: 'Error al suspender el evento: ' + err.message });
    }
  };

  const performFinishEvent = async () => {
    try {
      console.log("Finalizando el evento:", selectedEvent.code);
      await changeEventStatus(selectedEvent.code, 2);
      const updatedEvent = await fetchEventByCode(selectedEvent.code);
      setSelectedEvent(updatedEvent);
    } catch (err) {
      console.error('Error al finalizar el evento:', err);
      setAlert({ type: 'danger', message: 'Error al finalizar el evento: ' + err.message });
    }
  };

  // Función que abre el modal de confirmación de acción
  const openConfirmModal = (action, title, message) => {
    console.log("Abriendo modal de acción:", action, title, message);
    setConfirmAction(action);
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    setShowActionConfirmModal(true);
  };

  const handleConfirm = async () => {
    console.log("Confirmando acción:", confirmAction);
    setShowActionConfirmModal(false);

    if (confirmAction === "resume") {
      await performResumeEvent();
    } else if (confirmAction === "suspend") {
      await performSuspendEvent();
    } else if (confirmAction === "finish") {
      await performFinishEvent();
    }

    const updatedEvent = await fetchEventByCode(selectedEvent.code);
    setEvents(events.map(ev => ev._id === updatedEvent._id ? updatedEvent : ev));

    // Se cierra el modal de edición (bootstrap sigue usándose para éste)
    const editModalEl = document.getElementById("editEventModal");
    const editModal = window.bootstrap.Modal.getInstance(editModalEl);
    if (editModal) editModal.hide();
    setSelectedEvent(null);
  };

  useEffect(() => {
    const loadOrganizationAndEvents = async () => {
      try {
        const organization = await fetchOrganizationByCode(organizationCode);
        setOrganizationName(organization.name);
        const data = await fetchEventsByOrganization(organizationCode);
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrganizationAndEvents();
  }, [organizationCode]);

  // Al hacer clic en ver detalles: se asigna el evento seleccionado y se abre el modal emergente de opciones
  const handleViewDetails = (eventItem, e) => {
    e.stopPropagation();
    console.log("Ver detalles del evento:", eventItem);
    setSelectedEvent(eventItem);
    const modalEl = document.getElementById("optionsModal");
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  };

  const handleDeleteEvent = (eventItem, e) => {
    e.stopPropagation();
    console.log("Solicitando eliminación del evento:", eventItem);
    setEventToDelete(eventItem);
    setShowDeleteConfirmModal(true);
  };

  // Al hacer clic en editar se abre el modal de edición
  const handleEditEvent = async (eventItem, e) => {
    e.stopPropagation();
    console.log("Editando el evento:", eventItem);
    setSelectedEvent(eventItem);
    try {
      // Cargar organizaciones y filtrarlas según permisos del usuario
      const orgs = await fetchOrganizations();
      let filteredOrgs;
      
      // Si es superadmin, puede ver todas las organizaciones
      if (currentUser.isSuperAdmin) {
        filteredOrgs = orgs;
      } else {
        // Si no es superadmin, solo muestra las organizaciones que administra
        filteredOrgs = orgs.filter(org => 
          currentUser.adminOf?.some(adminOrg => 
            String(adminOrg.id) === String(org._id) || 
            String(adminOrg._id) === String(org._id)
          )
        );
      }
      
      setEventOrganizations(filteredOrgs);
    } catch (err) {
      console.error('Error al cargar organizaciones:', err);
    }
    const modalEl = document.getElementById("editEventModal");
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  };

  const handleDeleteConfirmed = async () => {
    if (eventToDelete) {
      try {
        console.log("Confirmando eliminación del evento:", eventToDelete);
        await deleteEvent(eventToDelete.code);
        setEvents(events.filter(ev => ev._id !== eventToDelete._id));
        setShowDeleteConfirmModal(false);
        setEventToDelete(null);
        setAlert({ type: 'success', message: 'Evento eliminado correctamente' });
      } catch (err) {
        console.error('Error al eliminar el evento:', err);
        setAlert({ type: 'danger', message: 'Error al eliminar el evento: ' + err.message });
      }
    }
  };

  const validateEventForm = async () => {
    if (!selectedEvent) return false;
    const newErrors = {};
  
    if (!selectedEvent.name || selectedEvent.name.trim() === '') {
      newErrors.name = 'El nombre no puede estar vacío';
    }
    if (!selectedEvent.postalCode || selectedEvent.postalCode.trim() === '') {
      newErrors.postalCode = 'El código postal no puede estar vacío';
    }
    if (!selectedEvent.time || isNaN(selectedEvent.time)) {
      newErrors.time = 'El tiempo de actualización debe ser un número';
    }
    if (!selectedEvent.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }
    if (!selectedEvent.endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }
    if (selectedEvent.startDate && selectedEvent.endDate) {
      const start = new Date(selectedEvent.startDate);
      const end = new Date(selectedEvent.endDate);
      if (start > end) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    if (!selectedEvent.organizationCode || selectedEvent.organizationCode === '') {
      newErrors.organizationCode = 'Debe seleccionar una organización';
    }
    
    // Validación para imagen e icono
    if (selectedEvent.image && selectedEvent.image.trim() !== '') {
      try {
        new URL(selectedEvent.image);
      } catch (err) {
        newErrors.image = 'La URL de imagen no es válida';
      }
    }
    
    if (selectedEvent.icon && selectedEvent.icon.trim() !== '') {
      try {
        new URL(selectedEvent.icon);
      } catch (err) {
        newErrors.icon = 'La URL del icono no es válida';
      }
    }
    
    setEventErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateEventForm();
    if (!isValid) return;
    try {
      const startDate = DateTime.fromISO(selectedEvent.startDate)
        .setZone('Europe/Madrid')
        .toISO();
      const endDate = DateTime.fromISO(selectedEvent.endDate)
        .setZone('Europe/Madrid')
        .toISO();
      // Ensure multiDevice is a boolean value
      const multiDevice = selectedEvent.multiDevice === true;
      
      const adjustedEvent = { 
        ...selectedEvent, 
        startDate, 
        endDate,
        image: selectedEvent.image, 
        icon: selectedEvent.icon,
        multiDevice
      };
  
      if (selectedEvent._id) {
        // Edit event
        await updateEvent(selectedEvent.code, adjustedEvent);
        
        // First check if organization has changed
        const originalOrg = events.find(e => e._id === selectedEvent._id)?.organizationCode;
        const newOrg = adjustedEvent.organizationCode;
        
        // If org code changed and doesn't match current page org, remove from list
        if (newOrg !== originalOrg && newOrg !== organizationCode) {
          setEvents(events.filter(ev => ev._id !== selectedEvent._id));
        } 
        // Otherwise update the event in the list
        else {
          const updatedEvent = await fetchEventByCode(selectedEvent.code);
          console.log("Updated event:", updatedEvent);
          setEvents(prevEvents => prevEvents.map(ev => 
            ev._id === updatedEvent._id ? updatedEvent : ev
          ));
        }
        setAlert({ type: 'success', message: 'Evento actualizado correctamente' });
      } else {
        // Create event
        const createdEvent = await addEvent(adjustedEvent);
        
        // Only add to the list if it belongs to the current organization
        if (createdEvent.event.organizationCode === organizationCode) {
          setEvents(prevEvents => [...prevEvents, createdEvent.event]);
          setTimeout(() => {
            if (bottomRef.current) {
              bottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 200);
        }
        setAlert({ type: 'success', message: 'Evento creado correctamente' });
      }
  
      // Close the modal
      const modalEl = document.getElementById("editEventModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error al procesar el evento:', err);
      setAlert({ type: 'danger', message: 'Error al procesar el evento: ' + err.message });
    }
  };

  // Nuevas funciones para editar ubicaciones y rutas
  const handleEditLocation = () => {
    if (!selectedEvent) {
      console.error("No hay evento seleccionado para editar ubicaciones");
      return;
    }
    if (selectedEvent.multiDevice) {
      // Si es multi-dispositivo, navega a la lista de ubicaciones
      navigate(`/events/${selectedEvent.code}/location`);
    } else {
      // Si no es multi-dispositivo, navega directamente a editar la ubicación con un ID predeterminado
      navigate(`/events/${selectedEvent.code}/editLocation`);
    }
  };

  const handleEditRoute = () => {
    if (!selectedEvent) {
      console.error("No hay evento seleccionado para editar la ruta");
      return;
    }

    if (selectedEvent.multiDevice) {
      // Si es multi-dispositivo, navega a la lista de ubicaciones
      navigate(`/events/${selectedEvent.code}/route`);
    } else {
      // Si no es multi-dispositivo, navega directamente a editar la ubicación con un ID predeterminado
      navigate(`/events/${selectedEvent.code}/editRoute`);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <LocalHeaderLayout breadcrumbs={breadcrumbs}>
      <div className="content-wrapper" style={{ padding: '20px', paddingBottom: '50px' }}>
        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
          />
        )}
        {events.length > 0 ? (
          <div className="row gx-3 justify-content-center align-items-stretch">
            {events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={(e) => handleEditEvent(event, e)}
                onViewDetails={(e) => handleViewDetails(event, e)}
                onDelete={(e) => handleDeleteEvent(event, e)}
              />
            ))}
            {/* Elemento al final para hacer scroll */}
            <div ref={bottomRef} />
          </div>
        ) : (
          !loading && (
            <div className="d-flex flex-column align-items-center justify-content-center my-5">
              <i className="bi bi-exclamation-circle text-muted fs-1 mb-3"></i>
              <p className="text-muted fs-5 m-0">
                No hay eventos registrados para esta organización.
              </p>
            </div>
          )
        )}
        {/* Uso del FloatingAddButton para agregar un nuevo evento */}
        <FloatingAddButton
          onClick={() => {
            setEventErrors({});
            setSelectedEvent({
              name: '',
              postalCode: '',
              time: '',
              startDate: '',
              endDate: '',
              image: '',
              icon: '',
              multiDevice: false,
              organizationCode: organizationCode, 
            });
            setCancelInfo('');
            // Cargamos las organizaciones filtradas por permisos de usuario
            fetchOrganizations()
              .then(orgs => {
                let filteredOrgs;
                
                // Si es superadmin, puede ver todas las organizaciones
                if (currentUser.isSuperAdmin) {
                  filteredOrgs = orgs;
                } else {
                  // Si no es superadmin, solo muestra las organizaciones que administra
                  filteredOrgs = orgs.filter(org => 
                    currentUser.adminOf?.some(adminOrg => 
                      String(adminOrg.id) === String(org._id) || 
                      String(adminOrg._id) === String(org._id)
                    )
                  );
                }
                
                setEventOrganizations(filteredOrgs);
              })
              .catch(err => console.error("Error al cargar organizaciones:", err));
              
            const modalEl = document.getElementById("editEventModal");
            if (modalEl) {
              const formEl = modalEl.querySelector("form");
              if (formEl) {
                formEl.classList.remove("was-validated");
              }
              const modal = new window.bootstrap.Modal(modalEl);
              modal.show();
            } else {
              console.error("No se encontró el modal 'editEventModal'");
            }
          }}
        />
      </div>

      <OptionsModal 
        selectedEvent={selectedEvent}
        handleEditLocation={handleEditLocation}
        handleEditRoute={handleEditRoute}
      />

      {/* Modal para editar / actualizar evento */}
      <div
        className="modal fade"
        id="editEventModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="editEventModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={handleEventSubmit} className="needs-validation" noValidate>
              <div className="modal-header">
                <h5 className="modal-title" id="editEventModalLabel">
                  {selectedEvent && selectedEvent._id ? "Editar Evento" : "Agregar Evento"}
                </h5>
                <button
                  type="button"
                  className="btn btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              {selectedEvent && selectedEvent._id && selectedEvent.status === 1 && (
                <div className="alert alert-warning m-3" role="alert">
                  Este evento está cancelado.
                </div>
              )}
              {selectedEvent && selectedEvent._id && selectedEvent.status === 2 && (
                <div className="alert alert-danger m-3" role="alert">
                  Este evento está finalizado.
                </div>
              )}
              <div className="modal-body" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {selectedEvent && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="eventName" className="form-label">Nombre</label>
                      <input
                        type="text"
                        className={`form-control ${eventErrors.name ? 'is-invalid' : ''}`}
                        id="eventName"
                        value={selectedEvent.name || ''}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, name: e.target.value })
                        }
                        placeholder="Nombre del evento"
                        required
                      />
                      {eventErrors.name && (
                        <div className="invalid-feedback">
                          {eventErrors.name}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="eventPostalCode" className="form-label">Código Postal</label>
                      <input
                        type="text"
                        className={`form-control ${eventErrors.postalCode ? 'is-invalid' : ''}`}
                        id="eventPostalCode"
                        value={selectedEvent.postalCode || ''}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, postalCode: e.target.value })
                        }
                        placeholder="Código Postal"
                        required
                      />
                      {eventErrors.postalCode && (
                        <div className="invalid-feedback">
                          {eventErrors.postalCode}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="eventTime" className="form-label">Tiempo actualización (segundos)</label>
                      <input
                        type="number"
                        className={`form-control ${eventErrors.time ? 'is-invalid' : ''}`}
                        id="eventTime"
                        value={selectedEvent.time || ''}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, time: e.target.value })
                        }
                        placeholder="Tiempo de actualización"
                        required
                      />
                      {eventErrors.time && (
                        <div className="invalid-feedback">
                          {eventErrors.time}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="eventStartDate" className="form-label">Fecha de Inicio</label>
                      <input
                        type="datetime-local"
                        className={`form-control ${eventErrors.startDate ? 'is-invalid' : ''}`}
                        id="eventStartDate"
                        value={selectedEvent.startDate ? selectedEvent.startDate.replace('Z', '') : ''}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, startDate: e.target.value })
                        }
                        required
                      />
                      {eventErrors.startDate && (
                        <div className="invalid-feedback">
                          {eventErrors.startDate}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="eventEndDate" className="form-label">Fecha de Fin</label>
                      <input
                        type="datetime-local"
                        className={`form-control ${eventErrors.endDate ? 'is-invalid' : ''}`}
                        id="eventEndDate"
                        value={selectedEvent.endDate ? selectedEvent.endDate.replace('Z', '') : ''}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, endDate: e.target.value })
                        }
                        required
                      />
                      {eventErrors.endDate && (
                        <div className="invalid-feedback">
                          {eventErrors.endDate}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="eventImage" className="form-label">Imagen (URL)</label>
                      <input
                        type="text"
                        className={`form-control ${eventErrors.image ? 'is-invalid' : ''}`}
                        id="eventImage"
                        value={selectedEvent.image || ''}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, image: e.target.value })
                        }
                        placeholder="URL de la imagen"
                      />
                      {eventErrors.image && (
                        <div className="invalid-feedback">
                          {eventErrors.image}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="eventIcon" className="form-label">Icono (URL)</label>
                      <input
                        type="text"
                        className={`form-control ${eventErrors.icon ? 'is-invalid' : ''}`}
                        id="eventIcon"
                        value={selectedEvent.icon || ''}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, icon: e.target.value })
                        }
                        placeholder="URL del icono"
                      />
                      {eventErrors.icon && (
                        <div className="invalid-feedback">
                          {eventErrors.icon}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="eventOrganization" className="form-label">Organización</label>
                      <select
                        id="eventOrganization"
                        className={`form-select ${eventErrors.organizationCode ? 'is-invalid' : ''}`}
                        value={selectedEvent.organizationCode || ''}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, organizationCode: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>
                          Selecciona una organización
                        </option>
                        {eventOrganizations.map((org) => (
                          <option key={org.code} value={org.code}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                      {eventErrors.organizationCode && (
                        <div className="invalid-feedback">
                          {eventErrors.organizationCode}
                        </div>
                      )}
                    </div>
                    {/* Añadir checkbox para multiDevice */}
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="multiDevice"
                        checked={selectedEvent.multiDevice || false}
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, multiDevice: e.target.checked })
                        }
                      />
                      <label className="form-check-label" htmlFor="multiDevice">
                        Permitir múltiples dispositivos
                      </label>
                    </div>
                    {selectedEvent._id && (
                      <div className="d-flex flex-wrap gap-2">
                        {selectedEvent.status !== 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              openConfirmModal("resume", "Confirmar Reanudación", "¿Estás seguro de que deseas reanudar el evento?")
                            }
                            className="btn btn-success"
                          >
                            Reanudar Evento
                          </button>
                        )}
                        {selectedEvent.status !== 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              openConfirmModal("suspend", "Confirmar Suspensión", "¿Estás seguro de que deseas suspender el evento?")
                            }
                            className="btn btn-warning"
                          >
                            Suspender Evento
                          </button>
                        )}
                        {selectedEvent.status !== 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              openConfirmModal("finish", "Confirmar Finalización", "¿Estás seguro de que deseas finalizar el evento?")
                            }
                            className="btn btn-danger"
                          >
                            Finalizar Evento
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de acción */}
      {showActionConfirmModal && (
        <ConfirmationModal
          id="actionConfirmModal"
          title={confirmModalTitle}
          message={confirmModalMessage}
          onConfirm={handleConfirm}
          onCancel={() => {
            console.log("Se canceló la acción");
            setShowActionConfirmModal(false);
          }}
          extraContent={
            confirmAction === "suspend" && (
              <>
                <label htmlFor="cancelInfo">Información de Cancelación:</label>
                <textarea
                  id="cancelInfo"
                  className="form-control"
                  value={cancelInfo}
                  onChange={(e) => setCancelInfo(e.target.value)}
                />
              </>
            )
          }
        />
      )}

      {/* Modal de confirmación de eliminación de evento */}
      {showDeleteConfirmModal && (
        <ConfirmationModal
          id="deleteConfirmModal"
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar el evento ${eventToDelete?.name}?`}
          onConfirm={async () => {
            console.log("Confirmación para eliminar evento");
            await handleDeleteConfirmed();
            setShowDeleteConfirmModal(false);
          }}
          onCancel={() => {
            console.log("Se canceló la eliminación del evento");
            setShowDeleteConfirmModal(false);
          }}
          extraContent={null}
        />
      )}
    </LocalHeaderLayout>
  );
};

export default Events;