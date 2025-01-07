// URL del API
const SERVICE_API_URL = 'https://api-backend-tfg.onrender.com/api/services';
const SERVICE_TYPES_API_URL = 'https://api-backend-tfg.onrender.com/api/serviceTypes';

// Obtener servicios existentes
export const fetchService = async (code) => {
  try {
    const response = await fetch(`${SERVICE_API_URL}/${code}`);

    if (!response.ok) {
      throw new Error('Error al obtener los servicios');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener los servicios:', error);
    throw error;
  }
};

// Obtener tipos de servicio
export const fetchServiceTypes = async () => {
  try {
    const response = await fetch(SERVICE_TYPES_API_URL);
    if (!response.ok) {
      throw new Error('Error al obtener los tipos de servicio');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener los tipos de servicio:', error);
    throw error;
  }
};

// Crear un nuevo servicio
export const fetchCreateService = async (code, latitude, longitude, type) => {
  try {
    const response = await fetch(SERVICE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, latitude, longitude, type }),
    });

    if (!response.ok) {
      throw new Error('Error al crear el servicio');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    throw error;
  }
};

export const fetchDeleteService = async (id) => {
  try {
    const response = await fetch(`${SERVICE_API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el servicio');
    }
  } catch (error) {
    console.error('Error al eliminar el servicio:', error);
    throw error;
  }
};

// Eliminar todos los servicios de un evento
export const fetchDeleteAllServices = async (code) => {
  try {
    const response = await fetch(`${SERVICE_API_URL}/deleteAll/${code}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar todas los servicios del evento');
    }

    console.log('Todos los servicios han sido eliminados correctamente.');
  } catch (error) {
    console.error('Error al eliminar todos los servicios:', error);
    throw error;
  }
};
