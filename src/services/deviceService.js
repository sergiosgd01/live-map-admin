const API_URL = 'https://api-backend-tfg.onrender.com/api/device';

export const fetchDevicesByEventCode = async (eventCode) => {
  try {
    console.log('fetchDevicesByEventCode', eventCode);
    const response = await fetch(`${API_URL}/devices-by-event/${eventCode}`);

    if (!response.ok) {
      throw new Error('Error al obtener los dispositivos para el evento');
    }

    const { devices } = await response.json();

    return devices;
  } catch (error) {
    console.error('Error al obtener los dispositivos por evento:', error);
    return []; // Devuelve una lista vacía en caso de error
  }
};

export const fetchDeviceById = async (deviceID) => {
  try {
    const response = await fetch(`${API_URL}/devices-by-id/${deviceID}`);

    if (!response.ok) {
      throw new Error('Error al obtener el dispositivo');
    }

    const device = await response.json();

    return device;
  } catch (error) {
    console.error('Error al obtener el dispositivo:', error);
    throw error;
  }
};

export const fetchDeviceByDeviceIDEventCode = async (deviceID, eventCode) => {
  try {
    const response = await fetch(`${API_URL}/${deviceID}/${eventCode}`);

    if (!response.ok) {
      throw new Error('Error al obtener el dispositivo por deviceID y eventCode');
    }

    const { device } = await response.json();

    return device;
  } catch (error) {
    console.error('Error al obtener el dispositivo por deviceID y eventCode:', error);
    throw error;
  }
};

export const updateDevice = async (deviceID, eventCode, deviceData) => {
  try {
    const response = await fetch(`${API_URL}/edit/${deviceID}/${eventCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el dispositivo');
    }

    const { device } = await response.json();

    return device;
  } catch (error) {
    console.error('Error al actualizar el dispositivo:', error);
    throw error;
  }
};