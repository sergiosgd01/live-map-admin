import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Servicios
import { fetchDevicesByEventCode } from "../../../services/deviceService";
import { fetchLocationsByDeviceIdEventCode } from "../../../services/locationService";
import { fetchEventByCode } from "../../../services/eventService";

// Utils
import { centerMapBasedOnMarkers } from "../../../utils/mapCentering";

// Components
import { useMap } from "../../../components/SharedMap";
import DevicePanel from "../../../components/DevicePanel";
import Spinner from "../../../components/Spinner";
import TogglePanelButton from "../../../components/TogglePanelButton";

function Location({ eventCode }) {
  const map = useMap();
  const navigate = useNavigate();

  // Refs para guardar marcadores y polilíneas
  const deviceMarkersRef = useRef({});
  const devicePolylinesRef = useRef({});

  // Estados
  const [devices, setDevices] = useState([]);
  const [deviceLocations, setDeviceLocations] = useState({});
  const [eventPostalCode, setEventPostalCode] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para mostrar/ocultar el panel lateral
  const [showPanel, setShowPanel] = useState(false);
  // Estado para guardar el dispositivo filtrado (cuando se muestra "Ver")
  const [selectedDevice, setSelectedDevice] = useState(null);

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

        // 5. Dibujar marcadores y polilíneas
        const bounds = new window.google.maps.LatLngBounds();
        let anyLocation = false;
        locationsByDevice.forEach(({ deviceID, locations }) => {
          const deviceColor =
            devicesResponse.find((d) => d.deviceID === deviceID)?.color ||
            "#000000";
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
        });

        // 6. Centrar el mapa
        if (anyLocation) {
          map.fitBounds(bounds);
        } else {
          centerMapBasedOnMarkers(map, false, postalCode);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar marcadores:", error);
        setLoading(false);
      }
    };

    loadDeviceMarkers();
  }, [map, eventCode]);

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
    const newBounds = new window.google.maps.LatLngBounds();
    let anyLocation = false;
    if (deviceLocations[deviceID]) {
      deviceLocations[deviceID].forEach((loc) => {
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
    const newBounds = new window.google.maps.LatLngBounds();
    let anyLocation = false;
    Object.keys(deviceLocations).forEach((devId) => {
      deviceLocations[devId].forEach((loc) => {
        newBounds.extend({ lat: loc.latitude, lng: loc.longitude });
        anyLocation = true;
      });
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

      {/* PANEL DE DISPOSITIVOS (Extraído en DevicePanel.jsx) */}
      {showPanel && !loading && (
        <DevicePanel
          devices={devices}
          showDevice={showDeviceLocations}
          handleEdit={handleEditLocations}
          showAll={showAllLocations}
          selectedDevice={selectedDevice}
        />
      )}
    </>
  );
}

export default Location;
