import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DateTime } from 'luxon';
import { useMap } from '../../../components/SharedMap';
import { fetchLocationsByDeviceIdEventCode, fetchAddLocation, fetchDeleteLocation, fetchDeleteLocationsByDeviceAndEvent } from '../../../services/locationService';
import { fetchDeviceByDeviceIDEventCode } from '../../../services/deviceService';
import { lightenColor, darkenColor } from '../../../utils/colorUtils';

const EditLocation = ({ eventCode, deviceID }) => {
  const map = useMap();
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const tempPolylineRef = useRef(null);
  const tempMarkersRef = useRef([]);
  const [newPoints, setNewPoints] = useState([]);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [isMapCentered, setIsMapCentered] = useState(false);
  const [mode, setMode] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [deviceColor, setDeviceColor] = useState('#0000FF');

  const clearTemporaryMarkersAndLines = () => {
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
    const device = await fetchDeviceByDeviceIDEventCode(deviceID, eventCode);
    console.log('device:', device);
    setDeviceColor(device.color || '#0000FF'); 
  }, [deviceID, eventCode]);

  const loadLocationMarkers = useCallback(async () => {
    if (!map || !eventCode) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const markers = await fetchLocationsByDeviceIdEventCode(deviceID, eventCode);

    const path = markers.map((marker, index) => {
      const position = { lat: marker.latitude, lng: marker.longitude };
      let fillColor = deviceColor;

      if (index === 0) {
        fillColor = lightenColor(deviceColor, 30); // Primer punto más claro
      } else if (index === markers.length - 1) {
        fillColor = darkenColor(deviceColor, 30); // Último punto más oscuro
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
          setSelectedMarkers((prev) => {
            const isSelected = prev.includes(marker._id);
            if (isSelected) {
              newMarker.setIcon({
                ...newMarker.getIcon(),
                fillColor: fillColor,
              });
              return prev.filter((id) => id !== marker._id);
            } else {
              newMarker.setIcon({
                ...newMarker.getIcon(),
                fillColor: lightenColor(deviceColor, 30),
              });
              return [...prev, marker._id];
            }
          });
        });
      } else if (mode === '') {
        newMarker.addListener('click', () => {
          setSelectedPoint({
            eventCode: marker.code,
            latitude: marker.latitude,
            longitude: marker.longitude,
            accuracy: marker.accuracy,
            timestamp: marker.timestamp,
          });
        });
      }

      markersRef.current.push(newMarker);
      return position;
    });

    if (!isMapCentered && path.length > 0) {
      const lastMarkerPosition = path[path.length - 1];
      map.panTo(lastMarkerPosition);
      map.setZoom(14);
      setIsMapCentered(true);
    }

    redrawPolyline(markers);
  }, [map, eventCode, deviceID, isMapCentered, mode, deviceColor]);

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
    loadDeviceColor();
    clearTemporaryMarkersAndLines();
    loadLocationMarkers();

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
          tempMarker.setMap(null);
          tempMarkersRef.current = tempMarkersRef.current.filter((marker) => marker !== tempMarker);
          setNewPoints((prev) => prev.filter((point) => point.latitude !== newPoint.latitude || point.longitude !== newPoint.longitude));
        });

        tempMarkersRef.current.push(tempMarker);
        setNewPoints((prev) => [...prev, newPoint]);
      };

      map.addListener('click', handleMapClick);

      return () => {
        window.google.maps.event.clearListeners(map, 'click');
      };
    }
  }, [map, eventCode, deviceID, loadLocationMarkers, mode, deviceColor]);

  const handleInsertPoints = async () => {
    if (newPoints.length === 0) {
      alert('Debe seleccionar al menos un punto para insertar.');
      return;
    }
    try {
      for (const point of newPoints) {

        // Obtén la fecha ajustada a la zona horaria
        const timestamp = DateTime.now().setZone("Europe/Madrid").toISO();

        // Convierte la fecha ISO a un objeto Date
        const adjustedTimestamp = new Date(timestamp);

        console.log('timestamp', timestamp); // Fecha en formato ISO ajustada
        console.log('adjustedTimestamp', adjustedTimestamp); // Objeto Date válido
        
        const locationData = { 
          latitude: point.latitude, 
          longitude: point.longitude, 
          accuracy: 0,
          timestamp: adjustedTimestamp,
        };
        console.log(locationData.timestamp);
        await fetchAddLocation(locationData, eventCode, deviceID);        
      }
      clearTemporaryMarkersAndLines();
      alert('Puntos insertados correctamente');
      await loadLocationMarkers();
    } catch (error) {
      console.error('Error al insertar puntos:', error);
      alert('Error al insertar puntos');
    }
  };

  const handleDeleteSelectedPoints = async () => {
    if (selectedMarkers.length === 0) {
      alert('Debe seleccionar al menos un marcador para eliminar.');
      return;
    }
    try {
      for (const markerId of selectedMarkers) {
        await fetchDeleteLocation(markerId);
      }
      setSelectedMarkers([]);
      alert('Puntos eliminados correctamente');
      await loadLocationMarkers();
    } catch (error) {
      console.error('Error al eliminar puntos:', error);
      alert('Error al eliminar puntos');
    }
  };

  const handleDeleteAllLocations = async () => {
    try {
      if (window.confirm('¿Estás seguro de que deseas eliminar todas las ubicaciones?')) {
        await fetchDeleteLocationsByDeviceAndEvent(eventCode, deviceID);
        alert('Todas las ubicaciones se han eliminado correctamente.');
        await loadLocationMarkers();
      }
    } catch (error) {
      console.error('Error al eliminar todas las ubicaciones:', error);
      alert('Error al eliminar todas las ubicaciones');
    }
  };

  return (
    <>
      <button
        onClick={() => setMode((prev) => (prev === 'insert' ? '' : 'insert'))}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '10px 20px',
          backgroundColor: mode === 'insert' ? '#007bff' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Insertar Puntos
      </button>
      <button
        onClick={() => setMode((prev) => (prev === 'delete' ? '' : 'delete'))}
        style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          zIndex: 1000,
          padding: '10px 20px',
          backgroundColor: mode === 'delete' ? '#dc3545' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Eliminar Puntos
      </button>
      <button
        onClick={handleDeleteAllLocations}
        style={{
          position: 'absolute',
          top: '90px',
          left: '10px',
          zIndex: 1000,
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Eliminar Todas
      </button>
      {mode === 'insert' && (
        <button
          onClick={handleInsertPoints}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Confirmar Inserción
        </button>
      )}
      {mode === 'delete' && (
        <button
          onClick={handleDeleteSelectedPoints}
          style={{
            position: 'absolute',
            top: '50px',
            right: '10px',
            zIndex: 1000,
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Confirmar Eliminación
        </button>
      )}
      {selectedPoint && mode === '' && (
        <div
          style={{
            position: 'absolute',
            top: '150px',
            left: '10px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
            width: '250px',
          }}
        >
          <h4>Información del Punto</h4>
          <p><strong>ID:</strong> {selectedPoint.id}</p>
          <p><strong>Latitud:</strong> {selectedPoint.latitude}</p>
          <p><strong>Longitud:</strong> {selectedPoint.longitude}</p>
          <p><strong>Precisión:</strong> {selectedPoint.accuracy || 'N/A'}</p>
          <p><strong>Fecha y Hora:</strong> {new Date(selectedPoint.timestamp).toLocaleString()}</p>
          <button
            onClick={() => setSelectedPoint(null)}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
};

export default EditLocation;