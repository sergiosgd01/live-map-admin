import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DateTime } from 'luxon';

// Components
import { useMap } from '../../../components/SharedMap';
import Alert from '../../../components/Alert'; 
import ConfirmationModal from '../../../components/ConfirmationModal';
import PointInfo from '../../../components/PointInfo';
import EditPanel from '../../../components/EditPanel';
import Spinner from '../../../components/Spinner';

// Services
import {
  fetchLocationsByDeviceIdEventCode,
  fetchAddLocation,
  fetchDeleteLocation,
  fetchDeleteLocationsByDeviceAndEvent
} from '../../../services/locationService';
import { fetchDeviceByDeviceIDEventCode } from '../../../services/deviceService';
import { fetchEventByCode } from '../../../services/eventService';

// Utils
import { lightenColor, darkenColor } from '../../../utils/colorUtils';
import { centerMapBasedOnMarkers } from '../../../utils/mapCentering';

const EditLocation = ({ eventCode, deviceID }) => {
  const map = useMap();

  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const tempPolylineRef = useRef(null);
  const tempMarkersRef = useRef([]);

  const [newPoints, setNewPoints] = useState([]);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [mode, setMode] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [deviceColor, setDeviceColor] = useState(null);
  const [eventPostalCode, setEventPostalCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Autoocultar la alerta después de 5 segundos
  useEffect(() => {
    console.log("Alert actualizado:", alert);
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

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
    if (!markers || markers.length === 0) {
      if (shouldCenter) {
        centerMapBasedOnMarkers(map, false, eventPostalCode);
      }
      setLoading(false);
      return;
    }

    const path = markers.map((marker, index) => {
      const position = { lat: marker.latitude, lng: marker.longitude };
      let fillColor = deviceColor;
      if (index === 0) {
        fillColor = lightenColor(deviceColor, 50);
      } else if (index === markers.length - 1) {
        fillColor = darkenColor(deviceColor, 30);
      }
      const newMarker = new window.google.maps.Marker({
        position,
        map,
        title: index === 0 ? 'Inicio' : index === markers.length - 1 ? 'Fin' : `Punto ${index + 1}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: fillColor,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: 'black',
        },
      });

      if (mode === 'delete') {
        newMarker.addListener('click', () => {
          console.log("Marcador clicado en modo eliminar:", marker._id);
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
          console.log("Marcador clicado en modo ver:", marker._id);
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
      markersRef.current.push(newMarker);
      return position;
    });

    if (shouldCenter) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((pos) => bounds.extend(pos));
      map.fitBounds(bounds);
    }
    redrawPolyline(markers);
    setLoading(false);
  }, [map, eventCode, deviceID, mode, deviceColor, eventPostalCode]);

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

  useEffect(() => {
    (async () => {
      setLoading(true); 
      await loadDeviceColor();
    })();
  }, [loadDeviceColor]);
  
  useEffect(() => {
    if (deviceColor) {
      clearTemporaryMarkersAndLines();
      loadLocationMarkers(true);
    }
  }, [deviceColor, loadLocationMarkers]); 

  useEffect(() => {
    if (map && mode === 'insert') {
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
      await loadLocationMarkers(true);
    } catch (error) {
      console.error('Error al insertar puntos:', error);
      setAlert({ type: 'danger', message: 'Error al insertar puntos' });
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

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      <EditPanel
        title="Editar Ubicaciones"
        mode={mode}
        setMode={setMode}
        handleInsertPoints={handleInsertPoints}
        handleDeleteSelectedPoints={handleDeleteSelectedPoints}
        setShowDeleteAllModal={setShowDeleteAllModal}
      />

      <PointInfo 
        selectedPoint={selectedPoint} 
        mode={mode} 
        setSelectedPoint={setSelectedPoint} 
        extended={true}
      />

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
