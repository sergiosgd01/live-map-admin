import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

// Components
import { useMap } from '../../components/SharedMap';
import ImproveLocationButton from '../../components/ImproveLocationButton';
import UpdateMarkersButton from '../../components/UpdateMarkersButton';
import Alert from '../../components/Alert';

// Services
import { fetchEventLocations } from '../../services/locationService';
import { fetchEventByCode } from '../../services/eventService';
import { fetchRouteMarkersByEventCode } from '../../services/routeService';
import { fetchService } from '../../services/serviceService';
import { fetchServiceTypes } from '../../services/serviceTypeService';

// Utils
import { centerMapBasedOnMarkers } from '../../utils/mapCentering';
import { getNearestRouteLocations } from '../../utils/getNearestRouteLocations';
import { lightenColor, darkenColor } from '../../utils/colorUtils';
import colors from '../../utils/colors';

const CombinedView = () => {
  const { eventCode } = useParams();
  const map = useMap();

  // Refs for markers and polylines
  const locationMarkersRef = useRef([]);
  const routeMarkersRef = useRef([]);
  const locationPolylineRef = useRef(null);
  const routePolylineRef = useRef(null);
  const serviceMarkersRef = useRef([]);
  const improveLocationRef = useRef(false);

  // States
  const [eventData, setEventData] = useState(null);
  const [eventPostalCode, setEventPostalCode] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Data states
  const [locations, setLocations] = useState([]);
  const [routeMarkers, setRouteMarkers] = useState([]);
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  
  // UI states
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    locations: true,
    routes: true,
    services: true
  });
  const [improveLocation, setImproveLocation] = useState(false);
  const [lastLocationMarkerTime, setLastLocationMarkerTime] = useState(null);

  // Automatically hide alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Update improveLocation ref when state changes
  useEffect(() => {
    improveLocationRef.current = improveLocation;
  }, [improveLocation]);

  // Clear all markers from the map
  const clearAllMarkers = useCallback(() => {
    console.log("Limpiando todos los marcadores");
    // Clear location markers
    locationMarkersRef.current.forEach(marker => marker.setMap(null));
    locationMarkersRef.current = [];
    
    // Clear route markers
    routeMarkersRef.current.forEach(marker => marker.setMap(null));
    routeMarkersRef.current = [];
    
    // Clear polylines
    if (locationPolylineRef.current) {
      locationPolylineRef.current.setMap(null);
      locationPolylineRef.current = null;
    }
    
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
    
    // Clear service markers
    serviceMarkersRef.current.forEach(marker => marker.setMap(null));
    serviceMarkersRef.current = [];
  }, []);

  // Draw all map elements (locations, routes, services)
  const drawAllMapElements = useCallback((
    locationsData = null,
    routeData = null,
    servicesData = null
  ) => {
    if (!map) {
      console.log("No hay mapa disponible para dibujar elementos");
      return;
    }
    
    console.log("Dibujando elementos en el mapa (cantidad):", {
      locations: (locationsData || locations).length,
      routes: (routeData || routeMarkers).length,
      services: (servicesData || services || []).length
    });
    
    // Create bounds for centering the map
    const bounds = new window.google.maps.LatLngBounds();
    let anyMarker = false;
    
    // Default color for non-multidevice events
    const defaultColor = '#0000FF';
    
    // 1. Draw locations
    if (layerVisibility.locations) {
      const locationsToUse = improveLocationRef.current ? visitedLocations : (locationsData || locations);
      
      if (locationsToUse && locationsToUse.length > 0) {
        console.log(`Dibujando ${locationsToUse.length} ubicaciones`);
        // Create path for polyline
        const path = locationsToUse.map(loc => ({
          lat: loc.latitude,
          lng: loc.longitude,
        }));
        
        // Create markers for first and last points
        locationsToUse.forEach((loc, index) => {
          let fillColor = defaultColor;
          if (index === 0) {
            fillColor = lightenColor(defaultColor, 50);
          } else if (index === locationsToUse.length - 1) {
            fillColor = darkenColor(defaultColor, 30);
          }
          
          const marker = new window.google.maps.Marker({
            position: { lat: loc.latitude, lng: loc.longitude },
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
          
          // Add click listener to show location info
          marker.addListener('click', () => {
            setAlert({ 
              type: 'info', 
              message: `Punto ${index + 1}: ${new Date(loc.timestamp).toLocaleString()}`
            });
          });
          
          locationMarkersRef.current.push(marker);
          bounds.extend({ lat: loc.latitude, lng: loc.longitude });
          anyMarker = true;
        });
        
        // Draw polyline
        if (path.length > 1) {
          locationPolylineRef.current = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: defaultColor,
            strokeOpacity: 1.0,
            strokeWeight: 4,
          });
          locationPolylineRef.current.setMap(map);
        }
      }
    }
    
    // 2. Draw routes
    if (layerVisibility.routes) {
      const routeToUse = routeData || routeMarkers;
      
      if (routeToUse && routeToUse.length > 0) {
        console.log(`Dibujando ${routeToUse.length} puntos de ruta`);
        // Create path for polyline
        const path = routeToUse.map(route => ({
          lat: route.latitude,
          lng: route.longitude,
        }));
        
        // Create markers for first and last points
        const firstRoute = routeToUse[0];
        const firstMarker = new window.google.maps.Marker({
          position: { lat: firstRoute.latitude, lng: firstRoute.longitude },
          map,
          title: 'Inicio de ruta',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: lightenColor(defaultColor, 50),
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: 'black',
          },
        });
        routeMarkersRef.current.push(firstMarker);
        bounds.extend({ lat: firstRoute.latitude, lng: firstRoute.longitude });
        anyMarker = true;
        
        if (routeToUse.length > 1) {
          const lastRoute = routeToUse[routeToUse.length - 1];
          const lastMarker = new window.google.maps.Marker({
            position: { lat: lastRoute.latitude, lng: lastRoute.longitude },
            map,
            title: 'Fin de ruta',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: darkenColor(defaultColor, 30),
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: 'black',
            },
          });
          routeMarkersRef.current.push(lastMarker);
          bounds.extend({ lat: lastRoute.latitude, lng: lastRoute.longitude });
          anyMarker = true;
          
          // Draw dotted polyline for route
          routePolylineRef.current = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: defaultColor,
            strokeOpacity: 0,
            strokeWeight: 2,
            icons: [
              {
                icon: {
                  path: 'M 0,-1 0,1',
                  strokeOpacity: 1,
                  strokeWeight: 3,
                  scale: 2,
                },
                offset: '0',
                repeat: '10px',
              },
            ],
          });
          routePolylineRef.current.setMap(map);
        }
      }
    }
    
    // 3. Draw services
    if (layerVisibility.services) {
      const servicesToDraw = servicesData || services || [];
      
      if (servicesToDraw.length > 0) {
        console.log(`Dibujando ${servicesToDraw.length} servicios`);
        
        for (const service of servicesToDraw) {
          const serviceType = serviceTypes.find(type => type.type === service.type);
          let icon;
          
          if (serviceType && serviceType.image) {
            icon = {
              url: serviceType.image,
              scaledSize: new window.google.maps.Size(30, 30),
            };
          } else {
            icon = {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#FF0000',
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#000',
            };
          }

          const marker = new window.google.maps.Marker({
            position: { lat: service.latitude, lng: service.longitude },
            map,
            title: serviceType ? serviceType.name : 'Servicio',
            icon: icon
          });

          serviceMarkersRef.current.push(marker);
          bounds.extend({ lat: service.latitude, lng: service.longitude });
          anyMarker = true;
        }
      }
    }
    
    // Center the map based on all markers
    if (anyMarker) {
      console.log("Ajustando mapa a los marcadores");
      map.fitBounds(bounds);
    } else {
      console.log("No hay marcadores, centrando por código postal");
      centerMapBasedOnMarkers(map, false, eventPostalCode);
    }
  }, [map, layerVisibility, serviceTypes, eventPostalCode]); // Reducir dependencias, acceder a los estados directamente

  // Modifica loadInitialData para evitar dependencias innecesarias
