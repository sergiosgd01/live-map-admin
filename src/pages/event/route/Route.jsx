import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMap } from '../../../components/SharedMap';
import { fetchDevicesByEventCode } from '../../../services/deviceService';
import { fetchRouteByEventCodeDeviceID } from '../../../services/routeService';
import { fetchEventByCode } from '../../../services/eventService'; 
import { useNavigate } from 'react-router-dom';

import { lightenColor, darkenColor } from '../../../utils/colorUtils';

import { centerMapBasedOnMarkers } from "../../../utils/mapCentering";

const Route = ({ eventCode }) => {
  const map = useMap();
  const navigate = useNavigate();

  // Referencias para los marcadores y polilíneas según el dispositivo
  const deviceMarkersRef = useRef({});
  const devicePolylinesRef = useRef({});

  // Estados
  const [devices, setDevices] = useState([]);
  const [deviceRoutes, setDeviceRoutes] = useState({});
  const [eventPostalCode, setEventPostalCode] = useState(null); // Código postal del evento
  const [loading, setLoading] = useState(true); // Estado de carga

  // -- Función para limpiar marcadores/polilíneas anteriores
  const clearMarkersAndPolylines = () => {
    // Limpiar marcadores
    Object.values(deviceMarkersRef.current)
      .flat()
      .forEach((marker) => marker.setMap(null));
    deviceMarkersRef.current = {};

    // Limpiar polilíneas
    Object.values(devicePolylinesRef.current).forEach((polyline) =>
      polyline.setMap(null)
    );
    devicePolylinesRef.current = {};
  };

  // -- Función para cargar dispositivos y sus rutas
  const loadDeviceMarkers = useCallback(async () => {
    if (!map || !eventCode) return;

    try {
      // 1. Obtener detalles del evento para obtener eventPostalCode
      const eventData = await fetchEventByCode(eventCode);
      let postalCode = null;

      if (eventData) {
        postalCode = eventData.postalCode;
        setEventPostalCode(postalCode);
      } else {
        console.warn(`Evento con código ${eventCode} no encontrado.`);
      }

      // 2. Obtener lista de dispositivos
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

      // 4. Guardar rutas en estado
      const newDeviceRoutes = Object.fromEntries(
        routesByDevice.map(({ deviceID, routes }) => [deviceID, routes])
      );
      setDeviceRoutes(newDeviceRoutes);

      // 5. Limpiar marcadores y polilíneas anteriores
      clearMarkersAndPolylines();

      // 6. Crear marcadores y polilíneas para cada dispositivo
      routesByDevice.forEach(({ deviceID, routes }) => {
        // Color del dispositivo
        const deviceColor =
          devicesResponse.find((d) => d.deviceID === deviceID)?.color || '#000000';

        // --- MARCADORES: solo primero y último
        const markers = [];
        if (routes.length > 0) {
          // Primer punto con color aclarado
          const firstRoute = routes[0];
          const firstMarker = new window.google.maps.Marker({
            position: { lat: firstRoute.latitude, lng: firstRoute.longitude },
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: lightenColor(deviceColor, 30), // Aclarado
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#000',
            },
          });
          markers.push(firstMarker);
        }
        if (routes.length > 1) {
          // Último punto con color oscurecido
          const lastRoute = routes[routes.length - 1];
          const lastMarker = new window.google.maps.Marker({
            position: { lat: lastRoute.latitude, lng: lastRoute.longitude },
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: darkenColor(deviceColor, 30), // Oscurecido
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#000',
            },
          });
          markers.push(lastMarker);
        }
        deviceMarkersRef.current[deviceID] = markers;

        // --- POLILÍNEA DISCONTINUA con TODOS los puntos
        if (routes.length > 1) {
          const path = routes.map((r) => ({
            lat: r.latitude,
            lng: r.longitude,
          }));

          const polyline = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: deviceColor,
            strokeOpacity: 0, // invisible
            strokeWeight: 2,
            icons: [
              {
                icon: {
                  path: 'M 0,-1 0,1', // un pequeño trazo vertical
                  strokeOpacity: 1,
                  strokeWeight: 3,
                  scale: 2, // grosor de la “raya”
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

      // 7. Ajustar bounds para ver TODAS las rutas o centrar en postal code
      const allRoutes = Object.values(newDeviceRoutes).flat();
      if (allRoutes.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        allRoutes.forEach((r) => {
          bounds.extend({ lat: r.latitude, lng: r.longitude });
        });
        map.fitBounds(bounds);
      } else {
        // Centrar en el código postal del evento si no hay rutas
        centerMapBasedOnMarkers(map, false, postalCode);
      }

      setLoading(false); // Finaliza la carga
    } catch (error) {
      console.error("Error al cargar los marcadores de dispositivos:", error);
      setLoading(false); // Incluso en error, finaliza la carga
    }
  }, [map, eventCode]);

  // Efecto para cargar marcadores al montar el componente o cambiar eventCode/map
  useEffect(() => {
    loadDeviceMarkers();
  }, [loadDeviceMarkers]);

  // MUESTRA LAS RUTAS DE UN SOLO DISPOSITIVO Y AJUSTA EL MAPA
  const showDeviceRoutes = (deviceID) => {
    // 1) Mostrar/Ocultar sólo marcadores/polilíneas de ese dispositivo
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      const show = id === deviceID;
      deviceMarkersRef.current[id]?.forEach((marker) => marker.setVisible(show));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(show);
      }
    });

    // 2) Calcular bounds con la ruta de ESE dispositivo
    const routes = deviceRoutes[deviceID] || [];
    if (routes.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      routes.forEach((r) => {
        bounds.extend({ lat: r.latitude, lng: r.longitude });
      });
      map.fitBounds(bounds);
    } else {
      // Centrar en el código postal del evento si no hay rutas
      centerMapBasedOnMarkers(map, false, eventPostalCode);
    }
  };

  // MUESTRA TODAS LAS RUTAS Y AJUSTA EL MAPA
  const showAllRoutes = () => {
    // 1. Mostrar todos los marcadores y polilíneas
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      deviceMarkersRef.current[id]?.forEach((marker) => marker.setVisible(true));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(true);
      }
    });

    // 2. Ajustar bounds a TODOS los dispositivos
    const allRoutes = Object.values(deviceRoutes).flat();
    if (allRoutes.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      allRoutes.forEach((r) => {
        bounds.extend({ lat: r.latitude, lng: r.longitude });
      });
      map.fitBounds(bounds);
    } else {
      // Centrar en el código postal del evento si no hay rutas
      centerMapBasedOnMarkers(map, false, eventPostalCode);
    }
  };

  // Ir a la pantalla de editar rutas
  const handleEditRoutes = (deviceID) => {
    navigate(`/events/${eventCode}/route/${deviceID}/edit`);
  };

  return (
    <>
      {/* Botones y Panel de Información */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          zIndex: 9999,
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: "rgba(0, 51, 102, 0.8)",
          color: "white",
          maxWidth: "300px",
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              className="spinner"
              style={{
                border: "4px solid rgba(255, 255, 255, 0.3)",
                borderTop: "4px solid white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                animation: "spin 1s linear infinite",
                marginRight: "10px",
              }}
            ></div>
            <span>Cargando rutas...</span>
          </div>
        ) : devices.length === 1 ? (
          <div>
            <p>
              <strong>Nombre:</strong> {devices[0].name}
            </p>
            <p>
              <strong>Color:</strong>{" "}
              <span
                style={{
                  backgroundColor: devices[0].color,
                  padding: "5px 10px",
                  borderRadius: "5px",
                  color: "#fff",
                }}
              >
                {devices[0].color}
              </span>
            </p>
            <button
              onClick={() => handleEditRoutes(devices[0].deviceID)}
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
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
                  <li
                    key={device._id}
                    style={{
                      marginBottom: '10px',
                      borderBottom: '1px solid #ccc',
                      paddingBottom: '10px',
                    }}
                  >
                    <p>
                      <strong>Nombre:</strong> {device.name}
                    </p>
                    <p>
                      <strong>Color:</strong>{" "}
                      <span
                        style={{
                          backgroundColor: device.color,
                          padding: '5px 10px',
                          borderRadius: '5px',
                          color: '#fff',
                        }}
                      >
                        {device.color}
                      </span>
                    </p>
                    <button
                      onClick={() => showDeviceRoutes(device.deviceID)}
                      style={{
                        marginRight: '10px',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Ver Rutas
                    </button>
                    <button
                      onClick={() => handleEditRoutes(device.deviceID)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '5px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Editar Rutas
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={showAllRoutes}
              style={{
                padding: '5px 10px',
                borderRadius: '5px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Mostrar Todos
            </button>
          </>
        )}
      </div>

      {/* Mostrar un indicador de carga si los datos aún están cargando */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '200px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 1000,
          }}
        >
          <div
            className="spinner"
            style={{
              border: "4px solid rgba(255, 255, 255, 0.3)",
              borderTop: "4px solid white",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 10px auto",
            }}
          ></div>
          <span>Cargando rutas del evento...</span>
        </div>
      )}
    </>
  );
};

export default Route;
