import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMap } from '../../../components/SharedMap';
import Alert from '../../../components/Alert';
import ConfirmationModal from '../../../components/ConfirmationModal';
import Spinner from '../../../components/Spinner';

import {
  fetchService,
  fetchCreateService,
  fetchDeleteService,
  fetchDeleteAllServices,
} from '../../../services/serviceService';
import { fetchServiceTypes } from '../../../services/serviceTypeService';
import { fetchEventByCode } from '../../../services/eventService';

import { centerMapBasedOnMarkers } from '../../../utils/mapCentering';

const Service_ = ({ eventCode }) => {
  const map = useMap();
  const navigate = useNavigate();

  // Refs para los marcadores
  const markersRef = useRef([]);

  // Estados
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [newService, setNewService] = useState(null); // para insertar
  const [serviceToDelete, setServiceToDelete] = useState(null); // para eliminar uno
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false); // para eliminar todos
  const [showOptionsModal, setShowOptionsModal] = useState(false); // modal de opciones
  const [loading, setLoading] = useState(true); // loading inicia en true para mostrar spinner desde el inicio
  const [alert, setAlert] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [eventPostalCode, setEventPostalCode] = useState(null);

  // Autooculta la alerta después de 3 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Limpia los marcadores existentes en el mapa
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  // Cargar datos iniciales: tipos de servicio y postalCode del evento
  const loadInitialData = useCallback(async () => {
    try {
      const eventData = await fetchEventByCode(eventCode);
      if (eventData) {
        setEventPostalCode(eventData.postalCode);
      }
      const types = await fetchServiceTypes();
      setServiceTypes(types);
      setIsReady(true);
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
    }
  }, [eventCode]);

  // Cargar los servicios y mostrarlos en el mapa
  const loadServiceMarkers = useCallback(async (shouldCenter = false) => {
    if (!map || !isReady) return;
    clearMarkers();
    try {
      const services = await fetchService(eventCode);
      if (!services || services.length === 0) {
        if (shouldCenter) {
          centerMapBasedOnMarkers(map, false, eventPostalCode);
        }
        return;
      }
      const bounds = new window.google.maps.LatLngBounds();

      services.forEach((service) => {
        const serviceType = serviceTypes.find((type) => type.type === service.type);
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
          icon: icon,
        });

        // Al hacer clic en el marcador, se muestra el modal de eliminación individual
        marker.addListener('click', (e) => {
          if (e.stopPropagation) e.stopPropagation();
          setServiceToDelete(service);
        });

        markersRef.current.push(marker);
        bounds.extend({ lat: service.latitude, lng: service.longitude });
      });

      if (shouldCenter) {
        map.fitBounds(bounds);
      }
    } catch (error) {
      console.error('Error al cargar los servicios:', error);
    }
  }, [map, isReady, eventCode, serviceTypes, eventPostalCode]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  useEffect(() => {
    if (map && isReady) {
      setLoading(true);
      loadServiceMarkers(true).finally(() => setLoading(false));
    }
  }, [map, isReady]);  

  // Listener para insertar nuevos servicios en el mapa (clic en área sin marcador)
  useEffect(() => {
    if (!map) return;
    const handleMapClick = (e) => {
      setNewService({ latitude: e.latLng.lat(), longitude: e.latLng.lng() });
    };
    map.addListener('click', handleMapClick);
    return () => {
      window.google.maps.event.clearListeners(map, 'click');
    };
  }, [map]);

  // Función para insertar un nuevo servicio
  const handleServiceInsert = async () => {
    if (!newService || !selectedType) {
      setAlert({ type: 'warning', message: 'Debe seleccionar un tipo de servicio.' });
      return;
    }
    try {
      setLoading(true);
      await fetchCreateService(
        eventCode,
        newService.latitude,
        newService.longitude,
        selectedType
      );
      setAlert({ type: 'success', message: 'Servicio insertado correctamente.' });
      setNewService(null);
      setSelectedType(null);
      await loadServiceMarkers(true);
    } catch (error) {
      console.error('Error al insertar el servicio:', error);
      setAlert({ type: 'danger', message: 'Error al insertar el servicio. Inténtelo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un servicio individual
  const handleServiceDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setLoading(true);
      await fetchDeleteService(serviceToDelete._id);
      setAlert({ type: 'success', message: 'Servicio eliminado correctamente.' });
      setServiceToDelete(null);
      await loadServiceMarkers(true);
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      setAlert({ type: 'danger', message: 'Error al eliminar el servicio. Inténtelo nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar todos los servicios
  const handleDeleteAllServices = async () => {
    try {
      setLoading(true);
      const result = await fetchDeleteAllServices(eventCode);
      if (result && result.noServices) {
        setAlert({ type: 'warning', message: 'No hay servicios para eliminar.' });
      } else {
        setAlert({ type: 'success', message: 'Todos los servicios han sido eliminados correctamente.' });
      }
      await loadServiceMarkers(true);
    } catch (error) {
      console.error('Error al eliminar todos los servicios:', error);
      setAlert({ type: 'danger', message: 'Error al eliminar todos los servicios.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Spinner />}
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* Modal para insertar un nuevo servicio al hacer clic en el mapa */}
      {newService && (
        <div
          className="modal fade show"
          style={{ display: 'block' }}
          id="insertServiceModal"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex="-1"
          aria-labelledby="insertServiceModalLabel"
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleServiceInsert();
                }}
                className="needs-validation"
                noValidate
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="insertServiceModalLabel">
                    Insertar Servicio
                  </h5>
                  <button
                    type="button"
                    className="btn btn-close"
                    onClick={() => setNewService(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}
                >
                  <p>
                    <strong>Latitud:</strong> {newService.latitude}
                  </p>
                  <p>
                    <strong>Longitud:</strong> {newService.longitude}
                  </p>
                  <div className="mb-3">
                    <label htmlFor="serviceTypeModal" className="form-label">
                      Seleccionar Tipo de Servicio:
                    </label>
                    <select
                      id="serviceTypeModal"
                      className="form-select"
                      value={selectedType || ''}
                      onChange={(e) => setSelectedType(e.target.value)}
                      required
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
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setNewService(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Cargando...' : 'Insertar Servicio'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar un servicio individual */}
      {serviceToDelete && (
        <ConfirmationModal
          id="deleteServiceModal"
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar este servicio?"
          onConfirm={handleServiceDelete}
          onCancel={() => setServiceToDelete(null)}
          extraContent={null}
        />
      )}

      {/* Modal para eliminar todos los servicios */}
      {showDeleteAllModal && (
        <ConfirmationModal
          id="deleteAllModal"
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar todos los servicios? Esta acción no se puede deshacer."
          onConfirm={async () => {
            setShowDeleteAllModal(false);
            await handleDeleteAllServices();
          }}
          onCancel={() => setShowDeleteAllModal(false)}
          extraContent={null}
        />
      )}

      {/* Modal de opciones: se muestra al pulsar el botón circular */}
      {showOptionsModal && (
        <div
          className="modal fade show"
          style={{ display: 'block' }}
          id="optionsModal"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex="-1"
          aria-labelledby="optionsModalLabel"
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="optionsModalLabel">Opciones</h5>
                <button
                  type="button"
                  className="btn btn-close"
                  onClick={() => setShowOptionsModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <button
                  className="btn btn-danger w-100 mb-2"
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowDeleteAllModal(true);
                  }}
                >
                  Eliminar Todos los Servicios
                </button>
                <button
                  className="btn btn-success w-100"
                  onClick={() => {
                    setShowOptionsModal(false);
                    navigate(`/services`);
                  }}
                >
                  Administrar Tipos de Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón circular en la esquina inferior izquierda para abrir el modal de opciones */}
      <button
        onClick={() => setShowOptionsModal(true)}
        className="btn btn-primary rounded-circle"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '50px',
          height: '50px',
          fontSize: '24px',
        }}
      >
        &#8942;
      </button>
    </>
  );
};

export default Service_;
