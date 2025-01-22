const API_URL = 'https://api-backend-tfg.onrender.com/api/locations'; 

// Obtener las ubicaciones de un evento
export const fetchEventLocations = async (code) => {
  try {
    const response = await fetch(`${API_URL}/${code}`);
    if (!response.ok) {
      throw new Error('Error al obtener las ubicaciones del evento');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    throw error;
  }
};

export const fetchLocationsByDeviceIdEventCode = async (deviceID, code) => {
  try {
    const response = await fetch(`${API_URL}/device?deviceID=${deviceID}&code=${code}`);
    if (!response.ok) {
      throw new Error('Error al obtener las ubicaciones para el dispositivo');
    }

    const data = await response.json();

    // Verificar si hay un mensaje de ausencia de datos
    if (data.message && data.locations?.length === 0) {
      console.warn(data.message); // Puedes mostrar un mensaje informativo en el frontend
      return []; // Devuelve un array vacío
    }

    return data;
  } catch (error) {
    console.error('Error al obtener las ubicaciones por dispositivo:', error);
    return [];
  }
};

export const fetchAddLocation = async (location, eventCode, deviceID) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, code: eventCode, deviceID }),
    });

    if (!response.ok) {
      throw new Error('Error al agregar la ubicación');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al agregar ubicación:', error);
    throw error;
  }
};

// Eliminar una ubicación existente
export const fetchDeleteLocation = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la ubicación');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    throw error;
  }
};

export const fetchDeleteLocationsByDeviceAndEvent = async (eventCode, deviceID) => {
  try {
    const response = await fetch(`${API_URL}/event/${eventCode}/device/${deviceID}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar las ubicaciones para el dispositivo y evento especificados');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar las ubicaciones:', error);
    throw error;
  }
};
