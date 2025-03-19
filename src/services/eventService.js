const API_URL = 'https://api-backend-tfg.onrender.com/api/events';

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
export const updateEvent = async (eventCode, updatedEvent) => {
  try {
    console.log('updatedEvent:', updatedEvent);
    const response = await fetch(`${API_URL}/editEvent/${eventCode}`, {
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

// Verificar si un evento existe por código
export const fetchEventByCode = async (eventCode) => {
  try {
    const response = await fetch(`${API_URL}/${eventCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null; // El código no existe en la base de datos
    }

    if (!response.ok) {
      throw new Error('Error al verificar el código del evento');
    }

    return await response.json(); // El código ya existe en la base de datos
  } catch (error) {
    console.error('Error al verificar el código del evento:', error);
    throw error;
  }
};

// export const checkCodeExists = async (id, code) => {
//   try {
//     console.log('id:', id);
//     const url = id
//       ? `${API_URL}/checkCodeExists/${code}?id=${id}`
//       : `${API_URL}/checkCodeExists/${code}`;

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Error al verificar la existencia del código');
//     }

//     const data = await response.json();
//     return data.exists;
//   } catch (error) {
//     console.error('Error al verificar la existencia del código:', error);
//     throw error;
//   }
// };

// Crear un nuevo evento
export const addEvent = async (event) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event), 
    });

    if (!response.ok) {
      throw new Error('Error al crear el evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear el evento:', error);
    throw error;
  }
};

export const deleteEvent = async (eventCode) => {
  try {
    const response = await fetch(`${API_URL}/${eventCode}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar el evento:', error);
    throw error;
  }
};

export const changeEventStatus = async (eventCode, action, cancelledInfo = '') => {
  try {
    const response = await fetch(`${API_URL}/cancel/${eventCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, cancelledInfo }),
    });

    if (!response.ok) {
      throw new Error('Error al cambiar el estado del evento');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al cambiar el estado del evento:', error);
    throw error;
  }
};
