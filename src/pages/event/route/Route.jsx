import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMap } from '../../../components/SharedMap';
import { fetchDevicesByEventCode } from '../../../services/deviceService';
import { fetchRouteByEventCodeDeviceID } from '../../../services/routeService';
import { useNavigate } from 'react-router-dom';

const Route = ({ eventCode }) => {
  const map = useMap();
  const navigate = useNavigate();

  // Referencia para los marcadores y polilíneas según el dispositivo
  const deviceMarkersRef = useRef({});
  const devicePolylinesRef = useRef({});

  // Estado para lista de dispositivos y rutas
  const [devices, setDevices] = useState([]);
  const [deviceRoutes, setDeviceRoutes] = useState({});

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

    // Para cada dispositivo, traer sus rutas
    const routesByDevice = await Promise.all(
      devicesResponse.map(async (device) => {
        const routes = await fetchRouteByEventCodeDeviceID(eventCode, device.deviceID);
        if (routes.length === 0) {
          console.log('No hay ubicaciones disponibles para este dispositivo en este evento.');
        }
        return { deviceID: device.deviceID, routes };
      })
    );

    // Guardar rutas en el estado
    const newDeviceRoutes = Object.fromEntries(
      routesByDevice.map(({ deviceID, routes }) => [deviceID, routes])
    );
    setDeviceRoutes(newDeviceRoutes);

    // Crear marcadores y polilíneas para cada dispositivo
    routesByDevice.forEach(({ deviceID, routes }) => {
      const deviceColor = devicesResponse.find((device) => device.deviceID === deviceID)?.color || '#000000'; // Color por defecto negro

      deviceMarkersRef.current[deviceID] = routes.map((route) => {
        return new window.google.maps.Marker({
          position: { lat: route.latitude, lng: route.longitude },
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

      const path = routes.map((route) => ({ lat: route.latitude, lng: route.longitude }));
      devicePolylinesRef.current[deviceID] = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: deviceColor,
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      devicePolylinesRef.current[deviceID].setMap(map);

      // Centrar el mapa en la última ubicación de la ruta
      if (routes.length > 0) {
        const lastRoute = routes[routes.length - 1];
        map.panTo({ lat: lastRoute.latitude, lng: lastRoute.longitude });
        map.setZoom(14);
      }
    });
  }, [map, eventCode]);

  // Mostrar rutas de un dispositivo específico
  const showDeviceRoutes = (deviceID) => {
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      const show = id === deviceID;
      deviceMarkersRef.current[id].forEach((marker) => marker.setVisible(show));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(show);
      }
    });
  };

  // Mostrar todas las rutas
  const showAllRoutes = () => {
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      deviceMarkersRef.current[id].forEach((marker) => marker.setVisible(true));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(true);
      }
    });
  };

  // Navegar a la pantalla de editar rutas
  const handleEditRoutes = (deviceID) => {
    navigate(`/events/${eventCode}/route/${deviceID}/edit`);
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
          <button onClick={() => handleEditRoutes(devices[0].deviceID)} style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
            Editar Rutas
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
                  <button onClick={() => showDeviceRoutes(device.deviceID)} style={{ marginRight: '10px', padding: '5px 10px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Ver Rutas
                  </button>
                  <button onClick={() => handleEditRoutes(device.deviceID)} style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Editar Rutas
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={showAllRoutes} style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
            Mostrar Todos
          </button>
        </>
      )}
    </div>
  );
};

export default Route;