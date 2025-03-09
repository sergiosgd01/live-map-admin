const API_URL = 'https://api-backend-tfg.onrender.com/api/device';

/**
 * 1) OBTENER TODOS LOS DISPOSITIVOS POR EVENTCODE
 *    GET /device/devices-by-event/:eventCode
 */
export const fetchDevicesByEventCode = async (eventCode) => {
  try {
    const response = await fetch(`${API_URL}/devices-by-event/${eventCode}`);
    if (!response.ok) {
      throw new Error('Error al obtener los dispositivos para el evento');
    }
    // El backend puede devolver:
    //  a) Array de dispositivos: [ {...}, {...} ]
    //  b) { message: '...', devices: [] }
    const data = await response.json();

    // Caso a) data es un array (dispositivos)
    if (Array.isArray(data)) {
      return data; // Retornamos directamente el array
    }

    // Caso b) data es un objeto con "devices" (probablemente vacío)
    if (data.devices && Array.isArray(data.devices)) {
      return data.devices;
    }

    // Respuesta desconocida
    console.warn('Respuesta desconocida del servidor:', data);
    return [];

  } catch (error) {
    console.error('Error al obtener los dispositivos por evento:', error);
    return [];
  }
};

/**
 * 2) OBTENER UN DISPOSITIVO POR ID
 *    GET /device/devices-by-id/:deviceID
 */
export const fetchDeviceById = async (deviceID) => {
  try {
    const response = await fetch(`${API_URL}/devices-by-id/${deviceID}`);
    if (!response.ok) {
      throw new Error('Error al obtener el dispositivo');
    }

    // El backend podría devolver:
    //  a) El objeto del dispositivo { _id, deviceID, eventCode, ... }
    //  b) { message: '...', devices: [] } si no se encontró
    const data = await response.json();

    // Caso a) data parece ser el dispositivo (no tiene "devices")
    if (data && !data.devices) {
      return data; 
    }

    // Caso b) data tiene "devices" vacío => no encontrado
    if (data.devices && Array.isArray(data.devices) && data.devices.length === 0) {
      return null;
    }

    // Respuesta desconocida
    console.warn('Respuesta desconocida del servidor:', data);
    return null;

  } catch (error) {
    console.error('Error al obtener el dispositivo:', error);
    throw error;
  }
};

/**
 * 3) OBTENER DISPOSITIVO POR deviceID + eventCode
 *    GET /device/:deviceID/:eventCode
 */
export const fetchDeviceByDeviceIDEventCode = async (deviceID, eventCode) => {
  try {
    const response = await fetch(`${API_URL}/${deviceID}/${eventCode}`);
    if (!response.ok) {
      throw new Error('Error al obtener el dispositivo por deviceID y eventCode');
    }

    // El backend podría devolver:
    //  a) El objeto del dispositivo
    //  b) { message: '...', devices: [] } si no se encontró
    const data = await response.json();

    // Caso a) data es el dispositivo
    if (data && !data.devices) {
      return data;
    }

    // Caso b) no encontrado
    if (data.devices && Array.isArray(data.devices) && data.devices.length === 0) {
      return null;
    }

    console.warn('Respuesta desconocida del servidor:', data);
    return null;
  } catch (error) {
    console.error('Error al obtener el dispositivo por deviceID y eventCode:', error);
    throw error;
  }
};

/**
 * 4) ACTUALIZAR UN DISPOSITIVO
 *    PUT /device/edit/:deviceID/:eventCode
 */
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

    // El backend podría devolver el dispositivo actualizado
    // o bien un objeto con "devices" vacío si no lo encontró
    const data = await response.json();

    // Si es el dispositivo actualizado (no tiene "devices")
    if (data && !data.devices) {
      return data;
    }

    // Si no lo encontró (devices vacío)
    if (data.devices && Array.isArray(data.devices) && data.devices.length === 0) {
      return null;
    }

    console.warn('Respuesta desconocida del servidor:', data);
    return null;

  } catch (error) {
    console.error('Error al actualizar el dispositivo:', error);
    throw error;
  }
};

/**
 * 5) ELIMINAR UN DISPOSITIVO
 *    DELETE /device/:id
 */
export const deleteDeviceById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el dispositivo');
    }

    // Normalmente el backend retorna algún mensaje de éxito
    const data = await response.json();
    if (data?.message) {
      return data.message;
    }

    // Caso que no devuelva el campo "message"
    console.warn('Respuesta desconocida del servidor:', data);
    return 'Operación de borrado completada (sin mensaje).';

  } catch (error) {
    console.error('Error al eliminar el dispositivo:', error);
    throw error;
  }
};
