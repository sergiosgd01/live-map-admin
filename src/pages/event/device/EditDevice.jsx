import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDeviceByDeviceIDEventCode, updateDevice } from '../../../services/deviceService';
import { SketchPicker } from 'react-color';

const EditDevice = () => {
  const { deviceId, eventCode } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState({ color: '#000000', icon: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDevice = async () => {
      try {
        const deviceData = await fetchDeviceByDeviceIDEventCode(deviceId, eventCode);
        setDevice(deviceData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDevice();
  }, [deviceId, eventCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDevice({ ...device, [name]: value });
  };

  const handleColorChange = (color) => {
    setDevice({ ...device, color: color.hex });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDevice(deviceId, device.eventCode, device);
      alert('Dispositivo actualizado exitosamente');
      navigate(`/events/${device.eventCode}/devices`);
    } catch (err) {
      console.error('Error al actualizar el dispositivo:', err);
      alert('Error al actualizar el dispositivo: ' + err.message);
    }
  };

  if (loading) return <p>Cargando dispositivo...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Editar Dispositivo</h1>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Device ID:</strong> {device.deviceID}</p>
        <p><strong>Event Code:</strong> {device.eventCode}</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', width: '60%' }}>
        <label>
          Nombre:
          <input
            type="text"
            name="name"
            placeholder={device.name}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Order:
          <input
            type="number"
            name="order"
            placeholder={device.order}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Icon URL:
          <input
            type="text"
            name="icon"
            placeholder={device.icon}
            value={device.icon || ''}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </label>
        <br />
        <label>
          Color:
          <SketchPicker
            color={device.color || '#000000'} // Usa un valor por defecto si `device.color` es null o undefined
            onChangeComplete={handleColorChange}
            width="100%"
          />
        </label>
        <br />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Actualizar Dispositivo
        </button>
      </form>
    </div>
  );
};

export default EditDevice;