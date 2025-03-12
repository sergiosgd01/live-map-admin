import React from 'react';
import colors from '../utils/colors';

const DevicePanel = ({
  devices,
  showDevice,
  handleEdit,
  showAll,
  selectedDevice,
  onClose // Make sure we receive the onClose prop
}) => {

  return (
    <div className="devices-panel-container" style={{
      position: 'absolute',
      bottom: '70px',
      left: '20px',
      backgroundColor: 'white',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)',
      borderRadius: '8px',
      padding: '15px',
      width: '310px',
      zIndex: 1000,
      maxHeight: '70vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="panel-header" style={{
        borderBottom: '1px solid colors.borderLight', 
        paddingBottom: '10px',
        marginBottom: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h5 className="m-0">Dispositivos</h5>
        <button 
          className="btn-close" 
          onClick={onClose} // Use the onClose prop here
          aria-label="Cerrar"
        ></button>
      </div>
      
      <div className="devices-content" style={{
        overflowY: 'auto',
        flex: 1
      }}>
        {devices.length === 0 ? (
          <p className="text-center">No hay dispositivos para este evento.</p>
        ) : (
          <div className="devices-list" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {devices.map((device) => (
              <div 
                key={device._id} 
                className="device-card" 
                style={{
                  border: '1px solid colors.borderLight', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div
                  className="device-header d-flex justify-content-between align-items-center"
                  style={{ 
                    padding: '8px 12px',
                    backgroundColor: selectedDevice === device.deviceID ? colors.selectedItemBg : colors.lightGray, 
                    borderBottom: '1px solid colors.borderLight',
                    cursor: 'pointer'
                  }}
                  onClick={() => showDevice(device.deviceID)}
                >
                  <strong style={{ fontSize: '0.95rem' }}>
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
                
                <div className="device-body" style={{ padding: '10px 12px' }}>
                  <p className="mb-2" style={{ fontSize: '0.85rem' }}>
                    <strong>DeviceID:</strong> {device.deviceID}
                  </p>
                  <div className="d-flex justify-content-between mt-2">
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        backgroundColor: selectedDevice === device.deviceID ? colors.purple : colors.white,
                        color: selectedDevice === device.deviceID ? colors.white : colors.purple,
                        borderColor: colors.purple,
                        border: `1px solid ${colors.purple}`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showDevice(device.deviceID);
                      }}
                    >
                      <i className="bi bi-map"></i> Ver
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        backgroundColor: colors.purple,
                        color: colors.white,
                        border: "none"
                      }}
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
            ))}
          </div>
        )}
      </div>
      
      {/* Botón "Mostrar Todos" si hay un dispositivo seleccionado */}
      {selectedDevice && (
        <div className="mt-3">
          <button
            onClick={showAll}
            className="btn btn-sm w-100"
            style={{
              backgroundColor: colors.purple,
              color: colors.white,
              border: "none"
            }}
          >
            <i className="bi bi-layers"></i> Mostrar Todos los Dispositivos
          </button>
        </div>
      )}
    </div>
  );
};

export default DevicePanel;