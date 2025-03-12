const API_URL = 'https://api-backend-tfg.onrender.com/api/route';

// Obtener rutas por código de evento
export const fetchRouteMarkersByEventCode = async (code) => {
  try {
    const response = await fetch(`${API_URL}/${code}`);
    if (!response.ok) {
      throw new Error('Error al obtener los puntos de la ruta');
    }
    const data = await response.json();
    
    // Manejar la respuesta que puede ser un array de rutas o un objeto con mensaje
    if (data.message && data.routes) {
      return data.routes; // Devuelve el array vacío incluido en la respuesta
    }
    return data; // Devuelve el array de rutas
  } catch (error) {
    console.error('Error al obtener los puntos de la ruta:', error);
    throw error;
  }
};

// Obtener rutas por código de evento y deviceID
export const fetchRouteByEventCodeDeviceID = async (code, deviceID) => {
  try {
    const response = await fetch(`${API_URL}/device?code=${code}&deviceID=${deviceID}`);
    if (!response.ok) {
      throw new Error('Error al obtener los puntos de la ruta para el dispositivo');
    }
    
    const data = await response.json();
    
    // Manejar la respuesta que puede tener diferentes formatos
    if (data.message && data.route?.length === 0) {
      console.warn(data.message);
      return []; // Devuelve un array vacío
    }
    
    return data.route || data; // Devuelve la ruta o los datos directos
  } catch (error) {
    console.error('Error al obtener los puntos de la ruta por dispositivo:', error);
    return [];
  }
};

// Crear un nuevo punto de ruta
export const fetchCreateRouteMarker = async (code, deviceID, latitude, longitude) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        latitude,
        longitude,
        deviceID
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al agregar el punto de ruta');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al agregar el punto de ruta:', error);
    throw error;
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

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar el punto de la ruta:', error);
    throw error;
  }
};

// Eliminar todas las rutas por código de evento y deviceID
export const fetchDeleteAllRoutes = async (code, deviceID) => {
  try {
    const url = deviceID
      ? `${API_URL}/deleteAll?eventCode=${eventCode}&deviceID=${deviceID}`
      : `${API_URL}/deleteAll?eventCode=${eventCode}`;
      
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar todos los puntos de la ruta');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar todos los puntos de la ruta:', error);
    throw error;
  }
};

// Actualizar el estado de visitado de los puntos de ruta
export const fetchUpdateVisitedStatus = async (pointIds) => {
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

export const fetchResetVisitedStatusByEventCode = async (code) => {
  try {
    const response = await fetch(`${API_URL}/reset-visited/${code}`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Error al resetear el estado de visited');
    }

    console.log(`Estado de visited reseteado para la ruta con código: ${code}`);
  } catch (error) {
    console.error('Error en fetchResetVisitedStatusByEventCode:', error);
    throw error;
  }
};