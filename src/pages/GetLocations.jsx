import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventRawLocations } from '../services/rawLocationService';

const GetLocations = () => {
  const { id } = useParams(); // Extrae el parámetro `id` de la URL
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        console.log('Loading locations for event:', id);
        setLoading(true);
        const locationsData = await fetchEventRawLocations(id);

        console.log('Locations:', locationsData);

        // Ordenar las ubicaciones en orden inverso según el timestamp
        const sortedLocations = locationsData.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setLocations(sortedLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        alert('Failed to load locations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadLocations();
      const interval = setInterval(loadLocations, 45000); // Actualiza cada 5 segundos

      // Limpia el intervalo cuando el componente se desmonte
      return () => clearInterval(interval);
    }
  }, [id]);

  // Función para determinar el color de fila según el código de error
  const getRowStyle = (errorCode) => {
    switch (errorCode) {
      case 0: // Sin errores
        return { backgroundColor: 'lightgreen' };
      case 1: // Ubicación igual a la última
        return { backgroundColor: 'lightyellow' };
      case 2: // Baja precisión
        return { backgroundColor: 'lightcoral' };
      default: // Otros casos
        return { backgroundColor: 'white' };
    }
  };

  // Formatear el timestamp para mostrar la hora en negrita
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = date.toISOString().split('T')[1].split('Z')[0]; // HH:mm:ss

    return (
      <>
        {formattedDate}{' '}
        <span style={{ fontWeight: 'bold' }}>{formattedTime}</span>
      </>
    );
  };

  return (
    <div>
      {loading ? (
        <p>Loading locations...</p>
      ) : locations.length > 0 ? (
        <>
          <p>Total Locations: {locations.length}</p>
          <table style={{ border: '1px solid black', width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Accuracy</th>
                <th>Reason</th>
                <th>ID</th>
                <th>Code</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location._id} style={getRowStyle(location.errorCode)}>
                  <td>{formatTimestamp(location.timestamp)}</td>
                  <td>{location.latitude}</td>
                  <td>{location.longitude}</td>
                  <td>{location.accuracy || 'N/A'}</td>
                  <td>{location.reason || 'No errors'}</td>
                  <td>{location._id}</td>
                  <td>{location.code || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No locations found for this event.</p>
      )}
    </div>
  );
};

export default GetLocations;
