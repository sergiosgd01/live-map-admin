import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventsByOrganization, deleteEvent } from '../services/eventService';
import { fetchOrganizationByCode } from '../services/organizationService'; // Importar el servicio

const Events = () => {
  const { organizationCode } = useParams();
  const [events, setEvents] = useState([]);
  const [organizationName, setOrganizationName] = useState(''); // Estado para el nombre de la organización
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrganizationAndEvents = async () => {
      try {
        // Obtener la organización por su ID
        console.log('organizationCode:', organizationCode);
        const organization = await fetchOrganizationByCode(organizationCode);
        setOrganizationName(organization.name); // Guardar el nombre de la organización

        // Obtener los eventos de la organización
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

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await deleteEvent(id);
        alert('Evento eliminado exitosamente');
        setEvents(events.filter((event) => event._id !== id));
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
      <h1 style={{ textAlign: 'center' }}>
        Eventos de la Organización {organizationName || organizationCode}
      </h1>
      {events.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {events.map((event) => (
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
                <Link to={`/events/${event._id}/edit`}>
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
                  onClick={() => handleDelete(event._id)}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#c9302c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#d9534f'}
                >
                  Eliminar Evento
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center' }}>No hay eventos registrados para esta organización.</p>
      )}
      <Link to={`/organizations/${organizationCode}/add-event`}>
        <button style={{
          padding: '10px 20px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          position: 'fixed',
          bottom: '20px',
          right: '20px'
        }}>
          +
        </button>
      </Link>
    </div>
  );
};

export default Events;
