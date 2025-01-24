import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDevicesByEventCode, deleteDeviceById } from '../../../services/deviceService';

const Device = () => {
  const { eventCode } = useParams(); 
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const loadDevices = async () => {
      const devicesList = await fetchDevicesByEventCode(eventCode);
      console.log(devicesList);
      setDevices(devicesList);
    };

    loadDevices();
  }, [eventCode]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este dispositivo?')) {
      try {
        await deleteDeviceById(id);
        alert('Dispositivo eliminado correctamente');
        setDevices(devices.filter(device => device._id !== id));
      } catch (error) {
        console.error('Error al eliminar el dispositivo:', error);
        alert('Error al eliminar el dispositivo');
      }
    }
  };

  return (
    <div>
      <h1>Listado de Dispositivos</h1>
      {devices.length === 0 ? (
        <p>No hay dispositivos para este evento.</p>
      ) : (
        <ul>
          {devices.map((device) => (
            <li key={device._id}>
              <p><strong>Nombre:</strong> {device.name}</p>
              <p><strong>Order:</strong> {device.order}</p>
              <p><strong>Color:</strong> <span style={{ backgroundColor: device.color, padding: '5px 10px', borderRadius: '5px', color: '#fff' }}>{device.color}</span></p>
              <p><strong>ID:</strong> {device.deviceID}</p>
              <p><strong>Event Code:</strong> {device.eventCode}</p>
              <Link to={`/devices/${device.deviceID}/${device.eventCode}/edit`}>
                <button style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>Editar</button>
              </Link>
              <button
                onClick={() => handleDelete(device._id)}
                style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', marginLeft: '10px' }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Device;