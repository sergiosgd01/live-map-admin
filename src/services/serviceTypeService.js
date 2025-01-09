const API_URL = 'https://api-backend-tfg.onrender.com/api/serviceTypes';

// Obtener todos los tipos de servicios
export const fetchServiceTypes = async () => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los tipos de servicios.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener los tipos de servicios:', error);
    throw error;
  }
};

// Crear un nuevo tipo de servicio
export const addServiceType = async (serviceType) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: serviceType.name, image: serviceType.image }), 
    });

    if (!response.ok) {
      throw new Error('Error al crear el tipo de servicio.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear el tipo de servicio:', error);
    throw error;
  }
};

// Eliminar un tipo de servicio
export const deleteServiceType = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el tipo de servicio.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar el tipo de servicio:', error);
    throw error;
  }
};