const loadInitialData = useCallback(async () => {
  // Evitar múltiples cargas
  if (!map || !eventCode) {
    console.log("No se puede cargar: faltan mapa/código de evento o ya está cargando");
    return;
  }
  
  console.log("Cargando datos iniciales para el evento:", eventCode);

  
  try {
    // 1. Clear any previous markers or polylines
    clearAllMarkers();

    // 2. Fetch event locations
    console.log("Obteniendo ubicaciones del evento");
    const locationsData = await fetchEventLocations(eventCode);
    console.log(`Obtenidas ${locationsData.length} ubicaciones`);
    setLocations(locationsData);
    
    // Get latest timestamp for display
    if (locationsData.length > 0) {
      const latestLocation = [...locationsData].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      setLastLocationMarkerTime(latestLocation.timestamp);
    }

    // 3. Fetch route markers
    console.log("Obteniendo marcadores de ruta");
    const routeData = await fetchRouteMarkersByEventCode(eventCode);
    console.log(`Obtenidos ${routeData.length} puntos de ruta`);
    setRouteMarkers(routeData);

    // 4. Fetch service types
    console.log("Obteniendo tipos de servicios");
    const types = await fetchServiceTypes();
    setServiceTypes(types);

    // 5. Fetch services
    console.log("Obteniendo servicios del evento");
    const servicesData = await fetchService(eventCode);
    console.log(`Obtenidos ${servicesData ? servicesData.length : 0} servicios`);
    setServices(servicesData || []);

    // 6. Draw all map elements
    console.log("Dibujando elementos en el mapa");
    clearAllMarkers(); // Asegurarse de que esté limpio antes de dibujar
    drawAllMapElements(locationsData, routeData, servicesData);

    console.log("Carga inicial completada");
  } catch (error) {
    console.error("Error loading initial data:", error);
    setAlert({ type: 'danger', message: 'Error al cargar los datos. Inténtelo nuevamente.' });
  } finally {
  }
}, [map, eventCode, clearAllMarkers, drawAllMapElements]); // Incluir loading en las dependencias

  // Reemplaza el useEffect que verifica el tipo de evento con este:
  useEffect(() => {
    // Crear una variable para evitar actualizaciones después de desmontaje
    let isMounted = true;
    
    const checkEventType = async () => {
      // Verificar si ya estamos cargando o si ya tenemos los datos para evitar bucles
      if (!eventCode || (eventData && eventData._id)) {
        return;
      }
      
      try {
        console.log("Verificando tipo de evento:", eventCode);

        
        const event = await fetchEventByCode(eventCode);
        
        // Verificar si el componente sigue montado
        if (!isMounted) return;
        
        console.log("Evento obtenido:", event);
        setEventData(event);
        
        if (event.multiDevice) {
          console.log("Evento con múltiples dispositivos, no se cargarán datos");
          // Si es multidevice, mostrar alerta y no cargar datos
          setAlert({ 
            type: 'warning', 
            message: 'Esta vista solo está disponible para eventos sin múltiples dispositivos. Use la vista de dispositivos.'
          });
        } else {
          console.log("Evento sin múltiples dispositivos, cargando datos");
          // Si no es multidevice, continuar con la carga de datos
          setEventPostalCode(event.postalCode);
          
          // Solo cargar datos iniciales si el mapa está disponible
          if (map) {
            await loadInitialData();
          } else {
            console.log("Mapa no disponible, deteniendo carga");

          }
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error verificando tipo de evento:", error);
        setAlert({ type: 'danger', message: 'Error al cargar el evento.' });

      }
    };
    
    checkEventType();
    
    // Cleanup function para evitar actualizaciones después del desmontaje
    return () => {
      isMounted = false;
    };
  }, [eventCode, map, loadInitialData]); // Quitamos eventData de las dependencias

  // Effect for handling improveLocation state change
  useEffect(() => {
    const updateImprovedLocations = async () => {
      if (!map) return;
      
      if (improveLocation) {
        try {
          console.log("🛠 Activando mejora de ubicación...");
          
          // Verificar si hay ubicaciones
          if (locations.length === 0) {
            console.log("No hay ubicaciones para mejorar");
            setAlert({ 
              type: 'warning', 
              message: 'No hay ubicaciones para mejorar. Añade ubicaciones primero.' 
            });
            setImproveLocation(false); // Desactivar el modo de mejora
            return;
          }
          
          // Verificar si hay ruta
          if (routeMarkers.length === 0) {
            console.log("No hay ruta definida para mejorar ubicaciones");
            setAlert({ 
              type: 'warning', 
              message: 'No hay ruta definida para mejorar las ubicaciones.' 
            });
            setImproveLocation(false); // Desactivar el modo de mejora
            return;
          }
          
          const visited = await getNearestRouteLocations(locations, routeMarkers);
          setVisitedLocations(visited);
          
          // Redibujar con ubicaciones mejoradas
          clearAllMarkers();
          drawAllMapElements(null, routeMarkers, services);

        } catch (error) {
          console.error("Error al mejorar ubicaciones:", error);
          setAlert({ type: 'danger', message: 'Error al mejorar las ubicaciones.' });
          setImproveLocation(false);

        }
      } else {
        console.log("🔄 Restaurando ubicaciones originales");
        // Redibujar con ubicaciones originales

        clearAllMarkers();
        drawAllMapElements(locations, routeMarkers, services);

      }
    };

    if (map && (locations.length > 0 || visitedLocations.length > 0)) {
      updateImprovedLocations();
    }
  }, [improveLocation, locations, routeMarkers, services, map, clearAllMarkers, drawAllMapElements]);

  // Toggle layer visibility
  const toggleLayerVisibility = (layer) => {
    const newVisibility = {
      ...layerVisibility,
      [layer]: !layerVisibility[layer]
    };
    setLayerVisibility(newVisibility);
    
    // Redraw the map with new visibility settings
    clearAllMarkers();
    drawAllMapElements(null, routeMarkers, services);
  };

  // Update markers (reload data)
  const handleUpdateMarkers = async () => {
    console.log("🔄 Actualizando marcadores...");

    
    try {
      // 1. Update locations
      const locationsData = await fetchEventLocations(eventCode);
      setLocations(locationsData);
      
      // Update last location time
      if (locationsData.length > 0) {
        const latestLocation = [...locationsData].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )[0];
        setLastLocationMarkerTime(latestLocation.timestamp);
      }
      
      // 2. Update services
      const servicesData = await fetchService(eventCode);
      setServices(servicesData || []);
      
      // 3. If we're in "improve location" mode, recalculate visited points
      if (improveLocationRef.current) {
        console.log("📍 Recalculating improved locations...");
        const visited = await getNearestRouteLocations(locationsData, routeMarkers);
        setVisitedLocations(visited);
      }
      
      // 4. Redraw all map elements
      clearAllMarkers();
      drawAllMapElements(null, routeMarkers, servicesData);
      
      setAlert({ type: 'success', message: 'Datos actualizados correctamente.' });
    } catch (error) {
      console.error("Error updating markers:", error);
      setAlert({ type: 'danger', message: 'Error al actualizar los datos.' });
    } finally {

    }
  };

  // If the event is multidevice, show warning and don't render the map elements
  if (eventData && eventData.multiDevice) {
    return (
      <div className="multidevice-warning" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <i className="bi bi-exclamation-triangle" style={{
          fontSize: '48px',
          color: '#ffc107',
          marginBottom: '15px'
        }}></i>
        <h4>Evento con múltiples dispositivos</h4>
        <p>
          Esta vista solo está disponible para eventos sin múltiples dispositivos.
          Por favor, utilice la vista de dispositivos para este evento.
        </p>
      </div>
    );
  }

  return (
    <>
      
      {/* Alert Message */}
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}
      
      {/* Tools Toggle Button */}
      {!eventData?.multiDevice && (
        <div className="panel-toggle-buttons" style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          display: 'flex',
          gap: '10px'
        }}>
          {/* Button for Tools Panel */}
          <button 
            className={`btn ${showToolsPanel ? 'btn-primary' : 'btn-outline-light'}`}
            onClick={() => setShowToolsPanel(prev => !prev)}
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
      
      {/* Tools Panel */}
      {showToolsPanel && !eventData?.multiDevice && (
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
            borderBottom: '1px solid #eee',
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
            {/* Layer Visibility Controls */}
            <div className="layer-controls" style={{
              background: colors.lightGray,
              padding: '10px',
              borderRadius: '4px'
            }}>
              <h6>Capas</h6>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="locationsLayer"
                  checked={layerVisibility.locations}
                  onChange={() => toggleLayerVisibility('locations')}
                />
                <label className="form-check-label" htmlFor="locationsLayer">
                  Ubicaciones
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="routesLayer"
                  checked={layerVisibility.routes}
                  onChange={() => toggleLayerVisibility('routes')}
                />
                <label className="form-check-label" htmlFor="routesLayer">
                  Rutas
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="servicesLayer"
                  checked={layerVisibility.services}
                  onChange={() => toggleLayerVisibility('services')}
                />
                <label className="form-check-label" htmlFor="servicesLayer">
                  Servicios
                </label>
              </div>
            </div>
              
            {/* Improve Location Button */}
            <ImproveLocationButton 
              improveLocation={improveLocation}
              setImproveLocation={setImproveLocation}
            />
              
            {/* Update Markers Button */}
            <UpdateMarkersButton 
              fetchData={handleUpdateMarkers}
            />
              
            {/* Last Location Marker Time */}
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
    </>
  );
};

export default CombinedView;