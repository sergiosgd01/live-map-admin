// src/pages/Events_.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { DateTime } from 'luxon';

// Components
import Layout from '../../components/Layout';
import EventCard from '../../components/EventCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import OptionsModal from '../../components/OptionsModal';

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

  // Funciones que realizan la acción sin confirmación
  const performResumeEvent = async () => {
    try {
      await changeEventStatus(selectedEvent.code, 0);
      const updatedEvent = await fetchEventByCode(selectedEvent.code);
      setSelectedEvent(updatedEvent);
    } catch (err) {
      console.error('Error al reanudar el evento:', err);
      alert('Error al reanudar el evento: ' + err.message);
    }
  };

  const performSuspendEvent = async () => {
    try {
      await changeEventStatus(selectedEvent.code, 1, cancelInfo);
      const updatedEvent = await fetchEventByCode(selectedEvent.code);
      setSelectedEvent(updatedEvent);
    } catch (err) {
      console.error('Error al suspender el evento:', err);
      alert('Error al suspender el evento: ' + err.message);
    }
  };

  const performFinishEvent = async () => {
    try {
      await changeEventStatus(selectedEvent.code, 2);
      const updatedEvent = await fetchEventByCode(selectedEvent.code);
      setSelectedEvent(updatedEvent);
    } catch (err) {
      console.error('Error al finalizar el evento:', err);
      alert('Error al finalizar el evento: ' + err.message);
    }
  };

  // Función que abre el modal de confirmación de acción
  const openConfirmModal = (action, title, message) => {
    setConfirmAction(action);
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    const modalEl = document.getElementById("actionConfirmModal");
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  };

  const handleConfirm = async () => {
    const actionModalEl = document.getElementById("actionConfirmModal");
    const actionModal = window.bootstrap.Modal.getInstance(actionModalEl);
    if (actionModal) actionModal.hide();

    if (confirmAction === "resume") {
      await performResumeEvent();
    } else if (confirmAction === "suspend") {
      await performSuspendEvent();
    } else if (confirmAction === "finish") {
      await performFinishEvent();
    }

    const updatedEvent = await fetchEventByCode(selectedEvent.code);
    setEvents(events.map(ev => ev._id === updatedEvent._id ? updatedEvent : ev));

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
    setSelectedEvent(eventItem);
    const modalEl = document.getElementById("optionsModal");
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  };

  const handleDeleteEvent = (eventItem, e) => {
    e.stopPropagation();
    setEventToDelete(eventItem);
    const modalEl = document.getElementById("deleteConfirmModal");
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  };

  // Al hacer clic en editar se abre el modal de edición
  const handleEditEvent = async (eventItem, e) => {
    e.stopPropagation();
    setSelectedEvent(eventItem);
    try {
      const orgs = await fetchOrganizations();
      setEventOrganizations(orgs);
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
        await deleteEvent(eventToDelete.code);
        setEvents(events.filter(ev => ev._id !== eventToDelete._id));
        const modalEl = document.getElementById("deleteConfirmModal");
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        setEventToDelete(null);
      } catch (err) {
        console.error('Error al eliminar el evento:', err);
        alert('Error al eliminar el evento: ' + err.message);
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
    setEventErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateEventForm();
    if (!isValid) return;
    try {
      const startDate = DateTime.fromISO(selectedEvent.startDate).setZone('Europe/Madrid').toISO();
      const endDate = DateTime.fromISO(selectedEvent.endDate).setZone('Europe/Madrid').toISO();
      const adjustedEvent = { ...selectedEvent, startDate, endDate };

      if (selectedEvent._id) {
        await updateEvent(selectedEvent.code, adjustedEvent);
        const updatedEvent = await fetchEventByCode(selectedEvent.code);
        setEvents(events.map(ev => ev._id === updatedEvent._id ? updatedEvent : ev));
      } else {
        const createdEvent = await addEvent(adjustedEvent);
        navigate(`/events/${createdEvent.event.code}`, { replace: true });
      }

      const modalEl = document.getElementById("editEventModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error al procesar el evento:', err);
      alert('Error al procesar el evento: ' + err.message);
    }
  };

  // Nuevas funciones para editar ubicaciones y ruta utilizando el código del evento seleccionado
  const handleEditLocation = () => {
    if (!selectedEvent) {
      console.error("No hay evento seleccionado para editar ubicaciones");
      return;
    }
    navigate(`/events/${selectedEvent.code}/location`);
  };

  const handleEditRoute = () => {
    if (!selectedEvent) {
      console.error("No hay evento seleccionado para editar la ruta");
      return;
    }
    navigate(`/events/${selectedEvent.code}/route`);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Layout>
        {/* Encabezado interno de la página */}
        <div className="main-header d-flex align-items-center justify-content-between position-relative">
          <div className="d-flex align-items-center justify-content-center">
            <div className="page-icon pe-3">
              <i className="bi bi-stickies"></i>
            </div>
            <div className="page-title d-none d-md-block">
              <h5>Eventos de {organizationName || organizationCode}</h5>
            </div>
          </div>
        </div>
        <div className="content-wrapper" style={{ padding: '20px' }}>
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
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>
              No hay eventos registrados para esta organización.
            </p>
          )}
          {/* Botón “+” para agregar un nuevo evento */}
          <button
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
                organizationCode: organizationCode,
              });
              setCancelInfo('');
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
            className="btn btn-primary rounded-circle"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '50px',
              height: '50px',
              fontSize: '24px',
            }}
          >
            +
          </button>
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
                          className="form-control"
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
                          className="form-control"
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
        <ConfirmationModal
          id="actionConfirmModal"
          title={confirmModalTitle}
          message={confirmModalMessage}
          onConfirm={handleConfirm}
          onCancel={() => {}}
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

        {/* Modal de confirmación de eliminación de evento */}
        <ConfirmationModal
          id="deleteConfirmModal"
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar el evento ${eventToDelete?.name}?`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => {
            // Puedes agregar lógica adicional al cancelar si es necesario
          }}
          extraContent={null}
        />
      </Layout>
    </>
  );
};

export default Events;
