import React, { useEffect, useRef, useState } from 'react';
import { useMap } from '../components/SharedMap';
import { fetchService, fetchServiceTypes, fetchCreateService, fetchDeleteService, fetchDeleteAllServices } from '../services/serviceService';

const EditService = ({ id }) => {
  const map = useMap();
  const markersRef = useRef([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [newService, setNewService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState(''); // 'insert' or 'delete'

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const loadServices = async () => {
    if (!map || !serviceTypes.length) {
      console.warn('Mapa o tipos de servicios aún no están listos, retrasando carga de servicios.');
      return;
    }

    try {
      const existingServices = await fetchService(id);
      setServices(existingServices);

      clearMarkers();

      if (existingServices.length > 0) {
        existingServices.forEach((service) => {
          const serviceType = serviceTypes.find((type) => type.type === service.type);

          const icon = serviceType?.image
            ? {
                url: serviceType.image,
                scaledSize: new window.google.maps.Size(30, 30),
              }
            : {
                url: 'https://example.com/default-icon.png',
                scaledSize: new window.google.maps.Size(30, 30),
              };

          const marker = new window.google.maps.Marker({
            position: { lat: service.latitude, lng: service.longitude },
            map,
            title: serviceType ? serviceType.name : 'Servicio',
            icon: icon,
          });

          if (mode === 'delete') {
            marker.addListener('click', async () => {
              if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
                try {
                  await fetchDeleteService(service._id);
                  alert('Servicio eliminado correctamente.');
                  loadServices();
                } catch (error) {
                  console.error('Error al eliminar el servicio:', error);
                  alert('Error al eliminar el servicio. Inténtelo nuevamente.');
                }
              }
            });
          }

          markersRef.current.push(marker);
        });

        const firstService = existingServices[0];
        map.panTo({ lat: firstService.latitude, lng: firstService.longitude });
        map.setZoom(14);
      }
    } catch (error) {
      console.error('Error al cargar los servicios:', error);
    }
  };

  const handleDeleteAllServices = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar todos los servicios? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await fetchDeleteAllServices(id);
      alert('Todos los servicios han sido eliminados correctamente.');
      loadServices();
    } catch (error) {
      console.error('Error al eliminar todos los servicios:', error);
      alert('Error al eliminar todos los servicios. Inténtelo nuevamente.');
    }
  };

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

  useEffect(() => {
    if (map && isReady) {
      loadServices();
    }
  }, [map, isReady, mode]);

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

  const handleServiceInsert = async () => {
    if (!newService || !selectedType) {
      alert('Debe seleccionar un tipo de servicio y una ubicación en el mapa.');
      return;
    }

    try {
      setLoading(true);
      await fetchCreateService(id, newService.latitude, newService.longitude, selectedType);
      setLoading(false);
      alert('Servicio insertado correctamente.');
      setNewService(null);
      setSelectedType(null);
      loadServices();
    } catch (error) {
      setLoading(false);
      console.error('Error al insertar el servicio:', error);
      alert('Error al insertar el servicio. Inténtelo nuevamente.');
    }
  };

  return (
    <div style={{ position: 'relative' }}>

      <button
        onClick={() => setMode((prev) => (prev === 'insert' ? '' : 'insert'))}
        style={{
          marginBottom: '10px',
          padding: '10px 20px',
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
          marginBottom: '10px',
          padding: '10px 20px',
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
          marginBottom: '10px',
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Eliminar Todos los Servicios
      </button>

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

    </div>
  );
};

export default EditService;
