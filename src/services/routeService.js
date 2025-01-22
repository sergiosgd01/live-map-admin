const API_URL = 'https://api-backend-tfg.onrender.com/api/route';

// Obtener rutas por código de evento
export const fetchRouteMarkersByEventCode = async (code) => {
  try {
    const response = await fetch(`${API_URL}/${code}`);
    if (!response.ok) {
      throw new Error('Error al obtener la ruta');
    }

    const data = await response.json();
    return data.routes || [];
  } catch (error) {
    console.error('Error al obtener la ruta:', error);
    return [];
  }
};

// Obtener rutas por código de evento y deviceID
export const fetchRouteByEventCodeDeviceID = async (code, deviceID) => {
  try {
    const response = await fetch(`${API_URL}/device?code=${code}&deviceID=${deviceID}`);
    if (!response.ok) {
      throw new Error('Error al obtener la ruta por deviceID');
    }

    const data = await response.json();

    // Verificar si hay un mensaje de ausencia de datos
    if (data.message && data.route?.length === 0) {
      console.warn(data.message); // Puedes mostrar un mensaje informativo en el frontend
      return []; // Devuelve un array vacío
    }

    return data;
  } catch (error) {
    console.error('Error al obtener la ruta por deviceID:', error);
    return [];
  }
};

// Crear un nuevo punto de ruta
export const fetchCreateRouteMarker = async (code, deviceID, latitude, longitude) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, deviceID, latitude, longitude }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error de red, por favor intente de nuevo');
  }
};

// Eliminar un punto de ruta por ID
export const fetchDeleteRouteMarker = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el punto de la ruta');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar el punto de la ruta:', error);
    throw new Error('Error de red, por favor intente de nuevo');
  }
};

// Eliminar todas las rutas por código de evento y deviceID
export const fetchDeleteAllRoutes = async (code, deviceID) => {
  try {
    const response = await fetch(`${API_URL}/event/${code}/device/${deviceID}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar todas las rutas');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar todas las rutas:', error);
    throw new Error('Error de red, por favor intente de nuevo');
  }
};

// Actualizar el estado de visitado de los puntos de ruta
export const updateVisitedStatus = async (pointIds) => {
  try {
    const response = await fetch(`${API_URL}/update-visited`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pointIds }),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el estado de visitado');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar el estado de visitado:', error);
    throw new Error('Error de red, por favor intente de nuevo');
  }
};

// Resetear el estado de visitado por código de evento
export const resetVisitedStatusByEventCode = async (code) => {
  try {
    const response = await fetch(`${API_URL}/reset-visited/${code}`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Error al resetear el estado de visitado');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al resetear el estado de visitado:', error);
    throw new Error('Error de red, por favor intente de nuevo');
  }
};