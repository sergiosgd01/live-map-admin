const API_URL = 'https://api-backend-tfg.onrender.com/api/rawLocations';

// Obtener las ubicaciones de un evento
export const fetchEventRawLocations = async (eventCode) => {
  try {
    const response = await fetch(`${API_URL}/${eventCode}`);
    if (!response.ok) {
      throw new Error('Error al obtener las ubicaciones del evento');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    throw error;
  }
};

// Eliminar todas las ubicaciones de un evento
export const deleteAllEventRawLocations = async (eventCode) => {
  try {
    const response = await fetch(`${API_URL}/${eventCode}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar todas las ubicaciones del evento');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar ubicaciones:', error);
    throw error;
  }
};
