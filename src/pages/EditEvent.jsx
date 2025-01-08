import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventById, updateEvent, checkCodeExists } from '../services/eventService';
import { fetchOrganizations } from '../services/organizationService';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [organizations, setOrganizations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); 
  const [cancelInfo, setCancelInfo] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadEventAndOrganizations = async () => {
      try {
        const data = await fetchEventById(id);
        setEvent(data);

        const orgs = await fetchOrganizations();
        setOrganizations(orgs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEventAndOrganizations();
  }, [id]);

  const handleInputChange = (field, value) => {
    setEvent({ ...event, [field]: value });
    setErrors({ ...errors, [field]: '' }); 
  };

  const validateForm = async () => {
    if (!event) return false; // Si `event` es null, la validación falla.
    const newErrors = {};
  
    if (!event.name || event.name.trim() === '') {
      newErrors.name = 'El nombre no puede estar vacío';
    }
  
    if (!event.code || isNaN(Number(event.code))) {
      newErrors.code = 'El código no puede estar vacío y debe ser un número';
    } else {
      try {
        const codeExists = await checkCodeExists(event._id, event.code);
        if (codeExists) {
          newErrors.code = 'El código ya existe en la base de datos';
        }
      } catch (err) {
        console.error('Error al verificar el código:', err);
        newErrors.code = 'Error al verificar el código, inténtelo nuevamente';
      }
    }    
  
    if (!event.postalCode || event.postalCode.trim() === '') {
      newErrors.postalCode = 'El código postal no puede estar vacío';
    }
  
    if (!event.time || isNaN(event.time)) {
      newErrors.time = 'El tiempo de actualización debe ser un número';
    }
  
    if (!event.organizationCode || event.organizationCode === '') {
      newErrors.organizationCode = 'Debe seleccionar un código de organización';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Devuelve true si no hay errores
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) {
      alert('Por favor, corrija los errores antes de enviar el formulario.');
      return;
    }
  
    try {
      await updateEvent(id, event);
      alert('Evento actualizado exitosamente');
      const updatedEvent = await fetchEventById(id);
      setEvent(updatedEvent);
      navigate(`/organizations/${event.organizationCode}/events`);
    } catch (err) {
      console.error('Error al actualizar el evento:', err);
      alert('Error al actualizar el evento: ' + err.message);
    }
  };  

  const handleResumeEvent = async () => {
    try {
      if (window.confirm('¿Estás seguro de que deseas renaudar el evento?')) {
        await updateEvent(id, { ...event, status: 0 });
        alert('Evento renaudado exitosamente');
        const updatedEvent = await fetchEventById(id);
        setEvent(updatedEvent);
      } 
    } catch (err) {
      console.error('Error al renaudar el evento:', err);
      alert('Error al renaudar el evento: ' + err.message);
    }
  };

  const handleSuspendEvent = async () => {
    try {
      await updateEvent(id, { ...event, status: 1, cancelledInfo: cancelInfo });
      alert('Evento suspendido exitosamente');
      setShowModal(false);
      const updatedEvent = await fetchEventById(id);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Error al suspender el evento:', err);
      alert('Error al suspender el evento: ' + err.message);
    }
  };

  const handleFinishEvent = async () => {
    try {
      if (window.confirm('¿Estás seguro de que deseas finalizar el evento?')) {
        await updateEvent(id, { ...event, status: 2 });
        alert('Evento finalizado exitosamente');
        const updatedEvent = await fetchEventById(id);
        setEvent(updatedEvent);
      } 
    } catch (err) {
      console.error('Error al finalizar el evento:', err);
      alert('Error al finalizar el evento: ' + err.message);
    }
  };

  if (loading) return <p>Cargando datos del evento...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No se encontró el evento.</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {event.status === 1 && (
        <div
          style={{
            backgroundColor: 'orange',
            color: '#000',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            width: '80%',
            margin: '0 auto',
          }}
        >
          <h3>Evento Suspendido</h3>
          <p>{event.cancelledInfo || 'Información no proporcionada'}</p>
        </div>
      )}
      {event.status === 2 && (
        <div
          style={{
            backgroundColor: 'red',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            width: '80%',
            margin: '0 auto',
          }}
        >
          <h3>Evento Finalizado</h3>
        </div>
      )}
      <h1>Editar Evento: {event.name}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', width: '60%' }}>
        <label>
          Nombre:
          <input
            type="text"
            value={event.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.name && <p style={{ color: 'red', margin: 0 }}>{errors.name}</p>}
        </label>
        <br />
        <label>
          Código:
          <input
            type="text"
            value={event.code || ''}
            onChange={(e) => handleInputChange('code', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.code && <p style={{ color: 'red', margin: 0 }}>{errors.code}</p>}
        </label>
        <br />
        <label>
          Código Postal:
          <input
            type="text"
            value={event.postalCode || ''}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.postalCode && <p style={{ color: 'red', margin: 0 }}>{errors.postalCode}</p>}
        </label>
        <br />
        <label>
          Tiempo actualización (segundos):
          <input
            type="number"
            value={event.time || ''}
            onChange={(e) => handleInputChange('time', e.target.value)}
            style={{ width: '100%' }}
          />
          {errors.time && <p style={{ color: 'red', margin: 0 }}>{errors.time}</p>}
        </label>
        <br />
        <label>
          Fecha de Inicio:
          <input
            type="datetime-local"
            value={event.startDate ? event.startDate.replace('Z', '') : ''}
            onChange={(e) => handleInputChange('startDate', e.target.value + ':00')}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Fecha de Fin:
          <input
            type="datetime-local"
            value={event.endDate ? event.endDate.replace('Z', '') : ''}
            onChange={(e) => handleInputChange('endDate', e.target.value + ':00')}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Imagen:
          <input
            type="text"
            value={event.image || ''}
            onChange={(e) => handleInputChange('image', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Icono:
          <input
            type="text"
            value={event.icon || ''}
            onChange={(e) => handleInputChange('icon', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Organización:
          <select
            value={event.organizationCode || ''}
            onChange={(e) => handleInputChange('organizationCode', e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="" disabled>
              Selecciona una organización
            </option>
            {organizations.map((org) => (
              <option key={org.code} value={org.code}>
                {org.name}
              </option>
            ))}
          </select>
          {errors.organizationCode && <p style={{ color: 'red', margin: 0 }}>{errors.organizationCode}</p>}
        </label>
        <br />
        {event.status !== 0 && (
          <button
            type="button"
            onClick={handleResumeEvent}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Reanudar Evento
          </button>
        )}
        {event.status !== 1 && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: 'orange',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Suspender Evento
          </button>
        )}
        {event.status !== 2 && (
          <button
            type="button"
            onClick={handleFinishEvent}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Finalizar Evento
          </button>
        )}
        <br />
        <button
          type="submit"
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Guardar Cambios
        </button>
      </form>
  
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              width: '300px',
            }}
          >
            <h3>Suspender Evento</h3>
            <label>
              Información de Cancelación:
              <textarea
                value={cancelInfo}
                onChange={(e) => setCancelInfo(e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
            </label>
            <button
              onClick={handleSuspendEvent}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Suspender Evento
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );  
};

export default EditEvent;
