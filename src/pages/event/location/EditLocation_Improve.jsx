import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DateTime } from 'luxon';

// Components
import { useMap } from '../../../components/SharedMap';
import Alert from '../../../components/Alert'; 
import ConfirmationModal from '../../../components/ConfirmationModal';
import PointInfo from '../../../components/PointInfo';
import EditPanel from '../../../components/EditPanel';
import Spinner from '../../../components/Spinner';
import ImproveLocationButton from '../../../components/ImproveLocationButton';

// Services
import {
  fetchLocationsByDeviceIdEventCode,
  fetchAddLocation,
  fetchDeleteLocation,
  fetchDeleteLocationsByDeviceAndEvent
} from '../../../services/locationService';
import { fetchDeviceByDeviceIDEventCode } from '../../../services/deviceService';
import { fetchEventByCode } from '../../../services/eventService';
import { fetchRouteByEventCodeDeviceID, fetchResetVisitedStatusByEventCode } from '../../../services/routeService';

// Utils
import { lightenColor, darkenColor } from '../../../utils/colorUtils';
import { centerMapBasedOnMarkers } from '../../../utils/mapCentering';
import { getNearestRouteLocations } from '../../../utils/getNearestRouteLocations';

const EditLocation = ({ eventCode, deviceID }) => {
  const map = useMap();

  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const tempPolylineRef = useRef(null);
  const tempMarkersRef = useRef([]);
  const improveLocationRef = useRef(false);

  const [newPoints, setNewPoints] = useState([]);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [mode, setMode] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [deviceColor, setDeviceColor] = useState(null);
  const [eventPostalCode, setEventPostalCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [improveLocation, setImproveLocation] = useState(false);
  const [deviceRoute, setDeviceRoute] = useState([]);
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [originalLocations, setOriginalLocations] = useState([]);

  // Autoocultar la alerta después de 5 segundos
  useEffect(() => {
    console.log("Alert actualizado:", alert);
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Actualizar la ref de improveLocation cuando cambie el estado
  useEffect(() => {
    improveLocationRef.current = improveLocation;
  }, [improveLocation]);

  const clearTemporaryMarkersAndLines = () => {
    console.log("Limpiando marcadores y líneas temporales");
    tempMarkersRef.current.forEach((marker) => marker.setMap(null));
    tempMarkersRef.current = [];
    setSelectedMarkers([]);
    setNewPoints([]);
    if (tempPolylineRef.current) {
      tempPolylineRef.current.setMap(null);
      tempPolylineRef.current = null;
    }
  };

  const loadDeviceColor = useCallback(async () => {
    try {
      console.log("Cargando color del dispositivo...");
      const eventData = await fetchEventByCode(eventCode);
      let postalCode = null;
      if (eventData) {
        postalCode = eventData.postalCode;
        setEventPostalCode(postalCode);
      }
      const device = await fetchDeviceByDeviceIDEventCode(deviceID, eventCode);
      const color = device?.color ? `#${device.color.replace('#', '')}` : '#FF0000';
      setDeviceColor(color);
      console.log("Color del dispositivo cargado:", color);
    } catch (err) {
      console.error('Error al cargar color del dispositivo:', err);
      setDeviceColor('#FF0000'); 
    }
  }, [deviceID, eventCode]);  

  const loadDeviceRoute = useCallback(async () => {
    try {
      console.log("Cargando ruta del dispositivo...");
      const route = await fetchRouteByEventCodeDeviceID(eventCode, deviceID);
      setDeviceRoute(route);
      console.log("Ruta del dispositivo cargada:", route);
    } catch (err) {
      console.error('Error al cargar ruta del dispositivo:', err);
      setDeviceRoute([]);
    }
  }, [deviceID, eventCode]);

  const loadLocationMarkers = useCallback(async (shouldCenter = false) => {
    if (!map || !eventCode || !deviceColor) return;
    console.log("Cargando marcadores de ubicación...");

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const markers = await fetchLocationsByDeviceIdEventCode(deviceID, eventCode);
    setOriginalLocations(markers);
    
    if (!markers || markers.length === 0) {
      if (shouldCenter) {
        centerMapBasedOnMarkers(map, false, eventPostalCode);
      }
      setLoading(false);
      return;
    }

    // Determinar qué ubicaciones usar basado en improveLocation
    const locationsToUse = improveLocationRef.current && visitedLocations.length > 0 
      ? visitedLocations 
      : markers;

    const path = locationsToUse.map((marker, index) => {
      const position = { lat: marker.latitude, lng: marker.longitude };
      let fillColor = deviceColor;
      if (index === 0) {
        fillColor = lightenColor(deviceColor, 50);
      } else if (index === locationsToUse.length - 1) {
        fillColor = darkenColor(deviceColor, 30);
      }
      const newMarker = new window.google.maps.Marker({
        position,
        map,
        title: index === 0 ? 'Inicio' : index === locationsToUse.length - 1 ? 'Fin' : `Punto ${index + 1}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: fillColor,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: 'black',
        },
      });

      if (!improveLocation) {
        if (mode === 'delete') {
          newMarker.addListener('click', () => {
            setSelectedMarkers((prev) => {
              const isSelected = prev.includes(marker._id);
              if (isSelected) {
                newMarker.setIcon({ ...newMarker.getIcon(), fillColor: fillColor });
                return prev.filter((id) => id !== marker._id);
              } else {
                newMarker.setIcon({ ...newMarker.getIcon(), fillColor: lightenColor(deviceColor, 50) });
                return [...prev, marker._id];
              }
            });
          });
        } else if (mode === '') {
          newMarker.addListener('click', () => {
            setSelectedPoint({
              id: marker._id,
              latitude: marker.latitude,
              longitude: marker.longitude,
              accuracy: marker.accuracy,
              timestamp: marker.timestamp,
              code: marker.code,
            });
          });
        }
      }
      markersRef.current.push(newMarker);
      return position;
    });

    if (shouldCenter) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((pos) => bounds.extend(pos));
      map.fitBounds(bounds);
    }
    redrawPolyline(locationsToUse);
    setLoading(false);
  }, [map, eventCode, deviceID, mode, deviceColor, eventPostalCode, visitedLocations]);

  const redrawPolyline = (markers) => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    const path = markers.map((marker) => ({
      lat: marker.latitude,
      lng: marker.longitude,
    }));
    polylineRef.current = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: deviceColor,
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });
    polylineRef.current.setMap(map);
  };

  // Efecto para el cambio de improveLocation
  useEffect(() => {
    const updateImprovedLocations = async () => {
      if (improveLocation) {
        try {
          console.log("🛠 Activando mejora de ubicación...");
          if (originalLocations.length === 0 || deviceRoute.length === 0) {
            console.log("No hay ubicaciones o rutas para mejorar");
            return;
          }
          const visited = await getNearestRouteLocations(originalLocations, deviceRoute);
          setVisitedLocations(visited);
          loadLocationMarkers(true);
        } catch (error) {
          console.error("Error al mejorar ubicaciones:", error);
        }
      } else {
        console.log("🔄 Restaurando ubicaciones originales");
        loadLocationMarkers(true);
      }
    };

    if (map && deviceColor) {
      updateImprovedLocations();
    }
  }, [improveLocation, deviceRoute, map, deviceColor]);

  useEffect(() => {
    (async () => {
      setLoading(true); 
      await loadDeviceColor();
      await loadDeviceRoute();
    })();
  }, [loadDeviceColor, loadDeviceRoute]);
  
  useEffect(() => {
    if (deviceColor) {
      clearTemporaryMarkersAndLines();
      loadLocationMarkers(true);
    }
  }, [deviceColor, loadLocationMarkers]); 

  useEffect(() => {
    if (map && mode === 'insert' && !improveLocation) {
      const handleMapClick = (e) => {
        const { latLng } = e;
        const newPoint = { latitude: latLng.lat(), longitude: latLng.lng() };
        const tempMarker = new window.google.maps.Marker({
          position: { lat: newPoint.latitude, lng: newPoint.longitude },
          map,
          title: 'Nuevo Punto',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: deviceColor,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: 'black',
          },
        });
        tempMarker.addListener('click', () => {
          console.log("Marcador temporal clicado. Se elimina.");
          tempMarker.setMap(null);
          tempMarkersRef.current = tempMarkersRef.current.filter((marker) => marker !== tempMarker);
          setNewPoints((prev) =>
            prev.filter((point) => point.latitude !== newPoint.latitude || point.longitude !== newPoint.longitude)
          );
        });
        tempMarkersRef.current.push(tempMarker);
        setNewPoints((prev) => [...prev, newPoint]);
      };
      map.addListener('click', handleMapClick);
      return () => {
        window.google.maps.event.clearListeners(map, 'click');
      };
    }
  }, [map, mode, deviceColor]);

  const handleInsertPoints = async () => {
    if (newPoints.length === 0) {
      setAlert({ type: 'warning', message: 'Debe seleccionar al menos un punto para insertar.' });
      return;
    }
    try {
      setLoading(true);
      for (const point of newPoints) {
        const timestamp = DateTime.now().setZone("Europe/Madrid").toISO();
        const adjustedTimestamp = new Date(timestamp);
        const locationData = { 
          latitude: point.latitude, 
          longitude: point.longitude, 
          accuracy: 0,
          timestamp: adjustedTimestamp,
        };
        await fetchAddLocation(locationData, eventCode, deviceID);        
      }
      clearTemporaryMarkersAndLines();
      setAlert({ type: 'success', message: 'Puntos insertados correctamente' });
      
      // Actualizar ubicaciones originales
      const updatedLocations = await fetchLocationsByDeviceIdEventCode(deviceID, eventCode);
      setOriginalLocations(updatedLocations);
      
      // Si estamos en modo mejorar ubicación, actualizar también las mejoradas
      if (improveLocationRef.current) {
        const visited = await getNearestRouteLocations(updatedLocations, deviceRoute);
        setVisitedLocations(visited);
      }
      
      await loadLocationMarkers(true);
    } catch (error) {
      console.error('Error al insertar puntos:', error);
      setAlert({ type: 'danger', message: 'Error al insertar puntos' });
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear el estado de visited
const handleResetVisitedStatus = async () => {
  try {
    setLoading(true);
    await fetchResetVisitedStatusByEventCode(eventCode);
    setAlert({ type: 'success', message: 'Estado de visited reseteado correctamente.' });

    if (improveLocationRef.current) {
      const visited = await getNearestRouteLocations(originalLocations, deviceRoute);
      setVisitedLocations(visited);
    }

    await loadLocationMarkers(true);
  } catch (error) {
    console.error('Error al resetear el estado de visited:', error);
    setAlert({ type: 'danger', message: 'Error al resetear el estado de visited.' });
  } finally {
    setLoading(false);
  }
};

  const handleDeleteSelectedPoints = async () => {
    if (selectedMarkers.length === 0) {
      setAlert({ type: 'warning', message: 'Debe seleccionar al menos un marcador para eliminar.' });
      return;
    }
    try {
      setLoading(true);
      for (const markerId of selectedMarkers) {
        await fetchDeleteLocation(markerId);
      }
      setSelectedMarkers([]);
      setAlert({ type: 'success', message: 'Puntos eliminados correctamente' });
      
      // Actualizar ubicaciones originales
      const updatedLocations = await fetchLocationsByDeviceIdEventCode(deviceID, eventCode);
      setOriginalLocations(updatedLocations);
      
      // Si estamos en modo mejorar ubicación, actualizar también las mejoradas
      if (improveLocationRef.current) {
        const visited = await getNearestRouteLocations(updatedLocations, deviceRoute);
        setVisitedLocations(visited);
      }
      
      await loadLocationMarkers(true);
    } catch (error) {
      console.error('Error al eliminar puntos:', error);
      setAlert({ type: 'danger', message: 'Error al eliminar puntos' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllLocations = async () => {
    try {
      setLoading(true);
      await fetchDeleteLocationsByDeviceAndEvent(eventCode, deviceID);
      setAlert({ type: 'success', message: 'Todas las ubicaciones se han eliminado correctamente.' });
      
      // Resetear ubicaciones
      setOriginalLocations([]);
      setVisitedLocations([]);
      
      await loadLocationMarkers(true);
    } catch (error) {
      console.error('Error al eliminar todas las ubicaciones:', error);
      setAlert({ type: 'warning', message: 'No hay ubicaciones para eliminar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SPINNER DE CARGA */}
      {loading && <Spinner />}
  
      {/* ALERTAS */}
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}
  
      {/* PANEL DE EDICIÓN */}
      {!improveLocation && (
        <EditPanel
          title="Editar Ubicaciones"
          mode={mode}
          setMode={setMode}
          handleInsertPoints={handleInsertPoints}
          handleDeleteSelectedPoints={handleDeleteSelectedPoints}
          setShowDeleteAllModal={setShowDeleteAllModal}
        />
      )}
  
      {/* INFORMACIÓN DEL PUNTO SELECCIONADO */}
      {!improveLocation && (
        <PointInfo 
          selectedPoint={selectedPoint} 
          mode={mode} 
          setSelectedPoint={setSelectedPoint} 
          extended={true}
        />
      )}
  
      {/* BOTÓN PARA RESETEAR EL ESTADO DE VISITED */}
      {!loading && !improveLocation && (
        <button
          className="btn btn-primary"
          onClick={handleResetVisitedStatus}
          style={{
            position: 'absolute',
            bottom: '80px', // Ajusta la posición vertical
            right: '20px', // Ajusta la posición horizontal
            zIndex: 1000, // Asegura que esté sobre otros elementos
          }}
        >
          Resetear Estado de Visited
        </button>
      )}
  
      {/* BOTÓN DE MEJORA DE UBICACIÓN */}
      {!loading && (
        <div className="improve-location-control" style={{ 
          position: 'absolute', 
          bottom: '20px', 
          right: '20px'
        }}>
          <ImproveLocationButton
            improveLocation={improveLocation}
            setImproveLocation={setImproveLocation}
          />
        </div>
      )}
  
      {/* MODAL PARA ELIMINAR TODAS LAS UBICACIONES */}
      {showDeleteAllModal && (
        <ConfirmationModal
          id="deleteAllModal"
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar todas las ubicaciones? Esta acción no se puede deshacer."
          onConfirm={async () => {
            setShowDeleteAllModal(false);
            await handleDeleteAllLocations();
          }}
          onCancel={() => {
            setShowDeleteAllModal(false);
          }}
          extraContent={null}
        />
      )}
    </>
  );
};

export default EditLocation;