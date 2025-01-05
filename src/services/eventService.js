const API_URL = 'https://api-backend-tfg.onrender.com/api/events/';

export const fetchEventsByOrganization = async (organizationCode) => {
  try {
    const response = await fetch(`${API_URL}/getEventsOrganization/${organizationCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los eventos de la organización');
    }

    return await response.json(); 
  } catch (error) {
    console.error('Error al obtener los eventos:', error);
    throw error;
  }
};

// Obtener un evento por id
export const fetchEventById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/getEventById/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener el evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener el evento:', error);
    throw error;
  }
};

// Actualizar un evento
export const updateEvent = async (id, updatedEvent) => {
  try {
    const response = await fetch(`${API_URL}/editEvent/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEvent),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar el evento:', error);
    throw error;
  }
};
