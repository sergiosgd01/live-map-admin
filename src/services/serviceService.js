const API_URL = 'https://api-backend-tfg.onrender.com/api/services';

// Obtener servicios existentes
export const fetchService = async (code) => {
  try {
    const response = await fetch(`${API_URL}/${code}`);

    if (!response.ok) {
      throw new Error('Error al obtener los servicios');
    }
    
    const data = await response.json();
    
    // Comprueba si la respuesta es un mensaje de "no se encontraron servicios"
    if (data.message && data.services) {
      // Si viene con el formato { message: '...', services: [] }
      return data.services; // Retorna el array vacío de servicios
    }
    
    // Si es un array directo de servicios (caso exitoso)
    return data;
  } catch (error) {
    console.error('Error al obtener los servicios:', error);
    // En caso de error real, devolvemos un array vacío
    return [];
  }
};

// Crear un nuevo servicio
export const fetchCreateService = async (code, latitude, longitude, type) => {
  try {
    const response = await fetch(API_URL, {
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
    const response = await fetch(`${API_URL}/${id}`, {
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
    const response = await fetch(`${API_URL}/deleteAll/${code}`, {
      method: 'DELETE',
    });

    // Si el endpoint devuelve 404, asumimos que no hay servicios para eliminar.
    if (response.status === 404) {
      return { noServices: true };
    }

    if (!response.ok) {
      throw new Error('Error al eliminar todas los servicios del evento');
    }

    console.log('Todos los servicios han sido eliminados correctamente.');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar todos los servicios:', error);
    throw error;
  }
};

