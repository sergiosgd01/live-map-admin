const API_URL = 'https://api-backend-tfg.onrender.com/api/organizations';

// Obtener todas las organizaciones
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

    return await response.json();
  } catch (error) {
    console.error('Error al obtener las organizaciones:', error);
    throw error;
  }
};

// Obtener una organización por su ID
export const fetchOrganizationById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener la organización');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener la organización:', error);
    throw error;
  }
};

// Obtener una organización por su code
export const fetchOrganizationByCode = async (code) => {
  try {
    const response = await fetch(`${API_URL}/code/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener la organización');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener la organización:', error);
    throw error;
  }
};

// Crear una nueva organización (el código es generado automáticamente en el backend)
export const addOrganization = async (organization) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: organization.name }),
    });

    if (!response.ok) {
      throw new Error('Error al crear la organización');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear la organización:', error);
    throw error;
  }
};

// Actualizar una organización por su ID
export const updateOrganization = async (id, updatedOrganization) => {
  try {
    console.log("holaaa,", updatedOrganization);
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: updatedOrganization.name, image: updatedOrganization.image }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || 'Error al actualizar la organización');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar la organización:', error);
    throw error;
  }
};

// Eliminar una organización por su ID
export const deleteOrganization = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la organización');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar la organización:', error);
    throw error;
  }
};
