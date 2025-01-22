import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMap } from '../../../components/SharedMap';
import {
  fetchRouteByEventCodeDeviceID,
  fetchDeleteRouteMarker,
  fetchCreateRouteMarker,
  fetchDeleteAllRoutes,
} from '../../../services/routeService';
import { fetchDeviceByDeviceIDEventCode } from '../../../services/deviceService';
import { lightenColor, darkenColor } from '../../../utils/colorUtils';

const EditRoute = ({ eventCode, deviceID }) => {
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
  const [deviceColor, setDeviceColor] = useState('#FF0000');

  const clearTemporaryMarkersAndLines = () => {
    tempMarkersRef.current.forEach((marker) => marker.setMap(null));
    tempMarkersRef.current = [];
    setSelectedMarkers([]);
    setNewPoints([]);
    setSelectedPoint(null);

    if (tempPolylineRef.current) {
      tempPolylineRef.current.setMap(null);
      tempPolylineRef.current = null;
    }
  };

  const loadDeviceColor = useCallback(async () => {
    const device = await fetchDeviceByDeviceIDEventCode(deviceID, eventCode);
    console.log('device:', device);
    setDeviceColor(device.color || '#FF0000'); 
  }, [deviceID, eventCode]);

  const loadRouteMarkers = useCallback(async () => {
    if (!map || !eventCode) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const markers = await fetchRouteByEventCodeDeviceID(eventCode, deviceID);

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
            id: marker._id,
            latitude: marker.latitude,
            longitude: marker.longitude,
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
  
    // ¡Aquí viene la configuración para la línea discontinua!
    polylineRef.current = new window.google.maps.Polyline({
      path,
      geodesic: true,
  
      // Dejamos el color, pero ponemos strokeOpacity a 0 para que la “línea base” sea invisible
      strokeColor: deviceColor,
      strokeOpacity: 0,
      strokeWeight: 4,
  
      // Usamos icons para dibujar los “segmentos”
      icons: [
        {
          icon: {
            // Simplemente un trazo vertical que se repetirá
            path: 'M 0,-1 0,1', 
            strokeOpacity: 1,
            strokeColor: deviceColor,
            strokeWeight: 2,
            scale: 2, // Ajusta para hacer más grueso o fino el trazo
          },
          offset: '0',
          repeat: '10px', // Ajusta para cambiar la distancia entre “guiones”
        },
      ],
    });
  
    polylineRef.current.setMap(map);
  };  

  const handleDeleteAllRoutes = async () => {
    try {
      if (window.confirm('¿Estás seguro de que deseas eliminar todas las rutas de este evento?')) {
        await fetchDeleteAllRoutes(eventCode, deviceID);
        clearTemporaryMarkersAndLines();
        loadRouteMarkers();
        alert('Todas las rutas han sido eliminadas correctamente.');
      }
    } catch (error) {
      console.error('Error al eliminar todas las rutas:', error);
      alert('Error al eliminar las rutas. Por favor, inténtalo de nuevo.');
    }
  };

  useEffect(() => {
    loadDeviceColor();
    clearTemporaryMarkersAndLines();
    loadRouteMarkers();

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
  }, [map, eventCode, deviceID, loadRouteMarkers, mode, deviceColor]);

  const handleInsertPoints = async () => {
    if (newPoints.length === 0) {
      alert('Debe seleccionar al menos un punto para insertar.');
      return;
    }
    try {
      for (const point of newPoints) {
        await fetchCreateRouteMarker(eventCode, deviceID, point.latitude, point.longitude);
      }
      clearTemporaryMarkersAndLines();
      alert('Puntos insertados correctamente');
      await loadRouteMarkers();
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
        console.log('Deleting marker:', markerId);
        await fetchDeleteRouteMarker(markerId);
      }
      setSelectedMarkers([]);
      alert('Puntos eliminados correctamente');
      await loadRouteMarkers();
    } catch (error) {
      console.error('Error al eliminar puntos:', error);
      alert('Error al eliminar puntos');
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
        onClick={handleDeleteAllRoutes}
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
        Eliminar todas las rutas
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

export default EditRoute;
