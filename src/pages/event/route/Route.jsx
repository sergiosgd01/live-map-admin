import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Services
import { fetchDevicesByEventCode } from '../../../services/deviceService';
import { fetchRouteByEventCodeDeviceID } from '../../../services/routeService';
import { fetchEventByCode } from '../../../services/eventService';

// Utils
import { lightenColor, darkenColor } from '../../../utils/colorUtils';
import { centerMapBasedOnMarkers } from '../../../utils/mapCentering';

// Components
import { useMap } from '../../../components/SharedMap';
import DevicePanel from '../../../components/DevicePanel';
import Spinner from '../../../components/Spinner';
import TogglePanelButton from '../../../components/TogglePanelButton';

const Route = ({ eventCode }) => {
  const map = useMap();
  const navigate = useNavigate();

  // Refs para guardar marcadores y polilíneas por dispositivo
  const deviceMarkersRef = useRef({});
  const devicePolylinesRef = useRef({});

  // Estados
  const [devices, setDevices] = useState([]);
  const [deviceRoutes, setDeviceRoutes] = useState({});
  const [eventPostalCode, setEventPostalCode] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para el panel de dispositivos
  const [showPanel, setShowPanel] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Función para limpiar marcadores y polilíneas anteriores
  const clearMarkersAndPolylines = () => {
    Object.values(deviceMarkersRef.current)
      .flat()
      .forEach((marker) => marker.setMap(null));
    deviceMarkersRef.current = {};
    Object.values(devicePolylinesRef.current).forEach((polyline) =>
      polyline.setMap(null)
    );
    devicePolylinesRef.current = {};
  };

  // Función para cargar dispositivos y rutas, y dibujar en el mapa
  const loadDeviceMarkers = useCallback(async () => {
    if (!map || !eventCode) return;
    setLoading(true);
    try {
      // 1. Obtener datos del evento para extraer postalCode
      const eventData = await fetchEventByCode(eventCode);
      let postalCode = null;
      if (eventData) {
        postalCode = eventData.postalCode;
        setEventPostalCode(postalCode);
      } else {
        console.warn(`Evento con código ${eventCode} no encontrado.`);
      }

      // 2. Obtener dispositivos asociados al evento
      const devicesResponse = await fetchDevicesByEventCode(eventCode);
      setDevices(devicesResponse);

      // 3. Obtener rutas para cada dispositivo
      const routesByDevice = await Promise.all(
        devicesResponse.map(async (device) => {
          const routes = await fetchRouteByEventCodeDeviceID(
            eventCode,
            device.deviceID
          );
          if (routes.length === 0) {
            console.log(
              `No hay rutas disponibles para el dispositivo ${device.name} en este evento.`
            );
          }
          return { deviceID: device.deviceID, routes };
        })
      );

      // 4. Guardar las rutas en el estado
      const newDeviceRoutes = Object.fromEntries(
        routesByDevice.map(({ deviceID, routes }) => [deviceID, routes])
      );
      setDeviceRoutes(newDeviceRoutes);

      // 5. Limpiar marcadores y polilíneas anteriores
      clearMarkersAndPolylines();

      // 6. Dibujar marcadores y polilíneas para cada dispositivo
      routesByDevice.forEach(({ deviceID, routes }) => {
        const deviceColor =
          devicesResponse.find((d) => d.deviceID === deviceID)?.color || '#000000';

        // --- MARCADORES: dibujar el primer y el último punto
        const markers = [];
        if (routes.length > 0) {
          const firstRoute = routes[0];
          const firstMarker = new window.google.maps.Marker({
            position: { lat: firstRoute.latitude, lng: firstRoute.longitude },
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: lightenColor(deviceColor, 30),
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#000',
            },
          });
          markers.push(firstMarker);
        }
        if (routes.length > 1) {
          const lastRoute = routes[routes.length - 1];
          const lastMarker = new window.google.maps.Marker({
            position: { lat: lastRoute.latitude, lng: lastRoute.longitude },
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: darkenColor(deviceColor, 30),
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#000',
            },
          });
          markers.push(lastMarker);
        }
        deviceMarkersRef.current[deviceID] = markers;

        // --- POLILÍNEA DISCONTINUA: dibujar la ruta completa
        if (routes.length > 1) {
          const path = routes.map((r) => ({
            lat: r.latitude,
            lng: r.longitude,
          }));
          const polyline = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: deviceColor,
            strokeOpacity: 0,
            strokeWeight: 2,
            icons: [
              {
                icon: {
                  path: 'M 0,-1 0,1',
                  strokeOpacity: 1,
                  strokeWeight: 3,
                  scale: 2,
                },
                offset: '0',
                repeat: '10px',
              },
            ],
          });
          polyline.setMap(map);
          devicePolylinesRef.current[deviceID] = polyline;
        }
      });

      // 7. Ajustar el bounds del mapa para que se vean TODAS las rutas
      const allRoutes = Object.values(newDeviceRoutes).flat();
      if (allRoutes.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        allRoutes.forEach((r) => {
          bounds.extend({ lat: r.latitude, lng: r.longitude });
        });
        map.fitBounds(bounds);
      } else {
        centerMapBasedOnMarkers(map, false, postalCode);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar los marcadores de dispositivos:", error);
      setLoading(false);
    }
  }, [map, eventCode]);

  useEffect(() => {
    loadDeviceMarkers();
  }, [loadDeviceMarkers]);

  // Función para mostrar las rutas de un dispositivo y ajustar el mapa
  const showDeviceRoutes = (deviceID) => {
    setSelectedDevice(deviceID);
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      const show = id === deviceID;
      deviceMarkersRef.current[id]?.forEach((marker) => marker.setVisible(show));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(show);
      }
    });
    const routes = deviceRoutes[deviceID] || [];
    if (routes.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      routes.forEach((r) => {
        bounds.extend({ lat: r.latitude, lng: r.longitude });
      });
      map.fitBounds(bounds);
    } else {
      centerMapBasedOnMarkers(map, false, eventPostalCode);
    }
  };

  // Función para mostrar todas las rutas y ajustar el mapa
  const showAllRoutes = () => {
    setSelectedDevice(null);
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      deviceMarkersRef.current[id]?.forEach((marker) => marker.setVisible(true));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(true);
      }
    });
    const allRoutes = Object.values(deviceRoutes).flat();
    if (allRoutes.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      allRoutes.forEach((r) => {
        bounds.extend({ lat: r.latitude, lng: r.longitude });
      });
      map.fitBounds(bounds);
    } else {
      centerMapBasedOnMarkers(map, false, eventPostalCode);
    }
  };

  // Función para ir a la pantalla de edición de rutas de un dispositivo
  const handleEditRoutes = (deviceID) => {
    navigate(`/events/${eventCode}/route/${deviceID}/edit`);
  };

  return (
    <>
      {/* SPINNER DE CARGA */}
      {loading && <Spinner />}

      {/* BOTÓN PARA MOSTRAR/OCULTAR PANEL */}
      {!loading && (
        <TogglePanelButton
          showPanel={showPanel}
          togglePanel={() => setShowPanel((prev) => !prev)}
        />
      )}

      {/* PANEL DE DISPOSITIVOS (extraído en DevicePanel.jsx) */}
      {showPanel && !loading && (
        <DevicePanel
          devices={devices}
          showDevice={showDeviceRoutes}
          handleEdit={handleEditRoutes}
          showAllRoutes={showAllRoutes}
          selectedDevice={selectedDevice}
        />
      )}
    </>
  );
};

export default Route;
