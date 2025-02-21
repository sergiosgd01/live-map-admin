const API_URL = 'https://api-backend-tfg.onrender.com/api/user';

// Inicio de sesión
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }), // Envía las credenciales en el cuerpo de la solicitud
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error en el inicio de sesión');
    }
    return data;
  } catch (error) {
    console.error('Error en el login:', error);
    throw error;
  }
};

// Obtener datos del usuario autenticado
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token'); // Recuperar el token del localStorage
    if (!token) {
      throw new Error('No hay token disponible');
    }

    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Enviar el token en el encabezado
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener los datos del usuario');
    }
    return data; // Devuelve los datos del usuario
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error.message);
    throw error;
  }
};

// Obtener todos los usuarios
export const fetchAllUsers = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los usuarios');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    throw error;
  }
};

// Obtener un usuario por ID
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

// Crear un nuevo usuario
export const addUser = async (newUser) => {
  try {
    const response = await fetch(API_URL, {
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

// Eliminar un usuario
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