const API_URL = 'https://api-backend-tfg.onrender.com/api/user';

// Fetch para obtener el listado de usuarios
export const fetchAllUsers = async () => {
  try {
    const url = `${API_URL}`; 
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
    return data; 
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

export const addUser = async (newUser) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error('Error al crear el usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear el usuario:', error);
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

    return await response.json(); 
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};
