import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventById, updateEvent } from '../services/eventService';

const EditEvent = () => {
  const { id } = useParams(); // Obtener el ID del evento desde la URL
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await fetchEventById(id);
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleInputChange = (field, value) => {
    setEvent({ ...event, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Datos enviados desde el formulario:', event);
  
    try {
      await updateEvent(id, event);
      alert('Evento actualizado exitosamente');
      navigate(-1); // Regresar a la página anterior
    } catch (err) {
      console.error('Error al actualizar el evento:', err);
      alert('Error al actualizar el evento: ' + err.message);
    }
  };
  

  if (loading) return <p>Cargando datos del evento...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No se encontró el evento.</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
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
        </label>
        <br />
        <label>
          Fecha de Inicio:
          <input
            type="datetime-local"
            value={event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Fecha de Fin:
          <input
            type="datetime-local"
            value={event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
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
          Código Postal:
          <input
            type="text"
            value={event.postalCode || ''}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            style={{ width: '100%' }}
          />
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
        </label>
        <br />
        <label>
          Estado:
          <select
            value={event.status || 0}
            onChange={(e) => handleInputChange('status', parseInt(e.target.value))}
            style={{ width: '100%' }}
          >
            <option value="0">Activo</option>
            <option value="1">Cancelado</option>
          </select>
        </label>
        <br />
        <label>
          Información de Cancelación:
          <textarea
            value={event.cancelledInfo || ''}
            onChange={(e) => handleInputChange('cancelledInfo', e.target.value)}
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
          Código QR:
          <input
            type="text"
            value={event.qrCode || ''}
            onChange={(e) => handleInputChange('qrCode', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Código de Organización:
          <input
            type="text"
            value={event.organizationCode || ''}
            onChange={(e) => handleInputChange('organizationCode', e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <button type="submit" style={{ marginTop: '20px' }}>Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditEvent;
