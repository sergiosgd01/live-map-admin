const API_URL = 'https://api-backend-tfg.onrender.com/api/user';

// Login de usuario
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error en el inicio de sesión');
    }
    // Guardamos el token y los datos del usuario
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Error en el login:', error);
    throw error;
  }
};

// Registro de usuario
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error en el registro');
    }
    // Guardamos el token y los datos del usuario si el registro es exitoso
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Error en el registro:', error);
    throw error;
  }
};

// Obtener datos del usuario autenticado
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token disponible');
    }

    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener los datos del usuario');
    }
    return data;
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    throw error;
  }
};

// Obtener todos los usuarios
export const fetchAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los usuarios');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Crear un nuevo usuario (solo superAdmin)
export const addUser = async (newUser) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al crear el usuario');
    }
    return data;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw error;
  }
};

export const updateUser = async (id, updatedUser) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedUser),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Capturar específicamente errores como el de email duplicado (400)
      if (response.status === 400 && data.message.includes('email ya está en uso')) {
        throw new Error('El email ya está en uso por otro usuario.');
      }
      throw new Error(data.message || 'Error al actualizar el usuario');
    }
    
    return data;
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw error;
  }
};

// Eliminar un usuario
export const deleteUser = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar el usuario');
    }
    return data;
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};