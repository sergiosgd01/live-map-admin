import React, { useEffect, useRef, useState } from 'react';
import { useMap } from '../components/SharedMap';
import { fetchService, fetchServiceTypes, fetchCreateService } from '../services/serviceService';

const EditService = ({ id }) => {
  const map = useMap();
  const markersRef = useRef([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [newService, setNewService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const clearMarkers = () => {
    console.log('Limpiando marcadores existentes...');
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const loadServices = async () => {
    if (!map || !serviceTypes.length) {
      console.warn('Mapa o tipos de servicios aún no están listos, retrasando carga de servicios.');
      return;
    }

    try {
      console.log('Cargando servicios...');
      const existingServices = await fetchService(id);
      console.log('Servicios obtenidos:', existingServices);
      setServices(existingServices);

      clearMarkers();

      if (existingServices.length > 0) {
        existingServices.forEach((service, index) => {
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

          console.log(`Agregando marcador para servicio: ${service._id}`, { icon });

          const marker = new window.google.maps.Marker({
            position: { lat: service.latitude, lng: service.longitude },
            map,
            title: serviceType ? serviceType.name : 'Servicio',
            icon: icon,
          });

          markersRef.current.push(marker);

          if (index === 0 && map) {
            console.log('Centrando mapa en el primer marcador...');
            map.panTo({ lat: service.latitude, lng: service.longitude });
            map.setZoom(14);
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar los servicios:', error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Cargando tipos de servicios...');
        const types = await fetchServiceTypes();
        console.log('Tipos de servicios obtenidos:', types);
        setServiceTypes(types);
        setIsReady(true); // Marca que los tipos de servicios están listos
      } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (map && isReady) {
      console.log('Mapa y tipos de servicios listos, cargando servicios...');
      loadServices();
    }
  }, [map, isReady]);

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e) => {
      const { latLng } = e;
      setNewService({ latitude: latLng.lat(), longitude: latLng.lng() });
      console.log('Nueva ubicación seleccionada:', { latitude: latLng.lat(), longitude: latLng.lng() });
    };

    map.addListener('click', handleMapClick);

    return () => {
      window.google.maps.event.clearListeners(map, 'click');
    };
  }, [map]);

  const handleServiceInsert = async () => {
    if (!newService || !selectedType) {
      alert('Debe seleccionar un tipo de servicio y una ubicación en el mapa.');
      return;
    }

    try {
      console.log('Insertando nuevo servicio...');
      setLoading(true);
      await fetchCreateService(
        id,
        newService.latitude,
        newService.longitude,
        selectedType
      );
      setLoading(false);
      alert('Servicio insertado correctamente.');
      setNewService(null);

      loadServices();
    } catch (error) {
      setLoading(false);
      console.error('Error al insertar el servicio:', error);
      alert('Error al insertar el servicio. Inténtelo nuevamente.');
    }
  };

  return (
    <div>
      <h2>Editar Servicios</h2>

      <div>
        <label htmlFor="serviceType">Seleccionar Tipo de Servicio:</label>
        <select
          id="serviceType"
          value={selectedType || ''}
          onChange={(e) => setSelectedType(parseInt(e.target.value, 10))}
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
      </div>

      <button
        onClick={handleServiceInsert}
        disabled={loading || !newService || !selectedType}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Cargando...' : 'Insertar Servicio'}
      </button>

      <div>
        <h3>Servicios Existentes:</h3>
        <ul>
          {services.map((service) => {
            const serviceType = serviceTypes.find((type) => type.type === service.type);
            return (
              <li key={service._id}>
                Tipo: {serviceType ? serviceType.name : service.type} | Lat: {service.latitude} | Lng: {service.longitude}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default EditService;
