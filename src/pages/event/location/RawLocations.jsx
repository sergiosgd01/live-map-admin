import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../../components/Layout';
import {
  fetchEventRawLocations,
  deleteAllEventRawLocations
} from '../../../services/rawLocationService';
import { fetchDevicesByEventCode } from '../../../services/deviceService';

// IMPORTA el archivo de estilos:
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

  // (OPCIÓN 1) Deja que DataTables pinte todo
  useEffect(() => {
    let dataTable;

    // Si ya existe un DataTable previo, lo destruimos antes de recrearlo
    if ($.fn.DataTable.isDataTable('#hideSearchExample')) {
      dataTable = $('#hideSearchExample').DataTable();
      dataTable.destroy();
    }

    if (filteredLocations.length > 0) {
      dataTable = $('#hideSearchExample').DataTable({
        // Aquí pasamos todo el array de ubicaciones filtradas:
        data: filteredLocations,

        // Definimos todas las columnas que se mostrarán y cómo se renderizan
        columns: [
          {
            // Fecha/hora
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
          {
            data: 'latitude'
          },
          {
            data: 'longitude'
          },
          {
            data: 'accuracy',
            render: function(value) {
              return value ? value : 'N/A';
            }
          },
          {
            data: 'errorCode',
            render: function(data) {
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
            // Mostramos el nombre del dispositivo
            data: 'deviceID',
            render: (deviceID) => {
              // Buscamos en el array de devices
              const device = devices.find((d) => d.deviceID === deviceID);
              return device ? device.name : deviceID;
            }
          },
          {
            // Pintamos un circulito del color del dispositivo
            data: 'deviceID',
            render: (deviceID) => {
              const device = devices.find((d) => d.deviceID === deviceID);
              const color = device ? device.color : 'transparent';
              return `
                <div style="width:20px; height:20px; border-radius:50%; background-color:${color}">
                </div>
              `;
            }
          }
        ],

        dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'i>>" +
             "<'row'<'col-sm-12'p>>",
        paging: true,
        ordering: true,
        info: true,
        searching: false,
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
        }
      });
    }

    return () => {
      if (dataTable) {
        dataTable.destroy();
      }
    };
  }, [filteredLocations, devices]);

  const handleDeleteAllLocations = async () => {
    try {
      if (window.confirm('¿Estás seguro de que deseas eliminar todas las ubicaciones?')) {
        await deleteAllEventRawLocations(eventCode);
        setLocations([]);
        alert('Todas las ubicaciones han sido eliminadas correctamente.');
      }
    } catch (error) {
      console.error('Error al eliminar todas las ubicaciones:', error);
      alert('Error al eliminar las ubicaciones. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <Layout>
      <div className="content-wrapper">
        <div className="row gx-3">
          <div className="col-sm-12 col-12">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Raw Locations</div>
              </div>
              <div className="card-body">
                <button
                  onClick={handleDeleteAllLocations}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                  }}
                >
                  Eliminar todas las ubicaciones
                </button>

                {devices.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                    }}
                  >
                    <select
                      value={selectedDevice}
                      onChange={(e) => setSelectedDevice(e.target.value)}
                      style={{ marginBottom: '10px' }}
                    >
                      <option value="ALL">All Devices</option>
                      {devices.map((device) => (
                        <option key={device.deviceID} value={device.deviceID}>
                          {device.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {filteredLocations.length > 0 ? (
                  <div className="table-responsive">
                    {/* Sin <tbody> manual; solo <thead> */}
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
                      {/* No <tbody> aquí: DataTables lo genera. */}
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
    </Layout>
  );
};

export default RawLocations;
