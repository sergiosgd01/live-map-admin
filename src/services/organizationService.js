const API_URL = 'https://api-backend-tfg.onrender.com/api/organizations';

export const fetchOrganizations = async () => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las organizaciones');
    }

    return await response.json(); // Devuelve el array de organizaciones
  } catch (error) {
    console.error('Error al obtener las organizaciones:', error);
    throw error;
  }
};
