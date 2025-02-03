import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import { useMap } from "../../../components/SharedMap";

// Services
import { fetchDevicesByEventCode } from "../../../services/deviceService";
import { fetchLocationsByDeviceIdEventCode } from "../../../services/locationService";
import { fetchEventByCode } from "../../../services/eventService";

// Utils
import { centerMapBasedOnMarkers } from "../../../utils/mapCentering";

const Location = ({ eventCode }) => {
  const map = useMap();
  const navigate = useNavigate();

  const deviceMarkersRef = useRef({});
  const devicePolylinesRef = useRef({});

  const [devices, setDevices] = useState([]);
  const [deviceLocations, setDeviceLocations] = useState({});
  const [eventPostalCode, setEventPostalCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!map || !eventCode) return;

    const loadDeviceMarkers = async () => {
      setLoading(true); 
      try {
        const eventData = await fetchEventByCode(eventCode);
        let postalCode = null;

        if (eventData) {
          postalCode = eventData.postalCode;
          setEventPostalCode(postalCode);
        } else {
          console.warn(`Evento con código ${eventCode} no encontrado.`);
        }

        // Limpia los marcadores y polilíneas anteriores
        Object.values(deviceMarkersRef.current)
          .flat()
          .forEach((marker) => marker.setMap(null));
        Object.values(devicePolylinesRef.current).forEach((polyline) =>
          polyline.setMap(null)
        );

        deviceMarkersRef.current = {};
        devicePolylinesRef.current = {};

        const devicesResponse = await fetchDevicesByEventCode(eventCode);
        setDevices(devicesResponse);

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

          const markers = [];
          if (locations.length > 0) {
            const lastLocation = locations[locations.length - 1];
            const lastMarker = new window.google.maps.Marker({
              position: { lat: lastLocation.latitude, lng: lastLocation.longitude },
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

          locations.forEach((loc) => {
            bounds.extend({ lat: loc.latitude, lng: loc.longitude });
            anyLocation = true;
          });
        });

        if (anyLocation) {
          map.fitBounds(bounds);
        } else {
          centerMapBasedOnMarkers(map, false, postalCode);
        }

        setLoading(false); // Finaliza la carga
      } catch (error) {
        console.error("Error al cargar los marcadores de dispositivos:", error);
        setLoading(false); // Finaliza la carga incluso en caso de error
      }
    };

    loadDeviceMarkers();
  }, [map, eventCode]);

  const showDeviceLocations = async (deviceID) => {
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

  const showAllLocations = () => {
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

  const handleEditLocations = (deviceID) => {
    navigate(`/events/${eventCode}/location/${deviceID}/edit`);
  };

  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
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
            }}
          ></div>
        </div>
      )}
      {!loading && (
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
          {devices.length === 1 ? (
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
                onClick={() => handleEditLocations(devices[0].deviceID)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "5px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Editar Ubicaciones
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>Dispositivos</h2>
              {devices.length === 0 ? (
                <p>No hay dispositivos para este evento.</p>
              ) : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {devices.map((device) => (
                    <li
                      key={device._id}
                      style={{
                        marginBottom: "10px",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: "10px",
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
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color: "#fff",
                          }}
                        >
                          {device.color}
                        </span>
                      </p>
                      <button
                        onClick={() => showDeviceLocations(device.deviceID)}
                        style={{
                          marginRight: "10px",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Ver Ubicaciones
                      </button>
                      <button
                        onClick={() => handleEditLocations(device.deviceID)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "5px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Editar Ubicaciones
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={showAllLocations}
                style={{
                  padding: "5px 10px",
                  borderRadius: "5px",
                  backgroundColor: "#ffc107",
                  color: "black",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Mostrar Todos
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Location;
