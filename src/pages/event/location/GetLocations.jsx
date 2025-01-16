import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventRawLocations, deleteAllEventRawLocations } from '../../../services/rawLocationService';

const GetLocations = () => {
  const { eventCode } = useParams(); 
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const locationsData = await fetchEventRawLocations(eventCode);

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

    if (eventCode) {
      loadLocations();
      const interval = setInterval(loadLocations, 20000);

      return () => clearInterval(interval);
    }
  }, [eventCode]);

  const getRowStyle = (errorCode) => {
    switch (errorCode) {
      case 0: 
        return { backgroundColor: 'lightgreen' };
      case 1: 
        return { backgroundColor: 'lightyellow' };
      case 2: 
        return { backgroundColor: 'lightcoral' };
      default: 
        return { backgroundColor: 'white' };
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().split('T')[0]; 
    const formattedTime = date.toISOString().split('T')[1].split('Z')[0];

    return (
      <>
        {formattedDate}{' '}
        <span style={{ fontWeight: 'bold' }}>{formattedTime}</span>
      </>
    );
  };

  const handleDeleteAllLocations = async () => {
    try {
      if (window.confirm('¿Estás seguro de que deseas eliminar todas las ubicaciones?')) {
        await deleteAllEventRawLocations(eventCode);
        setLocations([]); 
        alert('Todas las ubicaciones han sido eliminadas correctamente.');
      }
    } catch (error) {
      console.error('Error al eliminar todas las ubicaciones:', error);
      alert('Error al eliminar las ubicaciones. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div>
      <button
        onClick={handleDeleteAllLocations}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        Eliminar todas las ubicaciones
      </button>
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
                <th>DeviceID</th>
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
                  <td>{location.deviceID}</td>
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
