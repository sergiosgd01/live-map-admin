import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchEventRawLocations,
  deleteAllEventRawLocations
} from '../../../services/rawLocationService';
import { fetchDevicesByEventCode } from '../../../services/deviceService';

const GetLocations = () => {
  const { eventCode } = useParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('ALL');

  // Estado para controlar si se auto-refresca la lista o no
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Intervalo de refresco fijo (en segundos)
  const REFRESH_INTERVAL = 20;

  // Función para cargar dispositivos
  const loadDevices = async () => {
    try {
      const devicesResponse = await fetchDevicesByEventCode(eventCode);
      setDevices(devicesResponse);
    } catch (error) {
      console.error('Error fetching devices:', error);
      alert('Failed to load devices. Please try again later.');
    }
  };

  // Función para cargar ubicaciones
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

  // useEffect para cargar datos iniciales cuando cambia eventCode
  useEffect(() => {
    if (eventCode) {
      loadDevices();
      loadLocations();
    }
  }, [eventCode]);

  // useEffect para manejar el intervalo de actualización basado en autoRefresh
  useEffect(() => {
    if (!eventCode) return;

    let interval = null;
    if (autoRefresh) {
      interval = setInterval(loadLocations, REFRESH_INTERVAL * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, eventCode]);

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

  const getDeviceColor = (deviceID) => {
    const device = devices.find((d) => d.deviceID === deviceID);
    return device ? device.color : 'transparent';
  };

  const getDeviceName = (deviceID) => {
    const device = devices.find((d) => d.deviceID === deviceID);
    return device ? device.name : deviceID;
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

  const filteredLocations =
    selectedDevice === 'ALL'
      ? locations
      : locations.filter((loc) => loc.deviceID === selectedDevice);

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
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

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ cursor: 'pointer', marginRight: '10px' }} className="switch">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
        <span>Actualizar automáticamente cada {REFRESH_INTERVAL} segundos</span>
      </div>

      {devices.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
          }}
        >
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            style={{ marginBottom: '10px' }}
          >
            <option value="ALL">All Devices</option>
            {devices.map((device) => (
              <option key={device.deviceID} value={device.deviceID}>
                {device.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p>Loading locations...</p>
      ) : filteredLocations.length > 0 ? (
        <>
          <p>Total Locations: {filteredLocations.length}</p>
          <table style={{ border: '1px solid black', width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Accuracy</th>
                <th>Reason</th>
                <th>Device</th>
                <th>Device Color</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((location) => (
                <tr key={location._id} style={getRowStyle(location.errorCode)}>
                  <td>{formatTimestamp(location.timestamp)}</td>
                  <td>{location.latitude}</td>
                  <td>{location.longitude}</td>
                  <td>{location.accuracy || 'N/A'}</td>
                  <td>{location.reason || 'No errors'}</td>
                  <td>{getDeviceName(location.deviceID)}</td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: getDeviceColor(location.deviceID),
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No se han encontrado ubicaciones para este evento.</p>
      )}
    </div>
  );
};

export default GetLocations;