import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LocalHeaderLayout from '../../../components/LocalHeaderLayout';
import Spinner from '../../../components/Spinner';  
import ConfirmationModal from '../../../components/ConfirmationModal';
import {
  fetchEventRawLocations,
  deleteAllEventRawLocations
} from '../../../services/rawLocationService';
import { fetchDevicesByEventCode } from '../../../services/deviceService';
import { fetchEventByCode } from '../../../services/eventService';

import '../../../styles/RawLocations.css';

const RawLocations = () => {
  const { eventCode } = useParams();
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [organizationCode, setOrganizationCode] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMultiDevice, setIsMultiDevice] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true); // Por defecto activado
  const tableRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  const breadcrumbs = [
    { label: "Organizaciones", path: "/organizations" },
    { 
      label: "Eventos", 
      path: organizationCode ? `/organizations/${organizationCode}/events` : '#'
    },
    { label: "Registro de Ubicaciones", path: "" },
  ];

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      if (!eventCode || ignore) return;
      try {
        setLoading(true);

        const eventData = await fetchEventByCode(eventCode);
        if (eventData && eventData.organizationCode) {
          setOrganizationCode(eventData.organizationCode);
          // Corregido: usamos multiDevice en lugar de isMultiDevice
          setIsMultiDevice(!!eventData.multiDevice);
        }

        // Solo cargamos los dispositivos si es multiDevice
        if (eventData && eventData.multiDevice) {
          await loadDevices();
        }
        await loadLocations();
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [eventCode]);

  // Control de auto-refresh
  useEffect(() => {
    // Limpiar intervalos existentes
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Configurar nuevo intervalo si autoRefresh está activo
    if (autoRefresh && eventCode) {
      refreshIntervalRef.current = setInterval(() => {
        refreshLocations();
      }, 3000); // 30 segundos
    }

    // Limpieza al desmontar
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, eventCode]);

  const refreshLocations = async () => {
    if (refreshing) return; // Evitar múltiples actualizaciones simultáneas
    
    try {
      setRefreshing(true);
      await loadLocations();
      
      // Mostrar indicador visual durante 1 segundo
      refreshTimeoutRef.current = setTimeout(() => {
        setRefreshing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error refreshing locations:', error);
      setRefreshing(false);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const loadDevices = async () => {
    try {
      const devicesResponse = await fetchDevicesByEventCode(eventCode);
      setDevices(devicesResponse);
    } catch (error) {
      console.error('Error fetching devices:', error);
      alert('Failed to load devices. Please try again later.');
    }
  };

  const loadLocations = async () => {
    try {
      const locationsData = await fetchEventRawLocations(eventCode);
      const sortedLocations = locationsData.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setLocations(sortedLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      alert('Failed to load locations. Please try again later.');
    }
  };

  // Filtramos las ubicaciones según el dispositivo elegido (solo si es multiDevice)
  const filteredLocations = isMultiDevice && selectedDevice !== 'ALL'
    ? locations.filter((loc) => loc.deviceID === selectedDevice)
    : locations;

  const handleDeleteAllLocations = async () => {
    try {
      await deleteAllEventRawLocations(eventCode);
      setLocations([]);
      alert('Todas las ubicaciones han sido eliminadas correctamente.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error al eliminar las ubicaciones:', error);
      alert('Error al eliminar las ubicaciones. Por favor, inténtalo de nuevo.');
      setShowDeleteModal(false);
    }
  };

  // Construimos el HTML para el dropdown de dispositivos (solo si es multiDevice)
  const deviceDropdownHtml = isMultiDevice ? `
    <div class="dropdown" style="margin-left: 10px;">
      <button 
        class="btn btn-primary dropdown-toggle" 
        type="button"
        id="deviceDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        ${
          selectedDevice === 'ALL'
            ? 'Todos los dispositivos'
            : (devices.find((d) => d.deviceID === selectedDevice)?.name || 'Todos los dispositivos')
        }
      </button>
      <ul class="dropdown-menu" aria-labelledby="deviceDropdown">
        <li>
          <a class="dropdown-item device-option" data-device="ALL" href="#">
            Todos los dispositivos
          </a>
        </li>
        ${
          devices.map((dev) => `
            <li>
              <a class="dropdown-item device-option" data-device="${dev.deviceID}" href="#">
                ${dev.name}
              </a>
            </li>
          `).join('')
        }
      </ul>
    </div>
  ` : '';

  // Construimos el HTML para el botón de eliminar
  const deleteAllButtonHtml = `
  <button 
    class="btn btn-danger delete-all-btn"
    style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer"
  >
    Eliminar todas las ubicaciones
  </button>
`;

  // HTML para el botón de autorefresh
  const autoRefreshButtonHtml = `
    <button 
      id="autoRefreshBtn" 
      class="btn ${autoRefresh ? 'btn-success' : 'btn-secondary'}"
    >
      <i class="bi ${refreshing ? 'bi-arrow-clockwise spin' : 'bi-arrow-repeat'}"></i>
      Auto-refresh ${autoRefresh ? 'ON' : 'OFF'}
    </button>
    <style>
      .spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // Inicializamos DataTables
  useEffect(() => {
    let dataTable;

    // Si ya existe un DataTable previo, lo destruimos antes de recrearlo
    if ($.fn.DataTable.isDataTable('#hideSearchExample')) {
      dataTable = $('#hideSearchExample').DataTable();
      dataTable.destroy();
    }

    if (filteredLocations.length > 0) {
      // Definimos las columnas según si es multiDevice o no
      let columns = [
        {
          data: 'timestamp',
          render: function(value) {
            if (!value) return 'N/A';
            const date = new Date(value);
            const formattedDate = date.toISOString().split('T')[0];
            const formattedTime = date.toISOString().split('T')[1].split('Z')[0];
            return (
              formattedDate +
              ' <span style="font-weight:bold;">' +
              formattedTime +
              '</span>'
            );
          }
        },
        { data: 'latitude' },
        { data: 'longitude' },
        {
          data: 'accuracy',
          render: (val) => val || 'N/A'
        },
        {
          data: 'errorCode',
          render: (data) => {
            const errorCode = parseInt(data, 10);
            if (isNaN(errorCode)) {
              return `<span class="badge shade-red">N/A</span>`;
            }
            switch (errorCode) {
              case 0:
                return `<span class="badge shade-green">${errorCode}</span>`;
              case 1:
                return `<span class="badge shade-yellow">${errorCode}</span>`;
              case 2:
                return `<span class="badge shade-red">${errorCode}</span>`;
              default:
                return `<span class="badge shade-orange">${errorCode}</span>`;
            }
          }
        }
      ];

      // Añadimos columnas de dispositivo solo si es multiDevice
      if (isMultiDevice) {
        columns.push({
          data: 'deviceID',
          render: (data, type, row) => {
            if (!row.deviceID) return 'Sin dispositivo';
            const dev = devices.find((d) => d.deviceID === row.deviceID);
            return dev ? dev.name : row.deviceID;
          }
        });

        columns.push({
          data: 'deviceID',
          render: (data, type, row) => {
            if (!row.deviceID) {
              return `<div style="width:20px; height:20px; border-radius:50%; background-color:transparent"></div>`;
            }
            const dev = devices.find((d) => d.deviceID === row.deviceID);
            const color = dev ? dev.color : 'transparent';
            return `<div style="width:20px; height:20px; border-radius:50%; background-color:${color}"></div>`;
          }
        });
      }

      // Configuramos el DOM para incluir solo el botón de auto-refresh
      let domConfig = "<'row align-items-center justify-content-between'<'col-auto lengthMenu'l><'col-auto d-flex'<'deviceDropdown'><'refreshButton'>>>" +
          "<'row'<'col-12'tr>>" +
          "<'row justify-content-end'<'col-auto'i>>" +
          "<'row align-items-center justify-content-between'<'col-auto deleteAllButton'><'col-auto'p>>";

      dataTable = $('#hideSearchExample').DataTable({
        data: filteredLocations,
        columns: columns,
        dom: domConfig,
        paging: true,
        ordering: true,
        info: true,
        searching: false,
        scrollX: true,
        responsive: true,
        order: [[0, 'desc']], // Ordenar por timestamp (columna 0) en orden descendente
        language: {
          lengthMenu: "Mostrar _MENU_ ubicaciones",
          info: "Mostrando _START_ a _END_ de _TOTAL_ ubicaciones",
          infoEmpty: "Mostrando 0 a 0 de 0 ubicaciones",
          infoFiltered: "(filtrado de _MAX_ en total)",
          zeroRecords: "No se encontraron ubicaciones",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
          },
        },
        initComplete: function() {
          // Inyectamos el dropdown solo si es multiDevice
          if (isMultiDevice) {
            $('.deviceDropdown').html(deviceDropdownHtml);
            
            // Event listener para cambiar dispositivo
            $('.deviceDropdown').on('click', '.device-option', function(e) {
              e.preventDefault();
              const devId = $(this).data('device');
              setSelectedDevice(devId);
              const newText = (devId === 'ALL')
                ? 'Todos los dispositivos'
                : devices.find((d) => d.deviceID === devId)?.name || 'Desconocido';
              $('#deviceDropdown').text(newText);
            });
          }

          // Inyectamos solo el botón de auto-refresh
          $('.refreshButton').html(autoRefreshButtonHtml);

          // Inyectamos el botón de eliminar (siempre)
          $('.deleteAllButton').html(deleteAllButtonHtml);

          // Event listener para el botón "Eliminar todas las ubicaciones"
          $('.deleteAllButton').on('click', '.delete-all-btn', function(e) {
            e.preventDefault();
            setShowDeleteModal(true);
          });

          // Event listener para el botón de auto-refresh
          $('#autoRefreshBtn').on('click', function(e) {
            e.preventDefault();
            toggleAutoRefresh();
          });
        }
      });
    }

    return () => {
      if (dataTable) dataTable.destroy();
    };
  }, [filteredLocations, devices, isMultiDevice, refreshing, autoRefresh]);

  // Actualizar el texto y clase del botón de autorefresh cuando cambia el estado
  useEffect(() => {
    const autoRefreshBtn = document.getElementById('autoRefreshBtn');
    if (autoRefreshBtn) {
      autoRefreshBtn.className = `btn ${autoRefresh ? 'btn-success' : 'btn-secondary'}`;
      autoRefreshBtn.innerHTML = `
        <i class="bi ${refreshing ? 'bi-arrow-clockwise spin' : 'bi-arrow-repeat'}"></i>
        Auto-refresh ${autoRefresh ? 'ON' : 'OFF'}
      `;
    }
  }, [autoRefresh, refreshing]);

  return (
    <LocalHeaderLayout breadcrumbs={breadcrumbs}>
      {loading && <Spinner />}

      <div className="content-wrapper" style={{ paddingBottom: "50px" }}>
        <div className="row gx-3">
          <div className="col-sm-12 col-12">
            <div className="card">
              <div className="card-body">
                {filteredLocations.length > 0 ? (
                  <div className="table-responsive overflow-auto">
                    <table
                      id="hideSearchExample"
                      className="table custom-table"
                      ref={tableRef}
                    >
                      <thead>
                        <tr>
                          <th>Timestamp (UTC)</th>
                          <th>Latitude</th>
                          <th>Longitude</th>
                          <th>Accuracy</th>
                          <th>Error</th>
                          {isMultiDevice && <th>Device</th>}
                          {isMultiDevice && <th>Color</th>}
                        </tr>
                      </thead>
                    </table>
                  </div>
                ) : (
                  !loading && (
                    <div className="d-flex flex-column align-items-center justify-content-center my-5">
                      <i className="bi bi-exclamation-circle text-muted fs-1 mb-3"></i>
                      <p className="text-muted fs-5 m-0">
                        No se han encontrado ubicaciones para este evento.
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmationModal
          id="delete-locations-modal"
          title="Eliminar todas las ubicaciones"
          message="¿Estás seguro de que deseas eliminar todas las ubicaciones de este evento? Esta acción no se puede deshacer."
          onConfirm={() => handleDeleteAllLocations()}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </LocalHeaderLayout>
  );
};

export default RawLocations;