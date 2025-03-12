import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Servicios
import { fetchDevicesByEventCode } from "../../../services/deviceService";
import { fetchLocationsByDeviceIdEventCode } from "../../../services/locationService";
import { fetchEventByCode } from "../../../services/eventService";
import { fetchRouteByEventCodeDeviceID, fetchResetVisitedStatusByEventCode } from "../../../services/routeService";

// Utils
import { centerMapBasedOnMarkers } from "../../../utils/mapCentering";
import { getNearestRouteLocations } from "../../../utils/getNearestRouteLocations";

// Components
import { useMap } from "../../../components/SharedMap";
import DevicePanel from "../../../components/DevicePanel";
import Spinner from "../../../components/Spinner";
import TogglePanelButton from "../../../components/TogglePanelButton";
import ImproveLocationButton from "../../../components/ImproveLocationButton";
import UpdateMarkersButton from "../../../components/UpdateMarkersButton";

function Location({ eventCode }) {
  const map = useMap();
  const navigate = useNavigate();

  // Refs para guardar marcadores y polilíneas
  const deviceMarkersRef = useRef({});
  const devicePolylinesRef = useRef({});
  
  // Nueva ref para el estado de mejora de ubicación
  const improveLocationRef = useRef(false);

  // Estados
  const [devices, setDevices] = useState([]);
  const [deviceLocations, setDeviceLocations] = useState({});
  const [deviceRoutes, setDeviceRoutes] = useState({});
  const [deviceVisitedLocations, setDeviceVisitedLocations] = useState({});
  const [eventPostalCode, setEventPostalCode] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Nuevo estado para mejorar ubicación
  const [improveLocation, setImproveLocation] = useState(false);
  
  // Último timestamp
  const [lastLocationMarkerTime, setLastLocationMarkerTime] = useState("");

  // Estado para mostrar/ocultar el panel lateral
  const [showPanel, setShowPanel] = useState(false);
  // Estado para guardar el dispositivo filtrado (cuando se muestra "Ver")
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Obtiene el timestamp más reciente de todas las ubicaciones
  const getLatestTimestampFromLocations = (locsMap) => {
    let latest = 0;

    for (const devID in locsMap) {
      for (const loc of locsMap[devID]) {
        if (!loc.timestamp) continue;

        // Si loc.timestamp es un string ISO
        const timeMs = Date.parse(loc.timestamp);
        if (!isNaN(timeMs)) {
          if (timeMs > latest) {
            latest = timeMs;
          }
        }
      }
    }
    return latest;
  };

  // Actualizar el timestamp de la última ubicación cuando cambien las ubicaciones
  useEffect(() => {
    const ms = getLatestTimestampFromLocations(deviceLocations);
    if (ms > 0) {
      setLastLocationMarkerTime(new Date(ms).toISOString());
    } else {
      setLastLocationMarkerTime("");
    }
  }, [deviceLocations]);

  // Actualizar la ref de improveLocation cuando cambie el estado
  useEffect(() => {
    improveLocationRef.current = improveLocation;
  }, [improveLocation]);

  // Carga inicial de datos
  useEffect(() => {
    if (!map || !eventCode) return;

    const loadDeviceMarkers = async () => {
      setLoading(true);
      try {
        // 1. Fetch de datos del evento
        const eventData = await fetchEventByCode(eventCode);
        let postalCode = null;
        if (eventData) {
          postalCode = eventData.postalCode;
          setEventPostalCode(postalCode);
        } else {
          console.warn(`Evento con código ${eventCode} no encontrado.`);
        }

        // 2. Limpiar cualquier marcador o polilínea previa
        Object.values(deviceMarkersRef.current)
          .flat()
          .forEach((marker) => marker.setMap(null));
        Object.values(devicePolylinesRef.current).forEach((poly) =>
          poly.setMap(null)
        );
        deviceMarkersRef.current = {};
        devicePolylinesRef.current = {};

        // 3. Fetch de todos los dispositivos asociados al evento
        const devicesResponse = await fetchDevicesByEventCode(eventCode);
        setDevices(devicesResponse);

        // 4. Para cada dispositivo, traemos sus ubicaciones
        const locationsByDevice = await Promise.all(
          devicesResponse.map(async (device) => {
            const locs = await fetchLocationsByDeviceIdEventCode(
              device.deviceID,
              eventCode
            );
            return { deviceID: device.deviceID, locations: locs };
          })
        );
        const newDeviceLocations = Object.fromEntries(
          locationsByDevice.map(({ deviceID, locations }) => [
            deviceID,
            locations,
          ])
        );
        setDeviceLocations(newDeviceLocations);
        
        // 5. Para cada dispositivo, traemos su ruta
        const routesByDevice = await Promise.all(
          devicesResponse.map(async (device) => {
            //const hola = await fetchResetVisitedStatusByEventCode(routesByDevice.code);
            const route = await fetchRouteByEventCodeDeviceID(
              eventCode, 
              device.deviceID
            );
            return { deviceID: device.deviceID, route };
          })
        );
        const routeMap = Object.fromEntries(
          routesByDevice.map(({ deviceID, route }) => [deviceID, route])
        );
        setDeviceRoutes(routeMap);
        
        // 6. Inicializar deviceVisitedLocations vacío
        setDeviceVisitedLocations({});

        // 7. Dibujar marcadores y polilíneas
        await drawMarkersAndPolylines(newDeviceLocations, {}, postalCode);

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar marcadores:", error);
        setLoading(false);
      }
    };

    loadDeviceMarkers();
  }, [map, eventCode]);

  // Efecto para manejar el cambio de estado de improveLocation
  useEffect(() => {
    const updateLocationsAndRoutes = async () => {
      try {
        if (improveLocation) {
          console.log("🛠 Activando mejora de ubicación...");
          const updatesPromises = devices.map(async (device) => {
            const locs = deviceLocations[device.deviceID] || [];
            const route = deviceRoutes[device.deviceID] || [];
            if (locs.length === 0 || route.length === 0) {
              return { deviceID: device.deviceID, visited: [] };
            }
            return {
              deviceID: device.deviceID,
              visited: await getNearestRouteLocations(locs, route)
            };
          });

          const updates = await Promise.all(updatesPromises);
          const newVisited = {};
          for (const { deviceID, visited } of updates) {
            newVisited[deviceID] = visited;
          }
          setDeviceVisitedLocations(newVisited);
          
          // Redibujar con ubicaciones mejoradas
          await drawMarkersAndPolylines({}, newVisited, eventPostalCode);
        } else {
          console.log("🔄 Restaurando ubicaciones originales (sin visited)...");
          // Redibujar con ubicaciones originales
          await drawMarkersAndPolylines(deviceLocations, {}, eventPostalCode);
          setDeviceVisitedLocations({});
        }
      } catch (error) {
        console.error("Error actualizando ubicaciones/rutas:", error);
      }
    };

    if (devices.length > 0 && map) {
      updateLocationsAndRoutes();
    }
  }, [improveLocation, devices, deviceLocations, deviceRoutes, map, eventPostalCode]);

  // Función para dibujar marcadores y polilíneas
  const drawMarkersAndPolylines = async (
    locations = null, 
    visitedLocations = null, 
    postalCode = null
  ) => {
    // Limpiar marcadores y polilíneas existentes
    Object.values(deviceMarkersRef.current)
      .flat()
      .forEach((marker) => marker.setMap(null));
    Object.values(devicePolylinesRef.current).forEach((poly) =>
      poly.setMap(null)
    );
    deviceMarkersRef.current = {};
    devicePolylinesRef.current = {};
    
    // Determinar qué ubicaciones usar
    let locationsToUse = improveLocation ? visitedLocations : locations;
    if (!locationsToUse || Object.keys(locationsToUse).length === 0) {
      if (improveLocation) {
        locationsToUse = deviceVisitedLocations;
      } else {
        locationsToUse = deviceLocations;
      }
    }
    
    if (!locationsToUse || Object.keys(locationsToUse).length === 0) {
      console.warn("No hay ubicaciones que mostrar");
      return;
    }
    
    // Configurar bounds para centrar el mapa
    const bounds = new window.google.maps.LatLngBounds();
    let anyLocation = false;
    
    // Para cada dispositivo, dibujar sus ubicaciones
    for (const deviceID of Object.keys(locationsToUse)) {
      const deviceColor = devices.find(d => d.deviceID === deviceID)?.color || "#000000";
      const locations = locationsToUse[deviceID] || [];
      
      if (locations.length === 0) continue;
      
      // Crear el path para la polilínea
      const path = locations.map((loc) => ({
        lat: loc.latitude,
        lng: loc.longitude,
      }));
      
      // Marcador en la última ubicación
      const markers = [];
      if (locations.length > 0) {
        const lastLocation = locations[locations.length - 1];
        const lastMarker = new window.google.maps.Marker({
          position: {
            lat: lastLocation.latitude,
            lng: lastLocation.longitude,
          },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: deviceColor,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#000",
          },
        });
        markers.push(lastMarker);
      }
      deviceMarkersRef.current[deviceID] = markers;

      // Dibujar polyline si hay más de 1 ubicación
      if (path.length > 1) {
        const polyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: deviceColor,
          strokeOpacity: 1.0,
          strokeWeight: 4,
        });
        polyline.setMap(map);
        devicePolylinesRef.current[deviceID] = polyline;
      }

      // Ajustar bounds
      locations.forEach((loc) => {
        bounds.extend({ lat: loc.latitude, lng: loc.longitude });
        anyLocation = true;
      });
    }

    // Centrar el mapa
    if (anyLocation) {
      map.fitBounds(bounds);
    } else {
      centerMapBasedOnMarkers(map, false, postalCode);
    }
  };

  /** Actualizar marcadores */
  const handleUpdateMarkers = async () => {
    console.log("🔄 Actualizando marcadores...");
    setLoading(true);
    
    try {
      // 1. Para cada dispositivo, actualizamos sus ubicaciones
      const locationsByDevice = await Promise.all(
        devices.map(async (device) => {
          const locs = await fetchLocationsByDeviceIdEventCode(
            device.deviceID,
            eventCode
          );
          return { deviceID: device.deviceID, locations: locs };
        })
      );
      
      const newDeviceLocations = Object.fromEntries(
        locationsByDevice.map(({ deviceID, locations }) => [
          deviceID,
          locations,
        ])
      );
      setDeviceLocations(newDeviceLocations);
      
      // 2. Si estamos en modo "mejorar ubicación", recalculamos los puntos visitados
      if (improveLocationRef.current) {
        console.log("📍 Recalculando ubicaciones mejoradas...");
        const updatesPromises = devices.map(async (device) => {
          const deviceID = device.deviceID;
          const locs = newDeviceLocations[deviceID] || [];
          const route = deviceRoutes[deviceID] || [];

          if (locs.length === 0 || route.length === 0) {
            return { deviceID, visited: [] };
          }
          const visitedPoints = await getNearestRouteLocations(locs, route);
          return { deviceID, visited: visitedPoints };
        });

        const updates = await Promise.all(updatesPromises);
        const newVisited = {};
        for (const { deviceID, visited } of updates) {
          newVisited[deviceID] = visited;
        }
        setDeviceVisitedLocations(newVisited);
        
        // Dibujar con las ubicaciones mejoradas
        await drawMarkersAndPolylines({}, newVisited, eventPostalCode);
      } else {
        // Dibujar con las ubicaciones originales actualizadas
        await drawMarkersAndPolylines(newDeviceLocations, {}, eventPostalCode);
      }
    } catch (error) {
      console.error("Error al actualizar marcadores:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Mostrar solo ubicaciones de un dispositivo. */
  const showDeviceLocations = (deviceID) => {
    setSelectedDevice(deviceID);
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      const show = id === deviceID;
      deviceMarkersRef.current[id]?.forEach((marker) => marker.setVisible(show));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(show);
      }
    });
    
    // Determinar qué ubicaciones utilizar según improveLocation
    const locationsToUse = improveLocation 
      ? deviceVisitedLocations 
      : deviceLocations;
    
    const newBounds = new window.google.maps.LatLngBounds();
    let anyLocation = false;
    if (locationsToUse[deviceID]) {
      locationsToUse[deviceID].forEach((loc) => {
        newBounds.extend({ lat: loc.latitude, lng: loc.longitude });
        anyLocation = true;
      });
    }
    if (anyLocation) {
      map.fitBounds(newBounds);
    } else {
      centerMapBasedOnMarkers(map, false, eventPostalCode);
    }
  };

  /** Mostrar todas las ubicaciones. */
  const showAllLocations = () => {
    setSelectedDevice(null);
    Object.keys(deviceMarkersRef.current).forEach((id) => {
      deviceMarkersRef.current[id]?.forEach((marker) => marker.setVisible(true));
      if (devicePolylinesRef.current[id]) {
        devicePolylinesRef.current[id].setVisible(true);
      }
    });
    
    // Determinar qué ubicaciones utilizar según improveLocation
    const locationsToUse = improveLocation 
      ? deviceVisitedLocations 
      : deviceLocations;
    
    const newBounds = new window.google.maps.LatLngBounds();
    let anyLocation = false;
    Object.keys(locationsToUse).forEach((devId) => {
      if (locationsToUse[devId]) {
        locationsToUse[devId].forEach((loc) => {
          newBounds.extend({ lat: loc.latitude, lng: loc.longitude });
          anyLocation = true;
        });
      }
    });
    if (anyLocation) {
      map.fitBounds(newBounds);
    } else {
      centerMapBasedOnMarkers(map, false, eventPostalCode);
    }
  };

  /** Ir a la edición de ubicaciones de un dispositivo. */
  const handleEditLocations = (deviceID) => {
    navigate(`/events/${eventCode}/location/${deviceID}/edit`);
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

      {/* PANEL DE DISPOSITIVOS */}
      {showPanel && !loading && (
        <DevicePanel
          devices={devices}
          showDevice={showDeviceLocations}
          handleEdit={handleEditLocations}
          showAll={showAllLocations}
          selectedDevice={selectedDevice}
        />
      )}
      
      {/* BOTONES DE MEJORA DE UBICACIÓN Y ACTUALIZACIÓN */}
      {!loading && (
        <div className="location-controls" style={{ 
          position: 'absolute', 
          bottom: '20px', 
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <ImproveLocationButton
            improveLocation={improveLocation}
            setImproveLocation={setImproveLocation}
          />
          <UpdateMarkersButton fetchData={handleUpdateMarkers} />
        </div>
      )}
      
      {/* INFO DE ÚLTIMA UBICACIÓN */}
      {lastLocationMarkerTime && !loading && (
        <div className="timestamp-info" style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Última actualización: {new Date(lastLocationMarkerTime).toLocaleString()}
        </div>
      )}
    </>
  );
}

export default Location;