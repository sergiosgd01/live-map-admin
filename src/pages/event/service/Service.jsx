import React, { useEffect, useRef, useState } from 'react';
import { useMap } from '../../../components/SharedMap';
import { useNavigate } from 'react-router-dom';
import { fetchService, fetchCreateService, fetchDeleteService, fetchDeleteAllServices } from '../../../services/serviceService';
import { fetchServiceTypes } from '../../../services/serviceTypeService';

const Service = ({ eventCode }) => {
  const map = useMap(); // Hook personalizado para obtener la instancia del mapa
  const navigate = useNavigate();
  const markersRef = useRef([]); // Referencia para almacenar los marcadores
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [newService, setNewService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState(''); // Modo actual: insertar, eliminar, etc.

  // Función para limpiar todos los marcadores del mapa
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  // Función para cargar los servicios desde el backend y mostrarlos en el mapa
  const loadServices = async () => {
    if (!map || !serviceTypes.length) {
      console.warn('Mapa o tipos de servicios aún no están listos, retrasando carga de servicios.');
      return;
    }

    try {
      const existingServices = await fetchService(eventCode); // Obtener servicios desde el backend
      setServices(existingServices);

      clearMarkers(); // Limpiar marcadores existentes

      if (existingServices.length > 0) {
        existingServices.forEach((service) => {
          const serviceType = serviceTypes.find((type) => type.type === service.type);

          // Definir el ícono del marcador
          const icon = serviceType?.image
            ? {
                url: serviceType.image, // Ícono personalizado si está disponible
                scaledSize: new window.google.maps.Size(30, 30),
              }
            : {
                path: window.google.maps.SymbolPath.CIRCLE, // Ícono por defecto: círculo
                scale: 6,
                fillColor: '#FF0000', // Color predeterminado
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: '#000',
              };

          // Crear el marcador
          const marker = new window.google.maps.Marker({
            position: { lat: service.latitude, lng: service.longitude },
            map,
            title: serviceType ? serviceType.name : 'Servicio',
            icon: icon,
          });

          // Añadir listener para eliminar servicio si está en modo 'delete'
          if (mode === 'delete') {
            marker.addListener('click', async () => {
              if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
                try {
                  await fetchDeleteService(service._id);
                  alert('Servicio eliminado correctamente.');
                  loadServices(); // Recargar servicios después de eliminar
                } catch (error) {
                  console.error('Error al eliminar el servicio:', error);
                  alert('Error al eliminar el servicio. Inténtelo nuevamente.');
                }
              }
            });
          }

          markersRef.current.push(marker); // Almacenar el marcador
        });

        // Ajustar el mapa para mostrar todos los marcadores
        const allServices = existingServices;
        if (allServices.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          allServices.forEach((service) => {
            bounds.extend({ lat: service.latitude, lng: service.longitude });
          });
          map.fitBounds(bounds);
        } else {
          // Opcional: Manejar caso donde no hay servicios
          console.warn('No hay servicios para mostrar en el mapa.');
        }
      } else {
        // Opcional: Manejar caso donde no hay servicios
        console.warn('No hay servicios para mostrar en el mapa.');
      }
    } catch (error) {
      console.error('Error al cargar los servicios:', error);
    }
  };

  // Función para eliminar todos los servicios
  const handleDeleteAllServices = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar todos los servicios? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await fetchDeleteAllServices(eventCode);
      alert('Todos los servicios han sido eliminados correctamente.');
      loadServices(); // Recargar servicios después de eliminar
    } catch (error) {
      console.error('Error al eliminar todos los servicios:', error);
      alert('Error al eliminar todos los servicios. Inténtelo nuevamente.');
    }
  };

  // Cargar los tipos de servicios al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const types = await fetchServiceTypes();
        setServiceTypes(types);
        setIsReady(true);
      } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
      }
    };

    loadInitialData();
  }, []);

  // Cargar servicios cuando el mapa esté listo y los tipos de servicios se hayan cargado
  useEffect(() => {
    if (map && isReady) {
      loadServices();
    }
  }, [map, isReady, mode]);

  // Añadir listener para manejar inserción de nuevos servicios en el mapa
  useEffect(() => {
    if (!map || mode !== 'insert') return;

    const handleMapClick = (e) => {
      const { latLng } = e;
      setNewService({ latitude: latLng.lat(), longitude: latLng.lng() });
    };

    map.addListener('click', handleMapClick);

    return () => {
      window.google.maps.event.clearListeners(map, 'click');
    };
  }, [map, mode]);

  // Función para insertar un nuevo servicio
  const handleServiceInsert = async () => {
    if (!newService || !selectedType) {
      alert('Debe seleccionar un tipo de servicio y una ubicación en el mapa.');
      return;
    }

    try {
      setLoading(true);
      await fetchCreateService(eventCode, newService.latitude, newService.longitude, selectedType);
      setLoading(false);
      alert('Servicio insertado correctamente.');
      setNewService(null);
      setSelectedType(null);
      loadServices(); // Recargar servicios después de insertar
    } catch (error) {
      setLoading(false);
      console.error('Error al insertar el servicio:', error);
      alert('Error al insertar el servicio. Inténtelo nuevamente.');
    }
  };

  return (
    <>
      {/* Panel de Botones en la esquina inferior izquierda */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 9999,
          padding: '10px',
          borderRadius: '5px',
          backgroundColor: 'rgba(0, 51, 102, 0.8)',
          color: 'white',
          maxWidth: '300px',
          overflowY: 'auto',
          maxHeight: '90vh',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '16px', textAlign: 'center' }}>Opciones</h2>

        <button
          onClick={() => setMode((prev) => (prev === 'insert' ? '' : 'insert'))}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: mode === 'insert' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {mode === 'insert' ? 'Cancelar Inserción' : 'Insertar Servicio'}
        </button>

        <button
          onClick={() => setMode((prev) => (prev === 'delete' ? '' : 'delete'))}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: mode === 'delete' ? '#dc3545' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {mode === 'delete' ? 'Cancelar Eliminación' : 'Eliminar Servicio'}
        </button>

        <button
          onClick={handleDeleteAllServices}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Eliminar Todos los Servicios
        </button>

        <button
          onClick={() => navigate(`/services`)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Administrar Tipos de Servicio
        </button>
      </div>

      {/* Modal de Inserción */}
      {mode === 'insert' && newService && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              width: '300px',
            }}
          >
            <h3>Insertar Servicio</h3>
            <p>
              <strong>Latitud:</strong> {newService?.latitude}
            </p>
            <p>
              <strong>Longitud:</strong> {newService?.longitude}
            </p>

            <label htmlFor="serviceTypeModal">Seleccionar Tipo de Servicio:</label>
            <select
              id="serviceTypeModal"
              value={selectedType || ''}
              onChange={(e) => setSelectedType(parseInt(e.target.value, 10))}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <option value="" disabled>
                Selecciona un tipo
              </option>
              {serviceTypes.map((type) => (
                <option key={type._id} value={type.type}>
                  {type.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleServiceInsert}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Cargando...' : 'Insertar Servicio'}
            </button>

            <button
              onClick={() => setNewService(null)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Service;