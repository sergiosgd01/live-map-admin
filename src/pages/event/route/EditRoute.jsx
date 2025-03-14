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
  fetchRouteMarkersByEventCode,
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
import colors from '../../../utils/colors';

const EditRoute = ({ eventCode, deviceID }) => {
  const map = useMap();

  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const tempPolylineRef = useRef(null);
  const tempMarkersRef = useRef([]);

  // Estados
  const [newPoints, setNewPoints] = useState([]);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [mode, setMode] = useState(''); // 'insert', 'delete' o ''
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [deviceColor, setDeviceColor] = useState(null);
  const [eventPostalCode, setEventPostalCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);

  const [isMultiDevice, setIsMultiDevice] = useState(true);

  // Autoocultar la alerta después de 3 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Función para limpiar markers y líneas temporales (modo insert/eliminación)
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

  // Carga el color del dispositivo y el postalCode del evento
  const loadDeviceColor = useCallback(async () => {
    try {
      const eventData = await fetchEventByCode(eventCode);
      setIsMultiDevice(!!eventData.multiDevice);
      let postalCode = null;
      if (eventData) {
        postalCode = eventData.postalCode;
        setEventPostalCode(postalCode);
      }

      // Si no es multiDevice, establecemos un color predeterminado
      if (!eventData.multiDevice) {
        console.log("Evento sin multiDevice, usando color predeterminado");
        setDeviceColor('#FF0000');
        return;
      }

      const device = await fetchDeviceByDeviceIDEventCode(deviceID, eventCode);
      const color = device?.color ? `#${device.color.replace('#', '')}` : '#FF0000';
      setDeviceColor(color);
    } catch (err) {
      console.error('Error al cargar color del dispositivo:', err);
      setDeviceColor('#FF0000');
    }
  }, [deviceID, eventCode]);

  // Carga los markers de la ruta y dibuja la polyline en el mapa
  const loadRouteMarkers = useCallback(async (shouldCenter = false) => {
    if (!map || !eventCode || !deviceColor) return;

    // Limpiar markers y polyline anteriores
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    let markersData = null;
    if (!isMultiDevice) {
      markersData = await fetchRouteMarkersByEventCode(eventCode);
    } else {
      markersData = await fetchRouteByEventCodeDeviceID(eventCode, deviceID);
    }

    console.log("MarkersData:", markersData);

    if (!markersData || markersData.length === 0) {
      if (shouldCenter) {
        centerMapBasedOnMarkers(map, false, eventPostalCode);
      }
      setLoading(false);
      return;
    }

    // Crear markers y asignar listeners según el modo
    const pathPositions = markersData.map((marker, index) => {
      const position = { lat: marker.latitude, lng: marker.longitude };
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

      if (mode === 'delete') {
        newMarker.addListener('click', () => {
          const markerId = marker._id;
          setSelectedMarkers((prev) => {
            const isSelected = prev.includes(markerId);
            if (isSelected) {
              newMarker.setIcon({ ...newMarker.getIcon(), fillColor });
              return prev.filter((id) => id !== markerId);
            } else {
              newMarker.setIcon({
                ...newMarker.getIcon(),
                fillColor: lightenColor(deviceColor, 50),
              });
              return [...prev, markerId];
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

    // Crear polyline con los puntos de la ruta
    const routePath = markersData.map((m) => ({ lat: m.latitude, lng: m.longitude }));
    polylineRef.current = new window.google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: deviceColor,
      strokeOpacity: 0,
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

    if (shouldCenter) {
      const bounds = new window.google.maps.LatLngBounds();
      pathPositions.forEach((pos) => bounds.extend(pos));
      map.fitBounds(bounds);
    }

    setLoading(false);
  }, [map, eventCode, deviceID, mode, deviceColor, eventPostalCode, isMultiDevice]);

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

  useEffect(() => {
    if (!map || mode !== 'insert') return;
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
        tempMarkersRef.current = tempMarkersRef.current.filter((m) => m !== tempMarker);
        setNewPoints((prev) =>
          prev.filter(
            (p) =>
              p.latitude !== newPoint.latitude || p.longitude !== newPoint.longitude
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

  const handleInsertPoints = async () => {
    if (newPoints.length === 0) {
      setAlert({ type: 'warning', message: 'Debes seleccionar al menos un punto para insertar.' });
      return;
    }
    try {
      setLoading(true);
      // Usamos el deviceID efectivo (null si no es multiDevice)
      const effectiveDeviceID = isMultiDevice ? deviceID : null;
      
      for (const point of newPoints) {
        const timestamp = DateTime.now().setZone("Europe/Madrid").toISO();
        const adjustedTimestamp = new Date(timestamp);
        await fetchCreateRouteMarker(
          eventCode, 
          effectiveDeviceID, 
          point.latitude, 
          point.longitude
        );
      }
      clearTemporaryMarkersAndLines();
      setAlert({ type: 'success', message: 'Puntos insertados correctamente.' });
      await loadRouteMarkers(true);
    } catch (error) {
      console.error('Error al insertar puntos:', error);
      setAlert({ type: 'danger', message: 'Error al insertar puntos' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelectedPoints = async () => {
    if (selectedMarkers.length === 0) {
      setAlert({ type: 'warning', message: 'Selecciona al menos un marcador para eliminar.' });
      return;
    }
    try {
      setLoading(true);
      for (const markerId of selectedMarkers) {
        await fetchDeleteRouteMarker(markerId);
      }
      setSelectedMarkers([]);
      setAlert({ type: 'success', message: 'Puntos eliminados correctamente.' });
      await loadRouteMarkers(true);
    } catch (error) {
      console.error('Error al eliminar puntos:', error);
      setAlert({ type: 'danger', message: 'Error al eliminar puntos' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllRoutes = async () => {
    try {
      setLoading(true);
      // Usamos el deviceID efectivo (null si no es multiDevice)
      const effectiveDeviceID = isMultiDevice ? deviceID : null;
      await fetchDeleteAllRoutes(eventCode, effectiveDeviceID);
      
      clearTemporaryMarkersAndLines();
      await loadRouteMarkers(true);
      setAlert({ type: 'success', message: 'Todas las rutas han sido eliminadas correctamente.' });
    } catch (error) {
      console.error('Error al eliminar rutas:', error);
      setAlert({ type: 'warning', message: 'No hay rutas para eliminar' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle panel function
  const togglePanel = () => {
    setShowEditPanel(!showEditPanel);
    if (mode !== '') {
      setMode('');
      clearTemporaryMarkersAndLines();
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

      {/* BOTÓN PARA MOSTRAR/OCULTAR PANEL DE EDICIÓN */}
      {!loading && (
        <div className="panel-toggle-buttons" style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          display: 'flex',
          gap: '10px'
        }}>
          {/* Botón para panel de edición */}
          <button 
            className={`btn ${showEditPanel ? 'btn-primary' : 'btn-outline-light'}`}
            onClick={() => togglePanel('edit')}
            title="Edición de ubicaciones"
            style={{
              backgroundColor: showEditPanel ? '' : colors.white,
              color: showEditPanel ? '' : colors.purple,
              borderColor: showEditPanel ? '' : colors.purple,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '150px', 
              justifyContent: 'center'  
            }}
          >
            <i className="bi bi-pencil-square"></i> Edición
          </button>
        </div>
      )}

      {/* PANEL DE EDICIÓN */}
      {showEditPanel && !loading && (
        <div className="edit-panel-container" style={{
          position: 'absolute',
          bottom: '70px',      
          left: '20px',        
          backgroundColor: 'white',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '15px',
          width: '310px',
          zIndex: 1000
        }}>
          <div className="panel-header" style={{
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '10px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h5 className="m-0">Edición de Rutas</h5>
            <button 
              className="btn-close" 
              onClick={() => setShowEditPanel(false)}
              aria-label="Cerrar"
            ></button>
          </div>
          
          <div className="edit-buttons" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Botones de modo */}
            <div className="btn-group w-100 mb-2">
              <button
                className={`btn ${mode === 'insert' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => {
                  if (mode === 'insert') {
                    setMode('');
                    clearTemporaryMarkersAndLines();
                  } else {
                    setMode('insert');
                    if (selectedPoint) setSelectedPoint(null);
                  }
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Insertar Puntos
              </button>
              <button
                className={`btn ${mode === 'delete' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => {
                  if (mode === 'delete') {
                    setMode('');
                  } else {
                    setMode('delete');
                    if (selectedPoint) setSelectedPoint(null);
                  }
                }}
              >
                <i className="bi bi-trash me-2"></i>
                Eliminar Puntos
              </button>
            </div>
            
            {/* Botones de acción según el modo */}
            {mode === 'insert' && (
              <button
                className="btn btn-success w-100"
                onClick={handleInsertPoints}
                disabled={newPoints.length === 0}
              >
                Guardar {newPoints.length} punto{newPoints.length !== 1 ? 's' : ''}
              </button>
            )}
            
            {mode === 'delete' && (
              <button
                className="btn btn-danger w-100"
                onClick={handleDeleteSelectedPoints}
                disabled={selectedMarkers.length === 0}
              >
                Eliminar {selectedMarkers.length} punto{selectedMarkers.length !== 1 ? 's' : ''}
              </button>
            )}
            
            {/* Botón para eliminar todos los puntos */}
            <button
              className="btn btn-outline-danger w-100 mt-2"
              onClick={() => setShowDeleteAllModal(true)}
            >
              <i className="bi bi-trash-fill me-2"></i>
              Eliminar Todas las Rutas
            </button>
          </div>
        </div>
      )}

      {/* INFORMACIÓN DEL PUNTO SELECCIONADO */}
      {selectedPoint && !mode && (
        <PointInfo 
          selectedPoint={selectedPoint} 
          mode={mode} 
          setSelectedPoint={setSelectedPoint} 
          extended={false}
        />
      )}

      {showDeleteAllModal && (
        <ConfirmationModal
          id="deleteAllModal"
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar todas las rutas? Esta acción no se puede deshacer."
          onConfirm={async () => {
            setShowDeleteAllModal(false);
            await handleDeleteAllRoutes();
          }}
          onCancel={() => setShowDeleteAllModal(false)}
          extraContent={null}
        />
      )}
    </>
  );
};

export default EditRoute;