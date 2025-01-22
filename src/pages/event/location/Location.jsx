import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMap } from '../../../components/SharedMap';
import { fetchDevicesByEventCode } from '../../../services/deviceService';
import { fetchLocationsByDeviceIdEventCode } from '../../../services/locationService';
import { useNavigate } from 'react-router-dom';

const Location = ({ eventCode }) => {
  const map = useMap();
  const navigate = useNavigate();

  // Referencia para los marcadores y polilíneas según el dispositivo
  const deviceMarkersRef = useRef({});
  const devicePolylinesRef = useRef({});

  // Estado para lista de dispositivos y ubicaciones
  const [devices, setDevices] = useState([]);
  const [deviceLocations, setDeviceLocations] = useState({});

  const loadDeviceMarkers = useCallback(async () => {
    if (!map || !eventCode) return;

    // Limpiar marcadores y polilíneas previos
    Object.values(deviceMarkersRef.current).flat().forEach((marker) => marker.setMap(null));
    Object.values(devicePolylinesRef.current).forEach((polyline) => polyline.setMap(null));
    deviceMarkersRef.current = {};
    devicePolylinesRef.current = {};

    // Traer dispositivos
    const devicesResponse = await fetchDevicesByEventCode(eventCode);
    setDevices(devicesResponse);

    // Para cada dispositivo, traer sus ubicaciones
    const locationsByDevice = await Promise.all(
      devicesResponse.map(async (device) => {
        const locs = await fetchLocationsByDeviceIdEventCode(device.deviceID, eventCode);

        if (locs.length === 0) {
          console.log(`No se encontraron ubicaciones para el dispositivo ${device.deviceID} en el evento ${eventCode}.`);
        }

        return { deviceID: device.deviceID, locations: locs };
      })
    );

    // Guardar ubicaciones en el estado
    const newDeviceLocations = Object.fromEntries(
      locationsByDevice.map(({ deviceID, locations }) => [deviceID, locations])
    );
    setDeviceLocations(newDeviceLocations);

    // Crear marcadores y polilíneas para cada dispositivo
    locationsByDevice.forEach(({ deviceID, locations }) => {
      const deviceColor = devicesResponse.find((device) => device.deviceID === deviceID)?.color || '#000000'; // Color por defecto negro

      deviceMarkersRef.current[deviceID] = locations.map((loc) => {
        return new window.google.maps.Marker({
          position: { lat: loc.latitude, lng: loc.longitude },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: deviceColor, // Usar el color específico del dispositivo
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#000', // Contorno negro
          },
        });
      });

      const path = locations.map((loc) => ({ lat: loc.latitude, lng: loc.longitude }));
      devicePolylinesRef.current[deviceID] = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: deviceColor,
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      devicePolylinesRef.current[deviceID].setMap(map);

      // Centrar el mapa en la última ubicación
      if (locations.length > 0) {
        const lastLocation = locations[locations.length - 1];
        map.panTo({ lat: lastLocation.latitude, lng: lastLocation.longitude });
        map.setZoom(14);
      }
    });
  }, [map, eventCode]);

  // Mostrar ubicaciones de un dispositivo específico
  const showDeviceLocations = (deviceID) => {
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      const show = id === deviceID;
      deviceMarkersRef.current[id].forEach((marker) => marker.setVisible(show));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(show);
      }
    });
  };

  // Mostrar todas las ubicaciones
  const showAllLocations = () => {
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      deviceMarkersRef.current[id].forEach((marker) => marker.setVisible(true));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(true);
      }
    });
  };

  // Navegar a la pantalla de editar ubicaciones
  const handleEditLocations = (deviceID) => {
    navigate(`/events/${eventCode}/location/${deviceID}/edit`);
  };

  // Efecto para cargar marcadores al montar o cambiar de evento
  useEffect(() => {
    loadDeviceMarkers();
  }, [loadDeviceMarkers]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 9999,
        padding: '10px',
        borderRadius: '5px',
        backgroundColor: 'rgba(0, 51, 102, 0.8)', 
        color: 'white', // Texto blanco para mejor visibilidad
        maxWidth: '300px',
        overflowY: 'auto',
        maxHeight: '90vh',
      }}
    >
      {devices.length === 1 ? (
        <div>
          <p><strong>Nombre:</strong> {devices[0].name}</p>
          <p><strong>Color:</strong> <span style={{ backgroundColor: devices[0].color, padding: '5px 10px', borderRadius: '5px', color: '#fff' }}>{devices[0].color}</span></p>
          <button onClick={() => handleEditLocations(devices[0].deviceID)} style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
            Editar Ubicaciones
          </button>
        </div>
      ) : (
        <>
          <h2 style={{ marginTop: 0 }}>Dispositivos</h2>
          {devices.length === 0 ? (
            <p>No hay dispositivos para este evento.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {devices.map((device) => (
                <li key={device._id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                  <p><strong>Nombre:</strong> {device.name}</p>
                  <p><strong>Color:</strong> <span style={{ backgroundColor: device.color, padding: '5px 10px', borderRadius: '5px', color: '#fff' }}>{device.color}</span></p>
                  <button onClick={() => showDeviceLocations(device.deviceID)} style={{ marginRight: '10px', padding: '5px 10px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Ver Ubicaciones
                  </button>
                  <button onClick={() => handleEditLocations(device.deviceID)} style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Editar Ubicaciones
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={showAllLocations} style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
            Mostrar Todos
          </button>
        </>
      )}
    </div>
  );
};

export default Location;