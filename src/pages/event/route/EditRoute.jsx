import React, { useEffect, useRef, useState, useCallback } from 'react';

// Components
import { useMap } from '../../../components/SharedMap';

// Services
import {
  fetchRouteByEventCodeDeviceID,
  fetchDeleteRouteMarker,
  fetchCreateRouteMarker,
  fetchDeleteAllRoutes,
} from '../../../services/routeService';
import { fetchDeviceByDeviceIDEventCode } from '../../../services/deviceService';
import { fetchEventByCode } from '../../../services/eventService';
 
// Utils
import { lightenColor, darkenColor } from '../../../utils/colorUtils';
import { centerMapBasedOnMarkers } from '../../../utils/mapCentering';

const EditRoute = ({ eventCode, deviceID }) => {
  const map = useMap();

  // Refs para controlar los markers/polylines
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const tempPolylineRef = useRef(null);
  const tempMarkersRef = useRef([]);

  // Estados
  const [newPoints, setNewPoints] = useState([]);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [mode, setMode] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [deviceColor, setDeviceColor] = useState(null);

  const [eventPostalCode, setEventPostalCode] = useState(null); 

  const [loading, setLoading] = useState(false);

  /**
   * Limpia markers y líneas temporales (para modo insert, etc.)
   */
  const clearTemporaryMarkersAndLines = () => {
    // Borra los markers temporales
    tempMarkersRef.current.forEach((marker) => marker.setMap(null));
    tempMarkersRef.current = [];
    setSelectedMarkers([]);
    setNewPoints([]);
    setSelectedPoint(null);

    // Borra la polyline temporal
    if (tempPolylineRef.current) {
      tempPolylineRef.current.setMap(null);
      tempPolylineRef.current = null;
    }
  };

  /**
   * Carga el color real del dispositivo (o fallback #FF0000).
   */
  const loadDeviceColor = useCallback(async () => {
    try {
      const eventData = await fetchEventByCode(eventCode);
      let postalCode = null;

      if (eventData) {
        postalCode = eventData.postalCode;
        setEventPostalCode(postalCode);
      }

      const device = await fetchDeviceByDeviceIDEventCode(deviceID, eventCode);
        const color = device?.color ? `#${device.color.replace('#', '')}` : '#FF0000';
        setDeviceColor(color);
      } catch (err) {
        console.error('Error al cargar color del dispositivo:', err);
        setDeviceColor('#FF0000'); 
      }
    }, [deviceID, eventCode]);  

  /**
   * Carga los markers de la ruta y ajusta el mapa a todos los puntos.
   */
  const loadRouteMarkers = useCallback(async (shouldCenter = false) => {
    if (!map || !eventCode || !deviceColor) return;
  
    // 1) Limpiar markers previos
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  
    // 2) Fetch de la ruta
    const markersData = await fetchRouteByEventCodeDeviceID(eventCode, deviceID);
    if (!markersData || markersData.length === 0) {
      if (shouldCenter) {
        // Usamos la función para centrar el mapa basado en el código postal del evento
        centerMapBasedOnMarkers(map, false, eventPostalCode);
      }
      setLoading(false); // Desactivamos el loading
      return;
    }
  
    // 3) Crear markers
    const pathPositions = markersData.map((marker, index) => {
      const position = { lat: marker.latitude, lng: marker.longitude };
  
      // Ajustar color en primer y último
      let fillColor = deviceColor;
      if (index === 0) {
        fillColor = lightenColor(deviceColor, 50);
      } else if (index === markersData.length - 1) {
        fillColor = darkenColor(deviceColor, 30);
      }
  
      const newMarker = new window.google.maps.Marker({
        position,
        map,
        title:
          index === 0
            ? 'Inicio'
            : index === markersData.length - 1
            ? 'Fin'
            : `Punto ${index + 1}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: 'black',
        },
      });
  
      // Listeners según "mode"
      if (mode === 'delete') {
        newMarker.addListener('click', () => {
          const markerId = marker._id; 
          setSelectedMarkers((prev) => {
            const isSelected = prev.includes(markerId);
            if (isSelected) {
              // Quitar selección y restaurar color
              newMarker.setIcon({ ...newMarker.getIcon(), fillColor });
              return prev.filter((id) => id !== markerId);
            } else {
              // Seleccionar marcador y cambiar color
              newMarker.setIcon({
                ...newMarker.getIcon(),
                fillColor: lightenColor(deviceColor, 50),
              });
              return [...prev, markerId];
            }
          });
        });
      } else if (mode === '') {
        // Modo visualización => click => setSelectedPoint
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
  
    // 4) Crear polyline discontinua
    const routePath = markersData.map((m) => ({ lat: m.latitude, lng: m.longitude }));
    polylineRef.current = new window.google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: deviceColor,
      strokeOpacity: 0, // invisible base
      strokeWeight: 4,
      icons: [
        {
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            strokeColor: deviceColor,
            strokeWeight: 2,
            scale: 2,
          },
          offset: '0',
          repeat: '10px',
        },
      ],
    });
    polylineRef.current.setMap(map);
  
    // 5) Ajusta el mapa a todos los markers (bounding)
    if (shouldCenter) {
      const bounds = new window.google.maps.LatLngBounds();
      pathPositions.forEach((pos) => bounds.extend(pos));
      map.fitBounds(bounds);
    }
  
    // Desactivar el loading una vez procesado todo
    setLoading(false);
  }, [map, eventCode, deviceID, mode, deviceColor, eventPostalCode]);
  
  // /**
  //  * Al montar o cambiar eventCode/deviceID => cargar color y markers
  //  */
  // useEffect(() => {
  //   (async () => {
  //     setLoading(true);
  //     await loadDeviceColor();
  //     clearTemporaryMarkersAndLines();
  
  //     // Llamada con firstLoad (true la primera vez), centrará el mapa
  //     await loadRouteMarkers(firstLoad);
  
  //     // Ponerlo en false para que en futuros "cambios" no centre automáticamente
  //     setFirstLoad(false);
  //   })();
  // }, [loadDeviceColor, loadRouteMarkers]);

  useEffect(() => {
    (async () => {
      setLoading(true); 
      await loadDeviceColor();
    })();
  }, [loadDeviceColor]);
  
  useEffect(() => {
    if (deviceColor) {
      clearTemporaryMarkersAndLines();
      loadRouteMarkers(true);
    }
  }, [deviceColor, loadRouteMarkers]); 
  
  /**
   * Modo "insert": cada click en el mapa crea un marker temporal
   */
  useEffect(() => {
    if (!map) return;
    if (mode !== 'insert') return;
  
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
  
      // click => borrar este temporal
      tempMarker.addListener('click', () => {
        tempMarker.setMap(null);
        tempMarkersRef.current = tempMarkersRef.current.filter((m) => m !== tempMarker);
        setNewPoints((prev) =>
          prev.filter(
            (p) => p.latitude !== newPoint.latitude || p.longitude !== newPoint.longitude
          )
        );
      });
  
      tempMarkersRef.current.push(tempMarker);
      setNewPoints((prev) => [...prev, newPoint]);
    };
  
    map.addListener('click', handleMapClick);
    return () => {
      window.google.maps.event.clearListeners(map, 'click');
    };
  }, [map, mode, deviceColor]);
  
  /**
   * Insertar los puntos nuevos
   */
  const handleInsertPoints = async () => {
    if (newPoints.length === 0) {
      alert('Debes seleccionar al menos un punto para insertar.');
      return;
    }
    try {
      setLoading(true);
      for (const point of newPoints) {
        await fetchCreateRouteMarker(eventCode, deviceID, point.latitude, point.longitude);
      }
      clearTemporaryMarkersAndLines();
      alert('Puntos insertados correctamente.');
      await loadRouteMarkers(true); // Re-cargar markers para verlos
    } catch (error) {
      console.error('Error al insertar puntos:', error);
      alert('Error al insertar puntos');
    } finally {
      setLoading(false);
    } 
  };
  
  /**
   * Eliminar markers seleccionados
   */
  const handleDeleteSelectedPoints = async () => {
    if (selectedMarkers.length === 0) {
      alert('Selecciona al menos un marcador para eliminar.');
      return;
    }
    try {
      setLoading(true);
      for (const markerId of selectedMarkers) {
        await fetchDeleteRouteMarker(markerId);
      }
      setSelectedMarkers([]);
      alert('Puntos eliminados correctamente.');
      await loadRouteMarkers(true); // recarga
    } catch (error) {
      console.error('Error al eliminar puntos:', error);
      alert('Error al eliminar puntos');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Elimina TODAS las rutas
   */
  const handleDeleteAllRoutes = async () => {
    try {
      if (window.confirm('¿Estás seguro de que deseas eliminar todas las rutas?')) {
        setLoading(true);
        await fetchDeleteAllRoutes(eventCode, deviceID);
        clearTemporaryMarkersAndLines();
        await loadRouteMarkers(true);
        alert('Todas las rutas han sido eliminadas correctamente.');
      }
    } catch (error) {
      console.error('Error al eliminar rutas:', error);
      alert('Error al eliminar.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5em',
          }}
        >
          Cargando...
        </div>
      )}
  
      {/* BOTÓN MODO "INSERT" */}
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
  
      {/* BOTÓN MODO "DELETE" */}
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
  
      {/* BOTÓN ELIMINAR TODAS LAS RUTAS */}
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
  
      {/* BOTÓN CONFIRMAR INSERCIÓN */}
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
  
      {/* BOTÓN CONFIRMAR ELIMINACIÓN */}
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
  
      {/* PANEL DE INFO DEL PUNTO SELECCIONADO (sólo si mode === '') */}
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
          <p>
            <strong>ID:</strong> {selectedPoint.id}
          </p>
          <p>
            <strong>Latitud:</strong> {selectedPoint.latitude}
          </p>
          <p>
            <strong>Longitud:</strong> {selectedPoint.longitude}
          </p>
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
