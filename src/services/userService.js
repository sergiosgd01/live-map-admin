const API_URL = 'https://api-backend-tfg.onrender.com/api/user'; // Cambia la ruta si es necesario

// Fetch para obtener el listado de usuarios
export const fetchAllUsers = async () => {
  try {
    const url = `${API_URL}`; // Asegúrate de que tu backend tiene esta ruta
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los usuarios');
    }

    const data = await response.json();
    return data; // Asegúrate de que el backend devuelve el listado de usuarios en data
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    throw error;
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener el usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw error;
  }
};

// Actualizar un usuario
export const updateUser = async (id, updatedUser) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el usuario');
    }

    return await response.json(); // Devuelve la respuesta del backend
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};
