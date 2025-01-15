import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventsByOrganization } from '../../services/eventService';
import { fetchOrganizationByCode } from '../../services/organizationService'; 

const Events = () => {
  const { organizationCode } = useParams();
  const [events, setEvents] = useState([]);
  const [organizationName, setOrganizationName] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Cargando eventos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>
        Eventos de la Organización {organizationName || organizationCode}
      </h1>
      {events.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {events.map((event) => (
            <div key={event._id} style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
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
              <Link to={`/events/${event.code}`}>
                <button style={{
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  width: '200px',
                  textAlign: 'center',
                }}>
                  Ver Detalles
                </button>
              </Link>
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
