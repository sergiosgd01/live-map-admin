import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { deleteEvent, fetchEventByCode } from '../../services/eventService';

const EventDetails = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await fetchEventByCode(eventCode);
        setEvent(event); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventCode]);

  const handleDelete = async (eventCode) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await deleteEvent(eventCode);
        alert('Evento eliminado exitosamente');
        navigate(`/organizations/${event.organizationCode}/events`);
      } catch (err) {
        console.error('Error al eliminar el evento:', err);
        alert('Error al eliminar el evento: ' + err.message);
      }
    }
  };

  if (loading) return <p>Cargando eventos...</p>;
  if (error) return <p>Error: {error}</p>;

  const buttonStyle = {
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    width: '200px',
    textAlign: 'center',
  };

  return (
    <div style={{ padding: '20px' }}>
      <div key={event._id} style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        {event.status === 1 && (
          <div
            style={{
              backgroundColor: 'orange',
              color: '#000',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px',
            }}
          >
            <h3>Evento Suspendido</h3>
          </div>
        )}
        {event.status === 2 && (
          <div
            style={{
              backgroundColor: 'red',
              color: '#fff',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px',
            }}
          >
            <h3>Evento Finalizado</h3>
          </div>
        )}
        <h2>{event.name}</h2>
        <p><strong>Código:</strong> {event.code}</p>
        <p><strong>Fechas:</strong> {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</p>
        <p><strong>Código Postal:</strong> {event.postalCode}</p>
        {event.image && (
          <img
            src={event.image}
            alt={event.name}
            style={{ width: '200px', height: 'auto', marginBottom: '10px' }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to={`/events/${event.code}/edit`}>
            <button style={{ ...buttonStyle, backgroundColor: '#007bff' }}>Editar Datos</button>
          </Link>
          <Link to={`/events/${event.code}/locations`}>
            <button style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>Ver ubicaciones</button>
          </Link>
          <Link to={`/events/${event.code}/edit-location`}>
            <button style={{ ...buttonStyle, backgroundColor: '#28a745' }}>Editar Ubicaciones</button>
          </Link>
          <Link to={`/events/${event.code}/edit-route`}>
            <button style={{ ...buttonStyle, backgroundColor: '#ffc107', color: 'black' }}>Editar Ruta</button>
          </Link>
          <Link to={`/events/${event.code}/edit-service`}>
            <button style={{ ...buttonStyle, backgroundColor: '#17a2b8' }}>Editar Servicios</button>
          </Link>
          <button
            style={{ ...buttonStyle, backgroundColor: '#d9534f' }}
            onClick={() => handleDelete(event.code)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c9302c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#d9534f'}
          >
            Eliminar Evento
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
