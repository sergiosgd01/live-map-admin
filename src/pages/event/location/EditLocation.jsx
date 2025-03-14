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
  fetchDeleteAllLocations, 
  fetchEventLocations
} from '../../../services/locationService';
import { fetchDeviceByDeviceIDEventCode } from '../../../services/deviceService';
import { fetchEventByCode } from '../../../services/eventService';
import { fetchRouteByEventCodeDeviceID, fetchResetVisitedStatusByEventCode } from '../../../services/routeService';

// Utils
import { lightenColor, darkenColor } from '../../../utils/colorUtils';
import { centerMapBasedOnMarkers } from '../../../utils/mapCentering';
import { getNearestRouteLocations } from '../../../utils/getNearestRouteLocations';
import colors from '../../../utils/colors';

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
  const [lastLocationMarkerTime, setLastLocationMarkerTime] = useState(null);

  const [isMultiDevice, setIsMultiDevice] = useState(true); 

  // Estado para mostrar/ocultar los paneles laterales
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showToolsPanel, setShowToolsPanel] = useState(false);

  // Autoocultar la alerta después de 5 segundos
  useEffect(() => {
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
        setDeviceColor('#0000FF');
        return;
      }

      const device = await fetchDeviceByDeviceIDEventCode(deviceID, eventCode);
      const color = device?.color ? `#${device.color.replace('#', '')}` : '#0000FF';
      setDeviceColor(color);
      console.log("Color del dispositivo cargado:", color);
    } catch (err) {
      console.error('Error al cargar color del dispositivo:', err);
      setDeviceColor('#0000FF'); 
    }
  }, [deviceID, eventCode]);  

  const loadDeviceRoute = useCallback(async () => {
    try {
      if (!isMultiDevice) {
        const route = await fetchRouteMarkersByEventCode(eventCode);
        setDeviceRoute(route);
        console.log("Ruta cargada (sin multiDevice):", route);
        return;
      }

      const route = await fetchRouteByEventCodeDeviceID(eventCode, deviceID);
      setDeviceRoute(route);
      console.log("Ruta del dispositivo cargada:", route);
    } catch (err) {
      console.error('Error al cargar ruta del dispositivo:', err);
      setDeviceRoute([]);
    }
  }, [deviceID, eventCode, isMultiDevice]);

  const loadLocationMarkers = useCallback(async (shouldCenter = false) => {
    if (!map || !eventCode || !deviceColor) return;
    console.log("Cargando marcadores de ubicación...");

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    let markers;
    if (isMultiDevice) {
      markers = await fetchLocationsByDeviceIdEventCode(deviceID, eventCode);
    } else {
      // Para eventos sin multiDevice, usamos la API general de ubicaciones
      markers = await fetchEventLocations(eventCode);
    }
    
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
    setLastLocationMarkerTime(new Date());
  }, [map, eventCode, deviceID, mode, deviceColor, eventPostalCode, visitedLocations, isMultiDevice]);

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
          
          // Verificar si hay ubicaciones
          if (originalLocations.length === 0) {
            console.log("No hay ubicaciones para mejorar");
            setAlert({ 
              type: 'warning', 
              message: 'No hay ubicaciones para mejorar. Añade ubicaciones primero.' 
            });
            setImproveLocation(false); // Desactivar el modo de mejora
            return;
          }
          
          // Verificar si hay ruta
          if (deviceRoute.length === 0) {
            console.log("No hay ruta definida para mejorar ubicaciones");
            setAlert({ 
              type: 'warning', 
              message: 'No hay ruta definida para mejorar las ubicaciones. Crea una ruta primero.' 
            });
            setImproveLocation(false); // Desactivar el modo de mejora
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
        if (isMultiDevice) {
          await fetchAddLocation(locationData, eventCode, deviceID);
        } else {
          await fetchAddLocation(locationData, eventCode, null);
        }      
      }
      
      clearTemporaryMarkersAndLines();
      setAlert({ type: 'success', message: 'Puntos insertados correctamente' });
      
      // Actualizar ubicaciones originales
      let updatedLocations;
      if (isMultiDevice) {
        updatedLocations = await fetchLocationsByDeviceIdEventCode(deviceID, eventCode);
      } else {
        updatedLocations = await fetchEventLocations(eventCode);
      }
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

  const handleUpdateMarkers = async () => {
    try {
      setLoading(true);
      await loadLocationMarkers(true);
      setAlert({ type: 'success', message: 'Marcadores actualizados correctamente.' });
    } catch (error) {
      console.error('Error al actualizar marcadores:', error);
      setAlert({ type: 'danger', message: 'Error al actualizar marcadores.' });
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
      let updatedLocations;
      if (isMultiDevice) {
        updatedLocations = await fetchLocationsByDeviceIdEventCode(deviceID, eventCode);
      } else {
        updatedLocations = await fetchEventLocations(eventCode);
      }
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

      if (isMultiDevice) {
        await fetchDeleteAllLocations(eventCode, deviceID);
      } else {
        await fetchDeleteAllLocations(eventCode);
      }

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

  // Manejador para cambiar entre paneles
  const togglePanel = (panelName) => {
    if (panelName === 'edit') {
      setShowEditPanel(prev => !prev);
      if (showToolsPanel) setShowToolsPanel(false);
    } else if (panelName === 'tools') {
      setShowToolsPanel(prev => !prev);
      if (showEditPanel) setShowEditPanel(false);
    }
  };

  // Componente para el botón de actualizar marcadores
  const UpdateMarkersButton = ({ fetchData }) => {
    return (
      <button
        className="btn btn-primary w-100"
        onClick={fetchData}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <i className="bi bi-arrow-clockwise"></i>
        Actualizar Marcadores
      </button>
    );
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

      {/* BOTONES PARA MOSTRAR/OCULTAR PANELES */}
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
            disabled={improveLocation}
            style={{
              backgroundColor: showEditPanel ? '' : colors.white,
              color: showEditPanel ? '' : colors.purple,
              borderColor: showEditPanel ? '' : colors.purple,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '150px', 
              justifyContent: 'center', 
              opacity: improveLocation ? 0.6 : 1, 
            }}
          >
            <i className="bi bi-pencil-square"></i> Edición
            {improveLocation && <i className="bi bi-lock-fill ms-2" style={{fontSize: '0.8em'}}></i>}
          </button>
          
          {/* Botón para panel de herramientas */}
          <button 
            className={`btn ${showToolsPanel ? 'btn-primary' : 'btn-outline-light'}`}
            onClick={() => togglePanel('tools')}
            title="Herramientas"
            style={{
              backgroundColor: showToolsPanel ? '' : colors.white,
              color: showToolsPanel ? '' : colors.purple,
              borderColor: showToolsPanel ? '' : colors.purple,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '150px', 
              justifyContent: 'center'  
            }}
          >
            <i className="bi bi-gear"></i> Herramientas
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
            borderBottom: `1px solid ${colors.borderLight}`,
            paddingBottom: '10px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h5 className="m-0">Edición de Ubicaciones</h5>
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
              Eliminar Todos los Puntos
            </button>
          </div>
        </div>
      )}

      {/* PANEL DE HERRAMIENTAS */}
      {showToolsPanel && !loading && (
        <div className="tools-panel-container" style={{
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
            borderBottom: `1px solid ${colors.borderLight}`,
            paddingBottom: '10px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h5 className="m-0">Herramientas</h5>
            <button 
              className="btn-close" 
              onClick={() => setShowToolsPanel(false)}
              aria-label="Cerrar"
            ></button>
          </div>
          
          <div className="tools-content" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {/* Botón de mejora de ubicaciones */}
            <ImproveLocationButton
              improveLocation={improveLocation}
              setImproveLocation={setImproveLocation}
            />
            
            {/* Botón para resetear el estado de visited */}
            <button
              className="btn btn-warning w-100"
              onClick={handleResetVisitedStatus}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
              Resetear Estado de Visited
            </button>
            
            {/* Botón de actualización de marcadores */}
            <UpdateMarkersButton fetchData={handleUpdateMarkers} />
            
            {/* Información de última actualización */}
            {lastLocationMarkerTime && (
              <div className="timestamp-info" style={{
                background: colors.lightGray,
                padding: '10px',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <i className="bi bi-clock me-2"></i>
                <strong>Última actualización:</strong><br />
                {new Date(lastLocationMarkerTime).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
  
      {/* INFORMACIÓN DEL PUNTO SELECCIONADO */}
      {selectedPoint && !mode && !improveLocation && (
        <PointInfo 
          selectedPoint={selectedPoint} 
          mode={mode} 
          setSelectedPoint={setSelectedPoint} 
          extended={true}
        />
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