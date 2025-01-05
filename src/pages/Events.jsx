import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventsByOrganization } from '../services/eventService';

const Events = () => {
  const { organizationCode } = useParams(); // Obtén el código de la organización desde la URL
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEventsByOrganization(organizationCode);
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [organizationCode]);

  if (loading) return <p>Cargando eventos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Eventos de la Organización {organizationCode}</h1>
      {events.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {events.map((event) => (
            <div key={event._id} style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <h2>{event.name}</h2>
              <p><strong>Código:</strong> {event.code}</p>
              <p><strong>Fechas:</strong> {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</p>
              <p><strong>Estado:</strong> {event.status === 0 ? 'Activo' : 'Cancelado'}</p>
              <p><strong>Código Postal:</strong> {event.postalCode}</p>
              {event.image && (
                <img 
                  src={event.image} 
                  alt={event.name} 
                  style={{ width: '200px', height: 'auto', marginBottom: '10px' }} 
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to={`/events/${event._id}/edit`}>
                  <button style={{ padding: '10px', border: 'none', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>Editar Datos</button>
                </Link>
                <Link to={`/events/${event.code}/locations`}>
                  <button style={{ padding: '10px', border: 'none', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>Ver ubicaciones</button>
                </Link>
                <Link to={`/events/${event.code}/edit-location`}>
                  <button style={{ padding: '10px', border: 'none', borderRadius: '5px', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}>Editar Ubicaciones</button>
                </Link>
                <Link to={`/events/${event.code}/edit-route`}>
                  <button style={{ padding: '10px', border: 'none', borderRadius: '5px', backgroundColor: '#ffc107', color: 'black', cursor: 'pointer' }}>Editar Ruta</button>
                </Link>
                <Link to={`/events/${event.code}/edit-service`}>
                  <button style={{ padding: '10px', border: 'none', borderRadius: '5px', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer' }}>Editar Servicios</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center' }}>No hay eventos registrados para esta organización.</p>
      )}
    </div>
  );
};

export default Events;
