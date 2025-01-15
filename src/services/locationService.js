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

export const fetchAddLocation = async (location) => {
  try {
    console.log(location);
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
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

export const fetchDeleteAllLocations = async (eventCode) => {
  try {
    const response = await fetch(`${API_URL}/event/${eventCode}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar todas las ubicaciones');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar todas las ubicaciones:', error);
    throw error;
  }
};

