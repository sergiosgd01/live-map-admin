import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LocalHeaderLayout from '../../../components/LocalHeaderLayout';
import {
  fetchEventRawLocations,
  deleteAllEventRawLocations
} from '../../../services/rawLocationService';
import { fetchDevicesByEventCode } from '../../../services/deviceService';

import '../../../styles/RawLocations.css';

const RawLocations = () => {
  const { eventCode } = useParams();
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('ALL');
  const tableRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!eventCode || ignore) return;
      try {
        await loadDevices();
        await loadLocations();
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [eventCode]);

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

  // Filtramos las ubicaciones según el dispositivo elegido
  const filteredLocations = selectedDevice === 'ALL'
    ? locations
    : locations.filter((loc) => loc.deviceID === selectedDevice);

  const handleDeleteAllLocations = async () => {
    try {
      if (window.confirm('¿Estás seguro de que deseas eliminar todas las ubicaciones?')) {
        await deleteAllEventRawLocations(eventCode);
        setLocations([]);
        alert('Todas las ubicaciones han sido eliminadas correctamente.');
      }
    } catch (error) {
      console.error('Error al eliminar las ubicaciones:', error);
      alert('Error al eliminar las ubicaciones. Por favor, inténtalo de nuevo.');
    }
  };

  // Construimos el HTML para el dropdown de dispositivos
  const deviceDropdownHtml = `
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
  `;

  // Construimos el HTML para el botón de eliminar
  const deleteAllButtonHtml = `
    <button 
      class="btn btn-danger delete-all-btn"
      style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
    >
      Eliminar todas las ubicaciones
    </button>
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
      dataTable = $('#hideSearchExample').DataTable({
        data: filteredLocations,
        columns: [
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
          },
          {
            data: 'deviceID',
            render: (deviceID) => {
              const dev = devices.find((d) => d.deviceID === deviceID);
              return dev ? dev.name : deviceID;
            }
          },
          {
            data: 'deviceID',
            render: (deviceID) => {
              const dev = devices.find((d) => d.deviceID === deviceID);
              const color = dev ? dev.color : 'transparent';
              return `
                <div style="width:20px; height:20px; border-radius:50%; background-color:${color}">
                </div>
              `;
            }
          }
        ],
        // Personalizamos el dom para situar los controles
        dom:
        // Fila superior: a la izquierda => lengthMenu (l); a la derecha => deviceDropdown
        "<'row align-items-center justify-content-between'<'col-auto lengthMenu'l><'col-auto deviceDropdown'>>" +
        // Tabla
        "<'row'<'col-12'tr>>" +
        // Fila inferior: a la izquierda => botón; a la derecha => info + paginación
        "<'row align-items-center justify-content-between'<'col-auto deleteAllButton'><'col-auto text-end'i p>>"
      ,
      
        
        paging: true,
        ordering: true,
        info: true,
        searching: false, // Desactivamos el buscador
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
          // Inyectamos el dropdown y el botón
          $('.deviceDropdown').html(deviceDropdownHtml);
          $('.deleteAllButton').html(deleteAllButtonHtml);

          // Event listener para cambiar dispositivo al hacer clic en una opción del dropdown
          $('.deviceDropdown').on('click', '.device-option', function(e) {
            e.preventDefault();
            const devId = $(this).data('device');
            setSelectedDevice(devId);
            // Cambiamos el texto del botón
            const newText = (devId === 'ALL')
              ? 'Todos los dispositivos'
              : devices.find((d) => d.deviceID === devId)?.name || 'Desconocido';
            $('#deviceDropdown').text(newText);
          });

          // Event listener para el botón “Eliminar todas las ubicaciones”
          $('.deleteAllButton').on('click', '.delete-all-btn', function(e) {
            e.preventDefault();
            handleDeleteAllLocations();
          });
        }
      });
    }

    return () => {
      if (dataTable) dataTable.destroy();
    };
  }, [filteredLocations, devices]);

  return (
    <LocalHeaderLayout title="Raw Locations">
      <div className="content-wrapper">
        <div className="row gx-3">
          <div className="col-sm-12 col-12">
            <div className="card">
              <div className="card-body">
                {/* 
                  Eliminamos aquí el botón y el dropdown, 
                  pues ahora los inyectamos dentro del DataTable (initComplete)
                */}
                {filteredLocations.length > 0 ? (
                  <div className="table-responsive">
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
                          <th>Device</th>
                          <th>Device Color</th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                ) : (
                  <p>No se han encontrado ubicaciones para este evento.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalHeaderLayout>
  );
};

export default RawLocations;
