const API_URL = 'https://api-backend-tfg.onrender.com/api/route';

export const fetchRouteMarkers = async (code) => {
  try {  
    const response = await fetch(`${API_URL}/${code}`);
    if (!response.ok) {
      throw new Error('Error al obtener la ruta');
    }

    const data = await response.json();

    if (data.length > 0) {
      return data; 
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al obtener la ruta:', error);
    return [];
  }
};

export const fetchCreateRouteMarker = async (code, latitude, longitude) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, longitude, latitude }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error de red, por favor intente de nuevo');
  }
};
 
export const fetchDeleteRouteMarker = async (id) => {
  console.log('Deleting route marker:', id);
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el marcador');
    }

    console.log('Punto eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar el marcador:', error);
  }
};