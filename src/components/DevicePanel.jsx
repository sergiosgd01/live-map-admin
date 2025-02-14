// src/components/DevicePanel.jsx
import React from 'react';

const DevicePanel = ({
  devices,
  showDevice,
  handleEdit,
  showAll,
  selectedDevice
}) => {
  return (
    <div
      className="card shadow rounded"
      style={{
        position: 'absolute',
        left: '10px',
        bottom: '60px', // Un poco por encima del botón
        zIndex: 9999,
        width: '340px',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* CABECERA */}
      <div
        className="card-header text-center"
        style={{
          backgroundColor: '#fff',
          borderRadius: '0.25rem 0.25rem 0 0',
          padding: '0.5rem 1rem',
        }}
      >
        <h5 className="mb-0">Dispositivos</h5>
      </div>
      {/* LISTADO */}
      <div
        className="card-body"
        style={{
          overflowY: 'auto',
          flex: 1,
          padding: '0.5rem 1rem',
        }}
      >
        {devices.length === 0 ? (
          <p className="text-center">No hay dispositivos para este evento.</p>
        ) : (
          <div className="row">
            {devices.map((device) => (
              <div className="col-12 mb-3" key={device._id}>
                <div
                  className="card h-100"
                  style={{ cursor: 'pointer' }}
                  onClick={() => showDevice(device.deviceID)}
                >
                  {/* CABECERA DEL DISPOSITIVO */}
                  <div
                    className="card-header d-flex justify-content-between align-items-center"
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    <strong style={{ fontSize: '0.9rem' }}>
                      {device.name}
                    </strong>
                    <span
                      className="badge text-white"
                      style={{
                        backgroundColor: device.color,
                        fontSize: '0.75rem',
                      }}
                    >
                      {device.color}
                    </span>
                  </div>
                  {/* CUERPO */}
                  <div
                    className="card-body d-flex flex-column"
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <p className="mb-2">
                      <strong>DeviceID:</strong> {device.deviceID}
                    </p>
                    <div className="d-flex justify-content-between mt-auto">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          showDevice(device.deviceID);
                        }}
                      >
                        <i className="bi bi-map"></i> Ver
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(device.deviceID);
                        }}
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* FOOTER: Botón "Mostrar Todos" */}
      {selectedDevice && (
        <div
          className="card-footer text-center"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <button
            onClick={showAll}
            className="btn btn-warning btn-sm w-100"
            style={{ fontSize: '0.85rem' }}
          >
            Mostrar Todos
          </button>
        </div>
      )}
    </div>
  );
};

export default DevicePanel;
